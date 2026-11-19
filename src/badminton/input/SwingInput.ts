/**
 * Keyboard input for the swing action of the human (red) player.
 *
 * It is deliberately separate from BadmintonPlayerController: that controller
 * owns W/A/S/D movement, this one owns the swing key only, so neither system
 * can block the other. Hand tracking can replace this class later without
 * touching movement or hit detection.
 */
export class BadmintonSwingInput {
  private active = false

  constructor(
    private readonly code: string,
    private readonly onSwing: () => void,
  ) {}

  enable(): void {
    if (this.active) return
    this.active = true
    window.addEventListener('keydown', this.onKeyDown)
  }

  disable(): void {
    if (!this.active) return
    this.active = false
    window.removeEventListener('keydown', this.onKeyDown)
  }

  /** Held-key auto repeat is ignored, so one press means one swing. */
  private onKeyDown = (event: KeyboardEvent): void => {
    // [BADMINTON-DIAG] Sementara: log tombol yang dipantau listener ini
    // (Space / KeyT / Enter, sesuai code yang diberikan di konstruktor).
    if (event.code === this.code) {
      console.info(
        `[BADMINTON-DIAG] SwingInput: key=${this.code} repeat=${event.repeat} -> handler`
      )
    }
    if (event.code !== this.code || event.repeat) return
    this.onSwing()
  }
}