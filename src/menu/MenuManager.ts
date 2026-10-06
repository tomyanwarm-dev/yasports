import { GameState, Screen } from '../core/GameState.ts'
import type { Sport } from '../core/Sport.ts'
import { GameplayOverlay } from './GameplayOverlay.ts'
import { MainMenu } from './MainMenu.ts'
import { PlaceholderScreen } from './PlaceholderScreen.ts'
import { SportSelection } from './SportSelection.ts'

export class MenuManager {
  private screens = new Map<Screen, HTMLElement>()
  private active: Screen | null = null
  private selectedSport: Sport | null = null

  constructor(
    private root: HTMLElement,
    private state: GameState,
  ) {
    this.register(Screen.MainMenu, new MainMenu({
      onPlay: () => this.goTo(Screen.SportSelect),
      onSettings: () => this.goTo(Screen.Settings),
      onExit: () => this.goTo(Screen.Exit),
    }).element)

    this.register(Screen.SportSelect, new SportSelection({
      onSelect: (sport: Sport) => this.startSport(sport),
      onBack: () => this.goTo(Screen.MainMenu),
    }).element)

    const gameplayOverlay = new GameplayOverlay({
      onBack: () => this.goTo(Screen.SportSelect),
    })

    this.register(Screen.Badminton, gameplayOverlay.element)
    this.register(Screen.Pingpong, gameplayOverlay.element)

    this.register(Screen.Playing, new PlaceholderScreen({
      title: 'PLAY',
      message: 'Olahraga dipilih. Gameplay akan tersedia pada tahap berikutnya.',
      onBack: () => this.goTo(Screen.MainMenu),
    }).render())

    this.register(Screen.Settings, new PlaceholderScreen({
      title: 'SETTINGS',
      message: 'Pengaturan game akan tersedia pada tahap berikutnya.',
      onBack: () => this.goTo(Screen.MainMenu),
    }).render())

    this.register(Screen.Exit, new PlaceholderScreen({
      title: 'EXIT',
      message: 'Terima kasih sudah bermain di YASPORTS.',
      backLabel: 'MENU UTAMA',
      onBack: () => this.goTo(Screen.MainMenu),
    }).render())

    this.state.onChange((screen) => this.show(screen))
    this.show(this.state.screen)
  }

  goTo(screen: Screen): void {
    this.state.set(screen)
  }

  /** Entry point for the sport teams: sport picked, then the scene loads. */
  private startSport(sport: Sport): void {
    this.selectedSport = sport
    this.state.set(sport === 'badminton' ? Screen.Badminton : Screen.Pingpong)
  }

  get sport(): Sport | null {
    return this.selectedSport
  }

  private register(screen: Screen, element: HTMLElement): void {
    element.hidden = true
    this.screens.set(screen, element)
    if (!this.root.contains(element)) {
      this.root.append(element)
    }
  }

  private show(screen: Screen): void {
    const next = this.screens.get(screen)
    if (!next) return
    if (this.active) {
      const current = this.screens.get(this.active)
      if (current) current.hidden = true
    }
    next.hidden = false
    this.active = screen
  }
}
