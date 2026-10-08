import * as THREE from 'three'
import { BadmintonMovement } from './BadmintonMovement.ts'
import type { MovementBounds, MoveIntent } from './BadmintonMovement.ts'

export type AiState = 'idle' | 'moveLeft' | 'moveRight'

const IDLE_MIN = 0.5
const IDLE_MAX = 1.1
const MOVE_MIN = 1.0
const MOVE_MAX = 2.2

/**
 * Minimal opponent behaviour for the red player: alternate short pauses with
 * lateral movement, switching direction at random. The shuttlecock does not
 * exist yet, so the AI only patrols its own half inside the movement bounds.
 */
export class BadmintonAIController {
  private readonly movement: BadmintonMovement

  private state: AiState = 'idle'
  private timer = this.randomBetween(IDLE_MIN, IDLE_MAX)
  private active = false

  constructor(
    private player: THREE.Object3D,
    bounds: MovementBounds,
    private speed: number = 2.6,
  ) {
    this.movement = new BadmintonMovement(player, bounds, speed)
  }

  enable(): void {
    this.active = true
  }

  disable(): void {
    this.active = false
  }

  update(delta: number): void {
    if (!this.active) return

    this.timer -= delta
    if (this.timer <= 0) this.chooseNextState()

    this.movement.apply(this.currentIntent(), delta)
  }

  get currentState(): AiState {
    return this.state
  }

  private currentIntent(): MoveIntent {
    if (this.state === 'moveLeft') return { x: -1, z: 0 }
    if (this.state === 'moveRight') return { x: 1, z: 0 }
    return { x: 0, z: 0 }
  }

  private chooseNextState(): void {
    switch (this.state) {
      case 'idle':
        this.state = Math.random() < 0.5 ? 'moveLeft' : 'moveRight'
        this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX)
        break
      case 'moveLeft':
      case 'moveRight':
        if (Math.random() < 0.35) {
          this.state = 'idle'
          this.timer = this.randomBetween(IDLE_MIN, IDLE_MAX)
        } else {
          this.state = this.state === 'moveLeft' ? 'moveRight' : 'moveLeft'
          this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX)
        }
        break
    }
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }

  /** Kept for symmetry with the player controller. */
  get position(): THREE.Vector3 {
    return this.player.position
  }
}
