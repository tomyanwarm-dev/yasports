import * as THREE from 'three'
import { BadmintonMovement } from './BadmintonMovement.ts'
import type { MovementBounds, MoveIntent } from './BadmintonMovement.ts'

const KEY_FORWARD = 'KeyW'
const KEY_BACK = 'KeyS'
const KEY_LEFT = 'KeyA'
const KEY_RIGHT = 'KeyD'

const TRACKED_KEYS = new Set([KEY_FORWARD, KEY_BACK, KEY_LEFT, KEY_RIGHT])

const direction: Record<string, 'forward' | 'back' | 'left' | 'right'> = {
  [KEY_FORWARD]: 'forward',
  [KEY_BACK]: 'back',
  [KEY_LEFT]: 'left',
  [KEY_RIGHT]: 'right',
}

/** Anything able to report a movement intent: keyboard, gamepad, hand tracking. */
export type IntentProvider = () => MoveIntent

export interface BadmintonPlayerControllerOptions {
  speed?: number
  /** Optional override, so hand tracking can replace the keyboard later. */
  input?: IntentProvider
}

/**
 * Moves the blue player from a movement intent.
 *
 * Input handling lives here, movement rules live in BadmintonMovement, and the
 * player model is untouched: the controller only moves the group that the GLB
 * model is attached to.
 */
export class BadmintonPlayerController {
  private readonly movement: BadmintonMovement
  private readonly pressed = new Set<string>()
  private input: IntentProvider
  private active = false

  private onKeyDown = (event: KeyboardEvent) => {
    if (TRACKED_KEYS.has(event.code)) this.pressed.add(event.code)
  }

  private onKeyUp = (event: KeyboardEvent) => {
    if (TRACKED_KEYS.has(event.code)) this.pressed.delete(event.code)
  }

  /** Clears held keys so the player does not keep drifting after focus loss. */
  private onBlur = () => this.pressed.clear()

  constructor(
    private player: THREE.Object3D,
    bounds: MovementBounds,
    options: BadmintonPlayerControllerOptions = {},
  ) {
    this.movement = new BadmintonMovement(player, bounds, options.speed ?? 4.2)
    this.input = options.input ?? (() => this.readKeyboard())
  }

  /** Swaps the input source, e.g. for a MediaPipe hand-tracking provider. */
  setInputProvider(provider: IntentProvider): void {
    this.input = provider
  }

  enable(): void {
    if (this.active) return
    this.active = true
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
  }

  disable(): void {
    if (!this.active) return
    this.active = false
    this.pressed.clear()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
  }

  update(delta: number): void {
    this.movement.apply(this.input(), delta)
  }

  get position(): THREE.Vector3 {
    return this.player.position
  }

  private readKeyboard(): MoveIntent {
    const held = (key: string) => (this.pressed.has(key) ? 1 : 0)
    return {
      x: held(KEY_RIGHT) - held(KEY_LEFT),
      z: held(KEY_FORWARD) - held(KEY_BACK),
    }
  }
}