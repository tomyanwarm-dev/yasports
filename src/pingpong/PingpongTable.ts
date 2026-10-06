import * as THREE from 'three'

/** Regulation-inspired dimensions in metres; X = width, Z = table length. */
export const TABLE_WIDTH = 1.525
export const TABLE_LENGTH = 2.74
export const TABLE_HEIGHT = 0.76

/** The central table, line markings and simple undercarriage. */
export class PingpongTable {
  readonly group = new THREE.Group()

  constructor() {
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0x0d4d3f, roughness: 0.62 })
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x082f2a, roughness: 0.48, metalness: 0.18 })
    const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 })

    const top = new THREE.Mesh(new THREE.BoxGeometry(TABLE_WIDTH, 0.055, TABLE_LENGTH), topMaterial)
    top.position.y = TABLE_HEIGHT
    top.castShadow = true
    top.receiveShadow = true
    this.group.add(top)

    const edge = new THREE.Mesh(new THREE.BoxGeometry(TABLE_WIDTH + 0.045, 0.07, TABLE_LENGTH + 0.045), edgeMaterial)
    edge.position.y = TABLE_HEIGHT - 0.02
    this.group.add(edge)

    const lineY = TABLE_HEIGHT + 0.031
    const addLine = (width: number, length: number, x: number, z: number) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(width, 0.006, length), white)
      line.position.set(x, lineY, z)
      this.group.add(line)
    }
    const border = 0.027
    addLine(TABLE_WIDTH - border * 2, border, 0, -TABLE_LENGTH / 2 + border / 2)
    addLine(TABLE_WIDTH - border * 2, border, 0, TABLE_LENGTH / 2 - border / 2)
    addLine(border, TABLE_LENGTH, -TABLE_WIDTH / 2 + border / 2, 0)
    addLine(border, TABLE_LENGTH, TABLE_WIDTH / 2 - border / 2, 0)
    addLine(border, TABLE_LENGTH - border * 2, 0, 0)

    const frame = new THREE.Group()
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x172033, roughness: 0.42, metalness: 0.58 })
    for (const x of [-0.55, 0.55]) {
      for (const z of [-0.98, 0.98]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, TABLE_HEIGHT - 0.08, 0.07), frameMaterial)
        leg.position.set(x, (TABLE_HEIGHT - 0.08) / 2, z)
        leg.castShadow = true
        frame.add(leg)
      }
    }
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.1), frameMaterial)
    brace.position.set(0, 0.34, 0)
    frame.add(brace)
    this.group.add(frame)
  }
}
