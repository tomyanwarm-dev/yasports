/**
 * Ping Pong Scoring System (ITTF-compliant)
 *
 * Aturan resmi yang diimplementasikan:
 * 1) Game dimenangkan oleh pemain/pasangan yang lebih dulu mencapai 11 poin.
 *    Jika skor imbang 10-10 (deuce), permainan dilanjutkan sampai salah satu
 *    pihak unggul selisih 2 poin (12-10, 13-11, dst).
 * 2) Servis berganti setiap 2 poin. Saat deuce (skor 10-10 ke atas),
 *    servis berganti setiap 1 poin.
 * 3) Melacak kemenangan set/game dalam sebuah pertandingan (best of 5/7).
 * 4) Poin dicatat ketika bola menyentuh lantai/area luar meja lawan atau
 *    lawan gagal mengembalikan bola dengan benar.
 */

export type PlayerId = 'player1' | 'player2'
export type Server = PlayerId
export type GameState = 'playing' | 'gameOver'

export interface ScoreState {
  // Skor poin dalam game/set saat ini
  player1Score: number
  player2Score: number

  // Status game/set saat ini
  server: Server
  gameState: GameState
  winner: PlayerId | null

  // Pelacakan set/pertandingan (mis. best of 5 atau 7)
  player1Sets: number
  player2Sets: number
  currentSet: number
  bestOf: number
  setsToWin: number
  matchOver: boolean
  matchWinner: PlayerId | null

  // Info servis & status khusus
  isDeuce: boolean
  pointsUntilServeChange: number
}

export interface ScoreCallbacks {
  onScoreChange?: (state: ScoreState) => void
  onServeChange?: (server: Server) => void
  onGameOver?: (winner: PlayerId, state: ScoreState) => void
  onSetWon?: (winner: PlayerId, state: ScoreState) => void
  onMatchOver?: (winner: PlayerId, state: ScoreState) => void
}

export interface PingpongScoreOptions {
  bestOf?: 3 | 5 | 7
  startingServer?: Server
  callbacks?: ScoreCallbacks
}

export const WINNING_SCORE = 11
export const MIN_LEAD = 2

export class PingpongScore {
  private readonly callbacks: ScoreCallbacks
  private readonly bestOf: number
  private readonly setsToWin: number

  private state: ScoreState
  // Server awal untuk set ganjil; set genap dibalik sesuai praktik umum.
  private initialServerForOddSet: Server

  constructor(options: PingpongScoreOptions | ScoreCallbacks = {}) {
    const normalized = this.normalizeOptions(options)
    this.callbacks = normalized.callbacks
    this.bestOf = normalized.bestOf
    this.setsToWin = Math.ceil(this.bestOf / 2)
    this.initialServerForOddSet = normalized.startingServer
    this.state = this.createInitialState()
  }

  private normalizeOptions(options: PingpongScoreOptions | ScoreCallbacks): {
    bestOf: number
    startingServer: Server
    callbacks: ScoreCallbacks
  } {
    const isCallbacks =
      typeof options === 'object' &&
      options !== null &&
      ('onScoreChange' in options || 'onGameOver' in options || 'onServeChange' in options)

    if (isCallbacks) {
      return { bestOf: 5, startingServer: 'player1', callbacks: options as ScoreCallbacks }
    }

    const opt = options as PingpongScoreOptions
    return {
      bestOf: opt.bestOf ?? 5,
      startingServer: opt.startingServer ?? 'player1',
      callbacks: opt.callbacks ?? {},
    }
  }

  private createInitialState(): ScoreState {
    return {
      player1Score: 0,
      player2Score: 0,
      server: this.initialServerForOddSet,
      gameState: 'playing',
      winner: null,

      player1Sets: 0,
      player2Sets: 0,
      currentSet: 1,
      bestOf: this.bestOf,
      setsToWin: this.setsToWin,
      matchOver: false,
      matchWinner: null,

      isDeuce: false,
      pointsUntilServeChange: 2,
    }
  }

  /** State read-only untuk UI / sinkronisasi */
  getState(): Readonly<ScoreState> {
    return { ...this.state }
  }

  getServer(): Server {
    return this.state.server
  }

  isGameOver(): boolean {
    return this.state.gameState === 'gameOver'
  }

  getWinner(): PlayerId | null {
    return this.state.winner
  }

  isMatchOver(): boolean {
    return this.state.matchOver
  }

  /**
   * Aturan tambahan poin (ITTF):
   * Poin diberikan otomatis ketika:
   * - Bola menyentuh lantai/area luar meja lawan, atau
   * - Lawan gagal mengembalikan bola (gagal memantul benar di area sendiri).
   *
   * Panggil fungsi ini dengan pemenang reli/poin tersebut.
   */
  awardPoint(to: PlayerId): void {
    if (this.state.matchOver || this.state.gameState === 'gameOver') return

    if (to === 'player1') this.state.player1Score++
    else this.state.player2Score++

    // Cek pemenang game/set dulu, lalu rotasi servis bila game masih berjalan.
    const setWonBy = this.checkGameWin()
    if (!setWonBy) {
      this.updateServerAfterPoint()
    }

    this.updateDerivedState()

    this.callbacks.onScoreChange?.(this.getState())
    if (!setWonBy) {
      this.callbacks.onServeChange?.(this.state.server)
    }

    if (setWonBy) {
      this.callbacks.onSetWon?.(setWonBy, this.getState())
      this.callbacks.onGameOver?.(setWonBy, this.getState())
      if (this.state.matchOver && this.state.matchWinner) {
        this.callbacks.onMatchOver?.(this.state.matchWinner, this.getState())
      }
    }
  }

