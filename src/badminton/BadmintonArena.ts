import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { BadmintonAIController } from './BadmintonAIController.ts'
import { BadmintonBarriers } from './BadmintonBarriers.ts'
import { BadmintonCourt, HALF_LENGTH, HALF_WIDTH } from './BadmintonCourt.ts'
import { BadmintonHall } from './BadmintonHall.ts'
import { BadmintonHallLights } from './BadmintonHallLights.ts'
import { BadmintonNet } from './BadmintonNet.ts'
import { BadmintonPlayerBench } from './BadmintonPlayerBench.ts'
import { BadmintonPlayerCamera } from './BadmintonPlayerCamera.ts'
import { BadmintonShuttlecock } from './BadmintonShuttlecock.ts'
import { BadmintonShuttlecockPhysics } from './BadmintonShuttlecockPhysics.ts'
import type { MovementBounds } from './BadmintonMovement.ts'
import { BadmintonPlayerController } from './BadmintonPlayerController.ts'
import {
  BADMINTON_PLAYER_RED_URL,
  BADMINTON_PLAYER_URL,
  BadmintonPlayerModel,
} from './BadmintonPlayerModel.ts'
import { BadmintonRefereeChair } from './BadmintonRefereeChair.ts'
import { BadmintonSignage } from './BadmintonSignage.ts'
import { BadmintonTribune } from './BadmintonTribune.ts'

/**
 * Playable half per player: inside the court lines with a safety margin, and
 * never crossing the net at Z = 0.
 */
const MARGIN_SIDE = 0.35
const MARGIN_BACK = 0.35
const MARGIN_NET = 0.45

const BLUE_BOUNDS: MovementBounds = {
  minX: -(HALF_WIDTH - MARGIN_SIDE),
  maxX: HALF_WIDTH - MARGIN_SIDE,
  minZ: -(HALF_LENGTH - MARGIN_BACK),
  maxZ: -MARGIN_NET,
}

const RED_BOUNDS: MovementBounds = {
  minX: -(HALF_WIDTH - MARGIN_SIDE),
  maxX: HALF_WIDTH - MARGIN_SIDE,
  minZ: MARGIN_NET,
  maxZ: HALF_LENGTH - MARGIN_BACK,
}

/**
 * Demo trajectory used while hit detection does not exist: served from the red
 * side towards blue, clearing the 1.524 m net and landing inside the court.
 */
const DEMO_LAUNCH = {
  position: new THREE.Vector3(0, 1.5, 3.5),
  velocity: new THREE.Vector3(0, 3.08, -8.46),
}

/**
 * Badminton arena prototype: court, net, shuttlecock, two GLB players and the
 * surrounding sports hall. Red is the human player (keyboard), blue is the AI
 * opponent. Movement foundation only: no physics, hit detection or scoring.
 */
