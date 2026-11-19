import type { Player } from './MatchManager.ts'
import './point-celebration.css'

/** Data satu kejadian poin, semuanya berasal dari BadmintonMatchManager. */
export interface PointCelebrationData {
  /** Pemain yang memperoleh poin. */
  player: Player
  /** Skor sebelum poin ini diberikan. */
  scoreBefore: { red: number; blue: number }
  /** Skor terbaru dari MatchManager (sudah termasuk poin ini). */
  scoreAfter: { red: number; blue: number }
  gameNumber: number
  gamesWon: { red: number; blue: number }
}

/** Timeline normal: masuk, tahan, lalu keluar (total ~2,27 detik). */
const LEAVE_START_MS = 1850
const TOTAL_MS = 2270

/** Timeline singkat saat pengguna meminta reduced motion. */
const REDUCED_LEAVE_START_MS = 1000
const REDUCED_TOTAL_MS = 1380

/** Count-up skor banner: jeda kecil lalu 0,42 detik naik ke angka terbaru. */
const COUNT_DELAY_MS = 340
const COUNT_MS = 420

const TEAM_LABEL: Record<Player, string> = { red: 'RED', blue: 'BLUE' }

const SHUTTLE_SVG = `
  <svg class="bb-celebration__shuttle" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path d="M25 39 L13 12" />
    <path d="M32 41 L31 9" />
    <path d="M39 39 L51 12" />
    <path d="M13 12 Q32 3 51 12" opacity="0.6" />
    <path d="M17 22 Q32 15 47 22" opacity="0.35" />
    <circle class="bb-shuttle-cork" cx="32" cy="46" r="9" />
  </svg>
`

function padScore(value: number): string {
  return String(Math.max(0, Math.trunc(value))).padStart(2, '0')
}

/**
 * Banner selebrasi poin badminton (Tahap 2.11).
 *
 * Satu instance per arena, dirender sebagai overlay HTML di atas canvas dan
 * hanya dikendalikan lewat kelas CSS + timer yang selalu dibersihkan. Tidak ada
 * event listener global, tidak ada input pemain, dan tidak menyentuh canvas
 * maupun state pertandingan: seluruh isi banner berasal dari data MatchManager
 * yang diberikan oleh arena.
 */
export class BadmintonPointCelebration {
  readonly element: HTMLElement

  private readonly teamEl: HTMLElement
  private readonly verbEl: HTMLElement
  private readonly eyebrowEl: HTMLElement
  private readonly gamesEl: HTMLElement
  private readonly gameLabelEl: HTMLElement
  private readonly redScoreEl: HTMLElement
  private readonly blueScoreEl: HTMLElement

  private active = false
  private reducedMotion = false

  private leaveTimer: number | null = null
  private endTimer: number | null = null
  private countSafety: number | null = null
  private countRaf: number | null = null

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'bb-celebration'
    this.element.dataset.player = 'red'
    this.element.setAttribute('aria-hidden', 'true')
    this.element.innerHTML = `
      <div class="bb-celebration__veil"></div>
      <div class="bb-celebration__halo bb-celebration__halo--warm" aria-hidden="true"></div>
      <div class="bb-celebration__halo bb-celebration__halo--cool" aria-hidden="true"></div>
      <div class="bb-celebration__speedline bb-celebration__speedline--left" aria-hidden="true"></div>
      <div class="bb-celebration__speedline bb-celebration__speedline--right" aria-hidden="true"></div>
      <div class="bb-celebration__panel" role="status" aria-live="polite">
        <span class="bb-celebration__eyebrow">
          <span class="bb-celebration__dot" aria-hidden="true"></span>
          <span data-celebration-eyebrow>POINT &bull; GAME 1</span>
        </span>
        <div class="bb-celebration__title">
          <span class="bb-celebration__team" data-celebration-team>RED</span>
          <span class="bb-celebration__verb" data-celebration-verb>SCORES!</span>
        </div>
        <div class="bb-celebration__divider" aria-hidden="true">
          <span></span>
          ${SHUTTLE_SVG}
          <span></span>
        </div>
        <div class="bb-celebration__scores">
          <span class="bb-celebration__num bb-celebration__num--red" data-celebration-red>00</span>
          <span class="bb-celebration__dash" aria-hidden="true">&ndash;</span>
          <span class="bb-celebration__num bb-celebration__num--blue" data-celebration-blue>00</span>
        </div>
        <div class="bb-celebration__meta">
          <span data-celebration-games>GAMES 0 &ndash; 0</span>
          <span class="bb-celebration__meta-sep" aria-hidden="true"></span>
          <span data-celebration-game>GAME 1</span>
        </div>
      </div>
    `

