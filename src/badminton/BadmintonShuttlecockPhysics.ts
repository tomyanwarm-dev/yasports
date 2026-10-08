import * as THREE from 'three'

export type ShuttlecockPhase = 'idle' | 'flying' | 'resetting'

export type ShuttlecockEvent =
  | 'launched'
  | 'flying'
  | 'landed'
  | 'outOfBounds'

/** Area the shuttlecock may travel in, in world metres. */
export interface ShuttlecockBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface ShuttlecockPhysicsOptions {
  gravity?: number
  /** Ground plane and the height at which the shuttle is considered down. */
  groundY?: number
  groundThreshold?: number
  bounds?: ShuttlecockBounds
  /** Where the shuttlecock returns to after landing or leaving the court. */
  resetPoint?: THREE.Vector3
  /** Seconds the shuttlecock stays idle before the arena may relaunch it. */
  resetDelay?: number
}

/** Court is 6.10 (X) by 13.40 (Z); a small margin keeps it inside the lines. */
const DEFAULT_BOUNDS: ShuttlecockBounds = {
  minX: -3.05,
  maxX: 3.05,
  minZ: -6.7,
  maxZ: 6.7,
}

/**
 * Basic shuttlecock flight: velocity, gravity and a reset when it lands or
 * leaves the court. No racket collision, no net collision, no scoring.
 *
 * Integration is analytic for constant acceleration, so the result does not
 * depend on the frame rate: the same launch travels the same path at 30, 60
 * or 144 fps.
 */
export class BadmintonShuttlecockPhysics {
  private readonly position = new THREE.Vector3()
  private readonly velocity = new THREE.Vector3()
  private readonly gravityVector = new THREE.Vector3()

  private readonly gravity: number
  private readonly groundY: number
  private readonly groundThreshold: number
  private bounds: ShuttlecockBounds
  private readonly resetPoint: THREE.Vector3
  private resetDelay: number
  private resetTimer = 0

  private phase: ShuttlecockPhase = 'idle'

  constructor(options: ShuttlecockPhysicsOptions = {}) {
    this.gravity = options.gravity ?? 9.81
    this.groundY = options.groundY ?? 0
    this.groundThreshold = options.groundThreshold ?? 0.05
    this.bounds = options.bounds ?? DEFAULT_BOUNDS
    this.resetPoint = (options.resetPoint ?? new THREE.Vector3(0, 1.5, 3.5)).clone()
    this.resetDelay = options.resetDelay ?? 1.2

    this.gravityVector.set(0, -this.gravity, 0)
    this.position.copy(this.resetPoint)
  }

  launch(position: THREE.Vector3, velocity: THREE.Vector3): void {
    this.position.copy(position)
    this.velocity.copy(velocity)
    this.resetTimer = 0
    this.phase = 'flying'
  }

  /** Stops the flight and parks the shuttlecock at its reset point. */
  reset(position?: THREE.Vector3, velocity?: THREE.Vector3): void {
    this.position.copy(position ?? this.resetPoint)
    this.velocity.copy(velocity ?? ZERO)
    this.resetTimer = 0
    this.phase = 'idle'
  }

  stop(): void {
    this.velocity.set(0, 0, 0)
    this.phase = 'resetting'
    this.resetTimer = this.resetDelay
  }

  /** Advances the flight and reports what happened this frame. */
  update(delta: number): ShuttlecockEvent {
    const step = Math.min(Math.max(delta, 0), MAX_STEP)

    if (this.phase !== 'flying') {
      if (this.phase === 'resetting') {
        this.resetTimer -= step
        if (this.resetTimer <= 0) this.reset()
      }
      return 'flying'
    }

    // Exact integration for constant acceleration: frame-rate independent.
    this.position.addScaledVector(this.velocity, step)
    this.position.addScaledVector(this.gravityVector, 0.5 * step * step)
    this.velocity.addScaledVector(this.gravityVector, step)

    if (this.position.y <= this.groundY + this.groundThreshold) {
      this.position.y = this.groundY + this.groundThreshold
      this.stop()
      return 'landed'
    }

    if (this.isOutOfBounds()) {
      this.stop()
      return 'outOfBounds'
    }

    return 'flying'
  }

  private isOutOfBounds(): boolean {
    const { minX, maxX, minZ, maxZ } = this.bounds
    return (
      this.position.x < minX ||
      this.position.x > maxX ||
      this.position.z < minZ ||
      this.position.z > maxZ
    )
  }

  setBounds(bounds: ShuttlecockBounds): void {
    this.bounds = bounds
  }

  getPosition(): THREE.Vector3 {
    return this.position
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity
  }

  getGravity(): number {
    return this.gravity
  }

  isActive(): boolean {
    return this.phase === 'flying'
  }

  getPhase(): ShuttlecockPhase {
    return this.phase
  }

  /** True once the reset delay elapsed and the arena may launch again. */
  isReadyToLaunch(): boolean {
    return this.phase === 'idle'
  }
}

const MAX_STEP = 0.1
const ZERO = new THREE.Vector3()
