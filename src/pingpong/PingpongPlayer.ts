import * as THREE from 'three'

/**
 * Low-poly player character for Ping Pong, matching the visual style of BadmintonPlayer.
 * Supports arm rotation and body movement for natural hit animations.
 */
export class PingpongPlayer {
  readonly group = new THREE.Group()
  readonly rightArm = new THREE.Group()
  readonly leftArm = new THREE.Group()
  readonly headGroup = new THREE.Group()
  private rightUpperArm!: THREE.Mesh
  private rightForearm!: THREE.Mesh
  private torsoMesh!: THREE.Mesh

  constructor(color: number, isNPC: boolean = false) {
    this.group.add(
      this.createLegs(),
      this.createTorso(color),
      this.createLeftArm(),
      this.createRightArm(),
      this.createHead(),
    )

    if (isNPC) {
      // NPC faces toward Player 1 (positive Z)
      this.group.rotation.y = 0
    } else {
      // Player 1 faces toward NPC (negative Z)
      this.group.rotation.y = Math.PI
    }
  }

  private createLegs(): THREE.Group {
    const legs = new THREE.Group()
    const shortsMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })

    for (const sign of [-1, 1]) {
      const legGroup = new THREE.Group()

      // Shorts
      const short = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.28, 10),
        shortsMaterial,
      )
      short.position.set(sign * 0.12, 0.68, 0)
      short.castShadow = true
      legs.add(short)

      // Leg skin
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.055, 0.55, 10),
        skinMaterial,
      )
      leg.position.set(sign * 0.12, 0.32, 0)
      leg.castShadow = true
      legs.add(leg)

      // Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.07, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 }),
      )
      shoe.position.set(sign * 0.12, 0.035, 0.03)
      shoe.castShadow = true
      legs.add(shoe)
    }

    return legs
  }

  private createTorso(color: number): THREE.Mesh {
    this.torsoMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.44, 6, 14),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    )
    this.torsoMesh.position.y = 1.12
    this.torsoMesh.castShadow = true
    return this.torsoMesh
  }

  private createLeftArm(): THREE.Group {
    const material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.045, 0.42, 4, 10),
      material,
    )
    arm.position.set(-0.23, 1.08, 0)
    arm.rotation.z = -0.2
    arm.castShadow = true
    this.leftArm.add(arm)
    return this.leftArm
  }

  private createRightArm(): THREE.Group {
    this.rightArm.position.set(0.2, 1.25, 0)
    const material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })

    // Upper arm
    this.rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.25, 8),
      material,
    )
    this.rightUpperArm.position.set(0.05, -0.1, 0.08)
    this.rightUpperArm.rotation.x = -Math.PI / 4
    this.rightUpperArm.castShadow = true
    this.rightArm.add(this.rightUpperArm)

    // Forearm extending forward ready to hold paddle
    this.rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.035, 0.25, 8),
      material,
    )
    this.rightForearm.position.set(0.08, -0.18, 0.22)
    this.rightForearm.rotation.x = -Math.PI / 2.2
    this.rightForearm.castShadow = true
    this.rightArm.add(this.rightForearm)

    return this.rightArm
  }

  private createHead(): THREE.Group {
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 14),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    skull.castShadow = true
    this.headGroup.add(skull)

    // Headband
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.015, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }),
    )
    headband.rotation.x = Math.PI / 2
    headband.position.y = 0.03
    this.headGroup.add(headband)

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    neck.position.y = -0.13
    this.headGroup.add(neck)

    this.headGroup.position.y = 1.54
    return this.headGroup
  }

  /** Swing right arm forward for a strike */
  setSwingProgress(progress: number): void {
    // progress is 0 (idle) to 1 (peak swing) back to 0
    const angle = progress * Math.PI * 0.45
    this.rightArm.rotation.x = -angle
    this.rightArm.rotation.y = progress * 0.3
  }
}
