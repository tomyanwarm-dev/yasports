import * as THREE from 'three'

/** Real shuttlecock size in metres: 0.085 long, 0.065 skirt diameter. */
const TOTAL_LENGTH = 0.085
const HALF_LENGTH = TOTAL_LENGTH / 2
const SKIRT_RADIUS = 0.0325
const CORK_RADIUS = 0.013
const FEATHER_COUNT = 8

const UP = new THREE.Vector3(0, 1, 0)
const FORWARD = new THREE.Vector3()

/**
 * Procedural shuttlecock: cork head at the bottom, feather skirt on top.
 * Built from primitives only (no external model) and cheap enough to keep in
 * the scene permanently.
 *
 * This class owns look and transform only. Flight behaviour lives in
 * BadmintonShuttlecockPhysics, so rendering stays independent of simulation.
 */
export class BadmintonShuttlecock {
  readonly group = new THREE.Group()

  private readonly body = new THREE.Group()
  private readonly targetQuaternion = new THREE.Quaternion()
  private velocity = new THREE.Vector3()

  constructor(parent?: THREE.Object3D) {
    this.group.name = 'shuttlecock'
    this.group.add(this.body)
    this.body.add(
      this.createCork(),
      this.createCollar(),
      this.createSkirt(),
      this.createFeathers(),
      this.createTipRing(),
    )
    parent?.add(this.group)
  }

  setPosition(position: THREE.Vector3): void {
    this.group.position.copy(position)
  }

  getPosition(): THREE.Vector3 {
    return this.group.position
  }

  setVelocity(velocity: THREE.Vector3): void {
    this.velocity.copy(velocity)
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity
  }

  /**
   * Orients the shuttlecock cork-first along its flight direction, like a real
   * shuttle falling. Rotation is smoothed so a nearly zero velocity does not
   * produce jitter.
   */
  update(delta: number): void {
    const speed = this.velocity.length()
    if (speed < 0.05) {
      this.body.quaternion.slerp(IDENTITY, Math.min(delta * 4, 1))
      return
    }

    // Local -Y points at the cork, so up must oppose the travel direction.
    FORWARD.copy(this.velocity).normalize().negate()
    this.targetQuaternion.setFromUnitVectors(UP, FORWARD)
    this.body.quaternion.slerp(this.targetQuaternion, Math.min(delta * 12, 1))
  }

  /** Puts the shuttlecock back at rest: upright, cork down, no motion. */
  reset(position: THREE.Vector3): void {
    this.setPosition(position)
    this.setVelocity(ZERO)
    this.body.quaternion.identity()
  }

  dispose(): void {
    this.group.removeFromParent()
    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose()
    })
  }

  private createCork(): THREE.Mesh {
    const cork = new THREE.Mesh(
      new THREE.SphereGeometry(CORK_RADIUS, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }),
    )
    cork.scale.set(1, 1.3, 1)
    cork.position.y = -HALF_LENGTH + CORK_RADIUS * 1.3
    cork.castShadow = true
    return cork
  }

  private createCollar(): THREE.Mesh {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(CORK_RADIUS * 1.1, CORK_RADIUS * 1.5, 0.006, 14),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.25 }),
    )
    collar.position.y = -HALF_LENGTH + CORK_RADIUS * 2.6
    return collar
  }

  private createSkirt(): THREE.Mesh {
    const height = HALF_LENGTH - CORK_RADIUS * 2.6
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(SKIRT_RADIUS * 0.45, SKIRT_RADIUS, height, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7,
        emissive: 0x64748b,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
      }),
    )
    skirt.position.y = -HALF_LENGTH + CORK_RADIUS * 2.6 + height / 2
    skirt.castShadow = true
    return skirt
  }

  /** A few flat feathers to read as a feather skirt without heavy geometry. */
  private createFeathers(): THREE.Group {
    const feathers = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.75,
      side: THREE.DoubleSide,
    })
    const height = HALF_LENGTH - CORK_RADIUS * 2.6

    for (let i = 0; i < FEATHER_COUNT; i++) {
      const angle = (i / FEATHER_COUNT) * Math.PI * 2
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.013, height * 0.9), material)
      const radius = SKIRT_RADIUS * 0.66
      feather.position.set(
        Math.cos(angle) * radius,
        -HALF_LENGTH + CORK_RADIUS * 2.6 + height * 0.5,
        Math.sin(angle) * radius,
      )
      feather.rotation.y = -angle
      feather.rotation.x = -0.12
      feathers.add(feather)
    }

    return feathers
  }

  private createTipRing(): THREE.Mesh {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(SKIRT_RADIUS * 0.92, 0.0025, 6, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = HALF_LENGTH - 0.002
    return ring
  }
}

const IDENTITY = new THREE.Quaternion()
const ZERO = new THREE.Vector3()
