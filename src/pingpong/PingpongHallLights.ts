import * as THREE from 'three'
import { WALL_HEIGHT } from './PingpongHall.ts'

/** High-bay GOR lamp positions above the court & spectator stands (x, z). */
const LAMPS: [number, number][] = [
  [-5.2, -6.5],
  [0, -6.5],
  [5.2, -6.5],
  [-5.2, 0],
  [0, 0],
  [5.2, 0],
  [-5.2, 6.5],
  [0, 6.5],
  [5.2, 6.5],
]

const LAMP_HEIGHT = 8.9

/**
 * GOR high-bay stadium lighting matching BadmintonHallLights: hanging cylindrical
 * fixtures from the roof trusses plus balanced point lights over the table.
 */
export class PingpongHallLights {
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
      roughness: 0.35,
    })
    const rodMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    })

    const housing = new THREE.CylinderGeometry(0.45, 0.72, 0.36, 12)
    const glow = new THREE.CircleGeometry(0.66, 16)
    const rodHeight = Math.max(1.2, WALL_HEIGHT - LAMP_HEIGHT - 0.3)
    const rod = new THREE.CylinderGeometry(0.04, 0.04, rodHeight, 6)

    for (const [x, z] of LAMPS) {
      const body = new THREE.Mesh(housing, housingMaterial)
      body.position.set(x, LAMP_HEIGHT + 0.18, z)
      this.group.add(body)

      const lamp = new THREE.Mesh(glow, glowMaterial)
      lamp.rotation.x = Math.PI / 2
      lamp.position.set(x, LAMP_HEIGHT, z)
      this.group.add(lamp)

      const hanger = new THREE.Mesh(rod, rodMaterial)
      hanger.position.set(x, LAMP_HEIGHT + 0.36 + rodHeight / 2, z)
      this.group.add(hanger)
    }

    const keyLamp = new THREE.PointLight(0xe0f2fe, 95, 36, 2)
    keyLamp.position.set(0, LAMP_HEIGHT - 0.4, -3.5)
    this.group.add(keyLamp)

    const fillLamp = new THREE.PointLight(0xbfdbfe, 80, 36, 2)
    fillLamp.position.set(0, LAMP_HEIGHT - 0.4, 4.0)
    this.group.add(fillLamp)
  }
}
