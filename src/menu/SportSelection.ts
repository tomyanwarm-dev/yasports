import type { Sport } from '../core/Sport.ts'
import { MenuButton } from './MenuButton.ts'
import { SportCard } from './SportCard.ts'

const BADMINTON_ICON = `
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round">
  <circle cx="19" cy="19" r="11" />
  <path d="M27 27 L38 38" />
  <path d="M13 19h12M19 13v12M15 15l8 8M23 15l-8 8" stroke-width="1.2" />
  <path d="M33 12l3 4 3-4-3 4z" stroke-width="1.4" />
  <circle cx="36" cy="8" r="1.6" fill="currentColor" stroke="none" />
</svg>`

const PINGPONG_ICON = `
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="21" cy="17" rx="10" ry="12" />
  <path d="M21 29 L21 38" />
  <path d="M17 38h8" />
  <circle cx="37" cy="9" r="3" />
  <path d="M33 30a6 6 0 0 0 6-6" stroke-width="1.2" opacity="0.6" />
</svg>`

export interface SportSelectionActions {
  onSelect: (sport: Sport) => void
  onBack: () => void
}

export class SportSelection {
  readonly element: HTMLElement

  constructor(actions: SportSelectionActions) {
    this.element = document.createElement('section')
    this.element.className = 'screen screen--sport-select'
    this.element.setAttribute('aria-label', 'Pilih Olahraga')

    const panel = document.createElement('div')
    panel.className = 'panel panel--sport-select'

    const brand = document.createElement('p')
    brand.className = 'panel__brand'
    brand.textContent = 'YASPORTS'

    const title = document.createElement('h2')
    title.className = 'screen__title'
    title.textContent = 'PILIH OLAHRAGA'

    const grid = document.createElement('div')
    grid.className = 'sport-grid'

    const badminton = new SportCard({
      label: 'BADMINTON',
      hint: 'Arena Siap',
      icon: BADMINTON_ICON,
      onSelect: () => actions.onSelect('badminton'),
    })

    const pingpong = new SportCard({
      label: 'PINGPONG',
      hint: 'Arena siap',
      icon: PINGPONG_ICON,
      onSelect: () => actions.onSelect('pingpong'),
    })

    const back = new MenuButton({ label: 'BACK', onSelect: actions.onBack })

    grid.append(badminton.element, pingpong.element)
    panel.append(brand, title, grid, back.element)
    this.element.append(panel)
  }
}
