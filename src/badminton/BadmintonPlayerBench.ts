import * as THREE from 'three'

/** Benches behind each baseline, outside the playing area. */
const BENCH_POSITIONS: [number, number, number][] = [
  [0, -8.6, 0],
  [0, 8.6, 0],
]

/** Simple player benches: one long seat, backrest and two legs each. */
export class BadmintonPlayerBench {
  readonly group = new THREE.Group()

  constructor() {
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
    })
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6,
      metalness: 0.4,
    })

    for (const [x, z, rotationY] of BENCH_POSITIONS) {
      const bench = new THREE.Group()

      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.42), seatMaterial)
      seat.position.y = 0.45
      bench.add(seat)

      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.34, 0.06), seatMaterial)
      back.position.set(0, 0.66, -0.18)
      bench.add(back)

      for (const offset of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.36), frameMaterial)
        leg.position.set(offset * 1.05, 0.225, 0)
        bench.add(leg)
      }

      bench.position.set(x, 0, z)
      bench.rotation.y = rotationY
      bench.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true
          object.receiveShadow = true
        }
      })
      this.group.add(bench)
    }
  }
}