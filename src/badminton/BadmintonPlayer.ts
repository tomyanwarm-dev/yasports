import * as THREE from 'three'

/**
 * Minimal player placeholder built from primitives, used to check arena scale.
 * Faces +Z by default so both players can be rotated toward the net.
 */
export class BadmintonPlayer {
  readonly group = new THREE.Group()

  constructor(color: number) {
    this.group.add(
      this.createLegs(color),
      this.createTorso(color),
      this.createArms(color),
      this.createHead(),
    )
  }

  private createLegs(color: number): THREE.Group {
    const legs = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })

    for (const sign of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.065, 0.85, 10),
        material,
      )
      leg.position.set(sign * 0.1, 0.425, 0)
      leg.castShadow = true
      legs.add(leg)

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.05, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }),
      )
      foot.position.set(sign * 0.1, 0.025, 0.04)
      legs.add(foot)
    }

    return legs
  }

  private createTorso(color: number): THREE.Mesh {
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.42, 6, 14),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    )
    torso.position.y = 1.12
    torso.castShadow = true
    return torso
  }

  private createArms(color: number): THREE.Group {
    const arms = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })

    for (const sign of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.045, 0.45, 4, 10),
        material,
      )
      arm.position.set(sign * 0.22, 1.08, 0.04)
      arm.rotation.z = sign * 0.18
      arm.castShadow = true
      arms.add(arm)
    }

    return arms
  }

  private createHead(): THREE.Group {
    const head = new THREE.Group()

    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 14),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    skull.castShadow = true
    head.add(skull)

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    neck.position.y = -0.12
    head.add(neck)

    head.position.y = 1.52
    return head
  }
}