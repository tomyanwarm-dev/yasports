import * as THREE from 'three'

const COUNT = 160
const SPREAD = 26

/**
 * Very light ambient dust for depth. A single Points draw call,
 * so it stays cheap on mid-range laptops.
 */
export class AmbientParticles {
  readonly points: THREE.Points

  constructor() {
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD - 4
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.06,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geometry, material)
  }

  update(elapsed: number): void {
    this.points.rotation.y = elapsed * 0.012
    this.points.position.y = Math.sin(elapsed * 0.15) * 0.4
  }
}