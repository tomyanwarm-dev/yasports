import * as THREE from 'three'
import { BadmintonAnimationController } from '../animation/AnimationController.ts'
import { BadmintonMovement } from './Movement.ts'
import type { MovementBounds, MoveIntent } from './Movement.ts'
import type { PlayerClip } from '../entities/PlayerModel.ts'
import { planRedReception, type RedReceptionPlan } from './RedReception.ts'

const KEY_FORWARD = 'KeyW'
const KEY_BACK = 'KeyS'
const KEY_LEFT = 'KeyA'
const KEY_RIGHT = 'KeyD'

const TRACKED_KEYS = new Set([KEY_FORWARD, KEY_BACK, KEY_LEFT, KEY_RIGHT])

/** SplitStep cukup sekali per kedatangan shuttle, lalu ditahan sebentar. */
const SPLIT_STEP_HOLD = 0.16
/** Footwork tidak berganti arah hanya karena delta x/z sedikit berubah. */
const FOOTWORK_HYSTERESIS = 0.15
const FOOTWORK_MIN_HOLD = 0.1
/** Lunge dimulai sebelum kontak dan dipertahankan sampai one-shot mengambil alih. */
const LUNGE_LEAD_WINDOW = 0.22
/** Recovery dipertahankan walau planner masih menghasilkan intent otomatis. */
const RECOVERY_SECONDS = 0.34
/** Mulai melambat saat tubuh mendekati stance intersepsi (m). */
const APPROACH_SLOW_RADIUS = 0.55
/** Kecepatan minimum menjelang stance; step tetap di-clamp agar tidak overshoot. */
const APPROACH_MIN_SPEED_FACTOR = 0.28

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
  /**
   * Sejak 2.21 tidak ada callback pukulan otomatis. Ayunan hanya datang dari
   * Space / gesture lewat `BadmintonArena.onSwingInput`.
   */
}

/** Informasi shuttle yang dipakai hanya untuk memilih footwork, bukan gerak. */
export interface ShuttleAwareness {
  position: THREE.Vector3
  velocity: THREE.Vector3
  phase: string
  gravity: number
}

/**
 * Moves the human Red player from keyboard input and incoming-shuttle reception.
 *
 * Input handling lives here, movement rules live in BadmintonMovement, and the
 * player model is untouched: the controller only moves the group that the GLB
 * model is attached to.
 */
export class BadmintonPlayerController {
  private readonly movement: BadmintonMovement
  private readonly bounds: MovementBounds
  private readonly speed: number
  private readonly pressed = new Set<string>()
  private input: IntentProvider
  private active = false
  /** Rencana kontak yang sedang dijalankan untuk satu shuttle datang. */
  private receptionPlan: RedReceptionPlan | null = null
  /** Recovery tetap dijalankan setelah ayunan manual selesai. */
  private manualSwingPending = false
  private recoveryRemaining = 0
  /** Animasi transisi Red (Tahap 2.20B). */
  private incomingLatch = false
  private splitStepPlayed = false
  private splitStepRemaining = 0
  private footworkClip: PlayerClip | null = null
  private footworkHold = 0
  private lungeClip: PlayerClip | null = null
  private manualMovementActive = false
  private receptionDistance = Infinity
  /** Informasi shuttle untuk footwork reaktif (SplitStep/Lunge). */
  private shuttle: ShuttleAwareness | null = null

