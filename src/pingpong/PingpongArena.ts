import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { PingpongBall } from './PingpongBall.ts'
import { PingpongNet } from './PingpongNet.ts'
import { PingpongPaddle } from './PingpongPaddle.ts'
import { PingpongPlayer } from './PingpongPlayer.ts'
import { PingpongTable, TABLE_HEIGHT, TABLE_LENGTH, TABLE_WIDTH } from './PingpongTable.ts'

export interface ArenaCollider {
  name: 'floor' | 'wall' | 'table' | 'net'
  center: THREE.Vector3
  size: THREE.Vector3
}

/**
 * Playable Ping Pong Arena with 1st-person / tight 3rd-person camera,
 * Player 1 paddle controls, Player 2 NPC opponent, ball physics, table bounces,
 * paddle collisions, net detection, and a continuous rally system.
 */
export class PingpongArena implements Stage {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100)
  readonly table = new PingpongTable()
  readonly net = new PingpongNet()
  readonly colliders: ArenaCollider[] = []

  // Characters & Equipment
  readonly player1 = new PingpongPlayer(0x2563eb, false)
  readonly player2 = new PingpongPlayer(0xdc2626, true)
  readonly player1Paddle = new PingpongPaddle(true)
  readonly player2Paddle = new PingpongPaddle(false)
  readonly ball = new PingpongBall()

  // Game state & mechanics
  private hudElement: HTMLElement | null = null
  private rallyCount = 0
  private maxRallyCount = 0
  private serveState: 'serving' | 'rally' | 'scored' = 'serving'
  private resetTimer = 0
  private cameraMode: 'fpp' | 'tpp' | 'broadcast' = 'fpp'

  // Input & Paddle position
  private targetPaddlePos = new THREE.Vector3(0, 0.95, 1.30)
  private currentPaddlePos = new THREE.Vector3(0, 0.95, 1.30)
  private paddleVelocity = new THREE.Vector3()
  private isSwinging = false
  private swingTimer = 0
  private p1SwingProgress = 0
  private p2SwingProgress = 0

  // Event listener references for clean teardown
  private onPointerMove = (e: PointerEvent) => this.handlePointerMove(e)
  private onPointerDown = () => this.triggerSwing()
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') this.triggerSwing()
    if (e.code === 'KeyC' || e.code === 'KeyV') this.toggleCameraMode()
  }

  constructor() {
    this.scene.background = new THREE.Color(0x071520)
    this.scene.fog = new THREE.Fog(0x071520, 18, 38)

    // Build environment
    this.scene.add(
      this.createHall(),
      this.table.group,
      this.net.group,
      this.createDecorations(),
      this.createLights(),
    )

    // Add Player 1, Player 2 NPC, Paddles, and Ball
    this.scene.add(this.player1.group)
    this.scene.add(this.player2.group)
    this.scene.add(this.player1Paddle.group)
    this.scene.add(this.player2Paddle.group)
    this.scene.add(this.ball.group)

    // Initial positions
    this.player1.group.position.set(0, 0, 2.15)
    this.player2.group.position.set(0, 0, -1.95)
    this.player2Paddle.group.position.set(0, 0.92, -1.35)

    this.createColliders()

    // FPP / Close TPP camera behind Player 1 looking at table
    this.camera.position.set(0, 1.32, 2.30)
    this.camera.lookAt(0, 0.82, -0.60)
  }

  enter(): void {
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('keydown', this.onKeyDown)
    this.createHUD()
    this.resetServe('player1')
  }

  exit(): void {
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('keydown', this.onKeyDown)
    this.destroyHUD()
  }

  update(delta: number): void {
    this.updatePlayer1Input(delta)
    this.updateBallPhysics(delta)
    this.updateNPC(delta)
    this.updateCamera(delta)
    this.updateAnimations(delta)
  }

  private handlePointerMove(event: PointerEvent): void {
    const normX = (event.clientX / window.innerWidth) * 2 - 1
    const normY = (event.clientY / window.innerHeight) * 2 - 1

    // Map screen cursor to 3D workspace in front of camera
    this.targetPaddlePos.x = THREE.MathUtils.clamp(normX * 1.15, -1.10, 1.10)
    this.targetPaddlePos.y = THREE.MathUtils.clamp(0.76 + (1 - normY) * 0.52, 0.76, 1.35)
  }

  private triggerSwing(): void {
    if (this.serveState === 'serving') {
      this.serveBall()
      return
    }
    this.isSwinging = true
    this.swingTimer = 0.22
  }

  private updatePlayer1Input(delta: number): void {
    // Handle swing timer & forward impulse
    let zOffset = 1.30
    if (this.swingTimer > 0) {
      this.swingTimer -= delta
      this.p1SwingProgress = Math.sin((0.22 - this.swingTimer) / 0.22 * Math.PI)
      zOffset = 1.30 - this.p1SwingProgress * 0.22
    } else {
      this.isSwinging = false
      this.p1SwingProgress = THREE.MathUtils.lerp(this.p1SwingProgress, 0, delta * 10)
    }

    const prevPos = this.currentPaddlePos.clone()
    this.targetPaddlePos.z = zOffset

    // Smooth movement lerp
    this.currentPaddlePos.x = THREE.MathUtils.lerp(this.currentPaddlePos.x, this.targetPaddlePos.x, delta * 24)
    this.currentPaddlePos.y = THREE.MathUtils.lerp(this.currentPaddlePos.y, this.targetPaddlePos.y, delta * 24)
    this.currentPaddlePos.z = THREE.MathUtils.lerp(this.currentPaddlePos.z, this.targetPaddlePos.z, delta * 24)

    // Calculate paddle velocity vector
    this.paddleVelocity.subVectors(this.currentPaddlePos, prevPos).divideScalar(Math.max(delta, 0.001))

    // Position Player 1 paddle
    this.player1Paddle.group.position.copy(this.currentPaddlePos)
    this.player1Paddle.group.rotation.x = -0.15 - this.p1SwingProgress * 0.4
    this.player1Paddle.group.rotation.y = (this.currentPaddlePos.x * 0.15)
    this.player1Paddle.group.rotation.z = -this.currentPaddlePos.x * 0.2

    // Position Player 1 body slightly behind paddle
    this.player1.group.position.x = THREE.MathUtils.lerp(this.player1.group.position.x, this.currentPaddlePos.x * 0.65, delta * 8)
    this.player1.setSwingProgress(this.p1SwingProgress)
  }

  private updateBallPhysics(delta: number): void {
    if (this.serveState === 'serving') {
      // Ball stays suspended near server until hit/served
      const serveHeight = 0.95 + Math.sin(Date.now() * 0.005) * 0.04
      this.ball.position.set(this.currentPaddlePos.x * 0.5, serveHeight, 1.15)
      this.ball.mesh.position.copy(this.ball.position)
      this.ball.shadowDot.position.set(this.ball.position.x, 0.762, this.ball.position.z)
      return
    }

    if (this.serveState === 'scored') {
      this.resetTimer -= delta
      if (this.resetTimer <= 0) {
        this.resetServe('player1')
      }
      this.ball.update(delta)
      return
    }

    this.ball.update(delta)

    // --- Table Collision & Bouncing ---
    const ballR = this.ball.radius
    const halfW = TABLE_WIDTH / 2 + 0.02
    const halfL = TABLE_LENGTH / 2 + 0.02

    if (
      this.ball.position.y - ballR <= TABLE_HEIGHT &&
      this.ball.position.y >= TABLE_HEIGHT - 0.10 &&
      this.ball.velocity.y < 0
    ) {
      if (Math.abs(this.ball.position.x) <= halfW && Math.abs(this.ball.position.z) <= halfL) {
        // Successful table bounce
        this.ball.position.y = TABLE_HEIGHT + ballR
        this.ball.velocity.y = -this.ball.velocity.y * 0.86
        this.ball.bouncedOnTableCount++
        this.createBounceSpark(this.ball.position)
      }
    }

    // --- Net Collision ---
    const netHeightTop = TABLE_HEIGHT + 0.1525
    if (
      Math.abs(this.ball.position.z) < 0.035 &&
      this.ball.position.y <= netHeightTop + 0.02 &&
      this.ball.position.y >= TABLE_HEIGHT &&
      Math.abs(this.ball.position.x) <= TABLE_WIDTH / 2 + 0.04
    ) {
      // Hit net
      this.ball.velocity.z = -this.ball.velocity.z * 0.28
      this.ball.velocity.y *= 0.4
      this.ball.position.z = Math.sign(this.ball.position.z || 1) * 0.04
    }

    // --- Player 1 Paddle Collision ---
    if (this.ball.position.z > 0.4 && this.ball.position.z < 1.55 && this.ball.velocity.z > 0) {
      const dist = this.ball.position.distanceTo(this.player1Paddle.group.position)
      if (dist < 0.22) {
        // Hit by Player 1!
        this.ball.lastHitBy = 'player1'
        const hitImpulse = this.isSwinging ? 2.8 : 1.2

        this.ball.velocity.z = -4.4 - hitImpulse - Math.abs(this.ball.velocity.z) * 0.15
        this.ball.velocity.y = 2.15 + (this.currentPaddlePos.y - 0.76) * 0.6
        this.ball.velocity.x = (this.ball.position.x - this.currentPaddlePos.x) * 3.8 + this.paddleVelocity.x * 0.35

        // Adjust position slightly forward to avoid stuck collision
        this.ball.position.z = this.currentPaddlePos.z - 0.08
        this.rallyCount++
        this.updateHUD()
      }
    }

    // --- Player 2 (NPC) Paddle Collision ---
    if (this.ball.position.z < -0.4 && this.ball.position.z > -1.65 && this.ball.velocity.z < 0) {
      const dist = this.ball.position.distanceTo(this.player2Paddle.group.position)
      if (dist < 0.24) {
        // Hit by Player 2 (NPC)!
        this.ball.lastHitBy = 'player2'
        this.p2SwingProgress = 1.0

        this.ball.velocity.z = 4.3 + Math.random() * 0.6
        this.ball.velocity.y = 2.1 + Math.random() * 0.4
        this.ball.velocity.x = (Math.random() - 0.5) * 1.2 - this.ball.position.x * 0.35

        this.ball.position.z = -1.25
        this.rallyCount++
        this.updateHUD()
      }
    }

    // --- Out of Bounds / Floor Hit Check ---
    if (this.ball.position.y <= 0.04 || Math.abs(this.ball.position.z) > 3.6 || Math.abs(this.ball.position.x) > 2.8) {
      this.handleRallyEnd()
    }
  }

  private updateNPC(delta: number): void {
    // NPC AI moves toward ball position when ball is coming to NPC side
    const targetX = this.ball.velocity.z < 0 ? THREE.MathUtils.clamp(this.ball.position.x, -1.0, 1.0) : 0
    const targetY = this.ball.velocity.z < 0 ? THREE.MathUtils.clamp(this.ball.position.y, 0.78, 1.30) : 0.95

    const npcPos = this.player2Paddle.group.position
    npcPos.x = THREE.MathUtils.lerp(npcPos.x, targetX, delta * 7)
    npcPos.y = THREE.MathUtils.lerp(npcPos.y, targetY, delta * 7)
    npcPos.z = -1.35

    // NPC character body follows paddle
    this.player2.group.position.x = THREE.MathUtils.lerp(this.player2.group.position.x, npcPos.x * 0.75, delta * 6)

    // Swing decay
    if (this.p2SwingProgress > 0) {
      this.p2SwingProgress = THREE.MathUtils.lerp(this.p2SwingProgress, 0, delta * 8)
    }
    this.player2.setSwingProgress(this.p2SwingProgress)

    // NPC Paddle rotation
    this.player2Paddle.group.rotation.x = Math.PI + 0.15 + this.p2SwingProgress * 0.4
    this.player2Paddle.group.rotation.y = Math.PI - npcPos.x * 0.15
  }

  private toggleCameraMode(): void {
    if (this.cameraMode === 'fpp') this.cameraMode = 'tpp'
    else if (this.cameraMode === 'tpp') this.cameraMode = 'broadcast'
    else this.cameraMode = 'fpp'
    this.updateHUD()
  }

  private updateCamera(delta: number): void {
    if (this.cameraMode === 'broadcast') {
      this.camera.position.set(6.7, 5.1, 8.9)
      this.camera.lookAt(0, 0.65, 0)
      return
    }

    if (this.cameraMode === 'tpp') {
      const targetCamX = this.currentPaddlePos.x * 0.25
      const targetCamY = 1.95 + (this.currentPaddlePos.y - 0.95) * 0.15
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 4)
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 4)
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 3.15, delta * 4)
      this.camera.lookAt(this.ball.position.x * 0.1, 0.75, -0.50)
      return
    }

    // Default FPP mode
    const targetCamX = this.currentPaddlePos.x * 0.18
    const targetCamY = 1.30 + (this.currentPaddlePos.y - 0.95) * 0.12
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 4)
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 4)
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 2.30, delta * 4)
    this.camera.lookAt(this.ball.position.x * 0.1, 0.82, -0.60)
  }

  private updateAnimations(_delta: number): void {
    // Future visual animations (e.g. net sway) can be updated here
  }

  private serveBall(): void {
    this.serveState = 'rally'
    this.rallyCount = 0
    this.updateHUD()

    const vx = (this.currentPaddlePos.x - 0) * 0.8 + (Math.random() - 0.5) * 0.3
    this.ball.reset(
      new THREE.Vector3(this.currentPaddlePos.x * 0.4, 0.98, 1.15),
      new THREE.Vector3(vx, 2.1, -4.2),
    )
    this.triggerSwing()
  }

  private resetServe(_server: 'player1' | 'player2'): void {
    this.serveState = 'serving'
    this.updateHUD('CLICK OR PRESS SPACE TO SERVE!')
  }

  private handleRallyEnd(): void {
    if (this.serveState === 'scored') return
    this.serveState = 'scored'
    this.resetTimer = 1.25

    if (this.rallyCount > this.maxRallyCount) {
      this.maxRallyCount = this.rallyCount
    }

    const msg = this.rallyCount > 0 ? `RALLY ENDED! HITS: ${this.rallyCount}` : `OUT OF BOUNDS!`
    this.updateHUD(msg)
  }

  private createBounceSpark(pos: THREE.Vector3): void {
    const spark = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    )
    spark.rotation.x = -Math.PI / 2
    spark.position.set(pos.x, TABLE_HEIGHT + 0.003, pos.z)
    this.scene.add(spark)

    // Fade out spark
    let opacity = 0.8
    const fade = () => {
      opacity -= 0.08
      if (opacity <= 0) {
        this.scene.remove(spark)
        spark.geometry.dispose()
        ;(spark.material as THREE.Material).dispose()
      } else {
        spark.material.opacity = opacity
        spark.scale.multiplyScalar(1.08)
        requestAnimationFrame(fade)
      }
    }
    fade()
  }

  // --- UI HUD ---
  private createHUD(): void {
    this.hudElement = document.createElement('div')
    this.hudElement.className = 'pingpong-hud-overlay'
    this.hudElement.style.cssText = `
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
      z-index: 20;
      font-family: system-ui, -apple-system, sans-serif;
    `
    this.hudElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; pointer-events: auto;">
        <div id="pp-rally-badge" style="
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(147, 197, 253, 0.3);
          backdrop-filter: blur(10px);
          padding: 8px 24px;
          border-radius: 999px;
          color: #f8fafc;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.14em;
          box-shadow: 0 8px 24px rgba(2, 8, 23, 0.6);
        ">
          RALLY <span id="pp-rally-count" style="color: #38bdf8; font-size: 1.3rem;">0</span>
        </div>
        <button id="pp-cam-btn" type="button" style="
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(147, 197, 253, 0.3);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 999px;
          color: #38bdf8;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.12em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(2, 8, 23, 0.6);
          transition: transform 0.15s ease, background 0.15s ease;
        ">
          CAM: FPP [C]
        </button>
      </div>
      <div id="pp-hint-msg" style="
        color: #94a3b8;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        background: rgba(2, 6, 23, 0.6);
        padding: 4px 14px;
        border-radius: 6px;
      ">
        CLICK OR PRESS SPACE TO SERVE
      </div>
    `
    const root = document.querySelector('.viewport') || document.body
    root.appendChild(this.hudElement)

    const camBtn = this.hudElement.querySelector('#pp-cam-btn')
    if (camBtn) {
      camBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleCameraMode()
      })
    }
  }

  private updateHUD(customMsg?: string): void {
    if (!this.hudElement) return
    const countEl = this.hudElement.querySelector('#pp-rally-count')
    const hintEl = this.hudElement.querySelector('#pp-hint-msg')
    const camBtn = this.hudElement.querySelector('#pp-cam-btn')

    if (countEl) countEl.textContent = `${this.rallyCount}`
    if (camBtn) camBtn.textContent = `CAM: ${this.cameraMode.toUpperCase()} [C]`

    if (hintEl) {
      if (customMsg) {
        hintEl.textContent = customMsg
      } else if (this.serveState === 'serving') {
        hintEl.textContent = "CLICK / SPACE UNTUK SERVE • TEKAN 'C' GANTI KAMERA"
      } else {
        hintEl.textContent = "MOUSE UNTUK PADDLE • KLIK SMASH • TEKAN 'C' GANTI KAMERA"
      }
    }
  }

  private destroyHUD(): void {
    if (this.hudElement) {
      this.hudElement.remove()
      this.hudElement = null
    }
  }

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

  private createDecorations(): THREE.Group {
    const group = new THREE.Group()
    const banner = this.createLabel('PING PONG  ARENA', '#a7f3d0')
    banner.scale.set(3.2, 1.25, 1)
    banner.position.set(0, 4.9, -11.82)
    group.add(banner)

    const board = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.6, 0.12), new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7, emissive: 0x111827, emissiveIntensity: 0.3 }))
    board.position.set(6.8, 4.4, -11.78)
    group.add(board)

    const boardText = this.createLabel('RALLY MODE', '#f8fafc')
    boardText.scale.set(1.4, 0.75, 1)
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
