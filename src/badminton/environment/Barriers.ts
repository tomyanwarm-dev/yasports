import * as THREE from 'three'

const BARRIER_HEIGHT = 0.9
const SEGMENT_LENGTH = 2.2
const GAP_AROUND_NET = 3.4

/**
 * Low barriers separating the playing area from the seating areas.
 * Deliberately short so they never block the camera view of the court.
 */
export class BadmintonBarriers {
  readonly group = new THREE.Group()

  constructor() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x24314a,
      roughness: 0.7,
      metalness: 0.2,
    })
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.5,
    })

    const positions: number[] = []
    for (let z = -6.7; z <= 6.7; z += SEGMENT_LENGTH) {
      if (Math.abs(z) < GAP_AROUND_NET) continue
      positions.push(z)
    }

    const count = positions.length * 2
    const bodies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.08, BARRIER_HEIGHT, SEGMENT_LENGTH * 0.92),
      material,
      count,
    )
    const tops = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.12, 0.08, SEGMENT_LENGTH * 0.92),
      topMaterial,
      count,
    )

    const dummy = new THREE.Object3D()
    let index = 0
    for (const side of [-1, 1]) {
      for (const z of positions) {
        dummy.position.set(side * 6.9, BARRIER_HEIGHT / 2, z)
        dummy.updateMatrix()
        bodies.setMatrixAt(index, dummy.matrix)

        dummy.position.set(side * 6.9, BARRIER_HEIGHT, z)
        dummy.updateMatrix()
        tops.setMatrixAt(index, dummy.matrix)

        index++
      }
    }

    for (const mesh of [bodies, tops]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.receiveShadow = true
      this.group.add(mesh)
    }
  }
}