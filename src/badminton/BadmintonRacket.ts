import * as THREE from 'three'

/** Racket proportions in metres: head 0.29, shaft 0.25, handle + grip 0.13. */
const HEAD_RX = 0.1
const HEAD_RY = 0.145
const SHAFT_LENGTH = 0.25
const GRIP_LENGTH = 0.13

/** Distance from the racket head down to the middle of the grip. */
const GRIP_OFFSET = HEAD_RY + SHAFT_LENGTH + GRIP_LENGTH / 2

/**
 * Procedural badminton racket. The group origin sits at the middle of the grip,
 * so the racket can be parented straight to a hand: the handle stays in the
 * palm and the head points along +Y. A hand-tracking controller can then move
 * one transform and the whole racket follows.
 */
export class BadmintonRacket {
  readonly group = new THREE.Group()
  readonly head = new THREE.Group()

  constructor() {
    this.head.add(this.createFrame(), this.createStrings())

    const rig = new THREE.Group()
    rig.name = 'racket-rig'
    rig.position.y = GRIP_OFFSET
    rig.add(this.head, this.createShaft(), this.createGrip())
    this.group.add(rig)
  }

  /** Total racket length in metres (0.67). */
  get length(): number {
    return HEAD_RY * 2 + SHAFT_LENGTH + GRIP_LENGTH
  }

  private createFrame(): THREE.Group {
    const frame = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.6,
    })
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.25,
      metalness: 0.5,
    })

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(HEAD_RX, 0.008, 8, 40),
      material,
    )
    outer.scale.set(1, HEAD_RY / HEAD_RX, 1)
    outer.castShadow = true
    frame.add(outer)

    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(HEAD_RX * 0.9, 0.003, 6, 32),
      accentMaterial,
    )
    inner.scale.set(1, HEAD_RY / HEAD_RX, 1)
    frame.add(inner)

    const throat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.007, 0.03, 8),
      material,
    )
    throat.position.y = -HEAD_RY - 0.012
    frame.add(throat)

    return frame
  }

  private createStrings(): THREE.LineSegments {
    const points: number[] = []
    const spacing = 0.018
    const limit = 0.9

    for (let x = -HEAD_RX; x <= HEAD_RX; x += spacing) {
      const k = 1 - (x * x) / (HEAD_RX * HEAD_RX)
      if (k <= 0.02) continue
      const half = HEAD_RY * limit * Math.sqrt(k)
      points.push(x, -half, 0, x, half, 0)
    }
    for (let y = -HEAD_RY; y <= HEAD_RY; y += spacing) {
      const k = 1 - (y * y) / (HEAD_RY * HEAD_RY)
      if (k <= 0.02) continue
      const half = HEAD_RX * limit * Math.sqrt(k)
      points.push(-half, y, 0, half, y, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const material = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.75,
    })
    return new THREE.LineSegments(geometry, material)
  }

  private createShaft(): THREE.Mesh {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.0065, SHAFT_LENGTH, 10),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.7 }),
    )
    shaft.position.y = -HEAD_RY - SHAFT_LENGTH / 2
    shaft.castShadow = true
    return shaft
  }

  private createGrip(): THREE.Group {
    const grip = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
    const wrapMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
    })

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.014, GRIP_LENGTH, 12),
      material,
    )
    handle.position.y = -HEAD_RY - SHAFT_LENGTH - GRIP_LENGTH / 2
    handle.castShadow = true
    grip.add(handle)

    for (let i = 0; i < 4; i++) {
      const wrap = new THREE.Mesh(
        new THREE.TorusGeometry(0.0135, 0.0025, 6, 14),
        wrapMaterial,
      )
      wrap.rotation.x = Math.PI / 2
      wrap.position.y = -HEAD_RY - SHAFT_LENGTH - 0.02 - i * 0.028
      grip.add(wrap)
    }

    const butt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0145, 0.013, 0.012, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.5 }),
    )
    butt.position.y = -HEAD_RY - SHAFT_LENGTH - GRIP_LENGTH - 0.004
    grip.add(butt)

    return grip
  }
}