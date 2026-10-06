import * as THREE from 'three'

const HEAD_RX = 0.6
const HEAD_RY = 0.72

/**
 * Badminton menu prop: racket (oval frame, throat, tapered shaft, wrapped grip)
 * and shuttlecock (cork, collar, feather skirt).
 * Built from procedural Three.js geometry only, so real assets can be swapped
 * in later without touching the menu layout or Game.
 */
export class BadmintonProp {
  readonly group = new THREE.Group()
  private racket = new THREE.Group()
  private shuttlecock = new THREE.Group()
  private stringMaterial: THREE.LineBasicMaterial

  constructor() {
    const strings = this.createStrings()
    this.stringMaterial = strings.material as THREE.LineBasicMaterial

    this.racket.add(this.createHead(), this.createThroat(), this.createShaft(), strings)
    this.racket.position.set(-0.3, 0.45, 0)
    this.racket.rotation.set(-0.18, 0.6, 0.14)
    this.group.add(this.racket)

    this.shuttlecock.add(this.createCork(), this.createCollar(), this.createSkirt())
    this.shuttlecock.position.set(0.95, -0.45, 0.3)
    this.shuttlecock.rotation.set(0.35, 0, 0.55)
    this.group.add(this.shuttlecock)
  }

  update(elapsed: number): void {
    this.racket.rotation.y = 0.6 + Math.sin(elapsed * 0.3) * 0.26
    this.racket.rotation.z = 0.14 + Math.cos(elapsed * 0.24) * 0.08
    this.racket.position.y = 0.45 + Math.sin(elapsed * 0.5) * 0.08

    this.shuttlecock.rotation.z = 0.55 + Math.sin(elapsed * 0.45) * 0.3
    this.shuttlecock.rotation.y = elapsed * 0.35
    this.shuttlecock.position.y = -0.45 + Math.sin(elapsed * 0.7) * 0.11

    this.stringMaterial.opacity = 0.24 + Math.sin(elapsed * 0.8) * 0.07
  }

  private createHead(): THREE.Group {
    const head = new THREE.Group()

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.28,
      metalness: 0.65,
      emissive: 0x0b1f4d,
      emissiveIntensity: 0.6,
    })
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.22,
      metalness: 0.5,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.8,
    })

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.055, 10, 64),
      frameMaterial,
    )
    outer.scale.set(HEAD_RX, HEAD_RY, 1)
    head.add(outer)

    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.022, 8, 56),
      accentMaterial,
    )
    inner.scale.set(HEAD_RX * 0.9, HEAD_RY * 0.9, 1)
    head.add(inner)

    const joint = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.07),
      frameMaterial,
    )
    joint.position.y = -HEAD_RY
    head.add(joint)

    return head
  }

  private createThroat(): THREE.Group {
    const throat = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.6,
    })

    const left = new THREE.Vector3(-0.2, -0.68, 0)
    const right = new THREE.Vector3(0.2, -0.68, 0)
    const neck = new THREE.Vector3(0, -0.95, 0)
    throat.add(this.strut(left, neck, 0.026, material))
    throat.add(this.strut(right, neck, 0.026, material))

    return throat
  }

  private createShaft(): THREE.Group {
    const shaft = new THREE.Group()
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.6,
    })
    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.92,
      metalness: 0.05,
    })
    const wrapMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    })

    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.045, 0.3, 10),
      frameMaterial,
    )
    cone.position.y = -1.1
    shaft.add(cone)

    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.05, 0.36, 14),
      gripMaterial,
    )
    grip.position.y = -1.42
    shaft.add(grip)

    for (let i = 0; i < 6; i++) {
      const wrap = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.007, 6, 20),
        wrapMaterial,
      )
      wrap.rotation.x = Math.PI / 2
      wrap.position.y = -1.29 - i * 0.055
      shaft.add(wrap)
    }

    const butt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.046, 0.05, 14),
      frameMaterial,
    )
    butt.position.y = -1.62
    shaft.add(butt)

    return shaft
  }

  private createStrings(): THREE.LineSegments {
    const points: number[] = []
    const step = 0.11
    const limit = 0.9
    for (let x = -HEAD_RX; x <= HEAD_RX; x += step) {
      const k = 1 - (x * x) / (HEAD_RX * HEAD_RX)
      if (k <= 0.02) continue
      const half = HEAD_RY * limit * Math.sqrt(k)
      points.push(x, -half, 0, x, half, 0)
    }
    for (let y = -HEAD_RY; y <= HEAD_RY; y += step) {
      const k = 1 - (y * y) / (HEAD_RY * HEAD_RY)
      if (k <= 0.02) continue
      const half = HEAD_RX * limit * Math.sqrt(k)
      points.push(-half, y, 0, half, y, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const material = new THREE.LineBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.28,
    })
    return new THREE.LineSegments(geometry, material)
  }

  private createCork(): THREE.Mesh {
    const cork = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 20, 14),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 }),
    )
    cork.scale.set(1, 1.2, 1)
    cork.position.y = -0.22
    return cork
  }

  private createCollar(): THREE.Mesh {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.17, 0.07, 20),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.2 }),
    )
    collar.position.y = -0.09
    return collar
  }

  private createSkirt(): THREE.Group {
    const skirt = new THREE.Group()
    const featherMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.72,
      side: THREE.DoubleSide,
    })
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
    })

    const base = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 18),
      baseMaterial,
    )
    base.position.y = 0.0
    skirt.add(base)

    const featherCount = 12
    for (let i = 0; i < featherCount; i++) {
      const angle = (i / featherCount) * Math.PI * 2
      const feather = new THREE.Mesh(
        new THREE.PlaneGeometry(0.09, 0.36),
        featherMaterial,
      )
      const radius = 0.16 + i * 0.0015
      feather.position.set(Math.cos(angle) * radius, 0.26, Math.sin(angle) * radius)
      feather.rotation.y = -angle
      feather.rotation.x = -0.16
      skirt.add(feather)
    }

    return skirt
  }

  private strut(
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius: number,
    material: THREE.Material,
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(to, from)
    const length = direction.length()
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 8),
      material,
    )
    mesh.position.copy(from).addScaledVector(direction, 0.5)
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    )
    return mesh
  }
}