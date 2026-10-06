import * as THREE from 'three'

const LENGTH = 1.55
const WIDTH = 0.85
const HEIGHT = 0.42

/**
 * Pingpong table for the menu backdrop: playing surface with court lines,
 * apron, legs, braces, and a semi-transparent net with tape and posts.
 */
export class PingpongTable {
  readonly group = new THREE.Group()

  constructor() {
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f5f57,
      roughness: 0.5,
      metalness: 0.1,
    })
    const apronMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b3b36,
      roughness: 0.7,
    })
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.6,
    })
    const lineMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
    })

    const surface = new THREE.Mesh(
      new THREE.BoxGeometry(LENGTH, 0.03, WIDTH),
      surfaceMaterial,
    )
    surface.position.y = HEIGHT
    surface.receiveShadow = true
    this.group.add(surface)

    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(LENGTH - 0.06, 0.06, WIDTH - 0.06),
      apronMaterial,
    )
    apron.position.y = HEIGHT - 0.045
    this.group.add(apron)

    for (const z of [-1, 1]) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(LENGTH, 0.004, 0.02),
        lineMaterial,
      )
      line.position.set(0, HEIGHT + 0.017, z * (WIDTH / 2 - 0.05))
      this.group.add(line)
    }

    const centreLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.004, WIDTH - 0.1),
      lineMaterial,
    )
    centreLine.position.set(0, HEIGHT + 0.017, 0)
    this.group.add(centreLine)

    const legX = LENGTH / 2 - 0.12
    const legZ = WIDTH / 2 - 0.1
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, HEIGHT - 0.03, 0.055),
          frameMaterial,
        )
        leg.position.set(x * legX, (HEIGHT - 0.03) / 2, z * legZ)
        this.group.add(leg)

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.09), apronMaterial)
        foot.position.set(x * legX, 0.01, z * legZ)
        this.group.add(foot)
      }
    }

    for (const z of [-1, 1]) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(legX * 2, 0.035, 0.035), frameMaterial)
      brace.position.set(0, 0.12, z * legZ)
      this.group.add(brace)
    }

    for (const x of [-1, 1]) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, legZ * 2), frameMaterial)
      brace.position.set(x * legX, 0.2, 0)
      this.group.add(brace)
    }

    this.group.add(this.createNet())
  }

  private createNet(): THREE.Group {
    const net = new THREE.Group()
    const hardwareMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.4,
    })

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(WIDTH - 0.04, 0.15),
      new THREE.MeshStandardMaterial({
        map: createNetTexture(),
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        roughness: 0.9,
      }),
    )
    mesh.rotation.y = Math.PI / 2
    mesh.position.set(0, HEIGHT + 0.09, 0)
    net.add(mesh)

    const tape = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.016, WIDTH - 0.02),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
    )
    tape.position.set(0, HEIGHT + 0.17, 0)
    net.add(tape)

    for (const z of [-1, 1]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8),
        hardwareMaterial,
      )
      post.position.set(0, HEIGHT + 0.1, z * (WIDTH / 2 - 0.01))
      net.add(post)

      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.03), hardwareMaterial)
      clamp.position.set(0, HEIGHT + 0.02, z * (WIDTH / 2 - 0.01))
      net.add(clamp)
    }

    return net
  }
}

/** Procedural net mesh, generated at runtime instead of loading a texture file. */
function createNetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)'
    ctx.lineWidth = 3
    for (let x = 0; x <= canvas.width; x += 16) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 16) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 1)
  return texture
}

export const TABLE_HEIGHT = HEIGHT