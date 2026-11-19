import * as THREE from 'three'
import type { BadmintonPlayerModel, PlayerClip } from '../entities/PlayerModel.ts'
import type { BadmintonAnimationController } from '../animation/AnimationController.ts'
import { RacketSurfaceCollision } from './RacketSurfaceCollision.ts'

/** Model-local forward axis of the GLB (forward = -Z at yaw 0). */
const MODEL_FORWARD = new THREE.Vector3(0, 0, -1)

export interface RacketHitOptions {
  /** Shuttlecock radius, so contact is not pixel-perfect. */
  shuttleRadius?: number
  /** Fractions of the swing clip during which a hit is allowed. */
  contactWindow?: [number, number]
  /** Racket head must move faster than this for a hit to count. */
  minRacketSpeed?: number
  /** How much racket speed is converted into shuttlecock speed. */
  powerScale?: number
  /** Minimum and maximum outgoing shuttlecock speed, m/s. */
  minHitSpeed?: number
  maxHitSpeed?: number
  /** Share of the player's forward direction blended into the outgoing path. */
  forwardBias?: number
  /** Minimum rise of the outgoing path, so a shot always lofts. */
  minRise?: number
  defaultSwing?: PlayerClip
}

export interface RacketHit {
  /** Contact point in world space. */
  readonly point: THREE.Vector3
  /** Exact closest triangle-surface distance from shuttle center at impact. */
  readonly surfaceDistance: number
  /** Outgoing velocity, ready for BadmintonShuttlecockPhysics.launch(). */
  readonly velocity: THREE.Vector3
  readonly speed: number
  readonly clip: PlayerClip
}

const DEFAULTS: Required<RacketHitOptions> = {
  shuttleRadius: 0.035,
  contactWindow: [0.1, 0.85],
  minRacketSpeed: 0.5,
  powerScale: 1.15,
  minHitSpeed: 4.5,
  maxHitSpeed: 14,
  forwardBias: 0.45,
  minRise: 0.3,
  defaultSwing: 'ForehandClear',
}

/**
 * Racket hit detection for the human player.
 *
 * Sweeps the racket's actual string bed and rim triangles between frames. The
 * shuttle can only be struck when its physical radius overlaps a real surface
 * triangle inside the active swing window. One swing can only produce one hit.
 *
 * It knows nothing about physics, the shuttlecock visual or the keyboard: it
 * receives a shuttlecock position and returns hit information.
 */
export class BadmintonRacketHitDetection {
  private readonly options: Required<RacketHitOptions>
  private readonly surface: RacketSurfaceCollision

  /** Reused scratch objects, so the per-frame path allocates nothing. */
  private readonly head = new THREE.Vector3()
  private readonly previousHead = new THREE.Vector3()
  private readonly headVelocity = new THREE.Vector3()
  private readonly contactPoint = new THREE.Vector3()
  private readonly outgoing = new THREE.Vector3()
  private readonly forward = new THREE.Vector3()
  private readonly awayFromBody = new THREE.Vector3()
  private readonly previousRacketMatrix = new THREE.Matrix4()
  private readonly currentRacketMatrix = new THREE.Matrix4()
  private readonly swingSampleMatrix = new THREE.Matrix4()
  private readonly sweepFromMatrix = new THREE.Matrix4()
  private readonly sweepToMatrix = new THREE.Matrix4()
  private readonly previousShuttlecock = new THREE.Vector3()
  private readonly swingSampleShuttlecock = new THREE.Vector3()
  private readonly sweepFromShuttlecock = new THREE.Vector3()
  private readonly surfaceContact = {
    point: new THREE.Vector3(),
    distance: Infinity,
    surfaceVelocity: new THREE.Vector3(),
  }
  private hasPreviousFrame = false

  private swingActive = false
  private swingElapsed = 0
  private swingDuration = 0
  private settle = 0
  private hasContact = false
  /** Klip yang sebenarnya sedang diayun (dari animation controller). */
  private currentSwingClip: PlayerClip | null = null
  private previousClipTime = 0

  constructor(
    private player: BadmintonPlayerModel,
    options: RacketHitOptions = {},
    private readonly animationController?: BadmintonAnimationController,
  ) {
    this.options = { ...DEFAULTS, ...options }
    this.surface = new RacketSurfaceCollision(player.group)

    player.group.updateMatrixWorld(true)
    this.currentRacketMatrix.copy(this.surface.root.matrixWorld)
    this.previousRacketMatrix.copy(this.currentRacketMatrix)
    this.surface.getHeadWorldCenter(this.previousHead)
    this.head.copy(this.previousHead)
  }

  /** The racket head node in use, exposed for debugging. */
  get racketNode(): THREE.Object3D {
    return this.surface.root
  }

  get isSwinging(): boolean {
    return this.swingActive && this.swingElapsed < this.swingDuration
  }

  get hasHitThisSwing(): boolean {
    return this.hasContact
  }

  /** Contact radius actually in use, in metres. */
  get reach(): number {
    return this.options.shuttleRadius
  }

