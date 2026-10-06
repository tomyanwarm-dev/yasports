import * as THREE from 'three'
import { HALF_WIDTH } from './BadmintonCourt.ts'

/** Umpire chair stands beside the net post, outside the sideline. */
const CHAIR_X = HALF_WIDTH + 0.95
const PLATFORM_HEIGHT = 1.25

/**
 * Badminton umpire chair: raised platform, tall frame, seat, backrest and
 * ladder steps. Faces the court (towards -X) and stays clear of the net line.
 */
export class BadmintonRefereeChair {
  readonly group = new THREE.Group()

  constructor() {
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.5,
      metalness: 0.55,
    })
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.6,
    })
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.75,
      metalness: 0.2,
    })

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.08, 1.1),
      platformMaterial,
    )
    platform.position.set(0, PLATFORM_HEIGHT, 0)
    this.group.add(platform)

    for (const offsetX of [-0.45, 0.45]) {
      for (const offsetZ of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, PLATFORM_HEIGHT, 0.08),
          frameMaterial,
        )
        leg.position.set(offsetX, PLATFORM_HEIGHT / 2, offsetZ)
        this.group.add(leg)
      }
    }

    for (const z of [-0.5, 0.5]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.06), frameMaterial)
      rail.position.set(0, PLATFORM_HEIGHT - 0.35, z)
      this.group.add(rail)
    }

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.5), seatMaterial)
    seat.position.set(-0.06, PLATFORM_HEIGHT + 0.08, 0)
    this.group.add(seat)

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.5), seatMaterial)
    backrest.position.set(0.26, PLATFORM_HEIGHT + 0.36, 0)
    this.group.add(backrest)

    for (let step = 0; step < 3; step++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.06), frameMaterial)
      rung.position.set(0.42, 0.32 + step * 0.3, -0.5)
      this.group.add(rung)
    }

    for (const z of [-0.5, 0.5]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), frameMaterial)
      rail.position.set(0.5, 0.8, z)
      this.group.add(rail)
    }

    this.group.position.set(CHAIR_X, 0, 0)
    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }
}