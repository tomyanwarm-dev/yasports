import * as THREE from 'three'

/** Tiered bowl stands surrounding the court. */
const LEVELS = 5
const RISE = 0.62
const FIRST_LEVEL_HEIGHT = 0.35
const TIER_SPREAD = 1.055

/** Inner edge of the first tier, measured from the court centre. */
const INNER_HALF_WIDTH = 9.0
const INNER_HALF_LENGTH = 13.0

/** Rounded-rectangle (superellipse) exponent: 4 keeps it boxy but curved. */
const SHAPE_POWER = 2 / 4
const ARC_SEGMENTS = 140
const SEAT_SPACING = 0.55

/** The wedge around +Z stays open so the camera keeps a wide view. */
const OPEN_WEDGE = (40 * Math.PI) / 180
const CLOSED_WEDGE = (140 * Math.PI) / 180
const ARC_START = CLOSED_WEDGE
const ARC_END = 2 * Math.PI + OPEN_WEDGE

/**
 * Spectator tribune: five stepped levels following a curved bowl around the
 * court, with seats instanced on each step and turned towards the court.
 * All steps and risers merge into two draw calls, the seats into three more.
 */
export class BadmintonTribune {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(this.buildSteps(), this.buildRisers(), this.buildSeats())
  }

  private curvePoint(angle: number, scale: number): THREE.Vector3 {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return new THREE.Vector3(
      INNER_HALF_WIDTH * scale * Math.sign(cos) * Math.pow(Math.abs(cos), SHAPE_POWER),
      0,
      INNER_HALF_LENGTH * scale * Math.sign(sin) * Math.pow(Math.abs(sin), SHAPE_POWER),
    )
  }

  private sampleArc(scale: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= ARC_SEGMENTS; i++) {
      const angle = ARC_START + ((ARC_END - ARC_START) * i) / ARC_SEGMENTS
      points.push(this.curvePoint(angle, scale))
    }
    return points
  }

  /** Horizontal walking surface of every tier. */
  private buildSteps(): THREE.Mesh {
    const positions: number[] = []

    for (let level = 0; level < LEVELS; level++) {
      const inner = Math.pow(TIER_SPREAD, level)
      const outer = Math.pow(TIER_SPREAD, level + 1)
      const top = FIRST_LEVEL_HEIGHT + level * RISE

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const from = ARC_START + ((ARC_END - ARC_START) * i) / ARC_SEGMENTS
        const to = ARC_START + ((ARC_END - ARC_START) * (i + 1)) / ARC_SEGMENTS

        const innerFrom = this.curvePoint(from, inner)
        const innerTo = this.curvePoint(to, inner)
        const outerFrom = this.curvePoint(from, outer)
        const outerTo = this.curvePoint(to, outer)

        pushQuad(
          positions,
          outerFrom.x, top, outerFrom.z,
          outerTo.x, top, outerTo.z,
          innerTo.x, top, innerTo.z,
          innerFrom.x, top, innerFrom.z,
        )
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.computeVertexNormals()

    const step = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x16203a,
        roughness: 0.9,
        side: THREE.DoubleSide,
      }),
    )
    step.receiveShadow = true
    return step
  }

  /** Vertical face at the front of every tier, which gives the stepped look. */
  private buildRisers(): THREE.Mesh {
    const positions: number[] = []

    for (let level = 0; level < LEVELS; level++) {
      const inner = Math.pow(TIER_SPREAD, level)
      const top = FIRST_LEVEL_HEIGHT + level * RISE
      const bottom = level === 0 ? 0 : FIRST_LEVEL_HEIGHT + (level - 1) * RISE

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const from = ARC_START + ((ARC_END - ARC_START) * i) / ARC_SEGMENTS
        const to = ARC_START + ((ARC_END - ARC_START) * (i + 1)) / ARC_SEGMENTS

        const innerFrom = this.curvePoint(from, inner)
        const innerTo = this.curvePoint(to, inner)

        pushQuad(
          positions,
          innerFrom.x, bottom, innerFrom.z,
          innerTo.x, bottom, innerTo.z,
          innerTo.x, top, innerTo.z,
          innerFrom.x, top, innerFrom.z,
        )
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.computeVertexNormals()

    const risers = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x101a30,
        roughness: 0.85,
        side: THREE.DoubleSide,
      }),
    )
    risers.receiveShadow = true
    return risers
  }

  private buildSeats(): THREE.Group {
    const placements = this.collectSeats()
    const count = placements.length

    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.65 })
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.55,
      metalness: 0.4,
    })

    const seats = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.44, 0.06, 0.42),
      seatMaterial,
      count,
    )
    const backs = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.44, 0.42, 0.06),
      seatMaterial,
      count,
    )
    const pedestals = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.07, 0.45, 0.07),
      frameMaterial,
      count,
    )

    const dummy = new THREE.Object3D()
    placements.forEach((placement, index) => {
      dummy.rotation.set(0, placement.yaw, 0)

      dummy.position.set(placement.x, placement.y + 0.48, placement.z)
      dummy.updateMatrix()
      seats.setMatrixAt(index, dummy.matrix)

      dummy.position.set(
        placement.x - Math.sin(placement.yaw) * 0.19,
        placement.y + 0.72,
        placement.z - Math.cos(placement.yaw) * 0.19,
      )
      dummy.updateMatrix()
      backs.setMatrixAt(index, dummy.matrix)

      dummy.position.set(placement.x, placement.y + 0.22, placement.z)
      dummy.updateMatrix()
      pedestals.setMatrixAt(index, dummy.matrix)
    })

    const group = new THREE.Group()
    for (const mesh of [seats, backs, pedestals]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.receiveShadow = true
      group.add(mesh)
    }
    return group
  }

  private collectSeats(): { x: number; y: number; z: number; yaw: number }[] {
    const placements: { x: number; y: number; z: number; yaw: number }[] = []

    for (let level = 0; level < LEVELS; level++) {
      const y = FIRST_LEVEL_HEIGHT + level * RISE
      const arc = this.sampleArc(Math.pow(TIER_SPREAD, level + 0.5))
      let travelled = SEAT_SPACING

      for (let i = 0; i < arc.length - 1; i++) {
        const from = arc[i]
        const to = arc[i + 1]
        const segment = from.distanceTo(to)
        if (segment === 0) continue

        while (travelled <= segment) {
          const ratio = travelled / segment
          const x = from.x + (to.x - from.x) * ratio
          const z = from.z + (to.z - from.z) * ratio
          placements.push({ x, y, z, yaw: Math.atan2(-x, -z) })
          travelled += SEAT_SPACING
        }
        travelled -= segment
      }
    }

    return placements
  }
}

function pushQuad(
  positions: number[],
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number,
  dx: number, dy: number, dz: number,
): void {
  positions.push(ax, ay, az, bx, by, bz, cx, cy, cz)
  positions.push(ax, ay, az, cx, cy, cz, dx, dy, dz)
}