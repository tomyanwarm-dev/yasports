import * as THREE from 'three'

interface SurfaceTriangle {
  a: THREE.Vector3
  b: THREE.Vector3
  c: THREE.Vector3
  bounds: THREE.Box3
  center: THREE.Vector3
}

interface BvhNode {
  bounds: THREE.Box3
  left?: BvhNode
  right?: BvhNode
  triangles?: SurfaceTriangle[]
}

export interface RacketSurfaceContact {
  /** Closest point on the actual racket triangle surface, in world coordinates. */
  point: THREE.Vector3
  /** Surface-to-shuttle-center distance, in metres. */
  distance: number
  /** Velocity of that same local surface point across this swept frame. */
  surfaceVelocity: THREE.Vector3
}

/**
 * Collision against the racket string bed and rim, stored in racket-root local
 * space so their BVH remains valid while the hand and racket move together.
 */
export class RacketSurfaceCollision {
  readonly root: THREE.Object3D
  private readonly tree: BvhNode
  private readonly localHeadCenter = new THREE.Vector3()
  private readonly bounds = new THREE.Box3()
  private readonly rootInverse = new THREE.Matrix4()
  private readonly relative = new THREE.Matrix4()
  private readonly a = new THREE.Vector3()
  private readonly b = new THREE.Vector3()
  private readonly c = new THREE.Vector3()
  private readonly localPoint = new THREE.Vector3()
  private readonly closest = new THREE.Vector3()
  private readonly closestWorld = new THREE.Vector3()
  private readonly closestLocal = new THREE.Vector3()
  private readonly previousSurfaceWorld = new THREE.Vector3()
  private readonly currentSurfaceWorld = new THREE.Vector3()
  private readonly worldShuttle = new THREE.Vector3()
  private readonly interpolated = new THREE.Matrix4()
  private readonly inverse = new THREE.Matrix4()
  private readonly previousPosition = new THREE.Vector3()
  private readonly currentPosition = new THREE.Vector3()
  private readonly previousRotation = new THREE.Quaternion()
  private readonly currentRotation = new THREE.Quaternion()
  private readonly previousScale = new THREE.Vector3()
  private readonly currentScale = new THREE.Vector3()
  private readonly interpolatedPosition = new THREE.Vector3()
  private readonly interpolatedRotation = new THREE.Quaternion()
  private readonly interpolatedScale = new THREE.Vector3()

  constructor(playerGroup: THREE.Object3D) {
    const roots: THREE.Object3D[] = []
    playerGroup.traverse((object) => {
      if (object.name === 'BadmintonRacket' && object.parent?.name === 'RightHand') roots.push(object)
    })
    if (roots.length !== 1) {
      throw new Error(`Expected one BadmintonRacket attached to RightHand; found ${roots.length}`)
    }
    this.root = roots[0]
    this.root.updateMatrixWorld(true)

    const namedMeshes = new Map<string, THREE.Mesh[]>()
    this.root.traverse((object) => {
      if (!object.visible || !(object as THREE.Mesh).isMesh) return
      const mesh = object as THREE.Mesh
      if (mesh.name === 'Object_4' || mesh.name === 'Object_10') {
        const list = namedMeshes.get(mesh.name) ?? []
        list.push(mesh)
        namedMeshes.set(mesh.name, list)
      }
    })

    let selected = ['Object_4', 'Object_10'].flatMap((name) => namedMeshes.get(name) ?? [])
    if (selected.length !== 2 || new Set(selected.map((mesh) => mesh.name)).size !== 2) {
      // A renamed asset may still be used if its mesh dimensions clearly match
      // a racket head surface. A shaft or handle never passes this test.
      selected = []
      this.root.traverse((object) => {
        if (!object.visible || !(object as THREE.Mesh).isMesh) return
        const mesh = object as THREE.Mesh
        if (this.isHeadSurface(mesh)) selected.push(mesh)
      })
    }
    if (selected.length === 0) {
      throw new Error('No validated racket string-bed or frame surface mesh found')
    }

    this.rootInverse.copy(this.root.matrixWorld).invert()
    const triangles: SurfaceTriangle[] = []
    for (const mesh of selected) this.appendMeshTriangles(mesh, triangles)
    if (triangles.length < 2) throw new Error('Racket head surface has too few valid triangles')

    this.tree = this.buildBvh(triangles)
    this.tree.bounds.getCenter(this.localHeadCenter)
  }

  getHeadWorldCenter(target: THREE.Vector3): THREE.Vector3 {
    return target.copy(this.localHeadCenter).applyMatrix4(this.root.matrixWorld)
  }

