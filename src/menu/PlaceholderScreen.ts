export interface PlaceholderScreenOptions {
  title: string
  message: string
  backLabel?: string
  onBack: () => void
}

export class PlaceholderScreen {
  readonly element: HTMLElement

  constructor(private options: PlaceholderScreenOptions) {
    this.element = document.createElement('section')
    this.element.className = 'screen screen--placeholder'
  }

  render(): HTMLElement {
    this.element.innerHTML = ''

    const panel = document.createElement('div')
    panel.className = 'panel'

    const title = document.createElement('h2')
    title.className = 'screen__title'
    title.textContent = this.options.title

    const message = document.createElement('p')
    message.className = 'screen__message'
    message.textContent = this.options.message

    const back = document.createElement('button')
    back.type = 'button'
    back.className = 'menu-button'
    back.textContent = this.options.backLabel ?? 'KEMBALI'
    back.addEventListener('click', this.options.onBack)

    panel.append(title, message, back)
    this.element.append(panel)
    return this.element
  }
}