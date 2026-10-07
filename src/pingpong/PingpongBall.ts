import * as THREE from 'three'

/**
 * 3D Ping Pong ball physics & rendering component.
 * Includes physics integration (velocity, gravity, air friction) and floor/table shadow marker.
 */
export class PingpongBall {
  readonly group = new THREE.Group()
  readonly mesh: THREE.Mesh
  readonly shadowDot: THREE.Mesh
  readonly radius = 0.021

  readonly position = new THREE.Vector3()
  readonly velocity = new THREE.Vector3()
  active = true
  lastHitBy: 'player1' | 'player2' | null = null
  bouncedOnTableCount = 0

  constructor() {
    // Standard white/light-orange ping pong ball mesh
    const geometry = new THREE.SphereGeometry(this.radius, 24, 24)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveIntensity: 0.08,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.group.add(this.mesh)

    // Floor/table projected shadow indicator for better 3D spatial perception
    const shadowGeo = new THREE.CircleGeometry(this.radius * 1.4, 16)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    this.shadowDot = new THREE.Mesh(shadowGeo, shadowMat)
    this.shadowDot.rotation.x = -Math.PI / 2
    this.group.add(this.shadowDot)
  }

  reset(pos: THREE.Vector3, vel: THREE.Vector3): void {
    this.position.copy(pos)
    this.velocity.copy(vel)
    this.mesh.position.copy(pos)
    this.active = true
    this.lastHitBy = null
    this.bouncedOnTableCount = 0
  }

  update(delta: number): void {
    if (!this.active) return

    // Limit delta to prevent tunneling on frame drops
    const dt = Math.min(delta, 0.033)

    // Apply gravity
    this.velocity.y += -9.81 * dt

    // Apply light air resistance
    this.velocity.x *= Math.pow(0.985, dt * 60)
    this.velocity.z *= Math.pow(0.992, dt * 60)

    // Step position
    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt
    this.position.z += this.velocity.z * dt

    // Update 3D mesh
    this.mesh.position.copy(this.position)

    // Update shadow dot directly below ball on table/floor height
    const shadowY = Math.max(0, this.position.y - this.radius)
    this.shadowDot.position.set(this.position.x, shadowY + 0.002, this.position.z)
    
    // Scale shadow dot based on distance from surface
    const heightAboveSurface = Math.max(0, this.position.y - 0.76)
    const shadowScale = Math.max(0.4, 1.2 - heightAboveSurface * 0.5)
    this.shadowDot.scale.set(shadowScale, shadowScale, 1)
  }
}
