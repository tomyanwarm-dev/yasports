import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import type { ShotTechnique } from '../../controllers/RedShotSelector.ts'
import { GestureRecognizer, type GestureEventKind } from './GestureRecognizer.ts'
import './gesture.css'

/**
 * Kontrol webcam + MediaPipe Hands untuk Red (Tahap 2.19).
 *
 * Controller ini hanya mengubah niat gerak / teknik / permintaan servis.
 * Semua physics, collision, dan animasi pukulan tetap memakai jalur produksi
 * yang sama dengan keyboard. Tidak ada getaran kamera yang diterjemahkan
 * langsung ke physics.
 */
export interface HandGestureControllerOptions {
  /** Teknik hasil pengenalan; arena tetap memakai RedShotSelector + collision. */
  onStroke: (technique: ShotTechnique, confidence: number) => void
}

const MODEL_PATH = '/mediapipe/hand_landmarker.task'
const WASM_BASE_PATH = '/mediapipe/wasm'

const FINGERS: ReadonlyArray<readonly [number, number, number]> = [
  [4, 3, 2], // thumb
  [8, 6, 5],
  [12, 10, 9],
  [16, 14, 13],
  [20, 18, 17],
]
const PALM_POINTS = [0, 5, 9, 13, 17]

function landmarkDistance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0))
}

/** Keterbukaan telapak 0..1 dari jari-jari yang benar-benar terentang. */
function palmOpenness(landmarks: NormalizedLandmark[]): number {
  let extended = 0
  for (const [tip, pip, mcp] of FINGERS) {
    const a = landmarks[tip]
    const b = landmarks[pip]
    const c = landmarks[mcp]
    if (!a || !b || !c) continue
    if (landmarkDistance(a, c) > landmarkDistance(b, c) * 1.12) extended++
  }
  return extended / FINGERS.length
}

/** Posisi telapak. X dicerminkan supaya searah dengan preview webcam. */
function palmCenter(landmarks: NormalizedLandmark[]): { x: number; y: number } {
  let x = 0
  let y = 0
  let count = 0
  for (const index of PALM_POINTS) {
    const point = landmarks[index]
    if (!point) continue
    x += point.x
    y += point.y
    count++
  }
  if (count === 0) return { x: 0.5, y: 0.5 }
  return { x: 1 - x / count, y: y / count }
}

export class HandGestureController {
  readonly element: HTMLElement

  private readonly video: HTMLVideoElement
  private readonly cameraStatus: HTMLElement
  private readonly handStatus: HTMLElement
  private readonly gestureStatus: HTMLElement
  private readonly confidenceStatus: HTMLElement
  private readonly toggleButton: HTMLButtonElement
  private readonly calibrateButton: HTMLButtonElement

  private readonly recognizer = new GestureRecognizer()
  private landmarker: HandLandmarker | null = null
  private stream: MediaStream | null = null
  private enabled = false
  private starting = false
  private running = false
  private hasHand = false
  private lastVideoTime = -1

  constructor(private readonly options: HandGestureControllerOptions) {
    this.element = document.createElement('div')
    this.element.className = 'bg-hud'
    this.element.innerHTML = `
      <div class="bg-hud__header">
        <span class="bg-hud__title">GESTURE CONTROL</span>
        <span class="bg-hud__pill" data-bg-camera>OFF</span>
      </div>
      <div class="bg-hud__preview">
        <video class="bg-hud__video" autoplay muted playsinline></video>
        <span class="bg-hud__preview-note">Palm · mirroring ON</span>
      </div>
      <div class="bg-hud__rows">
        <div><span>Camera</span><strong data-bg-camera-text>Nonaktif</strong></div>
        <div><span>Hand</span><strong data-bg-hand>Tidak terdeteksi</strong></div>
        <div><span>Gesture</span><strong data-bg-gesture>-</strong></div>
        <div><span>Confidence</span><strong data-bg-confidence>0%</strong></div>
      </div>
      <div class="bg-hud__actions">
        <button type="button" data-bg-toggle>GESTURE ON</button>
        <button type="button" data-bg-calibrate disabled>CALIBRATE</button>
      </div>
      <p class="bg-hud__hint">WASD / Space / Enter / T tetap aktif saat gesture OFF.</p>
    `

    this.video = this.query('video')
    this.cameraStatus = this.query('[data-bg-camera]')
    this.cameraStatusText = this.query('[data-bg-camera-text]')
    this.handStatus = this.query('[data-bg-hand]')
    this.gestureStatus = this.query('[data-bg-gesture]')
    this.confidenceStatus = this.query('[data-bg-confidence]')
    this.toggleButton = this.query('[data-bg-toggle]')
    this.calibrateButton = this.query('[data-bg-calibrate]')

    // Lepaskan fokus setelah klik: Space harus tetap menjadi pukulan, bukan
    // aktivasi tombol HUD yang sedang difokuskan browser.
    this.toggleButton.addEventListener('click', () => {
      this.toggleButton.blur()
      void this.toggle()
    })
    this.calibrateButton.addEventListener('click', () => {
      this.calibrateButton.blur()
      this.calibrate()
    })
    window.addEventListener('pagehide', this.onPageHide)
  }

  private readonly cameraStatusText: HTMLElement

