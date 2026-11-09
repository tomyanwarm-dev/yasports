/**
 * Ping Pong Scoring System
 * Implements official table tennis rules:
 * - 11 points per game, win by 2
 * - Deuce at 10-10 (continue until 2-point lead)
 * - Server is the player who won the last point
 */
export type Server = 'player1' | 'player2'
export type GameState = 'playing' | 'gameOver'

export interface ScoreState {
  player1Score: number
  player2Score: number
  server: Server
  gameState: GameState
  winner: Server | null
}

export interface ScoreCallbacks {
  onScoreChange?: (state: ScoreState) => void
  onGameOver?: (winner: Server) => void
  onServeChange?: (server: Server) => void
}

const WINNING_SCORE = 11
const MIN_LEAD = 2

export class PingpongScore {
  private state: ScoreState
  private callbacks: ScoreCallbacks

  constructor(callbacks: ScoreCallbacks = {}) {
    this.callbacks = callbacks
    this.state = this.getInitialState()
  }

  private getInitialState(): ScoreState {
    return {
      player1Score: 0,
      player2Score: 0,
      server: 'player1',
      gameState: 'playing',
      winner: null,
    }
  }

  /** Get current score state (read-only) */
  getState(): Readonly<ScoreState> {
    return { ...this.state }
  }

  /** Get current server */
  getServer(): Server {
    return this.state.server
  }

  /** Check if game is over */
  isGameOver(): boolean {
    return this.state.gameState === 'gameOver'
  }

  /** Get winner if game is over */
  getWinner(): Server | null {
    return this.state.winner
  }

  /** Record a point for the specified player */
  awardPoint(to: Server): void {
    if (this.state.gameState === 'gameOver') return

    if (to === 'player1') {
      this.state.player1Score++
    } else {
      this.state.player2Score++
    }

    // Server becomes the player who won the point
    this.state.server = to

    // Check for game win
    this.checkGameWin()

    // Notify callbacks
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)

    if (this.state.gameState === 'gameOver' as GameState) {
      this.callbacks.onGameOver?.(this.state.winner!)
    }
  }

  /** Check if either player has won the game */
  private checkGameWin(): void {
    const p1 = this.state.player1Score
    const p2 = this.state.player2Score

    // Check if either player has reached winning score with 2-point lead
    // Or if deuce (10-10) has been reached and someone leads by 2
    if ((p1 >= WINNING_SCORE || p2 >= WINNING_SCORE) && Math.abs(p1 - p2) >= MIN_LEAD) {
      if (p1 > p2) {
        this.state.winner = 'player1'
      } else {
        this.state.winner = 'player2'
      }
      this.state.gameState = 'gameOver'
    }
  }

  /** Reset the game to initial state */
  reset(): void {
    this.state = this.getInitialState()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
  }

  /** Set a specific score (for testing or multiplayer sync) */
  setScore(player1Score: number, player2Score: number, server: Server): void {
    this.state.player1Score = player1Score
    this.state.player2Score = player2Score
    this.state.server = server
    this.state.gameState = 'playing'
    this.state.winner = null
    this.checkGameWin()
    this.callbacks.onScoreChange?.(this.getState())
    this.callbacks.onServeChange?.(this.state.server)
  }

  /** Get score display string */
  getScoreString(): string {
    return `${this.state.player1Score} - ${this.state.player2Score}`
  }

  /** Check if we're in deuce (10-10 or beyond) */
  isDeuce(): boolean {
    return this.state.player1Score >= 10 && this.state.player2Score >= 10
  }

  /** Get points needed to win for current leader */
  getPointsToWin(): number {
    const p1 = this.state.player1Score
    const p2 = this.state.player2Score
    const leader = Math.max(p1, p2)
    return Math.max(WINNING_SCORE, leader + MIN_LEAD) - leader
  }
}