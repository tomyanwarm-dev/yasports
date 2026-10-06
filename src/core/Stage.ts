import type * as THREE from 'three'

/**
 * A playable area that takes over rendering while it is mounted.
 * Lets sport teams (badminton, pingpong) reuse the existing renderer,
 * animation loop and resize handling instead of creating a second WebGL context.
 */
export interface Stage {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  /** Called every frame with delta time (seconds) and elapsed time (seconds). */
  update?(delta: number, elapsed: number): void
  /** Called when the stage is mounted into the renderer. */
  enter?(): void
  /** Called when the stage is removed from the renderer. */
  exit?(): void
}