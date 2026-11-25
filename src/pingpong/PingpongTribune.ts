import * as THREE from 'three'
import { createSponsorBoardTexture, SPONSOR_BRANDS } from './PingpongSponsors.ts'

/** Tiered GOR spectator bowl surrounding the Pingpong court. */
const LEVELS = 5
const RISE = 0.56
const FIRST_LEVEL_HEIGHT = 0.42
const TIER_SPREAD = 1.11

/** Inner edge of the first tier, measured from court centre. */
const INNER_HALF_WIDTH = 5.3
const INNER_HALF_LENGTH = 7.2

/** Rounded-rectangle (superellipse) exponent matching BadmintonTribune. */
const SHAPE_POWER = 2 / 4
const ARC_SEGMENTS = 140
const SEAT_SPACING = 0.56

/** Keep +Z wedge open so POV and MAIN cameras always have an unobstructed view. */
const OPEN_WEDGE = (40 * Math.PI) / 180
const CLOSED_WEDGE = (140 * Math.PI) / 180
const ARC_START = CLOSED_WEDGE
const ARC_END = 2 * Math.PI + OPEN_WEDGE

interface SeatPlacement {
  x: number
  y: number
  z: number
  yaw: number
  level: number
  slotIndex: number
}

/**
 * GOR spectator tribune: five stepped tiers with multi-colored stadium chairs,
 * aisle walkways, front safety rails, and court-facing sponsor fascia boards.
 */
export class PingpongTribune {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(
      this.buildSteps(),
      this.buildRisers(),
      this.buildSeats(),
      this.buildFrontRailings(),
      this.buildFasciaSponsors(),
    )
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

