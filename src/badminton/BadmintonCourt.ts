import * as THREE from 'three'

/**
 * Real badminton court dimensions in metres (1 unit = 1 metre).
 * X is court width, Z is court length, Y is height.
 */
export const COURT_WIDTH = 6.1
export const COURT_LENGTH = 13.4
export const HALF_WIDTH = COURT_WIDTH / 2
export const HALF_LENGTH = COURT_LENGTH / 2

/** Short service line distance from the net (BWF). */
export const SHORT_SERVICE_FROM_NET = 1.98
/** Doubles long service line distance from the back boundary. */
export const LONG_SERVICE_FROM_BACK = 0.76
/** Singles side line offset inside the doubles sideline. */
export const SINGLES_SIDE_OFFSET = 0.46

export const LINE_THICKNESS = 0.04
/** Lines sit slightly above the surface to avoid z-fighting. */
export const LINE_HEIGHT = 0.006

/** Playing surface with an outer apron and regulation court lines. */
export class BadmintonCourt {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(this.createApron(), this.createSurface(), this.createLines())
  }

  private createApron(): THREE.Mesh {
    const apron = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT_WIDTH + 12, COURT_LENGTH + 10),
      new THREE.MeshStandardMaterial({ color: 0x0b1526, roughness: 1 }),
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
    surface.receiveShadow = true
    return surface
  }

  private createLines(): THREE.Group {
    const lines = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      emissive: 0x1f2937,
      emissiveIntensity: 0.4,
    })

    const addAlongX = (length: number, x: number, z: number) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(length, LINE_HEIGHT, LINE_THICKNESS),
        material,
      )
      line.position.set(x, LINE_HEIGHT / 2, z)
      lines.add(line)
    }

    const addAlongZ = (length: number, x: number, z: number) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(LINE_THICKNESS, LINE_HEIGHT, length),
        material,
      )
      line.position.set(x, LINE_HEIGHT / 2, z)
      lines.add(line)
    }

    // Outer boundary
    for (const sign of [-1, 1]) {
      addAlongX(COURT_WIDTH, 0, sign * HALF_LENGTH)
      addAlongZ(COURT_LENGTH, sign * HALF_WIDTH, 0)
    }

    // Centre line from the net to each back boundary
    for (const sign of [-1, 1]) {
      addAlongZ(HALF_LENGTH, 0, sign * (HALF_LENGTH / 2))
    }

    // Short service lines
    for (const sign of [-1, 1]) {
      addAlongX(COURT_WIDTH, 0, sign * SHORT_SERVICE_FROM_NET)
    }

    // Long service lines (doubles back service)
    for (const sign of [-1, 1]) {
      addAlongX(COURT_WIDTH, 0, sign * (HALF_LENGTH - LONG_SERVICE_FROM_BACK))
    }

    // Singles side lines
    for (const sign of [-1, 1]) {
      addAlongZ(COURT_LENGTH, sign * (HALF_WIDTH - SINGLES_SIDE_OFFSET), 0)
    }

    return lines
  }
}