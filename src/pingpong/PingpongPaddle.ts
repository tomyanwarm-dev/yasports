import * as THREE from 'three'

/**
 * 3D Ping Pong Paddle (Bat) with red/black rubber faces and a wooden handle.
 * Provides bounding box / sphere data for accurate 3D physics collision detection.
 */
export class PingpongPaddle {
  readonly group = new THREE.Group()
  readonly bladeMesh: THREE.Mesh
  readonly radius = 0.09
  readonly thickness = 0.012

  constructor(isPlayerOne: boolean = true) {
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0xc28d53,
      roughness: 0.5,
      metalness: 0.1,
    })

    const redRubber = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.35,
      metalness: 0.05,
    })

    const blackRubber = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.05,
    })

    // Main wooden core blade
    this.bladeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.thickness, 32),
      woodMaterial,
    )
    this.bladeMesh.rotation.x = Math.PI / 2
    this.bladeMesh.castShadow = true
    this.group.add(this.bladeMesh)

    // Red Rubber Face (+Z side)
    const redFace = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius * 0.98, this.radius * 0.98, 0.002, 32),
      redRubber,
    )
    redFace.rotation.x = Math.PI / 2
    redFace.position.z = this.thickness / 2 + 0.001
    this.group.add(redFace)

    // Black Rubber Face (-Z side)
    const blackFace = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius * 0.98, this.radius * 0.98, 0.002, 32),
      blackRubber,
    )
    blackFace.rotation.x = Math.PI / 2
    blackFace.position.z = -this.thickness / 2 - 0.001
    this.group.add(blackFace)

    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.10, 0.022),
      woodMaterial,
    )
    handle.position.set(0, -this.radius - 0.045, 0)
    handle.castShadow = true
    this.group.add(handle)

    // Handle Grip Bands
    const gripBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.035, 0.024),
      new THREE.MeshStandardMaterial({ color: isPlayerOne ? 0x2563eb : 0xef4444, roughness: 0.6 }),
    )
    gripBand.position.set(0, -this.radius - 0.045, 0)
    this.group.add(gripBand)

    // Orient paddle so red face is forward by default
    if (!isPlayerOne) {
      this.group.rotation.y = Math.PI
    }
  }

  /** Gets bounding sphere center & radius for physics collision */
  getWorldCenter(target: THREE.Vector3): THREE.Vector3 {
    return this.group.getWorldPosition(target)
  }
}
