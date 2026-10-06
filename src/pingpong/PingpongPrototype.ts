import type { Game } from '../core/Game.ts'
import { PingpongArena } from './PingpongArena.ts'

/** Connects the ping pong environment to the shared game renderer. */
export class PingpongPrototype {
  private arena: PingpongArena | null = null

  constructor(private game: Game) {}

  setActive(active: boolean): void {
    if (active) {
      this.arena ??= new PingpongArena()
      this.game.useStage(this.arena)
      return
    }
    this.game.useStage(null)
  }
}
