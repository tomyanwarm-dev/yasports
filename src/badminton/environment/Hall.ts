import * as THREE from 'three'

/** Indoor hall size in metres: court is 6.10 (X) x 13.40 (Z), centred on origin. */
const HALL_WIDTH = 36
const HALL_LENGTH = 46
const WALL_HEIGHT = 14
const WALL_THICKNESS = 0.5
const RIB_SPACING = 2.6

/**
 * Indoor sports hall shell: floor, walls with vertical panels, ceiling with
 * structural beams, and decorative doors. Purely visual, no gameplay logic.
 */
export class BadmintonHall {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(
      this.createFloor(),
      this.createWalls(),
      this.createWallPanels(),
      this.createCeiling(),
      this.createBeams(),
      this.createDoors(),
    )
  }

  private createFloor(): THREE.Mesh {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(HALL_WIDTH, HALL_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x151d2c, roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.004
    floor.receiveShadow = true
    return floor
  }

  private createWalls(): THREE.Group {
    const walls = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0x1b2434,
      roughness: 0.9,
      side: THREE.DoubleSide,
    })
    const halfWidth = HALL_WIDTH / 2
    const halfLength = HALL_LENGTH / 2

    const side = (width: number, x: number, z: number, rotationY: number) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(width, WALL_HEIGHT), material)
      wall.position.set(x, WALL_HEIGHT / 2, z)
      wall.rotation.y = rotationY
      wall.receiveShadow = true
      walls.add(wall)
    }

    side(HALL_LENGTH, -halfWidth, 0, Math.PI / 2)
    side(HALL_LENGTH, halfWidth, 0, -Math.PI / 2)
    side(HALL_WIDTH, 0, -halfLength, 0)
    side(HALL_WIDTH, 0, halfLength, Math.PI)
    return walls
  }

  /** Vertical ribs so the walls do not read as one empty box. */
  private createWallPanels(): THREE.InstancedMesh {
    const material = new THREE.MeshStandardMaterial({
      color: 0x24314a,
      roughness: 0.75,
    })
    const geometry = new THREE.BoxGeometry(0.3, WALL_HEIGHT, 0.3)
    const halfWidth = HALL_WIDTH / 2
    const halfLength = HALL_LENGTH / 2

    const alongX = Math.floor(HALL_WIDTH / RIB_SPACING)
    const alongZ = Math.floor(HALL_LENGTH / RIB_SPACING)
    const panels = new THREE.InstancedMesh(geometry, material, (alongX + alongZ) * 2)

    const dummy = new THREE.Object3D()
    let index = 0
    for (const sign of [-1, 1]) {
      for (let i = 0; i < alongZ; i++) {
        const z = -halfLength + RIB_SPACING / 2 + i * RIB_SPACING
        dummy.position.set(sign * (halfWidth - 0.2), WALL_HEIGHT / 2, z)
        dummy.updateMatrix()
        panels.setMatrixAt(index++, dummy.matrix)
      }
      for (let i = 0; i < alongX; i++) {
        const x = -halfWidth + RIB_SPACING / 2 + i * RIB_SPACING
        dummy.position.set(x, WALL_HEIGHT / 2, sign * (halfLength - 0.2))
        dummy.updateMatrix()
        panels.setMatrixAt(index++, dummy.matrix)
      }
    }
    panels.instanceMatrix.needsUpdate = true
    return panels
  }

  private createCeiling(): THREE.Mesh {
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(HALL_WIDTH, HALL_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 1 }),
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = WALL_HEIGHT
    return ceiling
  }

  private createBeams(): THREE.Group {
    const beams = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0x1f2a3d,
      roughness: 0.7,
      metalness: 0.3,
    })
    const dummy = new THREE.Object3D()

    const crossBeams = new THREE.InstancedMesh(
      new THREE.BoxGeometry(HALL_WIDTH, 0.7, 0.5),
      material,
      7,
    )
    for (let i = 0; i < 7; i++) {
      const z = -HALL_LENGTH / 2 + 4 + i * ((HALL_LENGTH - 8) / 6)
      dummy.position.set(0, WALL_HEIGHT - 0.55, z)
      dummy.updateMatrix()
      crossBeams.setMatrixAt(i, dummy.matrix)
    }
    crossBeams.instanceMatrix.needsUpdate = true
    beams.add(crossBeams)

    const longBeams = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.4, 0.5, HALL_LENGTH),
      material,
      2,
    )
    for (let i = 0; i < 2; i++) {
      dummy.position.set(i === 0 ? -8 : 8, WALL_HEIGHT - 1.1, 0)
      dummy.updateMatrix()
      longBeams.setMatrixAt(i, dummy.matrix)
    }
    longBeams.instanceMatrix.needsUpdate = true
    beams.add(longBeams)

    return beams
  }

  private createDoors(): THREE.Group {
    const doors = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.8 })

    for (const sign of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), material)
      door.position.set(0, 1.6, sign * (HALL_LENGTH / 2 - 0.06))
      door.rotation.y = sign === 1 ? Math.PI : 0
      doors.add(door)

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3.6, WALL_THICKNESS * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x2a3a54, roughness: 0.7 }),
      )
      frame.position.set(0, 1.8, sign * (HALL_LENGTH / 2 - 0.1))
      doors.add(frame)
    }

    return doors
  }
}