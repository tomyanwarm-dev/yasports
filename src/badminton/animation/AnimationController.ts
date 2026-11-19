import { BadmintonPlayerModel, type PlayerClip } from '../entities/PlayerModel.ts'

/**
 * Prioritas tiap klip animasi. Semakin tinggi, semakin sulit diinterupsi.
 *   0 - diri (Idle, Ready, DefensiveReady)
 *   1 - gerakan (SplitStep, Walk, Shuffle, Lunge, Recovery, Jump, Landing)
 *   2 - pukulan satu kali (Serve, Clear, Drive, Drop, Net, Block, Lift)
 *   3 - serang kuat (Smash, JumpSmash)
 */
const CLIP_PRIORITY: Record<PlayerClip, number> = {
  Idle: 0,
  Ready: 0,
  DefensiveReady: 0,
  SplitStep: 1,
  WalkForward: 1,
  WalkBackward: 1,
  ShuffleLeft: 1,
  ShuffleRight: 1,
  LungeForehand: 1,
  LungeBackhand: 1,
  Recovery: 1,
  Jump: 1,
  Landing: 1,
  ServeShort: 2,
  ServeLong: 2,
  ForehandClear: 2,
  BackhandClear: 2,
  DropShot: 2,
  ForehandDrive: 2,
  BackhandDrive: 2,
  NetShot: 2,
  NetKill: 2,
  DefensiveBlock: 2,
  Lift: 2,
  Smash: 3,
  JumpSmash: 3,
}

/**
 * Animation Controller untuk pemain badminton (Blue dan Red).
 *
 * Mengelola pemutaran 26 klip animasi di atas BadmintonPlayerModel dengan:
 * - prioritas agar animasi penting tidak terpotong sembarangan,
 * - crossfade antar klip,
 * - auto-return ke Ready setelah one-shot selesai,
 * - API modular untuk keyboard, AI, dan MediaPipe Hand Tracking (nantinya).
 *
 * Tidak menyentuh fisika, hit detection, movement, atau kamera.
 */
export class BadmintonAnimationController {
  private readonly model: BadmintonPlayerModel
  private activeClip: PlayerClip | null = null
  private activePriority = 0
  private isOneShot = false

  constructor(model: BadmintonPlayerModel) {
    this.model = model
  }

  /**
   * Memutar klip loop (Ready, Idle, gerakan). Tidak memotong one-shot yang
   * sedang berjalan. Loop dengan prioritas lebih tinggi dapat menggantikan
   * loop yang berjalan; prioritas sama diabaikan.
   */
  playLoop(clip: PlayerClip): boolean {
    const prio = CLIP_PRIORITY[clip]
    if (this.isOneShot) return false
    // Loop tidak memotong one-shot. Loop vs loop: prioritas lebih tinggi
    // menggantikan yang lebih rendah; prioritas sama diizinkan (mis. Ready↔Idle).
    if (this.activeClip !== null && this.activePriority > prio) return false
    this.model.play(clip)
    this.activeClip = clip
    this.activePriority = prio
    this.isOneShot = false
    return true
  }

  /**
   * Memutar klip one-shot (pukulan / serve). Setelah selesai, model otomatis
   * kembali ke Ready. Tidak memotong one-shot lain yang sedang berjalan.
   * Dapat memotong loop (Ready / Idle / gerakan).
   */
  playOneShot(clip: PlayerClip): boolean {
    const prio = CLIP_PRIORITY[clip]
    if (this.isOneShot) return false
    const started = this.model.playSwing(clip)
    if (started) {
      this.activeClip = clip
      this.activePriority = prio
      this.isOneShot = true
    }
    return started
  }

  /**
   * Majukan animasi satu frame. Panggil sekali per frame (terdapat di
   * BadmintonArena.update). Mendeteksi auto-return dari one-shot dan
   * sinkronisasi jika hit detection memutar one-shot langsung di model.
   */
  update(delta: number): void {
    this.model.update(delta)

    const clipName = this.model.playingClip

    // Jika sedang one-shot dan model sudah kembali ke Ready, tandai selesai.
    if (this.isOneShot && clipName === 'Ready') {
      this.isOneShot = false
      this.activeClip = 'Ready'
      this.activePriority = 0
      return
    }

    // Deteksi jika sesuatu lain (mis. hit detection) memutar one-shot langsung
    // di model tanpa melalui controller.
    if (
      !this.isOneShot &&
      clipName !== null &&
      clipName !== this.activeClip &&
      CLIP_PRIORITY[clipName as PlayerClip] !== undefined &&
      CLIP_PRIORITY[clipName as PlayerClip] >= 2
    ) {
      this.isOneShot = true
      this.activeClip = clipName as PlayerClip
      this.activePriority = CLIP_PRIORITY[clipName as PlayerClip]
    }
  }

  /** Kembali ke Ready segera, membatalkan apapun yang sedang berjalan. */
  stop(): void {
    this.model.play('Ready')
    this.activeClip = 'Ready'
    this.activePriority = 0
    this.isOneShot = false
  }

  /** Klip yang sedang diputar, atau null jika belum ada. */
  get playingClip(): PlayerClip | null {
    return this.activeClip
  }

  get playingClipTime(): number {
    return this.model.playingClipTime
  }

  get playingClipTimeScale(): number {
    return this.model.playingClipTimeScale
  }

  withCurrentClipAtTime<T>(time: number, inspect: () => T): T {
    return this.model.withCurrentClipAtTime(time, inspect)
  }

  /** True saat klip one-shot sedang berjalan. */
  get isPlayingOneShot(): boolean {
    return this.isOneShot
  }

  /** Prioritas klip saat ini. */
  get playingPriority(): number {
    return this.activePriority
  }

  /** Durasi klip dalam detik, atau 0 jika klip tidak tersedia. */
  clipDuration(clip: PlayerClip): number {
    return this.model.clipDuration(clip)
  }

  /** True jika klip tersedia pada model. */
  hasClip(clip: PlayerClip): boolean {
    return this.model.hasClip(clip)
  }

  /** Daftar semua nama klip yang tersedia. */
  get clipNames(): string[] {
    return this.model.clipNames
  }
}