  /** Arena menyuap posisi shuttle tiap frame; tidak mengubah input keyboard. */
  setShuttleAwareness(pos: THREE.Vector3, vel: THREE.Vector3, phase: string, gravity = 9.81): void {
    if (!this.shuttle) {
      this.shuttle = { position: pos.clone(), velocity: vel.clone(), phase, gravity }
    } else {
      this.shuttle.position.copy(pos)
      this.shuttle.velocity.copy(vel)
      this.shuttle.phase = phase
      this.shuttle.gravity = gravity
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
    this.bounds = bounds
    this.speed = options.speed ?? 4.2
    this.movement = new BadmintonMovement(player, bounds, this.speed)
    this.input = options.input ?? (() => this.readKeyboard())
  }

  /**
   * Arena memanggil ini setelah RacketHitDetection benar-benar mencatat kontak.
   * Sejak 2.21 ini HANYA membersihkan rencana positioning; tidak ada ayunan
   * otomatis yang direset atau dijadwalkan ulang.
   */
  noteSwingContact(): void {
    this.receptionPlan = null
  }

  /** Alias kompatibilitas untuk probe lama; kini setara `noteSwingContact()`. */
  noteAutomaticSwingResult(): void {
    this.noteSwingContact()
  }

  /** Arena memanggil ini setelah `requestSwing()` manual berhasil dimulai. */
  noteSwingStarted(): void {
    this.manualSwingPending = true
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
    const manualIntent = this.input()
    const hasManualMovement = manualIntent.x !== 0 || manualIntent.z !== 0
    this.manualMovementActive = hasManualMovement
    const receptionIntent = this.getReceptionIntent(delta)
    // WASD takes control while held; automatic reception resumes on release.
    const intent = hasManualMovement ? manualIntent : receptionIntent
    this.movement.apply(intent, delta)
    this.updateAnimation(intent, delta, hasManualMovement)
  }

  get position(): THREE.Vector3 {
    return this.player.position
  }

  /** Rencana penerimaan aktif, untuk diagnostics browser (read-only). */
  get reception(): RedReceptionPlan | null {
    return this.receptionPlan
  }

  /**
   * @deprecated Auto-swing dinonaktifkan sejak 2.21. Angka ini selalu 0 dan
   * dipertahankan hanya agar hook diagnostik lama tidak rusak.
   */
  get automaticSwingAttempts(): number {
    return 0
  }

  /** Status animasi transisi untuk audit 2.20B (read-only). */
  get animationState() {
    return {
      footwork: this.footworkClip,
      lunge: this.lungeClip,
      splitStepPlayed: this.splitStepPlayed,
      splitStepRemaining: +this.splitStepRemaining.toFixed(3),
      recoveryRemaining: +this.recoveryRemaining.toFixed(3),
      /** @deprecated Auto-swing nonaktif sejak 2.21; selalu false. */
      automaticSwingActive: false,
      receptionDistance: +this.receptionDistance.toFixed(3),
    }
  }

  /**
   * Rangkaian animasi Red:
   * Ready → SplitStep → Footwork → Lunge → Shot → Recovery → Ready.
   *
   * Fungsi ini hanya memilih klip. Posisi tetap dikendalikan `movement`,
   * dan pukulan tetap lewat `RacketHitDetection` produksi.
   */
  private updateAnimation(intent: MoveIntent, delta: number, hasManualMovement: boolean): void {
    const anim = this.animationController
    if (!anim) return

    // Jump/Landing dimiliki Arena (Caps Lock). Jangan menimpa, tetapi lepas
    // latch transisi supaya footwork langsung kembali setelah mendarat.
    if (anim.playingClip === 'Jump' || anim.playingClip === 'Landing') {
      this.footworkClip = null
      this.footworkHold = 0
      this.lungeClip = null
      this.splitStepRemaining = 0
      return
    }

    // One-shot pukulan tidak boleh dipotong oleh footwork/Lunge/Recovery.
    if (anim.isPlayingOneShot) return

    // Ayunan manual (Space/gesture) sudah selesai → Recovery → Ready.
    // Tidak ada ayunan otomatis yang memicu transisi ini.
    if (this.manualSwingPending && anim.playingClip === 'Ready') {
      this.manualSwingPending = false
      this.recoveryRemaining = RECOVERY_SECONDS
    }

    if (this.recoveryRemaining > 0) {
      // WASD boleh mengambil alih; intent otomatis tidak boleh membatalkan
      // Recovery sehingga transisi kembali ke Ready tetap terlihat.
      if (hasManualMovement) {
        this.recoveryRemaining = 0
        this.clearTransientAnimation()
      } else {
        this.recoveryRemaining = Math.max(0, this.recoveryRemaining - Math.max(delta, 0))
        if (this.recoveryRemaining > 0) {
          anim.playLoop('Recovery')
        } else {
          anim.playLoop('Ready')
          this.clearTransientAnimation()
        }
        return
      }
    }

    const sh = this.shuttle
    const incoming = sh?.phase === 'flying' && sh.velocity.z > 0.05
    const distance = sh
      ? Math.hypot(sh.position.x - this.player.position.x, sh.position.z - this.player.position.z)
      : Infinity

    if (!incoming) {
      this.incomingLatch = false
      this.splitStepPlayed = false
      this.splitStepRemaining = 0
      this.lungeClip = null
    } else if (!this.incomingLatch) {
      // Satu kedatangan shuttle = satu SplitStep, bukan satu per frame.
      this.incomingLatch = true
      this.splitStepPlayed = false
      this.lungeClip = null
    }

    if (incoming && sh && !this.splitStepPlayed && distance < 4.4) {
      this.splitStepPlayed = true
      this.splitStepRemaining = SPLIT_STEP_HOLD
      this.footworkClip = null
      this.footworkHold = 0
      anim.playLoop('SplitStep')
      return
    }
    if (this.splitStepRemaining > 0) {
      this.splitStepRemaining = Math.max(0, this.splitStepRemaining - Math.max(delta, 0))
      anim.playLoop('SplitStep')
      return
    }

    // Lunge menjelang kontak. Klip dipilih dari teknik yang dipakai planner,
    // sehingga sisi Lunge mengikuti keputusan RedShotSelector, bukan posisi
    // Red sebelum footwork.
    const plan = this.receptionPlan
    if (
      incoming &&
      plan &&
      plan.contactTime <= plan.lead + LUNGE_LEAD_WINDOW &&
      this.receptionDistance <= 1.0
    ) {
      const clip: PlayerClip = plan.clip.includes('Backhand') ? 'LungeBackhand' : 'LungeForehand'
      if (this.lungeClip !== clip) {
        this.lungeClip = clip
        this.footworkClip = null
        this.footworkHold = 0
      }
      anim.playLoop(clip)
      return
    }
    if (this.lungeClip && (!incoming || !plan)) this.lungeClip = null

    const desired = this.selectFootworkClip(intent)
    this.footworkHold = Math.max(0, this.footworkHold - Math.max(delta, 0))
    if (!desired) {
      if (this.footworkClip) {
        anim.playLoop('Ready')
        this.footworkClip = null
        this.footworkHold = 0
      }
      return
    }

    let clip = desired
    if (this.footworkClip && clip !== this.footworkClip && this.footworkHold > 0) {
      clip = this.footworkClip
    }
    if (clip !== this.footworkClip) {
      anim.playLoop(clip)
      this.footworkClip = clip
      this.footworkHold = FOOTWORK_MIN_HOLD
    } else {
      anim.playLoop(clip)
    }
  }

  /** Histeresis arah footwork; tidak berganti klip karena target bergeser kecil. */
  private selectFootworkClip(intent: MoveIntent): PlayerClip | null {
    const ax = Math.abs(intent.x)
    const az = Math.abs(intent.z)
    if (ax < 0.05 && az < 0.05) return null

    const lateral: PlayerClip = intent.x > 0 ? 'ShuffleRight' : 'ShuffleLeft'
    const forward: PlayerClip = intent.z > 0 ? 'WalkForward' : 'WalkBackward'
    if (ax >= az + FOOTWORK_HYSTERESIS) return lateral
    if (az >= ax + FOOTWORK_HYSTERESIS) return forward
    if (this.footworkClip === lateral || this.footworkClip === forward) return this.footworkClip
    return ax >= az ? lateral : forward
  }

  private clearTransientAnimation(): void {
    this.footworkClip = null
    this.footworkHold = 0
    this.lungeClip = null
    this.splitStepRemaining = 0
  }

  /**
   * Rencanakan kontak dengan zona raket kalibrasi lalu jalan ke stance.
   *
   * 2.21: method ini HANYA menghasilkan niat gerak. Tidak ada requestSwing,
   * tidak ada retry, dan tidak ada animasi pukulan di sini. Ayunan terjadi
   * hanya ketika arena menerima Space atau gesture dari pemain.
   */
  private getReceptionIntent(delta: number): MoveIntent {
    // Recovery tidak dibatalkan planner. WASD tetap bisa memotong.
    if (this.recoveryRemaining > 0 && !this.manualMovementActive) return { x: 0, z: 0 }
    const shuttle = this.shuttle
    const incoming = shuttle?.phase === 'flying' && shuttle.velocity.z > 0.05
    if (!incoming || !shuttle) {
      this.receptionPlan = null
      this.receptionDistance = Infinity
      return { x: 0, z: 0 }
    }

    const plan = planRedReception({
      shuttlePosition: shuttle.position,
      shuttleVelocity: shuttle.velocity,
      gravity: shuttle.gravity,
      playerPosition: this.player.position,
      playerYaw: this.player.rotation.y,
      bounds: this.bounds,
      speed: this.speed,
      isJumping: this.animationController?.playingClip === 'Jump',
    })
    if (!plan) {
      // Shuttle bukan ancaman lagi (terlalu rendah / sudah lewat / keluar).
      this.receptionPlan = null
      this.receptionDistance = Infinity
      return { x: 0, z: 0 }
    }

    // Rencana segar tiap frame mengikuti prediksi intersepsi. Footwork punya
    // histeresis sendiri, jadi perubahan klip kecil tidak memicu flicker.
    this.receptionPlan = plan
    const targetDx = plan.stanceX - this.player.position.x
    const targetDz = plan.stanceZ - this.player.position.z
    const targetDistance = Math.hypot(targetDx, targetDz)
    this.receptionDistance = targetDistance

    if (targetDistance <= 0.02) return { x: 0, z: 0 }
    // Mendekati stance: kecepatan diturunkan bertahap, lalu step terakhir
    // di-clamp tepat ke target sehingga Red tidak melewati titik intersepsi.
    const slowFactor =
      targetDistance >= APPROACH_SLOW_RADIUS
        ? 1
        : APPROACH_MIN_SPEED_FACTOR +
          (1 - APPROACH_MIN_SPEED_FACTOR) * (targetDistance / APPROACH_SLOW_RADIUS)
    const yaw = this.player.rotation.y
    const length = Math.max(targetDistance, 1e-8)
    const step = this.speed * Math.max(0, delta) * slowFactor
    const magnitude = step > 0 && targetDistance < step ? targetDistance / step : 1
    const worldX = targetDx / length
    const worldZ = targetDz / length
    return {
      x: (worldX * Math.cos(yaw) - worldZ * Math.sin(yaw)) * magnitude,
      z: (-worldX * Math.sin(yaw) - worldZ * Math.cos(yaw)) * magnitude,
    }
  }

  private readKeyboard(): MoveIntent {
    const held = (key: string) => (this.pressed.has(key) ? 1 : 0)
    return {
      x: held(KEY_RIGHT) - held(KEY_LEFT),
      z: held(KEY_FORWARD) - held(KEY_BACK),
    }
  }
}
