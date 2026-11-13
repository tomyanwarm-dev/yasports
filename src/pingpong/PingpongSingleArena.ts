import * as THREE from 'three'

/**
 * Single-table pingpong arena (ITTF-inspired) for Three.js.
 *
 * Coordinate system:
 * - Origin (0,0,0): center of the court on the floor.
 * - X axis: table width direction (left/right).
 * - Y axis: up.
 * - Z axis: table length direction (player/opponent ends).
 *
 * ITTF table dimensions:
 * - Length (Z): 2.74 m
 * - Width  (X): 1.525 m
 * - Height of playing surface from floor (Y): 0.76 m
 * - Net height above playing surface: 0.1525 m, spanning table width at Z = 0
 */
export const ITTF = {
  tableLength: 2.74,
  tableWidth: 1.525,
  tableHeight: 0.76,
  tableTopThickness: 0.025,
  netHeight: 0.1525,
  netThickness: 0.003,
  whiteLineWidth: 0.02,
} as const

export const COURT = {
  matWidth: 10, // X (meters), proportional playing space
  matLength: 5, // Z (meters)
  barrierHeight: 0.75,
  barrierThickness: 0.04,
  wallHeight: 4.5,
  roomWidth: 14,
  roomLength: 10,
} as const

export interface ArenaBuildOptions {
  withCamera?: boolean
  withHelpers?: boolean
}