  /** Closest exact triangle point for a bounded runtime diagnostic sample. */
  measureClosest(
    worldPoint: THREE.Vector3,
    target: RacketSurfaceContact,
    previousMatrix?: THREE.Matrix4,
    delta = 0,
  ): RacketSurfaceContact {
    this.root.updateWorldMatrix(true, true)
    this.inverse.copy(this.root.matrixWorld).invert()
    this.localPoint.copy(worldPoint).applyMatrix4(this.inverse)
    const nearest = this.findNearest(this.tree, this.localPoint, Infinity)
    if (!nearest) {
      target.distance = Infinity
      target.surfaceVelocity.set(0, 0, 0)
      return target
    }
    target.point.copy(nearest.point).applyMatrix4(this.root.matrixWorld)
    target.distance = target.point.distanceTo(worldPoint)
    if (previousMatrix && delta > 0) {
      this.previousSurfaceWorld.copy(nearest.point).applyMatrix4(previousMatrix)
      target.surfaceVelocity
        .subVectors(target.point, this.previousSurfaceWorld)
        .divideScalar(Math.max(delta, 1 / 240))
    } else {
      target.surfaceVelocity.set(0, 0, 0)
    }
    return target
  }

  /**
   * Sweeps the complete head surface between two transforms while the shuttle
   * moves between its two world positions. The returned point is on a real
   * triangle, and distance is measured against the shuttle's physical radius.
   */
  findSweptContact(
    previousMatrix: THREE.Matrix4,
    currentMatrix: THREE.Matrix4,
    previousShuttle: THREE.Vector3,
    currentShuttle: THREE.Vector3,
    delta: number,
    shuttleRadius: number,
    target: RacketSurfaceContact,
  ): RacketSurfaceContact | null {
    previousMatrix.decompose(this.previousPosition, this.previousRotation, this.previousScale)
    currentMatrix.decompose(this.currentPosition, this.currentRotation, this.currentScale)
    const headRadius = this.tree.bounds.getBoundingSphere(SPHERE).radius
    const rotationTravel = this.previousRotation.angleTo(this.currentRotation) * headRadius
    const relativeTravel =
      previousShuttle.distanceTo(currentShuttle) +
      this.previousPosition.distanceTo(this.currentPosition) +
      rotationTravel
    const sampleStep = Math.max(shuttleRadius * 0.5, 0.008)
    const steps = THREE.MathUtils.clamp(Math.ceil(relativeTravel / sampleStep), 1, 32)
    const maxWorldDistance = shuttleRadius
    let bestDistanceSq = maxWorldDistance * maxWorldDistance
    let found = false

    for (let i = 0; i <= steps; i++) {
      const alpha = i / steps
      this.interpolateMatrix(previousMatrix, currentMatrix, alpha, this.interpolated)
      this.inverse.copy(this.interpolated).invert()
      this.worldShuttle.lerpVectors(previousShuttle, currentShuttle, alpha)
      this.localPoint.copy(this.worldShuttle).applyMatrix4(this.inverse)
      const localScale = minAbsScale(this.interpolated)
      const localRadius = maxWorldDistance / Math.max(localScale, 1e-6)
      const nearest = this.findNearest(this.tree, this.localPoint, localRadius * localRadius)
      if (!nearest) continue
      const worldScale = localScale
      const worldDistanceSq = nearest.distanceSq * worldScale * worldScale
      if (worldDistanceSq > bestDistanceSq) continue
      bestDistanceSq = worldDistanceSq
      this.closestWorld.copy(nearest.point).applyMatrix4(this.interpolated)
      target.point.copy(this.closestWorld)
      target.distance = Math.sqrt(worldDistanceSq)
      this.closestLocal.copy(nearest.point)
      found = true
    }

    if (found) {
      this.previousSurfaceWorld.copy(this.closestLocal).applyMatrix4(previousMatrix)
      this.currentSurfaceWorld.copy(this.closestLocal).applyMatrix4(currentMatrix)
      target.surfaceVelocity
        .subVectors(this.currentSurfaceWorld, this.previousSurfaceWorld)
        .divideScalar(Math.max(delta, 1 / 240))
    }
    return found ? target : null
  }

  private appendMeshTriangles(mesh: THREE.Mesh, output: SurfaceTriangle[]): void {
    const geometry = mesh.geometry
    const position = geometry.getAttribute('position')
    if (!position || position.itemSize < 3) return
    const index = geometry.getIndex()
    const count = index ? index.count : position.count
    this.relative.multiplyMatrices(this.rootInverse, mesh.matrixWorld)

    for (let i = 0; i + 2 < count; i += 3) {
      const ia = index ? index.getX(i) : i
      const ib = index ? index.getX(i + 1) : i + 1
      const ic = index ? index.getX(i + 2) : i + 2
      this.a.fromBufferAttribute(position, ia).applyMatrix4(this.relative)
      this.b.fromBufferAttribute(position, ib).applyMatrix4(this.relative)
      this.c.fromBufferAttribute(position, ic).applyMatrix4(this.relative)
      const ab = this.b.clone().sub(this.a)
      const ac = this.c.clone().sub(this.a)
      if (ab.cross(ac).lengthSq() < 1e-12) continue
      const a = this.a.clone()
      const b = this.b.clone()
      const c = this.c.clone()
      const bounds = new THREE.Box3().setFromPoints([a, b, c])
      output.push({ a, b, c, bounds, center: bounds.getCenter(new THREE.Vector3()) })
    }
  }