  /** Starts a swing clip. False when the clip is missing or already playing. */
  requestSwing(clip: PlayerClip = this.options.defaultSwing): boolean {
    // Let the animation controller own playback (visual + controller state).
    // The controller internally calls model.playSwing(), so the model state
    // is also set for hit detection to read.
    if (this.animationController) {
      if (!this.animationController.playOneShot(clip)) return false
    } else if (!this.player.playSwing(clip)) {
      return false
    }

    this.currentSwingClip = clip
    this.previousClipTime = this.player.playingClipTime
    const duration = this.player.clipDuration(clip)
    this.swingDuration = duration > 0 ? duration : 1.3
    this.swingElapsed = 0
    this.swingActive = true
    this.settle = SETTLE_TIME
    this.hasContact = false

    this.player.group.updateMatrixWorld(true)
    this.currentRacketMatrix.copy(this.surface.root.matrixWorld)
    this.previousRacketMatrix.copy(this.currentRacketMatrix)
    this.surface.getHeadWorldCenter(this.previousHead)
    this.head.copy(this.previousHead)
    this.headVelocity.set(0, 0, 0)
    // Preserve the previous shuttle position. The racket matrix above is the
    // exact start pose, so the first update must sweep this initial segment.
    this.hasPreviousFrame = true
    return true
  }

  /**
   * Advances the swing timer and tests contact.
   * @returns hit information on contact, otherwise null.
   */
  update(delta: number, shuttlecockPosition: THREE.Vector3): RacketHit | null {
    // Bones and the attached racket have moved; refresh the actual head mesh.
    this.player.group.updateMatrixWorld(true)
    this.currentRacketMatrix.copy(this.surface.root.matrixWorld)
    this.surface.getHeadWorldCenter(this.head)

    if (!this.hasPreviousFrame) {
      this.previousHead.copy(this.head)
      this.previousRacketMatrix.copy(this.currentRacketMatrix)
      this.previousShuttlecock.copy(shuttlecockPosition)
      this.hasPreviousFrame = true
      if (this.settle > 0) this.settle = Math.max(0, this.settle - delta)
      return null
    }

    const step = Math.max(delta, MIN_STEP)
    this.headVelocity.subVectors(this.head, this.previousHead).divideScalar(step)

    if (this.swingActive) {
      this.swingElapsed += delta
      if (this.swingElapsed >= this.swingDuration) {
        this.swingActive = false
        this.hasContact = false
      }
    }

    // Skip only the exact settling portion of this interval. If a slow frame
    // crosses the settle boundary, retain the remainder for collision checks.
    let sweepStartFraction = 0
    if (this.settle > 0) {
      sweepStartFraction = Math.min(1, this.settle / Math.max(delta, MIN_STEP))
      this.settle = Math.max(0, this.settle - delta)
    }

    if (sweepStartFraction < 1 && this.isContactWindowOpen()) {
      let contact: typeof this.surfaceContact | null = null
      if (sweepStartFraction === 0 && this.headVelocity.lengthSq() >= this.options.minRacketSpeed ** 2) {
        contact = this.surface.findSweptContact(
          this.previousRacketMatrix,
          this.currentRacketMatrix,
          this.previousShuttlecock,
          shuttlecockPosition,
          delta,
          this.options.shuttleRadius,
          this.surfaceContact,
        )
      }

      // A large render delta can jump over a curved animation path. Evaluate
      // intermediate poses from the same GLTF clip and sweep actual triangles
      // through each short interval instead of approximating the whole arc.
      if (!contact && this.player.playingClip === this.currentSwingClip) {
        const clipTime = this.player.playingClipTime
        const sampleStartTime = THREE.MathUtils.lerp(this.previousClipTime, clipTime, sweepStartFraction)
        const clipDelta = Math.max(0, clipTime - sampleStartTime)
        const sampleCount = THREE.MathUtils.clamp(Math.ceil(clipDelta * 120), 1, 64)
        const startPose = () => {
          this.player.group.updateMatrixWorld(true)
          this.sweepFromMatrix.copy(this.surface.root.matrixWorld)
          this.sweepFromShuttlecock.lerpVectors(
            this.previousShuttlecock,
            shuttlecockPosition,
            sweepStartFraction,
          )
        }
        if (sweepStartFraction > 0) {
          if (this.animationController) this.animationController.withCurrentClipAtTime(sampleStartTime, startPose)
          else this.player.withCurrentClipAtTime(sampleStartTime, startPose)
        } else {
          this.sweepFromMatrix.copy(this.previousRacketMatrix)
          this.sweepFromShuttlecock.copy(this.previousShuttlecock)
        }

        for (let i = 1; i <= sampleCount && !contact; i++) {
          const fraction = THREE.MathUtils.lerp(sweepStartFraction, 1, i / sampleCount)
          const sampleTime = THREE.MathUtils.lerp(this.previousClipTime, clipTime, fraction)
          const progress = sampleTime / this.swingDuration
          if (progress < this.options.contactWindow[0] || progress > this.options.contactWindow[1]) {
            continue
          }
          const sample = () => {
            this.player.group.updateMatrixWorld(true)
            this.swingSampleMatrix.copy(this.surface.root.matrixWorld)
            this.swingSampleShuttlecock.lerpVectors(
              this.previousShuttlecock,
              shuttlecockPosition,
              fraction,
            )
            return this.surface.findSweptContact(
              this.sweepFromMatrix,
              this.swingSampleMatrix,
              this.sweepFromShuttlecock,
              this.swingSampleShuttlecock,
              Math.max(delta / sampleCount, MIN_STEP),
              this.options.shuttleRadius,
              this.surfaceContact,
            )
          }
          const candidate = this.animationController
            ? this.animationController.withCurrentClipAtTime(sampleTime, sample)
            : this.player.withCurrentClipAtTime(sampleTime, sample)
          if (!candidate) {
            const inspectExactPose = () => {
              this.player.group.updateMatrixWorld(true)
              this.surface.measureClosest(
                this.swingSampleShuttlecock,
                this.surfaceContact,
                this.sweepFromMatrix,
                Math.max(delta / sampleCount, MIN_STEP),
              )
            }
            if (this.animationController) {
              this.animationController.withCurrentClipAtTime(sampleTime, inspectExactPose)
            } else {
              this.player.withCurrentClipAtTime(sampleTime, inspectExactPose)
            }
          }
          const exactContact = !candidate &&
            this.surfaceContact.distance <= this.options.shuttleRadius &&
            this.surfaceContact.surfaceVelocity.lengthSq() >= this.options.minRacketSpeed ** 2
          if (candidate && candidate.surfaceVelocity.lengthSq() >= this.options.minRacketSpeed ** 2) {
            contact = candidate
          } else if (exactContact) {
            contact = this.surfaceContact
          }
          this.sweepFromMatrix.copy(this.swingSampleMatrix)
          this.sweepFromShuttlecock.copy(this.swingSampleShuttlecock)
        }
      }

      if (contact) {
        this.contactPoint.copy(contact.point)
        this.headVelocity.copy(contact.surfaceVelocity)
        // One contact per swing: overlapping frames cannot re-trigger a hit.
        this.hasContact = true
        const hit = this.buildHit(contact.distance)
        this.advancePreviousFrame(shuttlecockPosition)
        return hit
      }
    }

    this.advancePreviousFrame(shuttlecockPosition)
    if (this.player.playingClip === this.currentSwingClip) {
      this.previousClipTime = this.player.playingClipTime
    }
    return null
  }

