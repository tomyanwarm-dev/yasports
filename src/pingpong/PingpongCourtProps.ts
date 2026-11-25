import * as THREE from 'three'

/**
 * Court-side GOR furniture proportional to a Table Tennis arena:
 * - Umpire desk, chair, and miniature flip-scoreboard at Z = 0 beside the net
 * - Player corner benches and towel/water boxes behind the baselines
 */
export class PingpongCourtProps {
  readonly group = new THREE.Group()

  constructor() {
    this.group.add(this.buildUmpireStation(), this.buildPlayerBenches())
  }

  private buildUmpireStation(): THREE.Group {
    const station = new THREE.Group()
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.5,
    })
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.65 })
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })

    // Umpire desk positioned in the Z = 0 barrier gap on the +X sideline
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 1.15), deskMat)
    deskTop.position.set(0, 0.74, 0)
    station.add(deskTop)

    const frontSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.46, 1.05), deskMat)
    frontSkirt.position.set(-0.24, 0.49, 0)
    station.add(frontSkirt)

    const skirtTrim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 1.06), accentMat)
    skirtTrim.position.set(-0.24, 0.7, 0)
    station.add(skirtTrim)

    for (const lz of [-0.48, 0.48]) {
      for (const lx of [-0.22, 0.22]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), metalMat)
        leg.position.set(lx, 0.36, lz)
        station.add(leg)
      }
    }

    // Miniature tabletop flip scoreboard
    const flipBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.42), deskMat)
    flipBase.position.set(-0.06, 0.86, 0)
    station.add(flipBase)

    const flipCardLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.14, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
    )
    flipCardLeft.position.set(-0.06, 0.87, 0.11)
    station.add(flipCardLeft)

    const flipCardRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.14, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }),
    )
    flipCardRight.position.set(-0.06, 0.87, -0.11)
    station.add(flipCardRight)

    // Umpire chair behind the desk
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.44), seatMat)
    chairSeat.position.set(0.55, 0.46, 0)
    station.add(chairSeat)

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.44), seatMat)
    chairBack.position.set(0.74, 0.68, 0)
    station.add(chairBack)

    const chairPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 0.44, 10), metalMat)
    chairPedestal.position.set(0.55, 0.22, 0)
    station.add(chairPedestal)

    station.position.set(2.75, 0, 0)
    station.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return station
  }

  private buildPlayerBenches(): THREE.Group {
    const benches = new THREE.Group()
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6,
      metalness: 0.4,
    })
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 })

    // Corner benches & towel boxes on both ends (outside playing path)
    const configs: { x: number; z: number; rotY: number; teamColor: number }[] = [
      { x: -2.65, z: -4.25, rotY: Math.PI / 2, teamColor: 0xdc2626 }, // Player 2 (Red) corner
      { x: -2.65, z: 4.25, rotY: Math.PI / 2, teamColor: 0x2563eb },  // Player 1 (Blue) corner
    ]

    for (const cfg of configs) {
      const corner = new THREE.Group()
      corner.position.set(cfg.x, 0, cfg.z)
      corner.rotation.y = cfg.rotY

      // 2-seat player/coach bench
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.42), seatMat)
      seat.position.y = 0.44
      corner.add(seat)

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.06), seatMat)
      back.position.set(0, 0.64, -0.18)
      corner.add(back)

      for (const offset of [-0.62, 0.62]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 0.34), frameMat)
        leg.position.set(offset, 0.22, 0)
        corner.add(leg)
      }

      // Towel & water caddy box beside bench
      const caddy = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.36), boxMat)
      caddy.position.set(1.05, 0.24, 0)
      corner.add(caddy)

      const teamStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.37, 0.05, 0.37),
        new THREE.MeshStandardMaterial({ color: cfg.teamColor, roughness: 0.5 }),
      )
      teamStripe.position.set(1.05, 0.46, 0)
      corner.add(teamStripe)

      corner.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })
      benches.add(corner)
    }

    return benches
  }
}
