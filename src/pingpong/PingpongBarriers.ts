import * as THREE from 'three'
import { HALF_LENGTH, HALF_WIDTH } from './PingpongCourt.ts'
import { createSponsorBoardTexture, SPONSOR_BRANDS } from './PingpongSponsors.ts'

const BARRIER_HEIGHT = 0.74
const BARRIER_THICKNESS = 0.05

interface BarrierSpec {
  x: number
  z: number
  width: number
  rotationY: number
  sponsorIndex: number
}

/**
 * Portable tournament A-board barriers surrounding the Pingpong court mat,
 * each displaying diverse sports sponsor graphics facing the arena.
 */
export class PingpongBarriers {
  readonly group = new THREE.Group()

  constructor() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.25,
    })
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.45,
      metalness: 0.2,
    })
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
    })

    const specs: BarrierSpec[] = []
    const backZ = -(HALF_LENGTH + 0.14)
    const frontZ = HALF_LENGTH + 0.14
    const sideX = HALF_WIDTH + 0.14

    // Back (-Z) and Front (+Z) end barriers: 3 panels each along X
    const endSegW = 2.08
    const endXs = [-2.22, 0, 2.22]
    endXs.forEach((x, i) => {
      specs.push({ x, z: backZ, width: endSegW, rotationY: 0, sponsorIndex: i })
      specs.push({ x, z: frontZ, width: endSegW, rotationY: Math.PI, sponsorIndex: i + 3 })
    })

    // Left (-X) and Right (+X) sideline barriers: 4 panels each, leaving gap at Z = 0
    const sideSegW = 2.2
    const sideZs = [-3.9, -1.45, 1.45, 3.9]
    sideZs.forEach((z, i) => {
      specs.push({
        x: -sideX,
        z,
        width: sideSegW,
        rotationY: Math.PI / 2,
        sponsorIndex: i + 4,
      })
      specs.push({
        x: sideX,
        z,
        width: sideSegW,
        rotationY: -Math.PI / 2,
        sponsorIndex: i + 6,
      })
    })

    const trimGeom = new THREE.BoxGeometry(1, 0.035, BARRIER_THICKNESS + 0.015)
    const footGeom = new THREE.BoxGeometry(0.14, 0.03, 0.26)

    for (const spec of specs) {
      const panelGroup = new THREE.Group()
      panelGroup.position.set(spec.x, 0, spec.z)
      panelGroup.rotation.y = spec.rotationY

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(spec.width, BARRIER_HEIGHT, BARRIER_THICKNESS),
        frameMat,
      )
      body.position.y = BARRIER_HEIGHT / 2
      body.castShadow = true
      body.receiveShadow = true
      panelGroup.add(body)

      const trim = new THREE.Mesh(trimGeom, trimMat)
      trim.scale.x = spec.width
      trim.position.y = BARRIER_HEIGHT + 0.017
      panelGroup.add(trim)

      // Sponsor graphic face on both inner and outer sides
      const brand = SPONSOR_BRANDS[spec.sponsorIndex % SPONSOR_BRANDS.length]
      const sponsorTex = createSponsorBoardTexture(brand, 512, 192)
      const faceMat = new THREE.MeshStandardMaterial({
        map: sponsorTex,
        roughness: 0.55,
        metalness: 0.05,
      })
      const faceGeom = new THREE.PlaneGeometry(spec.width - 0.06, BARRIER_HEIGHT - 0.06)

      const innerFace = new THREE.Mesh(faceGeom, faceMat)
      innerFace.position.set(0, BARRIER_HEIGHT / 2, BARRIER_THICKNESS / 2 + 0.003)
      panelGroup.add(innerFace)

      const outerFace = new THREE.Mesh(faceGeom, faceMat)
      outerFace.position.set(0, BARRIER_HEIGHT / 2, -(BARRIER_THICKNESS / 2 + 0.003))
      outerFace.rotation.y = Math.PI
      panelGroup.add(outerFace)

      // Portable support feet
      for (const fx of [-spec.width * 0.34, spec.width * 0.34]) {
        const foot = new THREE.Mesh(footGeom, footMat)
        foot.position.set(fx, 0.015, 0)
        foot.receiveShadow = true
        panelGroup.add(foot)
      }

      this.group.add(panelGroup)
    }
  }
}
