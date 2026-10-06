export enum Screen {
  MainMenu = 'main-menu',
  SportSelect = 'sport-select',
  Settings = 'settings',
  Playing = 'playing',
  Badminton = 'badminton',
  Pingpong = 'pingpong',
  Exit = 'exit',
}

type Listener = (screen: Screen, previous: Screen) => void

export class GameState {
  private current: Screen = Screen.MainMenu
  private listeners = new Set<Listener>()

  get screen(): Screen {
    return this.current
  }

  is(screen: Screen): boolean {
    return this.current === screen
  }

  set(screen: Screen): void {
    if (screen === this.current) return
    const previous = this.current
    this.current = screen
    for (const listener of this.listeners) listener(screen, previous)
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
