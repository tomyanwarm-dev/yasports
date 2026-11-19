import type { ShotTechnique } from '../../controllers/RedShotSelector.ts'

/**
 * Pengenal gesture berbasis lintasan landmark (Tahap 2.19).
 *
 * Kelas ini sengaja murni: tidak memakai DOM, kamera, atau MediaPipe, sehingga
 * bisa diuji dengan frame sintetis. Satu pukulan tidak pernah ditentukan dari
 * satu pose — semua keputusan diambil dari rangkaian sampel beberapa frame
 * (arah, kecepatan puncak, amplitudo, posisi awal, dan keterbukaan telapak).
 *
 * State stroke: idle -> prepare (tangan naik) -> swing (ayunan turun/mendatar).
 * Gerakan naik dari posisi netral dianggap persiapan, bukan lift, kecuali tidak
 * ada pembalikan arah dan tangan kembali diam (itulah lift yang sebenarnya).
 */

export type GestureEventKind = ShotTechnique | 'serve'

export interface GestureFrame {
  /** Waktu dalam detik (monoton). */
  time: number
  /** Posisi telapak tangan termirror, ternormalisasi 0..1. */
  x: number
  /** Posisi telapak tangan ternormalisasi 0..1 (0 = atas). */
  y: number
  /** Keterbukaan jari 0..1. */
  openness: number
  /** Confidence deteksi MediaPipe 0..1. */
  confidence: number
}

export interface GestureEvent {
  technique: GestureEventKind
  confidence: number
}

export interface GestureStatus {
  name: string
  confidence: number
  swinging: boolean
}

interface Sample {
  time: number
  x: number
  y: number
  vx: number
  vy: number
  openness: number
}

type StrokePhase = 'idle' | 'prepare' | 'swing'

const SMOOTHING = 12

const START_SPEED = 0.35
const END_SPEED = 0.22
const CALM_SPEED = 0.18
const MIN_SWING_SAMPLES = 4
const MAX_SWING_SECONDS = 1.0
const SWING_COOLDOWN = 0.55
const SERVE_COOLDOWN = 0.85