  resetSwing(): void {
    this.swingActive = false
    this.swingElapsed = 0
    this.hasContact = false
    this.currentSwingClip = null
  }

  private canHit(): boolean {
    if (!this.isSwinging || this.hasContact) return false
    if (this.headVelocity.lengthSq() < this.options.minRacketSpeed ** 2) return false

    return this.isContactWindowOpen()
  }

  private isContactWindowOpen(): boolean {
    if (!this.isSwinging || this.hasContact) return false
    const [start, end] = this.options.contactWindow
    const progress = this.swingElapsed / this.swingDuration
    return progress >= start && progress <= end
  }

  private buildHit(surfaceDistance: number): RacketHit {
    const { powerScale, minHitSpeed, maxHitSpeed, forwardBias, minRise } = this.options

    this.forward.copy(MODEL_FORWARD).applyQuaternion(this.player.group.quaternion).normalize()

    this.awayFromBody.subVectors(this.contactPoint, this.player.group.position)
    this.awayFromBody.y = 0
    if (this.awayFromBody.lengthSq() > 1e-6) this.awayFromBody.normalize()

    // Outgoing path: racket motion, blended towards the player's forward and
    // nudged away from the body.
    this.outgoing.copy(this.headVelocity)
    if (this.outgoing.lengthSq() < 1e-6) this.outgoing.copy(this.forward)
    this.outgoing.normalize()
    this.outgoing.lerp(this.forward, forwardBias).normalize()

    // The racket can be travelling downwards early in the clip; a shot must
    // still lift, so the outgoing path keeps a minimum rise.
    if (this.outgoing.y < minRise) this.outgoing.y = minRise
    this.outgoing.normalize()

    this.contactPoint.addScaledVector(this.awayFromBody, CONTACT_OFFSET)

    const speed = THREE.MathUtils.clamp(
      this.headVelocity.length() * powerScale,
      minHitSpeed,
      maxHitSpeed,
    )

    // Scaling the normalised direction keeps the final magnitude exactly at the
    // clamped speed, so the configured range is always respected.
    const velocity = this.outgoing.multiplyScalar(speed)

    return {
      point: this.contactPoint.clone(),
      surfaceDistance,
      velocity: velocity.clone(),
      speed,
      clip: this.currentSwingClip ?? this.options.defaultSwing,
    }
  }

  private advancePreviousFrame(shuttlecockPosition: THREE.Vector3): void {
    this.previousHead.copy(this.head)
    this.previousRacketMatrix.copy(this.currentRacketMatrix)
    this.previousShuttlecock.copy(shuttlecockPosition)
  }
}

const MIN_STEP = 1 / 240
const CONTACT_OFFSET = 0.02
const SETTLE_TIME = 0.08
