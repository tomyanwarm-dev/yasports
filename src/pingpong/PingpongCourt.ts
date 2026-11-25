import * as THREE from 'three'

/**
 * Tournament playing mat dimensions in metres around the ITTF table (1 unit = 1 metre).
 * Table is 1.525 m (X) x 2.74 m (Z); surrounding mat gives realistic tournament run-off.
 */
export const COURT_WIDTH = 6.8
export const COURT_LENGTH = 10.6
export const HALF_WIDTH = COURT_WIDTH / 2
export const HALF_LENGTH = COURT_LENGTH / 2

const LINE_THICKNESS = 0.04
const LINE_HEIGHT = 0.005

/**
 * Pingpong tournament floor: dark GOR outer apron plus a Taraflex-style
 * playing mat with crisp white boundary lines, matching the Badminton GOR style.
 */
export class PingpongCourt {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(this.createApron(), this.createSurface(), this.createLines())
  }

  private createApron(): THREE.Mesh {
    const apron = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT_WIDTH + 8, COURT_LENGTH + 8),
      new THREE.MeshStandardMaterial({ color: 0x0b1526, roughness: 0.96 }),
    )
    apron.rotation.x = -Math.PI / 2
    apron.position.y = -0.002
    apron.receiveShadow = true
    return apron
  }

  private createSurface(): THREE.Mesh {
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT_WIDTH, COURT_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x15616f, roughness: 0.85 }),
    )
    surface.rotation.x = -Math.PI / 2
    surface.position.y = 0.0005
    surface.receiveShadow = true
    return surface
  }

  private createLines(): THREE.Group {
    const lines = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.55,
      emissive: 0x1f2937,
      emissiveIntensity: 0.35,
    })

    const addAlongX = (length: number, x: number, z: number) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(length, LINE_HEIGHT, LINE_THICKNESS),
        material,
      )
      line.position.set(x, LINE_HEIGHT / 2 + 0.001, z)
      lines.add(line)
    }

    const addAlongZ = (length: number, x: number, z: number) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(LINE_THICKNESS, LINE_HEIGHT, length),
        material,
      )
      line.position.set(x, LINE_HEIGHT / 2 + 0.001, z)
      lines.add(line)
    }

    // Outer perimeter of the tournament mat
    for (const sign of [-1, 1]) {
      addAlongX(COURT_WIDTH, 0, sign * (HALF_LENGTH - 0.14))
      addAlongZ(COURT_LENGTH - 0.28, sign * (HALF_WIDTH - 0.14), 0)
    }

    // Subtle inner playing-box baseline & sideline ticks for tournament depth
    for (const sign of [-1, 1]) {
      addAlongX(COURT_WIDTH * 0.58, 0, sign * 3.55)
    }

    // Center net-extension alignment marks on left/right of the table
    for (const sign of [-1, 1]) {
      addAlongX(1.2, sign * 2.15, 0)
    }

    return lines
  }
}
