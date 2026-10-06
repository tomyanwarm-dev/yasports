import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { PingpongNet } from './PingpongNet.ts'
import { PingpongTable, TABLE_HEIGHT, TABLE_LENGTH, TABLE_WIDTH } from './PingpongTable.ts'

export interface ArenaCollider {
  name: 'floor' | 'wall' | 'table' | 'net'
  center: THREE.Vector3
  size: THREE.Vector3
}

/**
 * Clean, low-poly indoor ping pong map. It owns only static environment data;
 * the public `colliders` array is ready for a future physics/gameplay layer.
 */
export class PingpongArena implements Stage {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100)
  readonly table = new PingpongTable()
  readonly net = new PingpongNet()
  readonly colliders: ArenaCollider[] = []
  readonly spawns = {
    player1: new THREE.Vector3(0, 0, 4.35),
    player2: new THREE.Vector3(0, 0, -4.35),
  }

  constructor() {
    this.scene.background = new THREE.Color(0x071520)
    this.scene.fog = new THREE.Fog(0x071520, 18, 38)
    this.scene.add(this.createHall(), this.table.group, this.net.group, this.createSpawnAreas(), this.createDecorations(), this.createLights())
    this.createColliders()
    this.camera.position.set(6.7, 5.1, 8.9)
    this.camera.lookAt(0, 0.65, 0)
  }

  update(): void {}

  private createHall(): THREE.Group {
    const group = new THREE.Group()
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2631, roughness: 0.9 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 24), floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    group.add(floor)

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x203040, roughness: 0.82 })
    const addWall = (width: number, height: number, x: number, z: number, rotate = false) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.3), wallMaterial)
      wall.position.set(x, height / 2, z)
      if (rotate) wall.rotation.y = Math.PI / 2
      wall.receiveShadow = true
      group.add(wall)
    }
    addWall(20, 7, 0, -12)
    addWall(20, 7, 0, 12)
    addWall(24, 7, -10, 0, true)
    addWall(24, 7, 10, 0, true)

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 24), new THREE.MeshStandardMaterial({ color: 0x101b27, roughness: 1 }))
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = 7
    group.add(ceiling)
    return group
  }

  private createLights(): THREE.Group {
    const lights = new THREE.Group()
    lights.add(new THREE.HemisphereLight(0xc5e4f5, 0x15202c, 1.1), new THREE.AmbientLight(0xffffff, 0.22))
    const key = new THREE.DirectionalLight(0xffffff, 1.7)
    key.position.set(4, 8, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -8; key.shadow.camera.right = 8; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8
    lights.add(key)
    const fixtureMaterial = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbde9ff, emissiveIntensity: 1.6 })
    for (const x of [-5, 0, 5]) for (const z of [-5, 5]) {
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.09, 0.55), fixtureMaterial)
      fixture.position.set(x, 6.78, z)
      lights.add(fixture)
      const lamp = new THREE.PointLight(0xe8f7ff, 18, 11, 2)
      lamp.position.set(x, 6.55, z)
      lights.add(lamp)
    }
    return lights
  }

  private createSpawnAreas(): THREE.Group {
    const group = new THREE.Group()
    const colors = [0x2563eb, 0xdc2626]
    ;[this.spawns.player1, this.spawns.player2].forEach((spawn, index) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.79, 32), new THREE.MeshBasicMaterial({ color: colors[index], transparent: true, opacity: 0.82, side: THREE.DoubleSide }))
      ring.rotation.x = -Math.PI / 2
      ring.position.copy(spawn)
      ring.position.y = 0.012
      group.add(ring)
      const label = this.createLabel(`PLAYER ${index + 1}`, colors[index] === 0x2563eb ? '#93c5fd' : '#fca5a5')
      label.position.set(index === 0 ? -1.9 : 1.9, 1.25, spawn.z)
      label.rotation.y = index === 0 ? 0 : Math.PI
      group.add(label)
    })
    return group
  }

  private createDecorations(): THREE.Group {
    const group = new THREE.Group()
    const banner = this.createLabel('PING PONG  ARENA', '#a7f3d0')
    banner.scale.set(3.2, 1.25, 1)
    banner.position.set(0, 4.9, -11.82)
    group.add(banner)
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.6, 0.12), new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7, emissive: 0x111827, emissiveIntensity: 0.3 }))
    board.position.set(6.8, 4.4, -11.78)
    group.add(board)
    const boardText = this.createLabel('00   00', '#f8fafc')
    boardText.scale.set(1.2, 0.75, 1)
    boardText.position.set(6.8, 4.4, -11.7)
    group.add(boardText)
    return group
  }

  private createLabel(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = color
      context.font = '700 52px system-ui, sans-serif'
      context.textAlign = 'center'; context.textBaseline = 'middle'
      context.fillText(text, 256, 64)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }))
    sprite.scale.set(3.6, 0.9, 1)
    return sprite
  }

  private createColliders(): void {
    this.colliders.push(
      { name: 'floor', center: new THREE.Vector3(0, -0.05, 0), size: new THREE.Vector3(20, 0.1, 24) },
      { name: 'wall', center: new THREE.Vector3(0, 3.5, -12), size: new THREE.Vector3(20, 7, 0.3) },
      { name: 'wall', center: new THREE.Vector3(0, 3.5, 12), size: new THREE.Vector3(20, 7, 0.3) },
      { name: 'wall', center: new THREE.Vector3(-10, 3.5, 0), size: new THREE.Vector3(0.3, 7, 24) },
      { name: 'wall', center: new THREE.Vector3(10, 3.5, 0), size: new THREE.Vector3(0.3, 7, 24) },
      { name: 'table', center: new THREE.Vector3(0, TABLE_HEIGHT, 0), size: new THREE.Vector3(TABLE_WIDTH, 0.055, TABLE_LENGTH) },
      { name: 'net', center: new THREE.Vector3(0, TABLE_HEIGHT + 0.076, 0), size: new THREE.Vector3(TABLE_WIDTH, 0.153, 0.025) },
    )
  }
}
