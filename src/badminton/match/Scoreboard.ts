import type { MatchState } from './MatchManager.ts'
import './point-celebration.css'

/**
 * Scoreboard HUD untuk mode Badminton.
 *
 * Tampilan compact di bagian atas layar, tidak menutupi area permainan.
 * Semua data dibaca dari BadmintonMatchManager (satu-satunya sumber kebenaran).
 *
 * Tahap 2.11: angka yang berubah diberi animasi scale/glow singkat dan sisi
 * pemain yang menang poin di-highlight. Deteksi perubahan dilakukan di sini
 * dengan membandingkan nilai sebelumnya, sehingga render ulang dari callback
 * lain (servis, interval) tidak pernah memicu animasi palsu.
 */
export class BadmintonScoreboard {
  readonly element: HTMLElement
  private state: MatchState | null = null
  private initialized = false
  private lastRed = 0
  private lastBlue = 0
  private lastGamesRed = 0
  private lastGamesBlue = 0
  private bumpTimer: ReturnType<typeof setTimeout> | null = null
  private gamesTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'bb-hud'
    this.element.innerHTML = `
      <div class="bb-panel">
        <div class="bb-row bb-row--main">
          <div class="bb-side bb-side--red" id="bb-side-red">
            <span class="bb-name">RED</span>
            <span class="bb-score" id="bb-score-red">0</span>
            <span class="bb-games" id="bb-games-red">0</span>
          </div>
          <div class="bb-side bb-side--blue" id="bb-side-blue">
            <span class="bb-name">BLUE</span>
            <span class="bb-score" id="bb-score-blue">0</span>
            <span class="bb-games" id="bb-games-blue">0</span>
          </div>
          <div class="bb-info">
            <span class="bb-game" id="bb-game">Game 1</span>
            <span class="bb-serve" id="bb-serve">Servis: RED (Kanan)</span>
          </div>
        </div>

        <div class="bb-row bb-row--interval" id="bb-interval" hidden>
          <span class="bb-interval-label">Interval</span>
          <span class="bb-interval-timer" id="bb-interval-timer">60</span>
        </div>

        <div class="bb-row bb-row--announce" id="bb-announce" hidden></div>
      </div>
    `
  }

  /** Terima state terbaru dari MatchManager dan render ulang. */
  update(state: MatchState): void {
    this.state = state
    this.render()
  }

  private render(): void {
    if (!this.state) return

    const {
      currentGame,
      gamesWon,
      gameNumber,
      server,
      serveSide,
      status,
      intervalSecondsRemaining,
      matchWinner,
      gameWinner,
    } = this.state

    this.setText('bb-score-red', String(currentGame.red))
    this.setText('bb-score-blue', String(currentGame.blue))
    this.setText('bb-games-red', String(gamesWon.red))
    this.setText('bb-games-blue', String(gamesWon.blue))
    this.setText('bb-game', `Game ${gameNumber}`)

    // Animasi hanya untuk penambahan skor nyata. Reset game (skor turun ke 0)
    // dan render ulang dari callback lain tidak memicu highlight.
    const redScored = this.initialized && currentGame.red > this.lastRed
    const blueScored = this.initialized && currentGame.blue > this.lastBlue
    const redGameWon = this.initialized && gamesWon.red > this.lastGamesRed
    const blueGameWon = this.initialized && gamesWon.blue > this.lastGamesBlue

    this.lastRed = currentGame.red
    this.lastBlue = currentGame.blue
    this.lastGamesRed = gamesWon.red
    this.lastGamesBlue = gamesWon.blue
    this.initialized = true

    if (redScored) this.flashScored('red')
    if (blueScored) this.flashScored('blue')
    if (redGameWon) this.flashGames('red')
    if (blueGameWon) this.flashGames('blue')

    const serveLabel = server === 'red' ? 'RED' : 'BLUE'
    const serveSideLabel = serveSide === 'right' ? 'Kanan' : 'Kiri'
    this.setText('bb-serve', `Servis: ${serveLabel} (${serveSideLabel})`)

    // Status teks
    let statusText = ''
    switch (status) {
      case 'ready':
        statusText = 'READY'
        break
      case 'playing':
        statusText = 'BERLANGSUNG'
        break
      case 'interval':
        statusText = 'INTERVAL'
        break
      case 'gameOver':
        statusText = 'GAME SELESAI'
        break
      case 'matchOver':
        statusText = 'PERTANDINGAN SELESAI'
        break
    }

    // Interval timer: HANYA tampil saat status interval (mid-game atau between-games)
    const intervalEl = this.element.querySelector('#bb-interval') as HTMLElement
    if (status === 'interval') {
      intervalEl.hidden = false
      this.setText('bb-interval-timer', String(Math.max(0, Math.floor(intervalSecondsRemaining))))
    } else {
      intervalEl.hidden = true
    }

    // Announcement: pemenang game atau match
    const announceEl = this.element.querySelector('#bb-announce') as HTMLElement
    if (matchWinner && status === 'matchOver') {
      announceEl.hidden = false
      announceEl.textContent = `PEMENANG PERTANDINGAN: ${matchWinner.toUpperCase()}`
      announceEl.className = 'bb-announce bb-announce--match'
    } else if (gameWinner && status === 'gameOver') {
      announceEl.hidden = false
      announceEl.textContent = `Game ${gameNumber} Menang: ${gameWinner.toUpperCase()}`
      announceEl.className = 'bb-announce bb-announce--game'
    } else {
      announceEl.hidden = true
    }

    // Highlight pemain yang sedang servis
    const redEl = this.element.querySelector('#bb-side-red') as HTMLElement
    const blueEl = this.element.querySelector('#bb-side-blue') as HTMLElement
    redEl.classList.toggle('bb-side--serving', server === 'red')
    blueEl.classList.toggle('bb-side--serving', server === 'blue')
  }

  private setText(id: string, text: string): void {
    const el = this.element.querySelector(`#${id}`) as HTMLElement
    if (el) el.textContent = text
  }

  /**
   * Highlight singkat untuk sisi yang baru menambah poin: angka membesar lalu
   * kembali, border/background sisi menyala sesuai warna pemain.
   */
  private flashScored(side: 'red' | 'blue'): void {
    const scoreEl = this.element.querySelector<HTMLElement>(`#bb-score-${side}`)
    const sideEl = this.element.querySelector<HTMLElement>(`#bb-side-${side}`)
    if (!scoreEl || !sideEl) return

    // Poin beruntun: bersihkan highlight sebelumnya supaya animasi bisa
    // dimulai ulang dari awal, bukan menumpuk.
    this.element
      .querySelectorAll('.bb-score--bump')
      .forEach((el) => el.classList.remove('bb-score--bump'))
    this.element
      .querySelectorAll('.bb-side--scored')
      .forEach((el) => el.classList.remove('bb-side--scored'))

    // Reflow sinkron: restart keyframes tanpa mengubah teks skor.
    void scoreEl.offsetWidth

    scoreEl.classList.add('bb-score--bump')
    sideEl.classList.add('bb-side--scored')

    this.clearBumpTimer()
    this.bumpTimer = setTimeout(() => {
      this.clearScoreClasses()
      this.bumpTimer = null
    }, 1600)
  }

  /** Animasi kecil saat jumlah game yang dimenangkan bertambah. */
  private flashGames(side: 'red' | 'blue'): void {
    const el = this.element.querySelector<HTMLElement>(`#bb-games-${side}`)
    if (!el) return
    el.classList.remove('bb-games--bump')
    void el.offsetWidth
    el.classList.add('bb-games--bump')
    if (this.gamesTimer !== null) clearTimeout(this.gamesTimer)
    this.gamesTimer = setTimeout(() => {
      el.classList.remove('bb-games--bump')
      this.gamesTimer = null
    }, 700)
  }

  /** Hentikan animasi dan timer (dipakai saat arena dilepas). */
  resetMotion(): void {
    this.clearBumpTimer()
    if (this.gamesTimer !== null) {
      clearTimeout(this.gamesTimer)
      this.gamesTimer = null
    }
    this.clearScoreClasses()
    this.element
      .querySelectorAll('.bb-games--bump')
      .forEach((el) => el.classList.remove('bb-games--bump'))
  }

  /** Lepas elemen dan seluruh timer. */
  dispose(): void {
    this.resetMotion()
    this.element.remove()
  }

  private clearBumpTimer(): void {
    if (this.bumpTimer !== null) {
      clearTimeout(this.bumpTimer)
      this.bumpTimer = null
    }
  }

  private clearScoreClasses(): void {
    this.element
      .querySelectorAll('.bb-score--bump')
      .forEach((el) => el.classList.remove('bb-score--bump'))
    this.element
      .querySelectorAll('.bb-side--scored')
      .forEach((el) => el.classList.remove('bb-side--scored'))
  }
}
