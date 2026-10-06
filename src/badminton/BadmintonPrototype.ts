import type { Game } from '../core/Game.ts'
import { BadmintonArena } from './BadmintonArena.ts'

/**
 * Mounts the badminton prototype on the shared renderer when the player
 * enters the sport, and hands rendering back to the menu on exit.
 */
export class BadmintonPrototype {
  private arena: BadmintonArena | null = null

  constructor(private game: Game) {}

  setActive(active: boolean): void {
    if (active) {
      this.arena ??= new BadmintonArena()
      this.game.useStage(this.arena)
      return
    }
    this.game.useStage(null)
  }
}