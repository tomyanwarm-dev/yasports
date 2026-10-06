import * as THREE from 'three'
import { TABLE_HEIGHT, TABLE_WIDTH } from './PingpongTable.ts'

/** Lightweight net with posts and a procedural line grid. */
export class PingpongNet {
  readonly group = new THREE.Group()

  constructor() {
    const height = 0.1525
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x263247, roughness: 0.4, metalness: 0.65 })
    const tapeMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 })
    for (const x of [-TABLE_WIDTH / 2 - 0.035, TABLE_WIDTH / 2 + 0.035]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, height + 0.11, 10), postMaterial)
      post.position.set(x, TABLE_HEIGHT + height / 2 - 0.02, 0)
      post.castShadow = true
      this.group.add(post)
    }
    const tape = new THREE.Mesh(new THREE.BoxGeometry(TABLE_WIDTH + 0.08, 0.024, 0.016), tapeMaterial)
    tape.position.set(0, TABLE_HEIGHT + height, 0)
    this.group.add(tape, this.createGrid(height))
  }

  private createGrid(height: number): THREE.LineSegments {
    const positions: number[] = []
    const half = TABLE_WIDTH / 2
    for (let x = -half; x <= half + 0.001; x += 0.055) positions.push(x, TABLE_HEIGHT, 0, x, TABLE_HEIGHT + height, 0)
    for (let y = TABLE_HEIGHT; y <= TABLE_HEIGHT + height + 0.001; y += 0.04) positions.push(-half, y, 0, half, y, 0)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.72 }))
  }
}
