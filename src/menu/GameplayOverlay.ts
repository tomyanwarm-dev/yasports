export interface GameplayOverlayActions {
  onBack: () => void
}

export class GameplayOverlay {
  readonly element: HTMLElement

  constructor(actions: GameplayOverlayActions) {
    this.element = document.createElement('section')
    this.element.className = 'screen screen--gameplay'
    this.element.setAttribute('aria-label', 'Gameplay UI')

    const backButton = document.createElement('button')
    backButton.type = 'button'
    backButton.className = 'gameplay-back-btn'
    backButton.setAttribute('aria-label', 'Kembali ke Pemilihan Olahraga')
    backButton.innerHTML = `
      <svg class="gameplay-back-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>BACK</span>
    `

    backButton.addEventListener('click', () => {
      actions.onBack()
    })

    this.element.append(backButton)
  }
}
