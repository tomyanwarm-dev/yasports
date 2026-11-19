import * as THREE from 'three'
import { BadmintonAnimationController } from '../animation/AnimationController.ts'
import { BadmintonMovement } from './Movement.ts'
import type { MovementBounds, MoveIntent } from './Movement.ts'
import type { PlayerClip } from '../entities/PlayerModel.ts'

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

/** Informasi shuttle yang dipakai hanya untuk memilih footwork, bukan gerak. */
export interface ShuttleAwareness {
  position: THREE.Vector3
  velocity: THREE.Vector3
  phase: string
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
  /** Informasi shuttle untuk footwork reaktif (SplitStep/Lunge). */
  private shuttle: ShuttleAwareness | null = null

  /** Arena menyuap posisi shuttle tiap frame; tidak mengubah input keyboard. */
  setShuttleAwareness(pos: THREE.Vector3, vel: THREE.Vector3, phase: string): void {
    if (!this.shuttle) {
      this.shuttle = { position: pos.clone(), velocity: vel.clone(), phase }
    } else {
      this.shuttle.position.copy(pos)
      this.shuttle.velocity.copy(vel)
      this.shuttle.phase = phase
    }
  }

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
    private readonly animationController?: BadmintonAnimationController,
  ) {
    this.movement = new BadmintonMovement(player, bounds, options.speed ?? 4.2)
    this.input = options.input ?? (() => this.readKeyboard())
  }

  /** Swaps the input source, e.g. for a MediaPipe hand-tracking provider. */
  setInputProvider(provider: IntentProvider): void {
    this.input = provider
  }

  /** Keyboard intent tetap bisa dibaca arena sebagai fallback saat gesture OFF. */
  getKeyboardIntent(): MoveIntent {
    return this.readKeyboard()
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
    const intent = this.input()
    this.movement.apply(intent, delta)
    this.updateAnimation(intent)
  }

  get position(): THREE.Vector3 {
    return this.player.position
  }

  /** Menentukan klip locomotion dari intent + awareness shuttle. Tidak memotong one-shot. */
  private updateAnimation(intent: MoveIntent): void {
    if (!this.animationController) return
    if (this.animationController.isPlayingOneShot) return
    if (this.animationController.playingClip === 'Jump' || this.animationController.playingClip === 'Landing') return

    const sh = this.shuttle
    const incoming = sh?.phase === 'flying' && sh.velocity.z > 0.05
    const distance = sh
      ? Math.hypot(sh.position.x - this.player.position.x, sh.position.z - this.player.position.z)
      : Infinity

    // Lunge saat shuttle rendah & dekat dan pemain bergerak meraih.
    if (incoming && sh && sh.position.y < 1.05 && distance < 2.4 && (intent.x !== 0 || intent.z !== 0)) {
      const sideLocal = intent.x !== 0 ? intent.x : (sh.position.x - this.player.position.x)
      this.animationController.playLoop(sideLocal >= 0 ? 'LungeForehand' : 'LungeBackhand')
      return
    }

    // Split step saat diam menghadapi shuttle yang datang (siap bereaksi).
    if (incoming && intent.x === 0 && intent.z === 0 && distance < 3.4) {
      this.animationController.playLoop('SplitStep')
      return
    }

    let clip: PlayerClip
    if (intent.x === 0 && intent.z === 0) {
      this.animationController.stop()
      return
    }
    if (Math.abs(intent.x) >= Math.abs(intent.z)) {
      clip = intent.x > 0 ? 'ShuffleRight' : 'ShuffleLeft'
    } else {
      clip = intent.z > 0 ? 'WalkForward' : 'WalkBackward'
    }

    this.animationController.playLoop(clip)
  }

  private readKeyboard(): MoveIntent {
    const held = (key: string) => (this.pressed.has(key) ? 1 : 0)
    return {
      x: held(KEY_RIGHT) - held(KEY_LEFT),
      z: held(KEY_FORWARD) - held(KEY_BACK),
    }
  }
}