    // White base material so per-instance colors via setColorAt render accurately
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.58 })
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.55,
      metalness: 0.4,
    })

    const seats = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.43, 0.06, 0.4),
      seatMaterial,
      count,
    )
    const backs = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.43, 0.42, 0.06),
      seatMaterial,
      count,
    )
    const pedestals = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.07, 0.42, 0.07),
      frameMaterial,
      count,
    )

    // GOR color sections: blue, cyan-sky, VIP crimson front-center, and teal sides
    const colorBlue = new THREE.Color(0x1d4ed8)
    const colorCyan = new THREE.Color(0x0284c7)
    const colorTeal = new THREE.Color(0x0f766e)
    const colorVip = new THREE.Color(0xbe123c)

    const dummy = new THREE.Object3D()
    placements.forEach((placement, index) => {
      dummy.rotation.set(0, placement.yaw, 0)

      dummy.position.set(placement.x, placement.y + 0.46, placement.z)
      dummy.updateMatrix()
      seats.setMatrixAt(index, dummy.matrix)

      dummy.position.set(
        placement.x - Math.sin(placement.yaw) * 0.18,
        placement.y + 0.69,
        placement.z - Math.cos(placement.yaw) * 0.18,
      )
      dummy.updateMatrix()
      backs.setMatrixAt(index, dummy.matrix)

      dummy.position.set(placement.x, placement.y + 0.21, placement.z)
      dummy.updateMatrix()
      pedestals.setMatrixAt(index, dummy.matrix)

      // Section coloring for visual variety across the GOR bowl
      let seatColor = colorBlue
      if (placement.level === 0 && Math.abs(placement.x) < 3.4 && placement.z < 0) {
        seatColor = colorVip
      } else if (placement.level % 2 === 1) {
        seatColor = colorCyan
      } else if (Math.abs(placement.x) > 4.6) {
        seatColor = colorTeal
      }
      seats.setColorAt(index, seatColor)
      backs.setColorAt(index, seatColor)
    })

    if (seats.instanceColor) seats.instanceColor.needsUpdate = true
    if (backs.instanceColor) backs.instanceColor.needsUpdate = true

    const group = new THREE.Group()
    for (const mesh of [seats, backs, pedestals]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.receiveShadow = true
      group.add(mesh)
    }
    return group
  }

  private collectSeats(): SeatPlacement[] {
    const placements: SeatPlacement[] = []

    for (let level = 0; level < LEVELS; level++) {
      const y = FIRST_LEVEL_HEIGHT + level * RISE
      const arc = this.sampleArc(Math.pow(TIER_SPREAD, level + 0.5))
      let travelled = SEAT_SPACING
      let slotIndex = 0

      for (let i = 0; i < arc.length - 1; i++) {
        const from = arc[i]
        const to = arc[i + 1]
        const segment = from.distanceTo(to)
        if (segment === 0) continue

        while (travelled <= segment) {
          const ratio = travelled / segment
          const x = from.x + (to.x - from.x) * ratio
          const z = from.z + (to.z - from.z) * ratio

          // Leave periodic 1-seat aisle gaps so the stands have realistic walkways
          const isAisle = slotIndex % 13 === 6
          if (!isAisle) {
            placements.push({ x, y, z, yaw: Math.atan2(-x, -z), level, slotIndex })
          }
          slotIndex++
          travelled += SEAT_SPACING
        }
        travelled -= segment
      }
    }

    return placements
  }

  /** Sleek metallic safety rail along the front rim of Tier 1. */
  private buildFrontRailings(): THREE.Group {
    const group = new THREE.Group()
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.45,
      metalness: 0.65,
    })

    const arc = this.sampleArc(1.015)
    const railY = FIRST_LEVEL_HEIGHT + 0.52
    const postCount = 24
    const posts = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.54, 8),
      railMat,
      postCount,
    )
    const dummy = new THREE.Object3D()

    for (let i = 0; i < postCount; i++) {
      const pt = arc[Math.round((i / (postCount - 1)) * (arc.length - 1))]
      dummy.position.set(pt.x, FIRST_LEVEL_HEIGHT + 0.27, pt.z)
      dummy.updateMatrix()
      posts.setMatrixAt(i, dummy.matrix)
    }
    posts.instanceMatrix.needsUpdate = true
    group.add(posts)

    // Continuous top handrail tube segments
    const segmentCount = Math.floor(arc.length / 2)
    const rails = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.04, 0.04, 1),
      railMat,
      segmentCount,
    )
    let idx = 0
    for (let i = 0; i < arc.length - 2 && idx < segmentCount; i += 2) {
      const a = arc[i]
      const b = arc[i + 2]
      const dx = b.x - a.x
      const dz = b.z - a.z
      const len = Math.hypot(dx, dz)
      dummy.position.set((a.x + b.x) / 2, railY, (a.z + b.z) / 2)
      dummy.rotation.set(0, Math.atan2(dx, dz), 0)
      dummy.scale.set(1, 1, len + 0.03)
      dummy.updateMatrix()
      rails.setMatrixAt(idx++, dummy.matrix)
    }
    rails.count = idx
    rails.instanceMatrix.needsUpdate = true
    group.add(rails)

    return group
  }

  /**
   * Sports sponsor boards mounted along the front Tier 1 riser facing the court,
   * visible right behind the barriers from both POV and MAIN cameras.
   */
  private buildFasciaSponsors(): THREE.Group {
    const group = new THREE.Group()
    const boardWidth = 2.4
    const boardHeight = 0.52
    const y = FIRST_LEVEL_HEIGHT + 0.28

    const placements: { x: number; z: number; rotY: number; brandIdx: number }[] = [
      // Far (-Z) tribune front facing +Z
      { x: -3.0, z: -(INNER_HALF_LENGTH - 0.12), rotY: 0, brandIdx: 7 },
      { x: 0, z: -(INNER_HALF_LENGTH - 0.12), rotY: 0, brandIdx: 0 },
      { x: 3.0, z: -(INNER_HALF_LENGTH - 0.12), rotY: 0, brandIdx: 9 },
      // Left (-X) tribune front facing +X
      { x: -(INNER_HALF_WIDTH - 0.12), z: -3.2, rotY: Math.PI / 2, brandIdx: 2 },
      { x: -(INNER_HALF_WIDTH - 0.12), z: 0, rotY: Math.PI / 2, brandIdx: 4 },
      { x: -(INNER_HALF_WIDTH - 0.12), z: 3.2, rotY: Math.PI / 2, brandIdx: 6 },
      // Right (+X) tribune front facing -X
      { x: INNER_HALF_WIDTH - 0.12, z: -3.2, rotY: -Math.PI / 2, brandIdx: 1 },
      { x: INNER_HALF_WIDTH - 0.12, z: 0, rotY: -Math.PI / 2, brandIdx: 5 },
      { x: INNER_HALF_WIDTH - 0.12, z: 3.2, rotY: -Math.PI / 2, brandIdx: 8 },
    ]

    const backingMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7 })

    for (const p of placements) {
      const brand = SPONSOR_BRANDS[p.brandIdx % SPONSOR_BRANDS.length]
      const board = new THREE.Group()
      board.position.set(p.x, y, p.z)
      board.rotation.y = p.rotY

      const backing = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth + 0.08, boardHeight + 0.06, 0.05),
        backingMat,
      )
      board.add(backing)

      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(boardWidth, boardHeight),
        new THREE.MeshBasicMaterial({
          map: createSponsorBoardTexture(brand, 512, 160),
        }),
      )
      front.position.z = 0.03
      board.add(front)

      group.add(board)
    }

    return group
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
