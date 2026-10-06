import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { BadmintonBarriers } from './BadmintonBarriers.ts'
import { BadmintonCourt } from './BadmintonCourt.ts'
import { BadmintonHall } from './BadmintonHall.ts'
import { BadmintonHallLights } from './BadmintonHallLights.ts'
import { BadmintonNet } from './BadmintonNet.ts'
import { BadmintonPlayer } from './BadmintonPlayer.ts'
import { BadmintonPlayerBench } from './BadmintonPlayerBench.ts'
import { BadmintonRacket } from './BadmintonRacket.ts'
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
  readonly racket = new BadmintonRacket()
  readonly shuttlecock = new Shuttlecock()
  readonly playerOne = new BadmintonPlayer(0x2563eb)
  readonly playerTwo = new BadmintonPlayer(0xdc2626)

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

    this.placePlayer(this.playerOne, -3.6, 0)
    this.placePlayer(this.playerTwo, 3.6, Math.PI)
    this.scene.add(this.playerOne.group, this.playerTwo.group)

    this.racket.group.position.set(1.45, 0.5, -2.6)
    this.scene.add(this.racket.group)

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
  }

  /** Prototype only: the scene is static, kept for future gameplay updates. */
  update(): void {}

  private placePlayer(player: BadmintonPlayer, z: number, rotationY: number): void {
    player.group.position.set(0, 0, z)
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