import * as THREE from 'three'

/**
 * Movement intent in the player's local space:
 *   x = strafe (+1 right, -1 left)
 *   z = forward (+1 towards the net, -1 backwards)
 *
 * Kept local so the same intent works for keyboard, gamepad or hand tracking,
 * and so a player rotated by PI is handled without special cases.
 */
export interface MoveIntent {
  x: number
  z: number
}

/** Axis-aligned area a player is allowed to move inside, in world metres. */
export interface MovementBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/**
 * Converts a local-space intent into a world-space direction.
 *
 * The player GLBs are authored with forward = -Z at rotation 0, so yaw 0
 * already looks towards -Z. The mapping uses that character frame (-Z forward,
 * +X right) instead of assuming a +Z forward model.
 */
export function intentToWorld(intent: MoveIntent, yaw: number): MoveIntent {
  const sin = Math.sin(yaw)
  const cos = Math.cos(yaw)
  return {
    x: -intent.z * sin + intent.x * cos,
    z: -intent.z * cos - intent.x * sin,
  }
}

/** Normalises the intent so diagonals are not faster than single axes. */
export function normaliseIntent(intent: MoveIntent): MoveIntent {
  const length = Math.hypot(intent.x, intent.z)
  if (length <= 1 || length === 0) return intent
  return { x: intent.x / length, z: intent.z / length }
}

/** Keeps a position inside the bounds, so nobody walks through the net. */
export function clampToBounds(position: THREE.Vector3, bounds: MovementBounds): void {
  position.x = Math.min(Math.max(position.x, bounds.minX), bounds.maxX)
  position.z = Math.min(Math.max(position.z, bounds.minZ), bounds.maxZ)
}

/**
 * Applies a movement intent to an Object3D using delta time. This class knows
 * nothing about keyboards, AI or the player model: it only moves and clamps.
 */
export class BadmintonMovement {
  private readonly movement = new THREE.Vector3()

  constructor(
    private target: THREE.Object3D,
    private bounds: MovementBounds,
    private speed: number,
  ) {}

  setSpeed(speed: number): void {
    this.speed = speed
  }

  setBounds(bounds: MovementBounds): void {
    this.bounds = bounds
  }

  apply(intent: MoveIntent, delta: number): void {
    const local = normaliseIntent(intent)
    if (local.x === 0 && local.z === 0) return

    const world = intentToWorld(local, this.target.rotation.y)
    this.movement.set(world.x, 0, world.z).multiplyScalar(this.speed * delta)

    const position = this.target.position
    position.add(this.movement)
    clampToBounds(position, this.bounds)
  }
}