import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { BadmintonBarriers } from './BadmintonBarriers.ts'
import { BadmintonCourt } from './BadmintonCourt.ts'
import { BadmintonHall } from './BadmintonHall.ts'
import { BadmintonHallLights } from './BadmintonHallLights.ts'
import { BadmintonNet } from './BadmintonNet.ts'
import { BadmintonPlayer } from './BadmintonPlayer.ts'
import { BadmintonPlayerBench } from './BadmintonPlayerBench.ts'
import {
  BADMINTON_PLAYER_RED_URL,
  BADMINTON_PLAYER_URL,
  BadmintonPlayerModel,
} from './BadmintonPlayerModel.ts'
import { BadmintonRefereeChair } from './BadmintonRefereeChair.ts'
import { BadmintonSignage } from './BadmintonSignage.ts'
import { Shuttlecock } from './Shuttlecock.ts'
import { BadmintonTribune } from './BadmintonTribune.ts'

/**
 * Badminton arena prototype: court, net, racket, shuttlecock, two player
 * placeholders and the surrounding sports hall (floor, walls, roof, lights,
 * seating, umpire chair). Static scene only, no gameplay, physics or scoring.
 */
export class BadmintonArena implements Stage {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)

  readonly court = new BadmintonCourt()
  readonly net = new BadmintonNet()
  readonly shuttlecock = new Shuttlecock()

  /** Placeholder players, shown only while the GLB model is still loading. */
  private placeholderOne = new BadmintonPlayer(0x2563eb)
  private placeholderTwo = new BadmintonPlayer(0xdc2626)
  private modelPlayers: BadmintonPlayerModel[] = []

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

    this.placePlayer(this.placeholderOne, -0.9, -4.6, 0)
    this.placePlayer(this.placeholderTwo, 0.9, 4.6, Math.PI)
    this.scene.add(this.placeholderOne.group, this.placeholderTwo.group)

    this.shuttlecock.group.position.set(0, 1.9, -1.4)
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

  /** Advances the GLB player animations. */
  update(_delta: number): void {
    for (const player of this.modelPlayers) player.update(_delta)
  }

  /** Read-only access to the loaded model players, empty while still loading. */
  get players(): readonly BadmintonPlayerModel[] {
    return this.modelPlayers
  }

  /**
   * Loads both player variants (blue on the near side, red on the far side).
   * Placeholders are only removed once both models are in the scene, so a
   * failed load keeps the arena usable instead of emptying it.
   */
  private async loadModelPlayers(): Promise<void> {
    try {
      const [blue, red] = await Promise.all([
        BadmintonPlayerModel.load(BADMINTON_PLAYER_URL),
        BadmintonPlayerModel.load(BADMINTON_PLAYER_RED_URL),
      ])

      blue.group.position.set(-0.9, 0, -4.6)
      red.group.position.set(0.9, 0, 4.6)
      red.group.rotation.y = Math.PI

      blue.play('Ready')
      red.play('Ready')

      this.scene.add(blue.group, red.group)
      this.modelPlayers = [blue, red]

      this.scene.remove(this.placeholderOne.group, this.placeholderTwo.group)
    } catch (error) {
      console.error('Gagal memuat model player GLB, memakai player placeholder', error)
    }
  }

  private placePlayer(player: BadmintonPlayer, x: number, z: number, rotationY: number): void {
    player.group.position.set(x, 0, z)
    player.group.rotation.y = rotationY
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