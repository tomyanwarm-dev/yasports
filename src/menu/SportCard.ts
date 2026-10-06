export interface SportCardOptions {
  label: string
  hint: string
  icon: string
  onSelect: () => void
}

export class SportCard {
  readonly element: HTMLButtonElement

  constructor(options: SportCardOptions) {
    this.element = document.createElement('button')
    this.element.type = 'button'
    this.element.className = 'sport-card'

    const icon = document.createElement('span')
    icon.className = 'sport-card__icon'
    icon.setAttribute('aria-hidden', 'true')
    icon.innerHTML = options.icon

    const label = document.createElement('span')
    label.className = 'sport-card__label'
    label.textContent = options.label

    const hint = document.createElement('span')
    hint.className = 'sport-card__hint'
    hint.textContent = options.hint

    this.element.append(icon, label, hint)
    this.element.addEventListener('click', options.onSelect)
  }
}