    this.teamEl = this.query('[data-celebration-team]')
    this.verbEl = this.query('[data-celebration-verb]')
    this.eyebrowEl = this.query('[data-celebration-eyebrow]')
    this.gamesEl = this.query('[data-celebration-games]')
    this.gameLabelEl = this.query('[data-celebration-game]')
    this.redScoreEl = this.query('[data-celebration-red]')
    this.blueScoreEl = this.query('[data-celebration-blue]')
  }

  /** True selama banner terlihat (dipakai arena untuk menahan servis otomatis). */
  get isActive(): boolean {
    return this.active
  }

  /** Total durasi tampil dalam detik, mengikuti preferensi reduced motion. */
  get totalSeconds(): number {
    return (this.prefersReducedMotion() ? REDUCED_TOTAL_MS : TOTAL_MS) / 1000
  }

  /** Tampilkan selebrasi untuk satu poin. Aman dipanggil beruntun. */
  show(data: PointCelebrationData): void {
    this.clearTimers()
    this.reducedMotion = this.prefersReducedMotion()

    const { player, scoreBefore, scoreAfter, gameNumber, gamesWon } = data
    const scoringEl = player === 'red' ? this.redScoreEl : this.blueScoreEl
    const opponentEl = player === 'red' ? this.blueScoreEl : this.redScoreEl
    const from = player === 'red' ? scoreBefore.red : scoreBefore.blue
    const to = player === 'red' ? scoreAfter.red : scoreAfter.blue
    const opponentScore = player === 'red' ? scoreAfter.blue : scoreAfter.red

    this.element.dataset.player = player
    this.teamEl.textContent = TEAM_LABEL[player]
    this.verbEl.textContent = 'SCORES!'
    this.eyebrowEl.textContent = `POINT \u2022 GAME ${gameNumber}`
    this.gamesEl.textContent = `GAMES ${gamesWon.red} \u2013 ${gamesWon.blue}`
    this.gameLabelEl.textContent = `GAME ${gameNumber}`

    this.redScoreEl.classList.toggle('is-scoring', player === 'red')
    this.blueScoreEl.classList.toggle('is-scoring', player === 'blue')
    scoringEl.textContent = padScore(this.reducedMotion ? to : from)
    opponentEl.textContent = padScore(opponentScore)

    this.element.setAttribute('aria-hidden', 'false')

    // Restart bersih: memaksa browser memutar ulang keyframes walau poin
    // berikutnya datang saat animasi sebelumnya belum selesai.
    this.element.classList.remove('is-active', 'is-leaving')
    void this.element.offsetWidth
    this.element.classList.add('is-active')
    this.active = true

    const leaveStart = this.reducedMotion ? REDUCED_LEAVE_START_MS : LEAVE_START_MS
    const total = this.reducedMotion ? REDUCED_TOTAL_MS : TOTAL_MS

    this.leaveTimer = window.setTimeout(() => {
      this.leaveTimer = null
      this.element.classList.add('is-leaving')
    }, leaveStart)

    this.endTimer = window.setTimeout(() => {
      this.endTimer = null
      this.finish()
    }, total)

    this.animateCount(scoringEl, from, to)
  }

  /** Sembunyikan langsung dan hentikan semua timer (dipakai saat arena keluar). */
  hide(): void {
    this.clearTimers()
    this.element.classList.remove('is-active', 'is-leaving')
    this.element.setAttribute('aria-hidden', 'true')
    this.active = false
  }

  /** Alias eksplisit untuk lifecycle arena: elemen tetap ada, animasi berhenti. */
  detach(): void {
    this.hide()
  }

  /** Lepas total dari DOM. */
  dispose(): void {
    this.hide()
    this.element.remove()
  }

  private finish(): void {
    this.element.classList.remove('is-active', 'is-leaving')
    this.element.setAttribute('aria-hidden', 'true')
    this.active = false
  }

  private animateCount(el: HTMLElement, from: number, to: number): void {
    if (this.reducedMotion || from === to) {
      el.textContent = padScore(to)
      return
    }

    // Satu flag `finished` menjaga dua jalur (rAF dan safety timeout) tidak
    // saling menimpa: setelah angka final ditulis, frame rAF yang masih
    // tertunda tidak boleh mengembalikan angka ke nilai lama.
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      if (this.countRaf !== null) {
        window.cancelAnimationFrame(this.countRaf)
        this.countRaf = null
      }
      if (this.countSafety !== null) {
        window.clearTimeout(this.countSafety)
        this.countSafety = null
      }
      el.textContent = padScore(to)
    }

    const startedAt = performance.now() + COUNT_DELAY_MS
    const step = (now: number) => {
      if (finished) return
      const t = Math.min(1, Math.max(0, (now - startedAt) / COUNT_MS))
      const eased = 1 - Math.pow(1 - t, 3)
      el.textContent = padScore(Math.round(from + (to - from) * eased))
      if (t < 1) {
        this.countRaf = window.requestAnimationFrame(step)
      } else {
        finish()
      }
    }
    this.countRaf = window.requestAnimationFrame(step)

    // Jaring pengaman bila rAF di-throttle (tab latar / render berat):
    // angka akhir tetap benar sebelum banner menghilang.
    this.countSafety = window.setTimeout(finish, COUNT_DELAY_MS + COUNT_MS + 220)
  }

  private query(selector: string): HTMLElement {
    const el = this.element.querySelector<HTMLElement>(selector)
    if (!el) throw new Error(`PointCelebration: elemen ${selector} tidak ditemukan`)
    return el
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  private clearTimers(): void {
    if (this.leaveTimer !== null) {
      window.clearTimeout(this.leaveTimer)
      this.leaveTimer = null
    }
    if (this.endTimer !== null) {
      window.clearTimeout(this.endTimer)
      this.endTimer = null
    }
    if (this.countSafety !== null) {
      window.clearTimeout(this.countSafety)
      this.countSafety = null
    }
    if (this.countRaf !== null) {
      window.cancelAnimationFrame(this.countRaf)
      this.countRaf = null
    }
  }
}
