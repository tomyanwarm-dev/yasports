import * as THREE from 'three'
import { HALF_WIDTH } from './BadmintonCourt.ts'

export const NET_HEIGHT = 1.524
export const POST_HEIGHT = 1.55

/**
 * The mesh is deliberately lifted: its lower edge sits well above the court
 * surface, leaving a large open space under the net. The posts still stand on
 * the floor.
 */
export const BOTTOM_NET_Y = 0.5

const TOP_NET_Y = NET_HEIGHT
const NET_LENGTH = HALF_WIDTH * 2

/** Regular grid with small 4-5 cm holes, thin and semi-transparent. */
const MESH_SPACING = 0.045
const MESH_COLOR = 0x1e293b
const MESH_OPACITY = 0.55

/**
 * Badminton net at X = 0, Z = 0, spanning the 6.10 m court width.
 *
 * Structure:
 *   group
 *   ├── left-post   (X -3.05, Y 0 -> 1.55, stands on the floor)
 *   ├── right-post  (X +3.05, Y 0 -> 1.55, stands on the floor)
 *   ├── top-tape    (white border, Y ~ 1.524)
 *   └── mesh        (Y 0.50 -> 1.524, large open space under the net)
 */
export class BadmintonNet {
  readonly group = new THREE.Group()
  readonly mesh = new THREE.Group()

  constructor() {
    this.mesh.name = 'net-mesh'
    this.mesh.add(this.createMeshGrid())

    this.group.add(this.createPost('left-post', -HALF_WIDTH))
    this.group.add(this.createPost('right-post', HALF_WIDTH))
    this.group.add(this.createTopTape(), this.mesh)
  }

  /**
   * Single BufferGeometry holding every vertical and horizontal line.
   * The lower edge is a normal grid line at BOTTOM_NET_Y, so nothing is ever
   * rendered below that height.
   */
  private createMeshGrid(): THREE.LineSegments {
    const points: number[] = []

    for (let x = -HALF_WIDTH; x <= HALF_WIDTH; x += MESH_SPACING) {
      pushSegment(points, x, BOTTOM_NET_Y, x, TOP_NET_Y)
    }
    for (let y = BOTTOM_NET_Y; y <= TOP_NET_Y; y += MESH_SPACING) {
      pushSegment(points, -HALF_WIDTH, y, HALF_WIDTH, y)
    }
    pushSegment(points, -HALF_WIDTH, TOP_NET_Y, HALF_WIDTH, TOP_NET_Y)

    assertMeshAboveFloor(points)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))

    const material = new THREE.LineBasicMaterial({
      color: MESH_COLOR,
      transparent: true,
      opacity: MESH_OPACITY,
    })
    return new THREE.LineSegments(geometry, material)
  }

  /** White border tape along the top of the mesh. */
  private createTopTape(): THREE.Group {
    const tape = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      emissive: 0x64748b,
      emissiveIntensity: 0.35,
    })

    const band = new THREE.Mesh(new THREE.BoxGeometry(NET_LENGTH, 0.05, 0.01), material)
    band.position.y = TOP_NET_Y - 0.025
    band.castShadow = true
    tape.add(band)

    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, NET_LENGTH, 6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 }),
    )
    cable.rotation.z = Math.PI / 2
    cable.position.y = TOP_NET_Y + 0.008
    tape.add(cable)

    return tape
  }

  private createPost(name: string, x: number): THREE.Group {
    const post = new THREE.Group()
    post.name = name

    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.55,
    })
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
    })

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, POST_HEIGHT, 12),
      postMaterial,
    )
    column.position.set(x, POST_HEIGHT / 2, 0)
    column.castShadow = true
    post.add(column)

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), postMaterial)
    cap.position.set(x, POST_HEIGHT, 0)
    post.add(cap)

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.02, 12),
      baseMaterial,
    )
    pad.position.set(x, 0.01, 0)
    pad.receiveShadow = true
    post.add(pad)

    return post
  }
}

/**
 * Pushes one grid line, rejecting anything below BOTTOM_NET_Y so the net can
 * never be rendered down to the court surface.
 */
function pushSegment(
  points: number[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
): void {
  if (ay < BOTTOM_NET_Y || by < BOTTOM_NET_Y) return
  points.push(ax, ay, 0, bx, by, 0)
}

/** Guards the "no mesh below BOTTOM_NET_Y" rule against future edits. */
function assertMeshAboveFloor(points: number[]): void {
  let lowest = Number.POSITIVE_INFINITY
  let highest = Number.NEGATIVE_INFINITY

  for (let i = 1; i < points.length; i += 3) {
    lowest = Math.min(lowest, points[i])
    highest = Math.max(highest, points[i])
  }

  if (lowest < BOTTOM_NET_Y || highest > TOP_NET_Y) {
    throw new Error(
      `BadmintonNet mesh must stay between ${BOTTOM_NET_Y} and ${TOP_NET_Y} m, got ${lowest} to ${highest}`,
    )
  }
}