export class BadmintonArena implements Stage {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)

  readonly court = new BadmintonCourt()
  readonly net = new BadmintonNet()
  readonly shuttlecock = new BadmintonShuttlecock()
  readonly shuttlecockPhysics = new BadmintonShuttlecockPhysics({
    resetPoint: DEMO_LAUNCH.position,
  })

  private modelPlayers: BadmintonPlayerModel[] = []
  /** Red is the human player, blue is the AI opponent. */
  private redController: BadmintonPlayerController | null = null
  private blueAiController: BadmintonAIController | null = null
  private playerCamera: BadmintonPlayerCamera | null = null
  private mounted = false
  private demoArmed = false

  readonly hall = new BadmintonHall()
  readonly hallLights = new BadmintonHallLights()
  readonly tribune = new BadmintonTribune()
  readonly benches = new BadmintonPlayerBench()
  readonly refereeChair = new BadmintonRefereeChair()
  readonly signage = new BadmintonSignage()
  readonly barriers = new BadmintonBarriers()

  constructor() {
    this.scene.background = new THREE.Color(0x0a1424)
    this.scene.fog = new THREE.Fog(0x0a1424, 22, 62)

    this.scene.add(this.hall.group)
    this.scene.add(this.court.group, this.net.group)
    this.scene.add(this.createLights())
    this.scene.add(this.hallLights.group)

    this.scene.add(this.shuttlecock.group)

    this.scene.add(
      this.refereeChair.group,
      this.barriers.group,
      this.tribune.group,
      this.benches.group,
      this.signage.group,
    )

    this.camera.position.set(0, 7.2, 13.6)
    this.camera.lookAt(0, 1.1, 0)

    void this.loadModelPlayers()
  }

  /** Advances the GLB animations, the controllers, then the gameplay camera. */
  update(delta: number): void {
    for (const player of this.modelPlayers) player.update(delta)
    this.redController?.update(delta)
    this.blueAiController?.update(delta)

    const event = this.shuttlecockPhysics.update(delta)
    if (event === 'landed' || event === 'outOfBounds') this.demoArmed = true

    this.shuttlecock.setPosition(this.shuttlecockPhysics.getPosition())
    this.shuttlecock.setVelocity(this.shuttlecockPhysics.getVelocity())
    this.shuttlecock.update(delta)

    if (this.demoArmed && this.shuttlecockPhysics.isReadyToLaunch()) this.launchDemoShuttle()

    this.playerCamera?.update(delta)
  }

  /** Demo launch used until hit detection exists: red side towards blue. */
  private launchDemoShuttle(): void {
    this.demoArmed = false
    this.shuttlecockPhysics.launch(DEMO_LAUNCH.position, DEMO_LAUNCH.velocity)
    this.shuttlecock.reset(DEMO_LAUNCH.position)
  }

  /** Enables control only while this arena is the visible stage. */
  enter(): void {
    this.mounted = true
    this.demoArmed = true
    this.setControllersActive(true)
  }

  exit(): void {
    this.mounted = false
    this.setControllersActive(false)
  }

  /** Read-only access to the loaded model players, empty while still loading. */
  get players(): readonly BadmintonPlayerModel[] {
    return this.modelPlayers
  }

  /** Human player controller (red, keyboard). */
  get humanController(): BadmintonPlayerController | null {
    return this.redController
  }

  /** Opponent controller (blue, AI). */
  get aiController(): BadmintonAIController | null {
    return this.blueAiController
  }

  private setControllersActive(active: boolean): void {
    if (active) {
      this.redController?.enable()
      this.blueAiController?.enable()
      return
    }
    this.redController?.disable()
    this.blueAiController?.disable()
  }

  /**
   * Loads both player variants (blue on the far -Z side, red on the near +Z
   * side). No primitive placeholder is used any more: the arena shows the GLB
   * players only.
   *
   * The new GLBs are authored with forward = -Z at rotation 0, so each player
   * is rotated to face the net at Z = 0: blue on the -Z side needs PI, red on
   * the +Z side needs 0.
   */
  private async loadModelPlayers(): Promise<void> {
    try {
      const [blue, red] = await Promise.all([
        BadmintonPlayerModel.load(BADMINTON_PLAYER_URL),
        BadmintonPlayerModel.load(BADMINTON_PLAYER_RED_URL),
      ])

      blue.group.position.set(-0.9, 0, -4.6)
      red.group.position.set(0.9, 0, 4.6)

      blue.group.rotation.y = Math.PI
      red.group.rotation.y = 0

      blue.play('Ready')
      red.play('Ready')

      // Human plays red from behind the net; blue is the AI opponent.
      this.redController = new BadmintonPlayerController(red.group, RED_BOUNDS)
      this.blueAiController = new BadmintonAIController(blue.group, BLUE_BOUNDS)
      this.playerCamera = new BadmintonPlayerCamera(this.camera, red.group)
      if (this.mounted) this.setControllersActive(true)

      this.scene.add(blue.group, red.group)
      this.modelPlayers = [blue, red]
    } catch (error) {
      console.error('Gagal memuat model player GLB', error)
    }
  }

  private createLights(): THREE.Group {
    const lights = new THREE.Group()

    lights.add(new THREE.HemisphereLight(0xbcd8ff, 0x0b1526, 0.55))
    lights.add(new THREE.AmbientLight(0x93c5fd, 0.2))

    const key = new THREE.DirectionalLight(0xffffff, 1.35)
    key.position.set(6, 12, 7)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 44
    key.shadow.camera.left = -12
    key.shadow.camera.right = 12
    key.shadow.camera.top = 14
    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.0015
    lights.add(key)

    const fill = new THREE.DirectionalLight(0x60a5fa, 0.45)
    fill.position.set(-7, 5, -5)
    lights.add(fill)

    return lights
  }
}