import * as THREE from 'three'

/** Camera sits behind the human player, slightly above head height. */
const CAMERA_OFFSET = new THREE.Vector3(0, 3.15, 5.6)
/** Aim point a little ahead of the player, towards the net. */
const LOOK_OFFSET = new THREE.Vector3(0, 1.15, -2.6)

const FOLLOW_SMOOTHING = 6
const LOOK_SMOOTHING = 8
const MIN_CAMERA_Y = 2.2
const MAX_CAMERA_Z = 14

/**
 * Lightweight third-person gameplay camera for the human player.
 *
 * It only follows the player's position and always keeps looking towards the
 * net, so moving left, right, forward or back never spins the view around.
 * The menu and sport-selection cameras are untouched.
 */
export class BadmintonPlayerCamera {
  private readonly desiredPosition = new THREE.Vector3()
  private readonly desiredLookAt = new THREE.Vector3()
  private readonly smoothedLookAt = new THREE.Vector3()

  constructor(
    private camera: THREE.PerspectiveCamera,
    private target: THREE.Object3D,
  ) {
    this.snap()
  }

  /** Places the camera immediately, used when the player model appears. */
  snap(): void {
    this.computeDesired()
    this.camera.position.copy(this.desiredPosition)
    this.smoothedLookAt.copy(this.desiredLookAt)
    this.camera.lookAt(this.smoothedLookAt)
  }

  update(delta: number): void {
    this.computeDesired()

    this.camera.position.lerp(this.desiredPosition, 1 - Math.exp(-delta * FOLLOW_SMOOTHING))
    this.smoothedLookAt.lerp(this.desiredLookAt, 1 - Math.exp(-delta * LOOK_SMOOTHING))
    this.camera.lookAt(this.smoothedLookAt)
  }

  setTarget(target: THREE.Object3D): void {
    this.target = target
    this.snap()
  }

  private computeDesired(): void {
    this.desiredPosition.copy(this.target.position).add(CAMERA_OFFSET)
    this.desiredPosition.y = Math.max(this.desiredPosition.y, MIN_CAMERA_Y)
    this.desiredPosition.z = Math.min(this.desiredPosition.z, MAX_CAMERA_Z)

    this.desiredLookAt.copy(this.target.position).add(LOOK_OFFSET)
  }
}