  private query<T extends HTMLElement>(selector: string): T {
    const found = this.element.querySelector<T>(selector)
    if (!found) throw new Error(`Elemen HUD gesture tidak ditemukan: ${selector}`)
    return found
  }

  /** Pasang HUD saat masuk arena; TIDAK otomatis menyalakan kamera. */
  mount(): void {
    if (!this.element.isConnected) document.body.appendChild(this.element)
  }

  unmount(): void {
    this.turnOff()
    this.element.remove()
  }

  get isActive(): boolean {
    return this.running && this.enabled
  }

  get isHandDetected(): boolean {
    return this.isActive && this.hasHand
  }

  /** Dipanggil arena setiap frame aktif. Deteksi berjalan di loop game yang ada. */
  update(): void {
    if (!this.isActive || !this.landmarker) return
    if (this.video.readyState < 2 || this.video.currentTime === this.lastVideoTime) return
    this.lastVideoTime = this.video.currentTime

    const timestamp = performance.now()
    const result = this.landmarker.detectForVideo(this.video, timestamp)

    const landmarks = result.landmarks[0]
    if (!landmarks) {
      this.hasHand = false
      this.recognizer.setHandLost()
    } else {
      this.hasHand = true
      const center = palmCenter(landmarks)
      const handednessScore = result.handedness?.[0]?.[0]?.score ?? 0.9
      this.recognizer.pushFrame({
        time: timestamp / 1000,
        x: center.x,
        y: center.y,
        openness: palmOpenness(landmarks),
        confidence: Math.max(0, Math.min(1, handednessScore)),
      })
    }

    this.dispatchEvents(this.recognizer.consumeEvents())
    this.renderStatus()
  }

  private dispatchEvents(events: ReadonlyArray<{ technique: GestureEventKind; confidence: number }>): void {
    for (const event of events) {
      if (event.technique === 'serve') continue
      this.options.onStroke(event.technique, event.confidence)
    }
  }

  calibrate(): void {
    this.recognizer.calibrate()
    this.renderStatus()
  }

  async turnOn(): Promise<void> {
    if (this.enabled || this.starting) return
    this.enabled = true
    this.starting = true
    this.setCameraText('Meminta izin kamera…')
    this.renderButtons()

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia tidak tersedia (perlu HTTPS atau localhost)')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (!this.enabled) {
        stopStream(stream)
        return
      }
      this.stream = stream
      this.video.srcObject = stream
      await this.video.play()

      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH)
      if (!this.enabled) return
      this.landmarker = await this.createLandmarker(fileset)
      if (!this.enabled) {
        this.cleanupRuntime()
        return
      }

      this.recognizer.reset()
      this.lastVideoTime = -1
      this.running = true
      this.setCameraText('Aktif')
      this.renderButtons()
    } catch (error) {
      this.enabled = false
      this.running = false
      this.cleanupRuntime()
      const message = error instanceof Error ? error.message : String(error)
      this.setCameraText(`Gagal: ${message}`)
      this.renderButtons()
    } finally {
      this.starting = false
    }
  }

  turnOff(): void {
    if (!this.enabled && !this.starting && !this.running) return
    this.enabled = false
    this.running = false
    this.hasHand = false
    this.cleanupRuntime()
    this.recognizer.reset()
    this.setCameraText('Nonaktif')
    this.renderStatus()
    this.renderButtons()
  }

  dispose(): void {
    this.turnOff()
    window.removeEventListener('pagehide', this.onPageHide)
    this.element.remove()
  }

  private async createLandmarker(fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>) {
    const options = {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' as const },
      runningMode: 'VIDEO' as const,
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }
    try {
      return await HandLandmarker.createFromOptions(fileset, options)
    } catch {
      // GPU delegate tidak tersedia di sebagian browser/VM; CPU tetap akurat.
      return HandLandmarker.createFromOptions(fileset, {
        ...options,
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
      })
    }
  }

  private cleanupRuntime(): void {
    if (this.stream) {
      stopStream(this.stream)
      this.stream = null
    }
    this.video.pause()
    this.video.srcObject = null
    this.landmarker?.close()
    this.landmarker = null
  }

  private toggle(): void {
    if (this.enabled || this.starting) this.turnOff()
    else void this.turnOn()
  }

  private readonly onPageHide = (): void => this.turnOff()

  private setCameraText(text: string): void {
    this.cameraStatus.textContent = this.running ? 'ACTIVE' : this.starting ? 'LOADING' : 'OFF'
    this.cameraStatusText.textContent = text
  }

  private renderButtons(): void {
    this.toggleButton.textContent = this.enabled || this.starting ? 'GESTURE OFF' : 'GESTURE ON'
    this.calibrateButton.disabled = !this.isActive
  }

  private renderStatus(): void {
    const status = this.recognizer.status
    this.handStatus.textContent = this.hasHand ? 'Terdeteksi' : 'Tidak terdeteksi'
    this.gestureStatus.textContent = this.isActive ? status.name : '-'
    this.confidenceStatus.textContent = `${Math.round((this.isActive ? status.confidence : 0) * 100)}%`
    this.cameraStatus.textContent = this.isActive ? 'ACTIVE' : this.starting ? 'LOADING' : 'OFF'
  }
}

function stopStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop()
}
