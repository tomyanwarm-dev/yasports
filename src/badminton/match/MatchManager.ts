export type Player = 'red' | 'blue'
export type MatchStatus = 'ready' | 'playing' | 'interval' | 'gameOver' | 'matchOver'
export type ServeSide = 'right' | 'left'
export type IntervalType = 'midGame' | 'betweenGames'

export interface GameScore {
  red: number
  blue: number
  winner: Player | null
}

export interface MatchState {
  status: MatchStatus
  gameNumber: number // 1, 2, or 3
  games: GameScore[] // score per game
  gamesWon: { red: number; blue: number }
  currentGame: GameScore
  server: Player
  serveSide: ServeSide
  intervalSecondsRemaining: number
  intervalStartedAt: number | null
  intervalType: IntervalType | null
  sideChanged: boolean // true when sides have been switched for current game
  matchWinner: Player | null
  gameWinner: Player | null // winner of current game, null if not over
}

export interface MatchCallbacks {
  onScoreChange?: (state: MatchState) => void
  onGameOver?: (winner: Player, gameNumber: number) => void
  onMatchOver?: (winner: Player) => void
  onServeChange?: (server: Player, serveSide: ServeSide) => void
  onIntervalStart?: (seconds: number) => void
  onIntervalTick?: (secondsRemaining: number) => void
  onIntervalEnd?: () => void
  onSideChange?: () => void
}

/** Official badminton scoring rules: rally point, best of 3, 21 points per game. */
export class BadmintonMatchManager {
  private state: MatchState
  private readonly callbacks: MatchCallbacks
  private intervalTimer = 0

  private static readonly WINNING_SCORE = 21
  private static readonly MIN_LEAD = 2
  private static readonly CAP_SCORE = 30
  private static readonly INTERVAL_SECONDS = 60
  private static readonly BETWEEN_GAMES_INTERVAL_SECONDS = 120
  private static readonly INTERVAL_TRIGGER_SCORE = 11

  constructor(callbacks: MatchCallbacks = {}) {
    this.callbacks = callbacks
    this.state = this.getInitialState()
  }

  private getInitialState(): MatchState {
    return {
      status: 'ready',
      gameNumber: 1,
      games: [],
      gamesWon: { red: 0, blue: 0 },
      currentGame: { red: 0, blue: 0, winner: null },
      server: 'red',
      serveSide: 'right',
      intervalSecondsRemaining: BadmintonMatchManager.INTERVAL_SECONDS,
      intervalStartedAt: null,
      intervalType: null,
      sideChanged: false,
      matchWinner: null,
      gameWinner: null,
    }
  }

  /** Read-only current match state. */
  getState(): Readonly<MatchState> {
    return { ...this.state, currentGame: { ...this.state.currentGame } }
  }

  /** Check if match is over. */
  isMatchOver(): boolean {
    return this.state.status === 'matchOver'
  }

  /** Get match winner if over. */
  getMatchWinner(): Player | null {
    return this.state.matchWinner
  }

  /** Get current game winner if game over. */
  getGameWinner(): Player | null {
    return this.state.gameWinner
  }

  /** Get current server. */
  getServer(): Player {
    return this.state.server
  }

  /** Get serve side for current server based on their score. */
  getServeSide(): ServeSide {
    return this.state.serveSide
  }

  /** Get interval seconds remaining. */
  getIntervalSecondsRemaining(): number {
    return this.state.intervalSecondsRemaining
  }

  /** Check if currently in interval. */
  isInInterval(): boolean {
    return this.state.status === 'interval'
  }

  /** Award a point to the specified player (rally winner). */
  awardPoint(to: Player): void {
    const { status } = this.state
    if (status === 'matchOver' || status === 'interval') return

    const red = this.state.currentGame.red
    const blue = this.state.currentGame.blue

    if (to === 'red') {
      this.state.currentGame.red++
      this.state.server = 'red'
    } else {
      this.state.currentGame.blue++
      this.state.server = 'blue'
    }

    this.state.serveSide = this.computeServeSide(this.state.server)

    // Cek interval di poin 11 (pertama kali dalam game, sebelum game berakhir)
    if (status === 'playing' && !this.state.intervalStartedAt) {
      if (this.state.currentGame.red >= BadmintonMatchManager.INTERVAL_TRIGGER_SCORE || this.state.currentGame.blue >= BadmintonMatchManager.INTERVAL_TRIGGER_SCORE) {
        this.startInterval('midGame')
        this.callbacks.onScoreChange?.(this.getState())
        this.callbacks.onServeChange?.(this.state.server, this.state.serveSide)
        this.callbacks.onIntervalStart?.(BadmintonMatchManager.INTERVAL_SECONDS)
        this.callbacks.onIntervalTick?.(this.state.intervalSecondsRemaining)
        return
      }
    }

    this.checkGameWin()

    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server, this.state.serveSide)

