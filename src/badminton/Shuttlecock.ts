import * as THREE from 'three'

/** Shuttlecock proportions in metres: length 0.085, feather diameter 0.065. */
const CORK_RADIUS = 0.013
const FEATHER_RADIUS = 0.0325
const FEATHER_HEIGHT = 0.055
const FEATHER_COUNT = 12

/**
 * Procedural shuttlecock (cork base + feather skirt).
 * No physics or hit logic here yet; it is a separate group so gameplay
 * and hand tracking can move it later.
 */
export class Shuttlecock {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(this.createCork(), this.createCollar(), this.createSkirt())
  }

  private createCork(): THREE.Mesh {
    const cork = new THREE.Mesh(
      new THREE.SphereGeometry(CORK_RADIUS, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 }),
    )
    cork.scale.set(1, 1.3, 1)
    cork.castShadow = true
    return cork
  }

  private createCollar(): THREE.Mesh {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(CORK_RADIUS * 1.15, CORK_RADIUS * 1.4, 0.006, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.25 }),
    )
    collar.position.y = CORK_RADIUS * 1.3
    return collar
  }

  private createSkirt(): THREE.Group {
    const skirt = new THREE.Group()
    const featherMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.75,
      side: THREE.DoubleSide,
    })
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
    })

    const base = new THREE.Mesh(
      new THREE.ConeGeometry(FEATHER_RADIUS * 0.45, FEATHER_HEIGHT * 0.45, 14),
      baseMaterial,
    )
    base.position.y = CORK_RADIUS * 1.3 + FEATHER_HEIGHT * 0.22
    skirt.add(base)

    for (let i = 0; i < FEATHER_COUNT; i++) {
      const angle = (i / FEATHER_COUNT) * Math.PI * 2
      const feather = new THREE.Mesh(
        new THREE.PlaneGeometry(0.014, FEATHER_HEIGHT),
        featherMaterial,
      )
      const radius = FEATHER_RADIUS * 0.6
      feather.position.set(
        Math.cos(angle) * radius,
        CORK_RADIUS * 1.3 + FEATHER_HEIGHT * 0.55,
        Math.sin(angle) * radius,
      )
      feather.rotation.y = -angle
      feather.rotation.x = -0.14
      skirt.add(feather)
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(FEATHER_RADIUS * 0.92, 0.002, 6, 24),
      baseMaterial,
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = CORK_RADIUS * 1.3 + FEATHER_HEIGHT * 0.9
    skirt.add(ring)

    return skirt
  }
}