  private isHeadSurface(mesh: THREE.Mesh): boolean {
    const geometry = mesh.geometry
    if (!geometry.getAttribute('position')) return false
    geometry.computeBoundingBox()
    if (!geometry.boundingBox) return false
    this.relative.multiplyMatrices(this.rootInverse, mesh.matrixWorld)
    const box = geometry.boundingBox.clone().applyMatrix4(this.relative)
    const dimensions = box.getSize(new THREE.Vector3()).toArray().sort((a, b) => a - b)
    return dimensions[0] <= 0.05 && dimensions[1] >= 0.16 && dimensions[2] >= 0.18 && dimensions[2] <= 0.36
  }

  private buildBvh(triangles: SurfaceTriangle[]): BvhNode {
    const bounds = new THREE.Box3().makeEmpty()
    for (const triangle of triangles) bounds.union(triangle.bounds)
    if (triangles.length <= LEAF_TRIANGLE_COUNT) return { bounds, triangles }

    const size = bounds.getSize(SIZE)
    const axis = size.x >= size.y && size.x >= size.z ? 'x' : size.y >= size.z ? 'y' : 'z'
    triangles.sort((a, b) => a.center[axis] - b.center[axis])
    const middle = Math.floor(triangles.length / 2)
    return {
      bounds,
      left: this.buildBvh(triangles.slice(0, middle)),
      right: this.buildBvh(triangles.slice(middle)),
    }
  }

  private findNearest(
    node: BvhNode,
    point: THREE.Vector3,
    maximumDistanceSq: number,
  ): { point: THREE.Vector3; distanceSq: number } | null {
    let bestDistanceSq = maximumDistanceSq
    let bestPoint: THREE.Vector3 | null = null
    const visit = (current: BvhNode): void => {
      if (current.bounds.distanceToPoint(point) ** 2 > bestDistanceSq) return
      if (current.triangles) {
        for (const item of current.triangles) {
          TRIANGLE.set(item.a, item.b, item.c).closestPointToPoint(point, this.closest)
          const distanceSq = this.closest.distanceToSquared(point)
          if (distanceSq <= bestDistanceSq) {
            bestDistanceSq = distanceSq
            bestPoint = this.closest.clone()
          }
        }
        return
      }

      const left = current.left
      const right = current.right
      if (!left || !right) return
      const leftDistance = left.bounds.distanceToPoint(point)
      const rightDistance = right.bounds.distanceToPoint(point)
      if (leftDistance <= rightDistance) {
        visit(left)
        visit(right)
      } else {
        visit(right)
        visit(left)
      }
    }
    visit(node)
    return bestPoint ? { point: bestPoint, distanceSq: bestDistanceSq } : null
  }

  private interpolateMatrix(
    from: THREE.Matrix4,
    to: THREE.Matrix4,
    alpha: number,
    target: THREE.Matrix4,
  ): void {
    // Linear interpolation of all 16 matrix elements introduces shear and
    // collapses rotations between frames. Interpolate the actual rigid pose.
    from.decompose(this.previousPosition, this.previousRotation, this.previousScale)
    to.decompose(this.currentPosition, this.currentRotation, this.currentScale)
    this.interpolatedPosition.lerpVectors(this.previousPosition, this.currentPosition, alpha)
    this.interpolatedRotation.copy(this.previousRotation).slerp(this.currentRotation, alpha)
    this.interpolatedScale.lerpVectors(this.previousScale, this.currentScale, alpha)
    target.compose(this.interpolatedPosition, this.interpolatedRotation, this.interpolatedScale)
  }
}

const LEAF_TRIANGLE_COUNT = 8
const TRIANGLE = new THREE.Triangle()
const SPHERE = new THREE.Sphere()
const SIZE = new THREE.Vector3()

function minAbsScale(matrix: THREE.Matrix4): number {
  matrix.decompose(UNUSED_POSITION, UNUSED_ROTATION, UNUSED_SCALE)
  return Math.min(Math.abs(UNUSED_SCALE.x), Math.abs(UNUSED_SCALE.y), Math.abs(UNUSED_SCALE.z))
}

const UNUSED_POSITION = new THREE.Vector3()
const UNUSED_ROTATION = new THREE.Quaternion()
const UNUSED_SCALE = new THREE.Vector3()
