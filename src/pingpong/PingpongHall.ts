import * as THREE from 'three'

/** Indoor GOR hall size in metres for the Pingpong Arena. */
export const HALL_WIDTH = 28
export const HALL_LENGTH = 34
export const WALL_HEIGHT = 11.5
const WALL_THICKNESS = 0.5
const RIB_SPACING = 2.4

/**
 * Indoor GOR sports hall shell matching BadmintonHall: dark floor, ribbed walls,
 * ceiling with steel structural trusses, and tunnel entrance doors.
 */
export class PingpongHall {
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

  /** Vertical structural ribs so walls read like a real GOR hall. */
  private createWallPanels(): THREE.InstancedMesh {
    const material = new THREE.MeshStandardMaterial({
      color: 0x24314a,
      roughness: 0.75,
    })
    const geometry = new THREE.BoxGeometry(0.28, WALL_HEIGHT, 0.28)
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
        dummy.position.set(sign * (halfWidth - 0.16), WALL_HEIGHT / 2, z)
        dummy.updateMatrix()
        panels.setMatrixAt(index++, dummy.matrix)
      }
      for (let i = 0; i < alongX; i++) {
        const x = -halfWidth + RIB_SPACING / 2 + i * RIB_SPACING
        dummy.position.set(x, WALL_HEIGHT / 2, sign * (halfLength - 0.16))
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

    const crossCount = 6
    const crossBeams = new THREE.InstancedMesh(
      new THREE.BoxGeometry(HALL_WIDTH, 0.6, 0.42),
      material,
      crossCount,
    )
    for (let i = 0; i < crossCount; i++) {
      const z = -HALL_LENGTH / 2 + 3.5 + i * ((HALL_LENGTH - 7) / (crossCount - 1))
      dummy.position.set(0, WALL_HEIGHT - 0.5, z)
      dummy.updateMatrix()
      crossBeams.setMatrixAt(i, dummy.matrix)
    }
    crossBeams.instanceMatrix.needsUpdate = true
    beams.add(crossBeams)

    const longBeams = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.35, 0.44, HALL_LENGTH),
      material,
      2,
    )
    for (let i = 0; i < 2; i++) {
      dummy.position.set(i === 0 ? -6.2 : 6.2, WALL_HEIGHT - 0.95, 0)
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
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3a54, roughness: 0.7 })

    for (const sign of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.9), material)
      door.position.set(0, 1.45, sign * (HALL_LENGTH / 2 - 0.06))
      door.rotation.y = sign === 1 ? Math.PI : 0
      doors.add(door)

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 3.3, WALL_THICKNESS * 0.45),
        frameMaterial,
      )
      frame.position.set(0, 1.65, sign * (HALL_LENGTH / 2 - 0.1))
      doors.add(frame)
    }

    return doors
  }
}
