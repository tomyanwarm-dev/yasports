import { MenuButton } from './MenuButton.ts'

export interface MainMenuActions {
  onPlay: () => void
  onSettings: () => void
  onExit: () => void
}

export class MainMenu {
  readonly element: HTMLElement

  constructor(actions: MainMenuActions) {
    this.element = document.createElement('section')
    this.element.className = 'screen screen--main-menu'
    this.element.setAttribute('aria-label', 'Menu Utama')

    const panel = document.createElement('div')
    panel.className = 'panel panel--main-menu'

    const title = document.createElement('h1')
    title.className = 'title'
    title.textContent = 'YASPORTS'

    const tagline = document.createElement('p')
    tagline.className = 'tagline'
    tagline.textContent = 'Game olahraga berbasis gerakan tangan.'

    const menu = document.createElement('nav')
    menu.className = 'menu-actions'
    menu.setAttribute('aria-label', 'Menu Utama')

    const play = new MenuButton({ label: 'PLAY', onSelect: actions.onPlay, variant: 'primary' })
    const settings = new MenuButton({ label: 'SETTINGS', onSelect: actions.onSettings })
    const exit = new MenuButton({ label: 'EXIT', onSelect: actions.onExit })

    menu.append(play.element, settings.element, exit.element)
    panel.append(title, tagline, menu)
    this.element.append(panel)
  }

  focusFirst(): void {
    this.element.querySelector<HTMLButtonElement>('.menu-button')?.focus()
  }
}