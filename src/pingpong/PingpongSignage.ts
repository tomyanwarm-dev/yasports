import * as THREE from 'three'
import { HALL_LENGTH, HALL_WIDTH } from './PingpongHall.ts'
import {
  createArenaBannerTexture,
  createSponsorBoardTexture,
  SPONSOR_BRANDS,
} from './PingpongSponsors.ts'

/**
 * GOR wall signage, tournament header, scoreboard display, and diverse sports
 * sponsor billboards around the upper walls and roof trusses.
 */
export class PingpongSignage {
  readonly group = new THREE.Group()

  constructor() {
    const halfW = HALL_WIDTH / 2 - 0.18
    const halfL = HALL_LENGTH / 2 - 0.18
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220,
      roughness: 0.65,
      metalness: 0.25,
    })

    // 1. Main GOR Header Banner on far (-Z) wall
    this.addBannerBoard(
      0,
      6.9,
      -halfL,
      0,
      9.4,
      1.75,
      createArenaBannerTexture(
        'GOR YASPORTS',
        'TABLE TENNIS CHAMPIONSHIP ARENA',
        '#091326',
        '#38bdf8',
        '#f8fafc',
      ),
      frameMat,
    )

    // 2. Opposite (+Z) wall banner
    this.addBannerBoard(
      0,
      6.9,
      halfL,
      Math.PI,
      9.0,
      1.65,
      createArenaBannerTexture(
        'TENIS MEJA GOR',
        'YASPORTS PRO SERIES • BEST OF 5',
        '#091326',
        '#22d3ee',
        '#f8fafc',
      ),
      frameMat,
    )

    // 3. Large Sports Sponsor Billboards flanking the far (-Z) wall
    const farWallSponsors = [
      { x: -8.6, y: 6.4, brandIdx: 1 },
      { x: 8.6, y: 6.4, brandIdx: 2 },
      { x: -8.6, y: 4.5, brandIdx: 4 },
      { x: 8.6, y: 4.5, brandIdx: 6 },
    ]
    for (const s of farWallSponsors) {
      const brand = SPONSOR_BRANDS[s.brandIdx % SPONSOR_BRANDS.length]
      this.addBannerBoard(
        s.x,
        s.y,
        -halfL,
        0,
        5.2,
        1.45,
        createSponsorBoardTexture(brand, 640, 200),
        frameMat,
      )
    }

    // 4. Diverse Sports Sponsor Billboards along Left (-X) & Right (+X) walls
    const sideZs = [-10.2, -3.4, 3.4, 10.2]
    sideZs.forEach((z, idx) => {
      const leftBrand = SPONSOR_BRANDS[(idx * 2 + 3) % SPONSOR_BRANDS.length]
      this.addBannerBoard(
        -halfW,
        5.8,
        z,
        Math.PI / 2,
        5.4,
        1.5,
        createSponsorBoardTexture(leftBrand, 640, 200),
        frameMat,
      )

      const rightBrand = SPONSOR_BRANDS[(idx * 2 + 5) % SPONSOR_BRANDS.length]
      this.addBannerBoard(
        halfW,
        5.8,
        z,
        -Math.PI / 2,
        5.4,
        1.5,
        createSponsorBoardTexture(rightBrand, 640, 200),
        frameMat,
      )
    })

    // 5. Hanging championship vertical banners near the side trusses
    const hangingCoords: [number, number, number][] = [
      [-10.2, -7.5, 0],
      [10.2, -7.5, 9],
      [-10.2, 1.5, 2],
      [10.2, 1.5, 3],
    ]
    for (const [x, z, brandIdx] of hangingCoords) {
      const brand = SPONSOR_BRANDS[brandIdx % SPONSOR_BRANDS.length]
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.9),
        new THREE.MeshBasicMaterial({
          map: createSponsorBoardTexture(brand, 512, 192),
          side: THREE.DoubleSide,
        }),
      )
      banner.position.set(x, 8.9, z)
      banner.rotation.y = x < 0 ? Math.PI / 4 : -Math.PI / 4
      this.group.add(banner)
    }
  }

  private addBannerBoard(
    x: number,
    y: number,
    z: number,
    rotationY: number,
    width: number,
    height: number,
    texture: THREE.CanvasTexture,
    frameMat: THREE.Material,
  ): void {
    const holder = new THREE.Group()
    holder.position.set(x, y, z)
    holder.rotation.y = rotationY

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.08),
      frameMat,
    )
    holder.add(frame)

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture }),
    )
    face.position.z = 0.045
    holder.add(face)

    this.group.add(holder)
  }
}
