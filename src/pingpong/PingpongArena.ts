import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { PingpongBall } from './PingpongBall.ts'
import { PingpongNet } from './PingpongNet.ts'
import { PingpongPaddle } from './PingpongPaddle.ts'
import { PingpongPlayer } from './PingpongPlayer.ts'
import { PingpongTable, TABLE_HEIGHT, TABLE_LENGTH, TABLE_WIDTH } from './PingpongTable.ts'
import { PingpongScore, type Server, type ScoreState } from './PingpongScore.ts'

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
  private cameraMode: 'pov' | 'main' = 'pov'
  private score: PingpongScore
  private scoreHUD: HTMLElement | null = null
  private scoreHudOpacityTimer: number | null = null
  private serveHoldY = 0
  private serveHoldVy = 0
  private autoServeTimer: number | null = null

  // Input & Paddle position (+ batas area meja/net & koreksi rotasi stabil)
  // Posisi siap (ready) di garis tepi belakang meja (baseline), natural seperti pemain tenis meja.
  private targetPaddlePos = new THREE.Vector3(0, 1.02, 1.55)
  private currentPaddlePos = new THREE.Vector3(0, 1.02, 1.55)
  private paddleVelocity = new THREE.Vector3()
  private isSwinging = false
  private swingTimer = 0
  private p1SwingProgress = 0
  private p2SwingProgress = 0
  private readonly p1Bounds = PingpongPaddle.getDefaultBounds('player1')
  private readonly p1RotLimits = PingpongPaddle.getDefaultRotationLimits('player1')
  private readonly p2Bounds = PingpongPaddle.getDefaultBounds('player2')
  private readonly p2RotLimits = PingpongPaddle.getDefaultRotationLimits('player2')

  // True saat bet player ditempelkan ke R_Hand_Attach glTF (posisi dunia di-urutulkan arena).
  private p1PaddleAttached = false
  private p2PaddleAttached = false
  private readonly desiredP1Rot = new THREE.Euler(0, 0, 0, 'XYZ')
  private readonly desiredP2Rot = new THREE.Euler(Math.PI, Math.PI, 0, 'XYZ')

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

    // Initialize scoring system (ITTF: 11 poin, deuce 10-10 selisih 2, servis tiap 2 poin/1 saat deuce, best-of set)
    this.score = new PingpongScore({
      bestOf: 5, // ubah ke 3 atau 7 untuk best-of-3 / best-of-7
      startingServer: 'player1',
      callbacks: {
        onScoreChange: (state) => this.updateScoreHUD(state),
        onGameOver: (winner) => this.handleGameOver(winner),
        onServeChange: (server) => this.updateServeIndicator(server),
      },
    })

    // Build environment
    this.scene.add(
      this.createHall(),
      this.table.group,
      this.createDecorations(),
      this.createLights(),
    )

    // Add Player 1, Player 2 NPC, Paddles, and Ball
    this.scene.add(this.player1.group)
    this.scene.add(this.player2.group)
    this.scene.add(this.player1Paddle.group)
    this.scene.add(this.player2Paddle.group)
    this.scene.add(this.ball.group)

    // Initial positions (ready) di garis tepi belakang meja masing-masing
    this.player1.group.position.set(0, 0, 2.15)
    this.player2.group.position.set(0, 0, -1.95)
    this.player1Paddle.group.position.set(0, 1.02, 1.55)
    this.player2Paddle.group.position.set(0, 1.02, -1.42)

    this.createColliders()

    // POV: pengalaman bermain utama (first-person, agak mundur agar pandangan leluasa)
    this.camera.position.set(0, 1.34, 2.28)
    this.camera.lookAt(0, 0.82, -0.40)
  }

  enter(): void {
    // Saat pertandingan dimulai/dimount, selalu gunakan POV sebagai kamera utama
    this.cameraMode = 'pov'
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('keydown', this.onKeyDown)
    this.createHUD()
    this.createScoreHUD()
    this.resetServe(this.score.getServer())
    // Muat glTF player1/player2 secara independen; pasang bet di attach point.
    void this.loadArenaModels()
  }

  /** Muat model glTF per instance (SkeletonUtils clone per player), lalu pasang bet. */
  private async loadArenaModels(): Promise<void> {
    await Promise.all([this.player1.loadModels(), this.player2.loadModels()])
    this.p1PaddleAttached = this.player1.attachPaddle(this.player1Paddle.group, 'right')
    this.p2PaddleAttached = this.player2.attachPaddle(this.player2Paddle.group, 'right')
    this.syncNpcAnimations()
    this.syncVisibility()
  }

  exit(): void {
    if (this.autoServeTimer) {
      window.clearTimeout(this.autoServeTimer)
      this.autoServeTimer = null
    }
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('keydown', this.onKeyDown)
    this.destroyHUD()
    this.destroyScoreHUD()
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

    // Map screen cursor / gesture point to 3D workspace, lalu batasi agar tidak tembus meja/net.
    this.targetPaddlePos.x = THREE.MathUtils.clamp(normX * 1.0, -1.0, 1.0)
    this.targetPaddlePos.y = THREE.MathUtils.clamp(0.98 + (1 - normY) * 0.38, 0.95, 1.4)
    PingpongPaddle.constrainPosition(this.targetPaddlePos, this.p1Bounds, this.player1Paddle.radius)
  }

  private triggerSwing(): void {
    if (this.serveState === 'serving') {
      // Saat giliran lawan servis, serve dilakukan otomatis (bukan oleh klik/space pemain).
      if (this.score.getServer() === 'player2') return
      this.serveBall()
      return
    }
    this.isSwinging = true
    this.swingTimer = 0.2
  }

  private updatePlayer1Input(delta: number): void {
    // Handle swing timer & forward impulse (dari baseline/tepi belakang meja)
    let zOffset = 1.55
    if (this.swingTimer > 0) {
      this.swingTimer -= delta
      this.p1SwingProgress = Math.sin((0.2 - this.swingTimer) / 0.2 * Math.PI)
      zOffset = 1.55 - this.p1SwingProgress * 0.22
    } else {
      this.isSwinging = false
      this.p1SwingProgress = THREE.MathUtils.lerp(this.p1SwingProgress, 0, delta * 10)
    }

    const prevPos = this.currentPaddlePos.clone()
    this.targetPaddlePos.z = zOffset
    PingpongPaddle.constrainPosition(this.targetPaddlePos, this.p1Bounds, this.player1Paddle.radius)

    // Smooth movement lerp
    this.currentPaddlePos.x = THREE.MathUtils.lerp(this.currentPaddlePos.x, this.targetPaddlePos.x, delta * 24)
    this.currentPaddlePos.y = THREE.MathUtils.lerp(this.currentPaddlePos.y, this.targetPaddlePos.y, delta * 24)
    this.currentPaddlePos.z = THREE.MathUtils.lerp(this.currentPaddlePos.z, this.targetPaddlePos.z, delta * 24)

    // Collision boundary akhir: cegah blade menembus meja/net (termasuk input gesture tidak stabil)
    PingpongPaddle.constrainPosition(this.currentPaddlePos, this.p1Bounds, this.player1Paddle.radius)

    // Velocity dari posisi yang sudah ter-constraint
    this.paddleVelocity.subVectors(this.currentPaddlePos, prevPos).divideScalar(Math.max(delta, 0.001))

    // Orientasi diinginkan (dapat diganti orientasi tangan dari gesture) -> dikunci Euler + di-Lerp
    this.desiredP1Rot.set(
      -0.15 - this.p1SwingProgress * 0.4,
      this.currentPaddlePos.x * 0.12,
      -this.currentPaddlePos.x * 0.18,
    )
    if (this.p1PaddleAttached) {
      // glTF: bet ditempelkan ke R_Hand_Attach; masukkan world pose ke sana.
      // Di cam 'main': bet didorong sedikit ke depan badan (soal cosmetik saja).
      const targetP1 = this.cameraMode === 'main'
        ? new THREE.Vector3(this.currentPaddlePos.x, this.currentPaddlePos.y, this.currentPaddlePos.z - 0.5)
        : this.currentPaddlePos
      const quat = new THREE.Quaternion().setFromEuler(this.desiredP1Rot)
      this.player1.applyPaddleWorldPose(targetP1, quat)
    } else {
      // Fallback: posisi manual di baseline meja (seperti sebelumnya).
      this.player1Paddle.group.position.copy(this.currentPaddlePos)
      this.player1Paddle.applyStableRotation(this.desiredP1Rot, delta, this.p1RotLimits, 16)
    }

    this.player1.group.position.set(
      this.currentPaddlePos.x * 0.75,
      0,
      this.currentPaddlePos.z + 0.58,
    )
    this.player1.setSwingProgress(this.p1SwingProgress)
  }

  private updateBallPhysics(delta: number): void {
    if (this.serveState === 'serving') {
      // Saat siap servis: bola memantul stabil di meja dan mengikuti bet (tanpa gerak acak).
      const server = this.score.getServer()
      const dt = Math.min(delta, 0.033)
      const tableY = TABLE_HEIGHT + this.ball.radius
      // Bola di atas sisi meja server, dekat/di depan wajah bet yang akan melakukan servis.
      const holdZ = server === 'player1'
        ? Math.max(this.currentPaddlePos.z - 0.22, TABLE_LENGTH / 2 - 0.18)
        : Math.min(this.player2Paddle.group.position.z + 0.22, -(TABLE_LENGTH / 2 - 0.18))
      const holdXRaw = server === 'player1' ? this.currentPaddlePos.x : this.player2Paddle.group.position.x
      const holdX = THREE.MathUtils.clamp(holdXRaw, -TABLE_WIDTH / 2 + 0.15, TABLE_WIDTH / 2 - 0.15)

      if (this.serveHoldY <= 0) {
        this.serveHoldY = tableY + 0.1
        this.serveHoldVy = 0
      }

      this.serveHoldVy += -9.81 * dt
      this.serveHoldY += this.serveHoldVy * dt
      if (this.serveHoldY <= tableY) {
        this.serveHoldY = tableY
        this.serveHoldVy = 1.9 // pantulan kecil stabil di meja (realistis, proporsional)
      }

      this.ball.position.set(holdX, this.serveHoldY, holdZ)
      this.ball.velocity.set(0, 0, 0)
      this.ball.mesh.position.copy(this.ball.position)
      this.ball.shadowDot.position.set(this.ball.position.x, TABLE_HEIGHT + 0.002, this.ball.position.z)
      const shadowScale = Math.max(0.4, 1.2 - (this.serveHoldY - TABLE_HEIGHT) * 0.5)
      this.ball.shadowDot.scale.set(shadowScale, shadowScale, 1)
      return
    }

    if (this.serveState === 'scored') {
      this.resetTimer -= delta
      if (this.resetTimer <= 0) {
        this.resetServe(this.score.getServer())
      }
      this.ball.update(delta)
      return
    }

    const prevBallX = this.ball.position.x
    const prevBallY = this.ball.position.y
    const prevBallZ = this.ball.position.z
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

    // --- Net Collision (swept, tidak bisa ditembus) ---
    const netHeightTop = TABLE_HEIGHT + 0.1525
    const netHalfWidth = TABLE_WIDTH / 2 + 0.08
    const netThickness = 0.025
    if (
      this.ball.position.y - ballR <= netHeightTop &&
      prevBallY - ballR <= netHeightTop + 0.02 &&
      Math.abs(this.ball.position.x) <= netHalfWidth
    ) {
      const crossed = (prevBallZ > 0 && this.ball.position.z <= 0) || (prevBallZ < 0 && this.ball.position.z >= 0)
      const insideNet = Math.abs(this.ball.position.z) <= netThickness
      if (crossed || insideNet) {
        const fromSide = prevBallZ >= 0 ? 1 : -1
        this.ball.position.z = fromSide * (netThickness + ballR + 0.001)
        // Pantulkan/dorong balik agar bola tidak menembus net
        if (Math.sign(this.ball.velocity.z) !== fromSide) {
          this.ball.velocity.z = Math.abs(this.ball.velocity.z) * 0.28 * fromSide
        } else {
          this.ball.velocity.z *= 0.28
        }
        this.ball.velocity.y *= 0.5
        this.ball.velocity.x *= 0.85
        this.ball.mesh.position.copy(this.ball.position)
      }
    }

    // --- Player 1 Paddle Collision ---
    if (this.ball.position.z > 0.4 && this.ball.position.z < 1.75 && this.ball.velocity.z > 0) {
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

        // Tahan bola agar melambung di atas net (biar tidak langsung jatuh balik ke
        // daerah sendiri karena tumbukan net saat meluncur langsung ke net).
        this.ball.position.y = Math.max(this.ball.position.y, TABLE_HEIGHT + this.ball.radius + 0.25)
        this.rallyCount++
        this.updateHUD()
      }
    }

    // --- Player 2 (NPC) Paddle Collision ---
    // Window sedikit lebih lebar & reaktif: NPC smash juga kalau bola lewat window
    // tapi masih dekat paddle (bola cepat melampaui window utama).
    const npcDist = this.ball.position.distanceTo(this.player2Paddle.group.position)
    const npcInZone = (this.ball.position.z < -0.4 && this.ball.position.z > -1.75)
      || (this.ball.position.z < -0.1 && npcDist < 0.5)
    if (npcInZone && this.ball.velocity.z < 0 && npcDist < 0.5) {
      // Hit by Player 2 (NPC)! - arc konsisten, tidak menggelinding
      this.ball.lastHitBy = 'player2'
      this.p2SwingProgress = 1.0
      const npcPaddle = this.player2Paddle.group.position
      const offsetX = THREE.MathUtils.clamp(this.ball.position.x - npcPaddle.x, -0.18, 0.18)

      this.ball.velocity.z = 4.9
      this.ball.velocity.y = Math.max(2.4, 2.1 + (npcPaddle.y - 0.9) * 0.5)
      this.ball.velocity.x = THREE.MathUtils.clamp(offsetX * 3.2 - this.ball.position.x * 0.12, -1.6, 1.6)

      // Pastikan bola terangkat tinggi agar melambung di atas net (mirror P1 smash).
      this.ball.position.y = Math.max(this.ball.position.y, TABLE_HEIGHT + this.ball.radius + 0.22)
      this.ball.position.z = npcPaddle.z + 0.08
      this.rallyCount++
      this.updateHUD()
    }

    // --- Out of Bounds / Floor Hit Check ---
    if (this.ball.position.y <= 0.04 || Math.abs(this.ball.position.z) > 3.6 || Math.abs(this.ball.position.x) > 2.8) {
      this.handleRallyEnd()
    }
  }

  private updateNPC(delta: number): void {
    // NPC AI moves toward ball position when ball is coming to NPC side
    const targetX = this.ball.velocity.z < 0 ? THREE.MathUtils.clamp(this.ball.position.x, -1.0, 1.0) : 0
    const targetY = this.ball.velocity.z < 0 ? THREE.MathUtils.clamp(this.ball.position.y, 0.95, 1.30) : 0.98

    const npcPos = this.player2Paddle.group.position
    npcPos.x = THREE.MathUtils.lerp(npcPos.x, targetX, delta * 7)
    npcPos.y = THREE.MathUtils.lerp(npcPos.y, targetY, delta * 7)
    npcPos.z = -1.42

    // Batas area/net/meja: cegah NPC paddle menembus permukaan meja atau melewati net
    PingpongPaddle.constrainPosition(npcPos, this.p2Bounds, this.player2Paddle.radius)

    // NPC character body follows paddle
    this.player2.group.position.x = THREE.MathUtils.lerp(this.player2.group.position.x, npcPos.x * 0.75, delta * 6)

    // Swing decay
    if (this.p2SwingProgress > 0) {
      this.p2SwingProgress = THREE.MathUtils.lerp(this.p2SwingProgress, 0, delta * 8)
    }
    this.player2.setSwingProgress(this.p2SwingProgress)

    // Rotasi NPC terkunci + smoothing (menghadap P1/lapangan, tidak terbalik/jungkir balik)
    this.desiredP2Rot.set(
      0.18 + this.p2SwingProgress * 0.35,
      Math.PI - npcPos.x * 0.12,
      npcPos.x * 0.08,
    )
    if (this.p2PaddleAttached) {
      const quat = new THREE.Quaternion().setFromEuler(this.desiredP2Rot)
      this.player2.applyPaddleWorldPose(npcPos, quat)
    } else {
      this.player2Paddle.applyStableRotation(this.desiredP2Rot, delta, this.p2RotLimits, 14)
    }
  }

  private toggleCameraMode(): void {
    this.cameraMode = this.cameraMode === 'pov' ? 'main' : 'pov'
    this.updateHUD()
  }

  private updateCamera(delta: number): void {
    const t = 1 - Math.exp(-delta * 4)

    if (this.cameraMode === 'main') {
      // Main: perspektif dari belakang pemain, sudut tinggi agar meja/bola tetap jelas
      const targetCamX = this.currentPaddlePos.x * 0.08
      const targetCamY = 2.15 + (this.currentPaddlePos.y - 0.95) * 0.06
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, t)
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, t)
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 3.45, t)
      this.camera.lookAt(this.ball.position.x * 0.08, 0.78, -0.30)
      return
    }

    // POV (default): first-person, lebih mundur dan sedikit lebih tinggi agar pandangan leluasa
    const targetCamX = this.currentPaddlePos.x * 0.04
    const targetCamY = 1.34 + (this.currentPaddlePos.y - 0.95) * 0.04
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, t)
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, t)
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 2.28, t)
    this.camera.lookAt(this.ball.position.x * 0.05, 0.82, -0.40)
  }

  private updateAnimations(delta: number): void {
    this.player1.update(delta)
    this.player2.update(delta)
    this.syncPlayer1Animations()
    this.syncNpcAnimations()
    this.syncPlayer1BehindTable()
    this.syncVisibility()
  }

  /** Player 1: saat bermain -> setSwingProgress memicu 'Forehand'; lain -> 'Ready'. */
  private syncPlayer1Animations(): void {
    if (this.swingTimer > 0 || this.p1SwingProgress > 0.02) {
      this.player1.setSwingProgress(this.p1SwingProgress)
    } else {
      this.player1.playAnimation('Ready', 0.3)
    }
  }

  /** NPC: 'Ready' saat bola mendekat/rally di luar rally -> 'Idle'; 'Forehand' saat memukul (p2SwingProgress). */
  private syncNpcAnimations(): void {
    const ballApproaching = this.serveState === 'rally' && this.ball.velocity.z < 0
    // NPC smash dari updateBallPhysics (p2SwingProgress = 1.0 saat ditendang).
    if (this.p2SwingProgress > 0.02) {
      this.player2.playAnimation('Forehand', 0.15)
    } else if (ballApproaching || this.serveState === 'serving') {
      this.player2.playAnimation('Ready', 0.2)
    } else {
      this.player2.playAnimation('Idle', 0.4)
    }
  }

  /**
   * Visibilitas pemain saat kamera POV vs main:
   * - POV (playing): player1 (self, saat bermain) disembunyikan — tidak menutupi
   *   pandangan kamera ke arah meja/net/bola. Bat P1 dibawa ke level scene
   *   supaya tetap terlihat (kalau disembunyikan bersama model, bat ikut tersembunyi
   *   karena bat parent model via attach point).
   * - NPC (player2): selalu terlihat di kedua mode, termasuk rambut mohawk-nya.
   * - Bat P2: selalu terlihat.
   * - Main: player1 tampil di belakang meja (z besar), tidak menghalangi sudut pandang.
   */
  private syncVisibility(): void {
    const isPlaying = this.serveState === 'serving' || this.serveState === 'rally'
    const hidePlayer1 = isPlaying && this.cameraMode === 'pov'

    // P1 (self): hides in POV play; visible in main/idle.
    this.player1.group.visible = !hidePlayer1
    // NPC: always visible, both modes.
    this.player2.group.visible = true

    // Player 1 paddle: keep visible even when player1 hidden in POV
    // (re-parent to scene when hidden so Three.js renders it).
    const paddle1 = this.player1Paddle.group
    if (hidePlayer1) {
      if (paddle1.parent && paddle1.parent !== this.scene) {
        paddle1.parent.remove(paddle1)
        this.scene.add(paddle1)
      }
    } else {
      if (paddle1.parent !== this.scene) {
        this.player1.attachPaddle(paddle1, 'right')
      }
    }
    paddle1.visible = true
    this.player2Paddle.group.visible = true
  }

  /**
   * Posisi P1 saat mode main: di belakang meja (z di belakang kamera),
   * tidak menutupi sudut pandang kamera.
   */
  private syncPlayer1BehindTable(): void {
    if (this.cameraMode === 'main') {
      // Seberang musuh (sisi positif Z, dari NPC berada di sisi negatif).
      this.player1.group.position.set(
        this.currentPaddlePos.x * 0.75,
        0,
        TABLE_LENGTH / 2 + 0.05,
      )
    }
  }

  private serveBall(): void {
    this.serveState = 'rally'
    this.rallyCount = 0
    this.serveHoldY = 0
    this.serveHoldVy = 0
    this.updateHUD()
    this.updateScoreHUD(this.score.getState())

    const server = this.score.getServer()

    if (server === 'player1') {
      // Serve dari posisi dekat bet menuju sisi lawan
      const startX = THREE.MathUtils.clamp(this.ball.position.x, -TABLE_WIDTH / 2 + 0.15, TABLE_WIDTH / 2 - 0.15)
      const startY = Math.max(this.ball.position.y, TABLE_HEIGHT + this.ball.radius)
      const serveZ = Math.max(this.ball.position.z, Math.max(this.currentPaddlePos.z - 0.22, TABLE_LENGTH / 2 - 0.18))
      const vx = (this.currentPaddlePos.x - 0) * 0.8 + (Math.random() - 0.5) * 0.3
      // vy 2.5 biar bola jelas melambung di atas net -> sampai ke sisi lawan
      // (dengan vy kecil, bola cepat cross net di lantai -> terpantul balik -> point lawan saat serve).
      this.ball.reset(
        new THREE.Vector3(startX, startY, serveZ),
        new THREE.Vector3(vx, 2.5, -4.2),
      )
      this.triggerSwing()
    } else {
      // NPC serve (otomatis) dengan kekuatan setara serve pemain
      const startX = THREE.MathUtils.clamp(this.player2Paddle.group.position.x, -TABLE_WIDTH / 2 + 0.15, TABLE_WIDTH / 2 - 0.15)
      const startY = Math.max(this.ball.position.y, TABLE_HEIGHT + this.ball.radius)
      const serveZ = Math.min(this.ball.position.z, Math.min(this.player2Paddle.group.position.z + 0.22, -(TABLE_LENGTH / 2 - 0.18)))
      const vx = (this.player2Paddle.group.position.x - 0) * 0.8 + (Math.random() - 0.5) * 0.3
      // vy 2.5 agar bola melambung di atas net, tidak cross net terlalu rendah
      // (cross net terlalu rendah = pantulan net balik ke sisi saya => point lawan).
      this.ball.reset(
        new THREE.Vector3(startX, startY, serveZ),
        new THREE.Vector3(vx, 2.5, 4.2),
      )
      this.p2SwingProgress = 1.0
      window.setTimeout(() => { this.p2SwingProgress = 0 }, 200)
    }
  }

  private resetServe(_server: Server): void {
    this.serveState = 'serving'
    this.serveHoldY = 0
    this.serveHoldVy = 0
    if (this.autoServeTimer) {
      window.clearTimeout(this.autoServeTimer)
      this.autoServeTimer = null
    }
    const server = this.score.getServer()
    if (server === 'player2') {
      this.updateHUD('LAWAN AKAN SERVE...')
      this.autoServeTimer = window.setTimeout(() => {
        this.autoServeTimer = null
        if (this.serveState === 'serving' && this.score.getServer() === 'player2') {
          this.serveBall()
        }
      }, 900)
    } else {
      this.updateHUD('KLIK ATAU TEKAN SPACE UNTUK SERVE!')
    }
    this.updateScoreHUD(this.score.getState())
  }

  private handleRallyEnd(): void {
    if (this.serveState === 'scored') return
    this.serveState = 'scored'
    this.resetTimer = 1.25

    if (this.rallyCount > this.maxRallyCount) {
      this.maxRallyCount = this.rallyCount
    }

    /**
     * Aturan tambahan poin (ITTF, disederhanakan untuk simulasi):
     * - Bola menyentuh lantai/keluar area di sisi lawan dari pemukul terakhir => poin untuk pemukul terakhir.
     * - Bola menyentuh lantai/keluar di sisi sendiri, terkena net/gagal menyeberang, atau serve fault
     *   (belum ada pukulan sah) => poin untuk lawan.
     */
    let pointWinner: Server = 'player1'
    const z = this.ball.position.z
    const side: Server | 'net' = z > 0.05 ? 'player1' : z < -0.05 ? 'player2' : 'net'
    const lastHitter = this.ball.lastHitBy

    if (lastHitter) {
      const opponent: Server = lastHitter === 'player1' ? 'player2' : 'player1'
      pointWinner = side === opponent ? lastHitter : opponent
    } else {
      // Fault saat serve / tidak ada kontak paddle: poin untuk sisi seberang dari jatuhnya bola
      pointWinner = side === 'player1' ? 'player2' : 'player1'
    }

    this.score.awardPoint(pointWinner)

    const msg = this.rallyCount > 0 ? `RALLY BERAKHIR! TOUCH: ${this.rallyCount}` : `POIN!`
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
    // Rally dan kamera ditempatkan di tengah atas.
    this.hudElement.style.cssText = `
      position: absolute;
      top: max(12px, env(safe-area-inset-top));
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
          CAM: POV [C]
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
    if (camBtn) {
      const label = this.cameraMode === 'pov' ? 'POV' : 'MAIN'
      camBtn.textContent = `CAM: ${label} [C]`
    }

    if (hintEl) {
      if (customMsg) {
        hintEl.textContent = customMsg
      } else if (this.serveState === 'serving') {
        hintEl.textContent = this.score.getServer() === 'player2'
          ? "LAWAN SERVE OTOMATIS • TEKAN 'C' GANTI KAMERA (POV/MAIN)"
          : "CLICK / SPACE UNTUK SERVE • TEKAN 'C' GANTI KAMERA (POV/MAIN)"
      } else {
        hintEl.textContent = "MOUSE/GESTUR UNTUK PADDLE • KLIK SMASH • TEKAN 'C' GANTI KAMERA"
      }
    }
  }

  private destroyHUD(): void {
    if (this.hudElement) {
      this.hudElement.remove()
      this.hudElement = null
    }
  }

  // --- Score HUD ---
  private createScoreHUD(): void {
    this.scoreHUD = document.createElement('div')
    this.scoreHUD.className = 'pingpong-score-hud'
    this.scoreHUD.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 21;
      font-family: system-ui, -apple-system, sans-serif;
    `
    // Skor dipisah: ANDA di kiri atas, MUSUH di kanan atas. Rally & kamera di tengah (HUD terpisah).
    // Ukuran tampilan skor tetap sama (angka 2.6rem).
    this.scoreHUD.innerHTML = `
      <div id="pp-score-panel-player" class="pp-score-panel pp-score-panel--player">
        <div class="pp-score-header">
          <span id="pp-p1-serve" class="pp-serve-dot pp-serve-dot--p1"></span>
          <span class="pp-score-label">ANDA</span>
        </div>
        <div class="pp-score-main">
          <span id="pp-p1-score" class="pp-score-number pp-score-number--p1">0</span>
        </div>
        <div class="pp-score-meta">
          <span class="pp-score-sets">SET <span id="pp-p1-sets">0</span></span>
        </div>
      </div>

      <div id="pp-score-panel-enemy" class="pp-score-panel pp-score-panel--enemy">
        <div class="pp-score-header">
          <span class="pp-score-label">MUSUH</span>
          <span id="pp-p2-serve" class="pp-serve-dot pp-serve-dot--p2"></span>
        </div>
        <div class="pp-score-main">
          <span id="pp-p2-score" class="pp-score-number pp-score-number--p2">0</span>
        </div>
        <div class="pp-score-meta">
          <span class="pp-score-sets">SET <span id="pp-p2-sets">0</span></span>
        </div>
      </div>

      <div id="pp-game-status" class="pp-score-status"></div>
      <button id="pp-restart-btn" type="button" class="pp-restart-btn">MAIN LAGI</button>

      <style>
        .pp-score-panel {
          position: absolute;
          top: max(12px, env(safe-area-inset-top));
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 24px;
          min-width: 168px;
          background: rgba(15, 23, 42, 0.72);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 18px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(2, 6, 23, 0.45);
          opacity: 0.9;
          transition: opacity 0.25s ease;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .pp-score-panel--player { left: max(12px, env(safe-area-inset-left)); align-items: flex-start; }
        .pp-score-panel--enemy { right: max(12px, env(safe-area-inset-right)); align-items: flex-end; }
        .pp-score-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .pp-score-panel--enemy .pp-score-header { justify-content: flex-end; }
        .pp-score-main {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 2px 0;
        }
        .pp-score-label {
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #94a3b8;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pp-score-number {
          font-size: 3.6rem;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          min-width: 1.5ch;
          text-align: center;
          color: #f8fafc;
        }
        .pp-score-number--p1 { text-shadow: 0 0 14px rgba(56, 189, 248, 0.4); }
        .pp-score-number--p2 { text-shadow: 0 0 14px rgba(239, 68, 68, 0.35); }
        .pp-serve-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          flex: 0 0 auto;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .pp-serve-dot--p1 { background: #38bdf8; box-shadow: 0 0 9px #38bdf8; }
        .pp-serve-dot--p2 { background: #ef4444; box-shadow: 0 0 9px #ef4444; }
        .pp-serve-dot.is-active {
          opacity: 1;
          animation: pp-serve-pulse 1.5s ease-in-out infinite;
        }
        .pp-score-meta {
          display: flex;
          align-items: center;
          width: 100%;
          margin-top: 2px;
          padding-top: 10px;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
        }
        .pp-score-panel--player .pp-score-meta { justify-content: flex-start; }
        .pp-score-panel--enemy .pp-score-meta { justify-content: flex-end; }
        .pp-score-sets {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94a3b8;
          white-space: nowrap;
        }
        .pp-score-sets span { color: #cbd5e1; }
        .pp-score-status {
          display: none;
          position: absolute;
          top: calc(max(12px, env(safe-area-inset-top)) + 86px);
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 14px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 999px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          white-space: nowrap;
          z-index: 22;
        }
        .pp-score-status.is-visible { display: inline-block; }
        .pp-restart-btn {
          display: none;
          position: absolute;
          top: calc(max(12px, env(safe-area-inset-top)) + 126px);
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: none;
          color: #f8fafc;
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 9px 20px;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4);
          pointer-events: auto;
          opacity: 0.9;
          z-index: 22;
        }
        @keyframes pp-serve-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.82); }
        }
        @keyframes pp-score-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .pp-score-pop { animation: pp-score-pop 0.28s ease; }
      </style>
    `

    const root = document.querySelector('.viewport') || document.body
    root.appendChild(this.scoreHUD)

    const restartBtn = this.scoreHUD.querySelector('#pp-restart-btn')
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.restartMatch()
      })
    }
  }

  private updateScoreHUD(state: ScoreState): void {
    if (!this.scoreHUD) return

    const panelEnemy = this.scoreHUD.querySelector('#pp-score-panel-enemy') as HTMLElement | null
    const panelPlayer = this.scoreHUD.querySelector('#pp-score-panel-player') as HTMLElement | null
    const p1ScoreEl = this.scoreHUD.querySelector('#pp-p1-score')
    const p2ScoreEl = this.scoreHUD.querySelector('#pp-p2-score')
    const p1ServeEl = this.scoreHUD.querySelector('#pp-p1-serve')
    const p2ServeEl = this.scoreHUD.querySelector('#pp-p2-serve')
    const statusEl = this.scoreHUD.querySelector('#pp-game-status') as HTMLElement | null
    const restartBtn = this.scoreHUD.querySelector('#pp-restart-btn') as HTMLElement | null

    // Opacity: 0.9 saat idle, penuh sesaat setelah skor berubah, lalu kembali.
    // Saat game over dipertahankan penuh agar hasil akhir tetap terbaca.
    if (this.scoreHudOpacityTimer) {
      window.clearTimeout(this.scoreHudOpacityTimer)
      this.scoreHudOpacityTimer = null
    }
    const setPanelsOpacity = (value: string) => {
      if (panelEnemy) panelEnemy.style.opacity = value
      if (panelPlayer) panelPlayer.style.opacity = value
    }
    setPanelsOpacity('1')
    if (state.gameState !== 'gameOver') {
      this.scoreHudOpacityTimer = window.setTimeout(() => {
        setPanelsOpacity('0.9')
        this.scoreHudOpacityTimer = null
      }, 900)
    }

    // Update angka skor + animasi pop
    if (p1ScoreEl) {
      p1ScoreEl.textContent = `${state.player1Score}`
      p1ScoreEl.classList.remove('pp-score-pop')
      void (p1ScoreEl as HTMLElement).offsetWidth
      p1ScoreEl.classList.add('pp-score-pop')
    }
    if (p2ScoreEl) {
      p2ScoreEl.textContent = `${state.player2Score}`
      p2ScoreEl.classList.remove('pp-score-pop')
      void (p2ScoreEl as HTMLElement).offsetWidth
      p2ScoreEl.classList.add('pp-score-pop')
    }

    // Skor set (best-of)
    const p1SetsEl = this.scoreHUD.querySelector('#pp-p1-sets')
    const p2SetsEl = this.scoreHUD.querySelector('#pp-p2-sets')
    if (p1SetsEl) p1SetsEl.textContent = `${state.player1Sets ?? 0}`
    if (p2SetsEl) p2SetsEl.textContent = `${state.player2Sets ?? 0}`

    // Indikator servis: titik menyala di sisi pemain yang sedang melakukan servis
    if (p1ServeEl && p2ServeEl) {
      p1ServeEl.classList.toggle('is-active', state.server === 'player1')
      p2ServeEl.classList.toggle('is-active', state.server === 'player2')
    }

    // Status ringkas di dalam panel (deuce / hasil akhir) — tidak ada UI di tengah layar
    if (statusEl) {
      if (state.gameState === 'gameOver') {
        const winnerText = state.winner === 'player1' ? 'ANDA MENANG' : 'MUSUH MENANG'
        const winnerColor = state.winner === 'player1' ? '#7dd3fc' : '#fca5a5'
        statusEl.classList.add('is-visible')
        statusEl.innerHTML = `<span style="color: ${winnerColor};">${winnerText}</span>`
        if (restartBtn) restartBtn.style.display = 'block'
      } else if (this.score.isDeuce()) {
        statusEl.classList.add('is-visible')
        statusEl.innerHTML = `<span style="color: #fcd34d;">DEUCE</span>`
        if (restartBtn) restartBtn.style.display = 'none'
      } else {
        statusEl.classList.remove('is-visible')
        statusEl.innerHTML = ''
        if (restartBtn) restartBtn.style.display = 'none'
      }
    }
  }

  private updateServeIndicator(server: Server): void {
    // Handled in updateScoreHUD via onScoreChange callback
    this.updateScoreHUD(this.score.getState())
  }

  private handleGameOver(winner: Server): void {
    const state = this.score.getState()
    if (state.matchOver) {
      this.updateHUD(winner === 'player1' ? 'MATCH SELESAI! ANDA MENANG!' : 'MATCH SELESAI! MUSUH MENANG!')
      this.updateScoreHUD(state)
      return
    }
    this.updateHUD(winner === 'player1' ? 'SET SELESAI! ANDA MENANG SET!' : 'SET SELESAI! MUSUH MENANG SET!')
    this.updateScoreHUD(state)
    window.setTimeout(() => {
      if (!this.score.isMatchOver() && this.score.isGameOver()) {
        this.score.startNextSet()
        this.resetServe(this.score.getServer())
      }
    }, 1800)
  }

  private restartMatch(): void {
    this.score.reset()
    this.maxRallyCount = 0
    this.resetServe(this.score.getServer())
    this.updateHUD()
    this.updateScoreHUD(this.score.getState())
  }

  private destroyScoreHUD(): void {
    if (this.scoreHudOpacityTimer) {
      window.clearTimeout(this.scoreHudOpacityTimer)
      this.scoreHudOpacityTimer = null
    }
    if (this.scoreHUD) {
      this.scoreHUD.remove()
      this.scoreHUD = null
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