  /**
   * Rotasi servis otomatis (ITTF):
   * - Setiap 2 poin sekali (berdasarkan total poin di game berjalan).
   * - Jika skor 10-10 ke atas (deuce), servis berganti setiap 1 poin.
   */
  private updateServerAfterPoint(): void {
    const p1 = this.state.player1Score
    const p2 = this.state.player2Score
    const total = p1 + p2
    const starter = this.getSetStartingServer(this.state.currentSet)

    if (this.isDeuceScore(p1, p2)) {
      // Saat deuce: berganti tiap 1 poin
      this.state.server = total % 2 === 0 ? starter : this.other(starter)
    } else {
      // Normal: berganti tiap 2 poin
      this.state.server = Math.floor(total / 2) % 2 === 0 ? starter : this.other(starter)
    }
  }

  /** Cek kemenangan game/set: capai 11 dan unggul >= 2 (termasuk setelah deuce). */
  private checkGameWin(): PlayerId | null {
    const p1 = this.state.player1Score
    const p2 = this.state.player2Score

    const hasWinningScore = p1 >= WINNING_SCORE || p2 >= WINNING_SCORE
    const hasLead = Math.abs(p1 - p2) >= MIN_LEAD
    if (!hasWinningScore || !hasLead) return null

    const winner: PlayerId = p1 > p2 ? 'player1' : 'player2'
    this.state.winner = winner
    this.state.gameState = 'gameOver'

    if (winner === 'player1') this.state.player1Sets++
    else this.state.player2Sets++

    // Cek pemenang pertandingan (best of N)
    if (this.state.player1Sets >= this.setsToWin) {
      this.state.matchOver = true
      this.state.matchWinner = 'player1'
    } else if (this.state.player2Sets >= this.setsToWin) {
      this.state.matchOver = true
      this.state.matchWinner = 'player2'
    }

    return winner
  }

  /** Mulai set/game berikutnya (jika pertandingan belum selesai). */
  startNextSet(): boolean {
    if (!this.state.gameState || this.state.gameState !== 'gameOver') return false
    if (this.state.matchOver) return false

    this.state.currentSet += 1
    this.state.player1Score = 0
    this.state.player2Score = 0
    this.state.winner = null
    this.state.gameState = 'playing'
    this.state.server = this.getSetStartingServer(this.state.currentSet)

    this.updateDerivedState()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
    return true
  }

  /** Reset seluruh pertandingan ke awal. */
  reset(): void {
    this.state = this.createInitialState()
    this.updateDerivedState()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
  }

  /** Reset game/set berjalan (skor poin), tetap pertahankan skor set pertandingan. */
  resetCurrentGame(): void {
    this.state.player1Score = 0
    this.state.player2Score = 0
    this.state.winner = null
    this.state.gameState = 'playing'
    this.state.server = this.getSetStartingServer(this.state.currentSet)
    this.updateDerivedState()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
  }

  /** Set skor manual (untuk testing/sinkronisasi). */
  setScore(player1Score: number, player2Score: number): void {
    this.state.player1Score = Math.max(0, Math.floor(player1Score))
    this.state.player2Score = Math.max(0, Math.floor(player2Score))
    this.state.winner = null
    this.state.gameState = 'playing'

    const setWonBy = this.checkGameWin()
    if (!setWonBy) this.updateServerAfterPoint()

    this.updateDerivedState()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
  }

  getScoreString(): string {
    return `${this.state.player1Score} - ${this.state.player2Score}`
  }

  getSetsString(): string {
    return `${this.state.player1Sets} - ${this.state.player2Sets}`
  }

  /** Deuce: kedua pihak telah mencapai 10 poin atau lebih (10-10 ke atas). */
  isDeuce(): boolean {
    return this.isDeuceScore(this.state.player1Score, this.state.player2Score)
  }

  private isDeuceScore(p1: number, p2: number): boolean {
    return p1 >= 10 && p2 >= 10
  }

  private updateDerivedState(): void {
    const p1 = this.state.player1Score
    const p2 = this.state.player2Score
    this.state.isDeuce = this.isDeuceScore(p1, p2)

    const total = p1 + p2
    if (this.state.gameState === 'gameOver') {
      this.state.pointsUntilServeChange = 0
    } else if (this.state.isDeuce) {
      this.state.pointsUntilServeChange = 1
    } else {
      this.state.pointsUntilServeChange = 2 - (total % 2)
    }
  }

  /**
   * Server awal bergantian tiap set:
   * - Set ganjil: server awal pertandingan
   * - Set genap: lawan dari server awal pertandingan
   */
  private getSetStartingServer(setNumber: number): Server {
    return setNumber % 2 === 1 ? this.initialServerForOddSet : this.other(this.initialServerForOddSet)
  }

  private other(player: PlayerId): PlayerId {
    return player === 'player1' ? 'player2' : 'player1'
  }
}