    if (this.state.status === 'gameOver') {
      this.callbacks.onGameOver?.(this.state.gameWinner!, this.state.gameNumber)
    }
  }

  /** Check if current game has been won. */
  private checkGameWin(): void {
    const { red, blue } = this.state.currentGame
    const maxScore = Math.max(red, blue)
    const lead = Math.abs(red - blue)

    let winner: Player | null = null

    if (maxScore >= BadmintonMatchManager.CAP_SCORE && lead >= 1) {
      winner = red > blue ? 'red' : 'blue'
    } else if (maxScore >= BadmintonMatchManager.WINNING_SCORE && lead >= BadmintonMatchManager.MIN_LEAD) {
      winner = red > blue ? 'red' : 'blue'
    }

    if (winner) {
      this.state.currentGame.winner = winner
      this.state.gameWinner = winner
      this.state.gamesWon[winner]++

      // Catat game yang selesai
      this.state.games.push({ ...this.state.currentGame })

      const matchWon = this.state.gamesWon.red >= 2 || this.state.gamesWon.blue >= 2

      if (matchWon) {
        this.state.status = 'matchOver'
        this.state.matchWinner = winner
        this.callbacks.onMatchOver?.(winner)
      } else {
        // Game selesai, masuk interval sebelum game berikutnya
        this.state.status = 'interval'
        this.state.gameWinner = winner
        this.startInterval('betweenGames')
      }
    }
  }

  /** Start interval after a game ends (before next game). */
  private startInterval(type: IntervalType = 'betweenGames'): void {
    this.state.status = 'interval'
    this.state.intervalStartedAt = performance.now()
    this.state.intervalType = type
    this.state.intervalSecondsRemaining =
      type === 'betweenGames'
        ? BadmintonMatchManager.BETWEEN_GAMES_INTERVAL_SECONDS
        : BadmintonMatchManager.INTERVAL_SECONDS
    this.callbacks.onIntervalStart?.(this.state.intervalSecondsRemaining)
    this.callbacks.onIntervalTick?.(this.state.intervalSecondsRemaining)
  }

  /** Advance to next game after interval. */
  private advanceGame(): void {
    this.state.gameNumber++
    this.state.currentGame = { red: 0, blue: 0, winner: null }
    this.state.gameWinner = null
    this.state.sideChanged = false
    this.state.intervalStartedAt = null
    this.state.intervalType = null
    this.state.intervalSecondsRemaining = BadmintonMatchManager.INTERVAL_SECONDS

    // Server alternates: winner of previous game serves first
    const prevWinner = this.state.games[this.state.games.length - 1]?.winner
    if (prevWinner) {
      this.state.server = prevWinner
    }
    this.state.serveSide = this.computeServeSide(this.state.server)

    this.state.status = 'playing'
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server, this.state.serveSide)
  }

  /** Update interval timer. Call once per frame with delta seconds. */
  updateInterval(delta: number): void {
    if (this.state.status !== 'interval') return

    this.intervalTimer += delta
    if (this.intervalTimer >= 1) {
      this.intervalTimer = 0
      this.state.intervalSecondsRemaining = Math.max(
        0,
        this.state.intervalSecondsRemaining - 1
      )
      this.callbacks.onIntervalTick?.(this.state.intervalSecondsRemaining)

      if (this.state.intervalSecondsRemaining <= 0) {
        this.endInterval()
      }
    }
  }

  /** End interval and proceed to next game or match over. */
  private endInterval(): void {
    this.callbacks.onIntervalEnd?.()

    if (this.state.intervalType === 'midGame') {
      // Pertengahan game: lanjut game yang sama, jangan reset intervalStartedAt
      // agar interval tidak terpicu lagi di game yang sama
      this.state.status = 'playing'
      this.state.intervalType = null
      this.callbacks.onScoreChange?.(this.getState())
      return
    }

    const matchWon = this.state.gamesWon.red >= 2 || this.state.gamesWon.blue >= 2

    if (matchWon) {
      this.state.status = 'matchOver'
      this.callbacks.onMatchOver?.(this.state.matchWinner!)
      return
    }

    this.advanceGame()
  }

  /** Manually end interval (for testing or skip). */
  skipInterval(): void {
    if (this.state.status !== 'interval') return
    this.endInterval()
  }

  /** Compute serve side: even score = right, odd score = left. */
  private computeServeSide(server: Player): ServeSide {
    const score = server === 'red' ? this.state.currentGame.red : this.state.currentGame.blue
    return score % 2 === 0 ? 'right' : 'left'
  }

  /** Check if side change should occur (after each game, or at 11 in game 3). */
  shouldChangeSides(): boolean {
    const { gameNumber, gamesWon, currentGame } = this.state

    // After each completed game
    if (this.state.status === 'gameOver' || this.state.status === 'matchOver') {
      return true
    }

    // In game 3, when a player first reaches 11
    if (gameNumber === 3 && !this.state.sideChanged) {
      if (currentGame.red >= 11 || currentGame.blue >= 11) {
        return true
      }
    }

    return false
  }

  /** Mark sides as changed so it doesn't repeat. */
  markSidesChanged(): void {
    this.state.sideChanged = true
    this.callbacks.onSideChange?.()
  }

  /** Record a completed game (for persistence between games). */
  private recordGame(): void {
    this.state.games.push({ ...this.state.currentGame })
  }

  /** Start the match (transition from ready to playing). */
  startMatch(): void {
    if (this.state.status !== 'ready') return
    this.state.status = 'playing'
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server, this.state.serveSide)
  }

  /** Reset match to initial state. */
  reset(): void {
    this.state = this.getInitialState()
    this.intervalTimer = 0
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server, this.state.serveSide)
  }
}
