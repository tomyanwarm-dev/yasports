import * as THREE from 'three'

/** Banners are pure decoration: no match data, no score logic. */
const BANNERS: { text: string; color: string; width: number }[] = [
  { text: 'YASPORTS', color: '#1d4ed8', width: 11 },
  { text: 'BADMINTON', color: '#0e7490', width: 11 },
]

/**
 * Wall signage for the hall. Text is rendered once to a canvas texture, so
 * there is no external image asset and no extra draw-call cost per banner.
 */
export class BadmintonSignage {
  readonly group = new THREE.Group()

  constructor() {
    const bannerMaterial = new THREE.MeshBasicMaterial({
      color: 0x0b1220,
      side: THREE.DoubleSide,
    })

    BANNERS.forEach((banner, index) => {
      const sign = index === 0 ? 1 : -1
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(banner.width, 1.7),
        bannerMaterial,
      )
      plane.position.set(0, 6.4, sign * 22.7)
      plane.rotation.y = sign === 1 ? Math.PI : 0
      this.group.add(plane)

      const text = new THREE.Mesh(
        new THREE.PlaneGeometry(banner.width - 0.6, 1.4),
        new THREE.MeshBasicMaterial({
          map: createTextTexture(banner.text, banner.color),
          transparent: true,
          side: THREE.DoubleSide,
        }),
      )
      text.position.set(0, 6.4, sign * 22.66)
      text.rotation.y = sign === 1 ? Math.PI : 0
      this.group.add(text)
    })

    const sideBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 1.5),
      new THREE.MeshBasicMaterial({
        map: createTextTexture('YASPORTS', '#38bdf8'),
        transparent: true,
        side: THREE.DoubleSide,
      }),
    )
    sideBanner.position.set(-17.7, 5.6, -8)
    sideBanner.rotation.y = Math.PI / 2
    this.group.add(sideBanner)
  }
}

function createTextTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.font = 'bold 78px system-ui, Segoe UI, Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '14px'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }

  return new THREE.CanvasTexture(canvas)
}