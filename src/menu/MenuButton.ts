export interface MenuButtonOptions {
  label: string
  onSelect: () => void
  variant?: 'primary' | 'default'
  disabled?: boolean
}

export class MenuButton {
  readonly element: HTMLButtonElement

  constructor(options: MenuButtonOptions) {
    this.element = document.createElement('button')
    this.element.type = 'button'
    this.element.className = 'menu-button'
    if (options.variant) {
      this.element.classList.add(`menu-button--${options.variant}`)
    }
    this.element.textContent = options.label
    this.element.disabled = options.disabled ?? false
    this.element.addEventListener('click', () => {
      if (!this.element.disabled) options.onSelect()
    })
  }
}