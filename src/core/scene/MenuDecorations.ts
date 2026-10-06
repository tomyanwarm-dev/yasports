import * as THREE from 'three'
import { BadmintonProp } from './BadmintonProp.ts'
import { PingpongProp } from './PingpongProp.ts'

const MIN_WIDTH_PX = 1024

/**
 * Owns the decorative sports props shown on the left and right of the menu.
 * Layout depends only on viewport size so the props never cover the buttons.
 */
export class MenuDecorations {
  readonly group = new THREE.Group()
  private badminton = new BadmintonProp()
  private pingpong = new PingpongProp()
  private visible = true
  private layoutVisible = true

  constructor() {
    this.group.add(this.badminton.group, this.pingpong.group)

    this.badminton.group.rotation.y = -0.42
    this.pingpong.group.rotation.y = 0.42

    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.castShadow = true
    })
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    this.group.visible = visible && this.layoutVisible
  }

  update(elapsed: number): void {
    this.badminton.update(elapsed)
    this.pingpong.update(elapsed)
  }

  /**
   * @param widthPx container width in CSS pixels
   * @param halfWidth visible world half-width at the scene origin
   */
  setLayout(widthPx: number, halfWidth: number): void {
    this.layoutVisible = widthPx >= MIN_WIDTH_PX
    this.group.visible = this.visible && this.layoutVisible

    if (!this.layoutVisible) return
    const scale = widthPx < 1280 ? 0.7 : widthPx < 1600 ? 0.82 : 0.92
    const gap = Math.min(4.3, halfWidth * 0.66)

    this.badminton.group.position.set(-gap, 0.35, 1.1)
    this.badminton.group.scale.setScalar(scale * 1.15)

    this.pingpong.group.position.set(gap, -0.35, -0.6)
    this.pingpong.group.scale.setScalar(scale * 0.95)
  }
}