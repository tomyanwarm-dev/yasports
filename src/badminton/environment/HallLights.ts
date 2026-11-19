import * as THREE from 'three'

/** High-bay lamp positions above the court (x, z). */
const LAMPS: [number, number][] = [
  [-5.5, -7],
  [0, -7],
  [5.5, -7],
  [-5.5, 7],
  [0, 7],
  [5.5, 7],
]

const LAMP_HEIGHT = 10.5

/**
 * Hall lighting: high-bay lamp bodies hanging from the roof structure plus a
 * small number of real lights. Kept to two point lights so mid-range laptops
 * stay comfortable; the other lamps are visual only.
 */
export class BadmintonHallLights {
  readonly group = new THREE.Group()

  constructor() {
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.5,
      metalness: 0.5,
    })
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xbfdbfe,
      emissiveIntensity: 1.6,
      roughness: 0.4,
    })
    const rodMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    })

    const housing = new THREE.CylinderGeometry(0.55, 0.85, 0.4, 12)
    const glow = new THREE.CircleGeometry(0.78, 16)
    const rod = new THREE.CylinderGeometry(0.05, 0.05, 2, 6)

    for (const [x, z] of LAMPS) {
      const body = new THREE.Mesh(housing, housingMaterial)
      body.position.set(x, LAMP_HEIGHT + 0.2, z)
      this.group.add(body)

      const lamp = new THREE.Mesh(glow, glowMaterial)
      lamp.rotation.x = Math.PI / 2
      lamp.position.set(x, LAMP_HEIGHT, z)
      this.group.add(lamp)

      const hanger = new THREE.Mesh(rod, rodMaterial)
      hanger.position.set(x, LAMP_HEIGHT + 1.4, z)
      this.group.add(hanger)
    }

    const keyLamp = new THREE.PointLight(0xdbeafe, 120, 40, 2)
    keyLamp.position.set(0, LAMP_HEIGHT - 0.5, -4)
    this.group.add(keyLamp)

    const fillLamp = new THREE.PointLight(0xbfdbfe, 90, 40, 2)
    fillLamp.position.set(0, LAMP_HEIGHT - 0.5, 5)
    this.group.add(fillLamp)
  }
}