export class PingpongSingleArena {
  readonly scene: THREE.Scene
  readonly root: THREE.Group
  readonly camera: THREE.PerspectiveCamera

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xe8edf2)

    this.root = new THREE.Group()
    this.root.name = 'PingpongSingleArena'
    this.scene.add(this.root)

    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100)
    // Default spectator/gameplay-friendly view of the single table
    this.camera.position.set(4.2, 3.2, 4.8)
    this.camera.lookAt(0, ITTF.tableHeight, 0)

    this.buildEnvironment()
    this.buildTable()
    this.buildNet()
    this.buildBarriers()
    this.buildLighting()
  }

  /** Call in render loop / on resize when using this arena's camera. */
  setAspect(aspect: number): void {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  private buildEnvironment(): void {
    // Main hall floor (clean, minimal indoor background)
    const hallFloorMat = new THREE.MeshStandardMaterial({
      color: 0xd7dde5,
      roughness: 0.95,
      metalness: 0.0,
    })
    const hallFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomWidth, COURT.roomLength),
      hallFloorMat,
    )
    hallFloor.rotation.x = -Math.PI / 2
    hallFloor.position.set(0, 0, 0)
    hallFloor.receiveShadow = true
    this.root.add(hallFloor)

    // Sports mat / court area around the single table (blue tournament-style)
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x1e4f8f, // blue sports mat
      roughness: 0.92,
      metalness: 0.0,
    })
    const mat = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.matWidth, COURT.matLength),
      matMat,
    )
    mat.rotation.x = -Math.PI / 2
    mat.position.set(0, 0.002, 0) // slight offset to avoid z-fighting
    mat.receiveShadow = true
    this.root.add(mat)

    // Simple mat border line
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
    })
    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.matWidth + 0.08, COURT.matLength + 0.08),
      borderMat,
    )
    border.rotation.x = -Math.PI / 2
    border.position.set(0, 0.001, 0)
    border.receiveShadow = true
    this.root.add(border)
    this.root.add(mat) // ensure mat renders above border

    // Clean minimal walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.98,
      metalness: 0.0,
    })

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomWidth, COURT.wallHeight),
      wallMat,
    )
    backWall.position.set(0, COURT.wallHeight / 2, -COURT.roomLength / 2)
    backWall.receiveShadow = true
    this.root.add(backWall)

    const frontWall = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomWidth, COURT.wallHeight),
      wallMat,
    )
    frontWall.position.set(0, COURT.wallHeight / 2, COURT.roomLength / 2)
    frontWall.rotation.y = Math.PI
    frontWall.receiveShadow = true
    this.root.add(frontWall)

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomLength, COURT.wallHeight),
      wallMat,
    )
    leftWall.position.set(-COURT.roomWidth / 2, COURT.wallHeight / 2, 0)
    leftWall.rotation.y = Math.PI / 2
    leftWall.receiveShadow = true
    this.root.add(leftWall)

    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomLength, COURT.wallHeight),
      wallMat,
    )
    rightWall.position.set(COURT.roomWidth / 2, COURT.wallHeight / 2, 0)
    rightWall.rotation.y = -Math.PI / 2
    rightWall.receiveShadow = true
    this.root.add(rightWall)

    // Simple ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.roomWidth, COURT.roomLength),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 1.0 }),
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(0, COURT.wallHeight, 0)
    this.root.add(ceiling)
  }

  private buildTable(): void {
    const tableGroup = new THREE.Group()
    tableGroup.name = 'ITTF_Table'
    this.root.add(tableGroup)

    const topSurfaceY = ITTF.tableHeight // 0.76 m from floor
    const topCenterY = topSurfaceY - ITTF.tableTopThickness / 2

    // Table top (dark blue/green ITTF-style)
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x0b5d8a,
      roughness: 0.35,
      metalness: 0.05,
    })
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(ITTF.tableWidth, ITTF.tableTopThickness, ITTF.tableLength),
      topMat,
    )
    top.position.set(0, topCenterY, 0)
    top.castShadow = true
    top.receiveShadow = true
    tableGroup.add(top)

    // White lines (sidelines, endlines, center line)
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.0,
    })
    const lineY = topSurfaceY + 0.001

    const addLine = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat)
      m.position.set(x, y, z)
      m.receiveShadow = true
      tableGroup.add(m)
      return m
    }

    const lw = ITTF.whiteLineWidth
    const halfW = ITTF.tableWidth / 2
    const halfL = ITTF.tableLength / 2

    // End lines (along X) at both ends
    addLine(ITTF.tableWidth, 0.0015, lw, 0, lineY, halfL - lw / 2)
    addLine(ITTF.tableWidth, 0.0015, lw, 0, lineY, -halfL + lw / 2)
    // Side lines (along Z)
    addLine(lw, 0.0015, ITTF.tableLength, halfW - lw / 2, lineY, 0)
    addLine(lw, 0.0015, ITTF.tableLength, -halfW - -lw / 2, lineY, 0)
    // Center line (for doubles layout marking, runs along Z but only on each half in play; drawn as thin center divider)
    addLine(lw / 2, 0.0012, ITTF.tableLength, 0, lineY, 0)

    // Underframe / legs
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2f3a45,
      roughness: 0.5,
      metalness: 0.7,
    })
    const legGeom = new THREE.BoxGeometry(0.05, ITTF.tableHeight - 0.05, 0.05)
    const legY = (ITTF.tableHeight - 0.05) / 2
    const legOffsetX = ITTF.tableWidth * 0.38
    const legOffsetZ = ITTF.tableLength * 0.38

    const legPositions: [number, number, number][] = [
      [-legOffsetX, legY, -legOffsetZ],
      [legOffsetX, legY, -legOffsetZ],
      [-legOffsetX, legY, legOffsetZ],
      [legOffsetX, legY, legOffsetZ],
    ]
    for (const [x, y, z] of legPositions) {
      const leg = new THREE.Mesh(legGeom, frameMat)
      leg.position.set(x, y, z)
      leg.castShadow = true
      leg.receiveShadow = true
      tableGroup.add(leg)
    }

    // Support beams
    const beamMat = frameMat
    const longBeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, ITTF.tableLength * 0.72), beamMat)
    longBeam.position.set(0, ITTF.tableHeight * 0.35, 0)
    longBeam.castShadow = true
    tableGroup.add(longBeam)

    const crossBeam1 = new THREE.Mesh(new THREE.BoxGeometry(ITTF.tableWidth * 0.72, 0.04, 0.04), beamMat)
    crossBeam1.position.set(0, ITTF.tableHeight * 0.35, -ITTF.tableLength * 0.25)
    crossBeam1.castShadow = true
    tableGroup.add(crossBeam1)

    const crossBeam2 = crossBeam1.clone()
    crossBeam2.position.z = ITTF.tableLength * 0.25
    tableGroup.add(crossBeam2)
  }

  private buildNet(): void {
    // Net spans across the table width at center (Z = 0), height 15.25 cm above surface
    const netGroup = new THREE.Group()
    netGroup.name = 'ITTF_Net'
    this.root.add(netGroup)

    const surfaceY = ITTF.tableHeight
    const netHeight = ITTF.netHeight // 0.1525 m
    const netWidth = ITTF.tableWidth + 0.183 // standard overhang beyond sidelines (~9.15cm each side)
    const netCenterY = surfaceY + netHeight / 2

    // Net mesh (semi-transparent dark fabric)
    const netMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      transparent: true,
      opacity: 0.55,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
    })
    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(netWidth, netHeight),
      netMat,
    )
    net.position.set(0, netCenterY, 0)
    net.castShadow = true
    net.receiveShadow = true
    netGroup.add(net)

    // Top white tape/band
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
    const tape = new THREE.Mesh(
      new THREE.BoxGeometry(netWidth, 0.015, 0.006),
      tapeMat,
    )
    tape.position.set(0, surfaceY + netHeight, 0)
    tape.castShadow = true
    netGroup.add(tape)

    // Net posts/clamps at each side
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8,
    })
    const postHeight = netHeight + 0.03
    const postGeom = new THREE.CylinderGeometry(0.008, 0.008, postHeight, 12)
    const postX = netWidth / 2

    const leftPost = new THREE.Mesh(postGeom, postMat)
    leftPost.position.set(-postX, surfaceY + postHeight / 2, 0)
    leftPost.castShadow = true
    netGroup.add(leftPost)

    const rightPost = new THREE.Mesh(postGeom, postMat)
    rightPost.position.set(postX, surfaceY + postHeight / 2, 0)
    rightPost.castShadow = true
    netGroup.add(rightPost)

    // Simple clamps at table edge
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.6 })
    const clampGeom = new THREE.BoxGeometry(0.06, 0.03, 0.05)
    const clampY = surfaceY - 0.01
    const clampX = ITTF.tableWidth / 2 + 0.02

    const leftClamp = new THREE.Mesh(clampGeom, clampMat)
    leftClamp.position.set(-clampX, clampY, 0)
    netGroup.add(leftClamp)

    const rightClamp = new THREE.Mesh(clampGeom, clampMat)
    rightClamp.position.set(clampX, clampY, 0)
    netGroup.add(rightClamp)
  }

  private buildBarriers(): void {
    // Portable court barriers (surround/boards) around the playing mat
    const barrierGroup = new THREE.Group()
    barrierGroup.name = 'CourtBarriers'
    this.root.add(barrierGroup)

    const h = COURT.barrierHeight
    const t = COURT.barrierThickness
    const w = COURT.matWidth
    const l = COURT.matLength

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f2744, // dark blue portable barrier
      roughness: 0.85,
      metalness: 0.05,
    })
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xdbe4ee,
      roughness: 0.6,
      metalness: 0.1,
    })

    const makePanel = (px: number, py: number, pz: number, sx: number, sy: number, sz: number) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), panelMat)
      panel.position.set(px, py, pz)
      panel.castShadow = true
      panel.receiveShadow = true
      barrierGroup.add(panel)

      // top trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(sx * (sx >= sz ? 1 : 1.05), 0.03, sz * (sz > sx ? 1 : 1.05)), trimMat)
      trim.position.set(px, py + sy / 2 + 0.015, pz)
      barrierGroup.add(trim)
    }

    // Panels placed just outside mat edges, leaving small gaps like portable barriers
    const y = h / 2
    const gap = 0.15

    // Front and back (along X)
    makePanel(0, y, -l / 2 - t / 2, w * 0.95, h, t)
    makePanel(0, y, l / 2 + t / 2, w * 0.95, h, t)

    // Left and right (along Z), split into segments with small gaps
    const sideSeg = l * 0.42
    makePanel(-w / 2 - t / 2, y, -l / 4 - gap / 2, t, h, sideSeg)
    makePanel(-w / 2 - t / 2, y, l / 4 + gap / 2, t, h, sideSeg)
    makePanel(w / 2 + t / 2, y, -l / 4 - gap / 2, t, h, sideSeg)
    makePanel(w / 2 + t / 2, y, l / 4 + gap / 2, t, h, sideSeg)

    // Feet/support blocks for a portable look
    const footMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    const footGeom = new THREE.BoxGeometry(0.18, 0.04, 0.28)
    const footPositions: [number, number, number][] = [
      [-w * 0.25, 0.02, -l / 2 - 0.12],
      [w * 0.25, 0.02, -l / 2 - 0.12],
      [-w * 0.25, 0.02, l / 2 + 0.12],
      [w * 0.25, 0.02, l / 2 + 0.12],
      [-w / 2 - 0.12, 0.02, -l / 4],
      [-w / 2 - 0.12, 0.02, l / 4],
      [w / 2 + 0.12, 0.02, -l / 4],
      [w / 2 + 0.12, 0.02, l / 4],
    ]
    for (const [x, fy, z] of footPositions) {
      const foot = new THREE.Mesh(footGeom, footMat)
      foot.position.set(x, fy, z)
      foot.receiveShadow = true
      barrierGroup.add(foot)
    }
  }

  private buildLighting(): void {
    // Indoor arena lighting: soft ambient/base + focused overhead fixtures above table
    const ambient = new THREE.AmbientLight(0xffffff, 0.35)
    this.root.add(ambient)

    const hemi = new THREE.HemisphereLight(0xf8fbff, 0xbec8d4, 0.45)
    hemi.position.set(0, COURT.wallHeight, 0)
    this.root.add(hemi)

    // Overhead arena light rig focused on the table (creates natural shadows on table)
    const rigY = 3.6
    const fixtureMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      roughness: 0.4,
      metalness: 0.2,
    })
    const fixtureGeom = new THREE.BoxGeometry(1.2, 0.08, 0.35)

    const createOverheadLight = (x: number, z: number, intensity = 55) => {
      const fixture = new THREE.Mesh(fixtureGeom, fixtureMat)
      fixture.position.set(x, rigY, z)
      fixture.castShadow = false
      this.root.add(fixture)

      const spot = new THREE.SpotLight(0xfff7e8, intensity)
      spot.position.set(x, rigY - 0.05, z)
      spot.target.position.set(0, ITTF.tableHeight, 0)
      spot.angle = Math.PI / 5
      spot.penumbra = 0.35
      spot.decay = 1.8
      spot.distance = 18
      spot.castShadow = true
      spot.shadow.mapSize.width = 1024
      spot.shadow.mapSize.height = 1024
      spot.shadow.camera.near = 0.5
      spot.shadow.camera.far = 12
      spot.shadow.bias = -0.00015
      this.root.add(spot)
      this.root.add(spot.target)
    }

    // Focused lights above/around table center (tournament-like)
    createOverheadLight(0, -0.8, 60)
    createOverheadLight(0, 0.8, 60)
    createOverheadLight(-1.2, 0, 35)
    createOverheadLight(1.2, 0, 35)

    // Gentle fill lights so surroundings are clean and visible but table remains focus
    const fill1 = new THREE.PointLight(0xffffff, 10, 20, 2)
    fill1.position.set(-4, 3.2, -2.5)
    this.root.add(fill1)
    const fill2 = new THREE.PointLight(0xffffff, 10, 20, 2)
    fill2.position.set(4, 3.2, 2.5)
    this.root.add(fill2)
  }
}

/**
 * Convenience factory: returns a ready-to-render single-table arena.
 * Example:
 *   const arena = createPingpongSingleArena()
 *   renderer.render(arena.scene, arena.camera)
 */
export function createPingpongSingleArena(): PingpongSingleArena {
  return new PingpongSingleArena()
}