const OPEN_THRESHOLD = 0.68
const SERVE_OPEN_THRESHOLD = 0.72
const SERVE_HIGH_Y = 0.33
const SERVE_HOLD_SECONDS = 0.32

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export class GestureRecognizer {
  private calibrated = false
  private hasPalm = false
  private centerX = 0.5
  private centerY = 0.55
  private smoothX = 0.5
  private smoothY = 0.55
  private previousRawX = 0.5
  private previousRawY = 0.55
  private smoothVX = 0
  private smoothVY = 0
  private lastTime = 0
  private samples: Sample[] = []

  private phase: StrokePhase = 'idle'
  private prepareStartedAt = 0
  private prepareCalmFor = 0
  private apexTime = 0
  private apexY = 1
  /** Awal sampel yang dipakai klasifikasi (bisa sebelum pembalikan arah). */
  private swingStartedAt = 0
  /** Awal ayunan yang dipakai timeout, tanpa masa diam saat persiapan. */
  private strokeStartedAt = 0
  private lastCalmAt = -Infinity
  private lastSwingAt = -Infinity
  private openHoldFor = 0
  private serveArmed = true
  private lastServeAt = -Infinity
  private serveAllowed = false

  private name = '-'
  private confidence = 0
  private events: GestureEvent[] = []

  /** Kalibrasi titik netral memakai posisi telapak saat ini. */
  calibrate(): void {
    if (!this.hasPalm) return
    this.centerX = this.smoothX
    this.centerY = this.smoothY
    this.calibrated = true
    this.samples.length = 0
    this.phase = 'idle'
    this.prepareCalmFor = 0
    this.openHoldFor = 0
    this.name = 'CALIBRATED'
  }

  /** Dipanggil saat tangan hilang: semua state dinamis dikosongkan. */
  setHandLost(): void {
    this.hasPalm = false
    this.samples.length = 0
    this.phase = 'idle'
    this.prepareCalmFor = 0
    this.lastCalmAt = -Infinity
    this.openHoldFor = 0
    this.smoothVX = 0
    this.smoothVY = 0
    this.name = '-'
    this.confidence = 0
  }

  /** Reset penuh (saat fitur dimatikan). Kalibrasi ikut dihapus. */
  reset(): void {
    this.setHandLost()
    this.calibrated = false
    this.lastSwingAt = -Infinity
    this.lastServeAt = -Infinity
    this.serveArmed = true
    this.serveAllowed = false
    this.events.length = 0
  }

  /** Gestur servis hanya boleh dikenali saat arena menunggu servis. */
  setServeAllowed(allowed: boolean): void {
    this.serveAllowed = allowed
    if (!allowed) this.openHoldFor = 0
  }

  /** Terima satu frame hasil deteksi. */
  pushFrame(frame: GestureFrame): void {
    const rawDt = this.lastTime === 0 ? 1 / 60 : frame.time - this.lastTime
    const dt = clamp(rawDt, 1 / 240, 0.1)
    this.lastTime = frame.time

    if (!this.hasPalm) {
      this.smoothX = frame.x
      this.smoothY = frame.y
      this.previousRawX = frame.x
      this.previousRawY = frame.y
      this.smoothVX = 0
      this.smoothVY = 0
      this.hasPalm = true
      if (!this.calibrated) {
        this.centerX = frame.x
        this.centerY = frame.y
        this.calibrated = true
      }
    }

    const alpha = 1 - Math.exp(-dt * SMOOTHING)
    this.smoothX += (frame.x - this.smoothX) * alpha
    this.smoothY += (frame.y - this.smoothY) * alpha

    // Kecepatan dihitung dari landmark mentah agar klasifikasi lintasan pukulan responsif.
    const rawVX = (frame.x - this.previousRawX) / dt
    const rawVY = (frame.y - this.previousRawY) / dt
    this.previousRawX = frame.x
    this.previousRawY = frame.y
    const velocityAlpha = 1 - Math.exp(-dt * 20)
    this.smoothVX += (rawVX - this.smoothVX) * velocityAlpha
    this.smoothVY += (rawVY - this.smoothVY) * velocityAlpha

    const speed = Math.hypot(this.smoothVX, this.smoothVY)
    this.samples.push({
      time: frame.time,
      x: frame.x,
      y: frame.y,
      vx: this.smoothVX,
      vy: this.smoothVY,
      openness: frame.openness,
    })
    while (this.samples.length > 48) this.samples.shift()
    const cutoff = frame.time - 1.0
    while (this.samples.length > 0 && this.samples[0].time < cutoff) this.samples.shift()

    this.updateStroke(frame, speed, dt)
  }

  /** Ambil dan kosongkan event yang belum dikonsumsi arena. */
  consumeEvents(): GestureEvent[] {
    if (this.events.length === 0) return []
    const result = this.events
    this.events = []
    return result
  }

  get status(): GestureStatus {
    return { name: this.name, confidence: this.confidence, swinging: this.phase !== 'idle' }
  }

  private updateServe(frame: GestureFrame, speed: number, dt: number): void {
    const servePose =
      this.serveAllowed &&
      frame.openness >= SERVE_OPEN_THRESHOLD &&
      this.smoothY <= SERVE_HIGH_Y &&
      speed < CALM_SPEED
    this.openHoldFor = servePose ? this.openHoldFor + dt : 0
    if (servePose) {
      this.name = 'SERVE READY'
      this.confidence = clamp(frame.confidence, 0, 0.99)
    }
    if (!servePose) this.serveArmed = true
    if (
      this.openHoldFor >= SERVE_HOLD_SECONDS &&
      this.serveArmed &&
      frame.time - this.lastServeAt >= SERVE_COOLDOWN
    ) {
      this.serveArmed = false
      this.lastServeAt = frame.time
      this.emit('serve', clamp(frame.confidence, 0, 0.99))
    }
  }

  private updateStroke(frame: GestureFrame, speed: number, dt: number): void {
    const vy = this.smoothVY

    if (this.phase === 'idle') {
      if (speed < CALM_SPEED) this.lastCalmAt = frame.time
      const canStart =
        this.samples.length >= MIN_SWING_SAMPLES &&
        frame.time - this.lastCalmAt <= 0.3 &&
        frame.time - this.lastSwingAt >= SWING_COOLDOWN &&
        !(this.serveAllowed && this.openHoldFor >= SERVE_HOLD_SECONDS)
      if (!canStart || speed < START_SPEED) return

      if (vy < -START_SPEED * 0.6) {
        this.phase = 'prepare'
        this.prepareStartedAt = frame.time
        this.prepareCalmFor = 0
        this.apexTime = frame.time
        this.apexY = frame.y
        this.name = 'PREPARE'
      } else {
        this.phase = 'swing'
        this.swingStartedAt = frame.time
        this.strokeStartedAt = frame.time
      }
      return
    }

    if (this.phase === 'prepare') {
      if (frame.y < this.apexY) {
        this.apexY = frame.y
        this.apexTime = frame.time
        this.prepareCalmFor = 0
      }
      // Gerakan naik yang diikuti jeda pendek lalu turun adalah pukulan
      // overhead. Jeda itu TIDAK boleh langsung dinilai sebagai lift.
      if (speed < CALM_SPEED) this.prepareCalmFor += dt
      else this.prepareCalmFor = 0

      if (vy > START_SPEED * 0.5 && frame.time - this.prepareStartedAt >= 0.08) {
        this.phase = 'swing'
        this.swingStartedAt = this.apexTime
        this.strokeStartedAt = frame.time
        return
      }
      // Lift hanya bila ayunan naik benar-benar selesai dan tidak dibatalkan
      // oleh ayunan turun dalam 0,4 detik.
      if (this.prepareCalmFor >= 0.4) {
        this.swingStartedAt = this.prepareStartedAt
        this.finishSwing(frame.time, 'lift')
        return
      }
      if (frame.time - this.prepareStartedAt > 1.2) {
        this.phase = 'idle'
        this.lastCalmAt = frame.time
        this.prepareCalmFor = 0
      }
      return
    }

    const elapsed = frame.time - this.strokeStartedAt
    if ((speed <= END_SPEED && elapsed >= 0.08) || elapsed >= MAX_SWING_SECONDS) {
      this.finishSwing(frame.time)
    }
  }

  private emit(technique: GestureEventKind, confidence: number): void {
    this.events.push({ technique, confidence })
  }

  private finishSwing(now: number, forced?: ShotTechnique): void {
    this.phase = 'idle'
    this.lastCalmAt = now
    this.lastSwingAt = now

    // Pukulan overhead mulai dari apex; jangan sertakan sampel pendekatan yang
    // masih naik supaya klasifikasi tidak membaca posisi awal yang salah.
    const lead = forced || this.swingStartedAt < this.strokeStartedAt ? 0 : 0.08
    const relevant = this.samples.filter((s) => s.time >= this.swingStartedAt - lead)
    if (relevant.length < MIN_SWING_SAMPLES) return

    // Buang masa diam di akhir ayunan supaya durasi tidak terhitung panjang.
    let endIndex = relevant.length - 1
    while (
      endIndex > 0 &&
      Math.hypot(relevant[endIndex].vx, relevant[endIndex].vy) < END_SPEED
    ) {
      endIndex--
    }
    const active = relevant.slice(0, Math.min(endIndex + 2, relevant.length))
    if (active.length < MIN_SWING_SAMPLES) return

    const first = active[0]
    const last = active[active.length - 1]
    const dx = last.x - first.x
    const dy = last.y - first.y
    const amplitude = Math.hypot(dx, dy)
    if (amplitude < 0.05) return

    // Untuk pukulan overhead, durasi dihitung sejak pembalikan arah, bukan
    // sejak tangan mulai diangkat saat persiapan.
    const motionStart = forced ? this.swingStartedAt : Math.max(this.strokeStartedAt, first.time)
    const duration = Math.max(last.time - motionStart, 1 / 240)
    let peakSpeed = 0
    let opennessSum = 0
    for (const s of active) {
      peakSpeed = Math.max(peakSpeed, Math.hypot(s.vx, s.vy))
      opennessSum += s.openness
    }
    const openAvg = opennessSum / active.length
    const technique =
      forced ?? this.classify(dx, dy, amplitude, peakSpeed, first.y, openAvg, duration)
    const confidence = clamp(
      0.52 +
        0.18 * Math.min(amplitude / 0.3, 1) +
        0.18 * Math.min(peakSpeed / 2.5, 1) +
        0.1 * openAvg,
      0,
      0.98,
    )
    this.name = technique.toUpperCase()
    this.confidence = confidence
    this.emit(technique, confidence)
  }

  /**
   * Klasifikasi multi-frame. Urutan penting: overhead dulu, lalu ayunan naik,
   * lalu horizontal cepat, baru gerakan pendek (net/block).
   */
  private classify(
    dx: number,
    dy: number,
    amplitude: number,
    peakSpeed: number,
    startY: number,
    openAvg: number,
    duration: number,
  ): ShotTechnique {
    const ax = Math.abs(dx)
    const ay = Math.abs(dy)

    // Overhead: mulai tinggi, bergerak turun. Durasi + kecepatan memisahkan
    // smash (pendek dan kuat), clear (panjang), dan drop shot (halus).
    if (startY < 0.45 && dy > 0.06 && amplitude >= 0.13) {
      if (amplitude >= 0.2 && peakSpeed >= 2.5 && duration <= 0.34) return 'smash'
      if (amplitude >= 0.45) return 'clear'
      return 'drop'
    }

    // Lift: ayunan dari bawah ke atas.
    if (startY > 0.5 && dy < -0.08 && amplitude >= 0.14) return 'lift'

    // Defensive block: gerakan pendek menahan dengan telapak terbuka.
    if (amplitude < 0.32 && openAvg >= 0.85) return 'block'

    // Drive: mendatar dan cepat.
    if (ax >= ay && ax >= 0.16 && peakSpeed >= 1.1) return 'drive'

    // Net shot: pendek dan halus.
    if (amplitude < 0.18 && peakSpeed < 1.15) return 'net'

    // Fallback geometris bila ambang di atas tidak terpenuhi.
    if (dy > 0 && amplitude >= 0.24) return 'clear'
    if (dy < -0.1) return 'lift'
    if (ax >= 0.2) return 'drive'
    return 'net'
  }
}
