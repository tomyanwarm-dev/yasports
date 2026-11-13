import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TABLE_LENGTH } from './PingpongTable.ts'

/** Batas virtual area pemain relatif ke meja/net (meter, ruang lokal arena). */
export interface PaddleBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

/** Batas rotasi Euler (radian) agar bat tidak jungkir balik/terbalik liar. */
export interface PaddleRotationLimits {
  minPitchX: number
  maxPitchX: number
  minYawY: number
  maxYawY: number
  minRollZ: number
  maxRollZ: number
}

const PADDLE_MODEL_URL = '/models/ping_pong_paddle.glb'
let paddleGltfPromise: Promise<THREE.Group> | null = null

function loadPaddleModel(): Promise<THREE.Group> {
  if (!paddleGltfPromise) {
    paddleGltfPromise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        PADDLE_MODEL_URL,
        (gltf) => resolve(gltf.scene),
        undefined,
        reject,
      )
    })
  }
  return paddleGltfPromise
}

/**
 * 3D Ping Pong Paddle (Bat) loaded from GLB model.
 * Includes coordinate constraints and stable rotation correction for hand-gesture control.
 */
export class PingpongPaddle {
  readonly group = new THREE.Group()
  readonly bladeMesh: THREE.Mesh
  readonly radius = 0.09
  readonly thickness = 0.012
  readonly isPlayerOne: boolean

  // Rotasi tersmoothing untuk mencegah perubahan mendadak dari deteksi tangan yang noise.
  private smoothedRotation = new THREE.Euler(0, 0, 0, 'XYZ')

  constructor(isPlayerOne: boolean = true) {
    this.isPlayerOne = isPlayerOne

    // Collision/reference mesh (invisible) to keep a stable expected mesh reference.
    this.bladeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.thickness, 32),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    this.bladeMesh.rotation.x = Math.PI / 2
    this.group.add(this.bladeMesh)

    loadPaddleModel()
      .then((scene) => {
        const model = scene.clone(true)
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        if (size.x > 0 && size.y > 0 && size.z > 0) {
          // Fit blade roughly to gameplay size (diameter ~0.18m). Use model's largest
          // face dimension for the blade diameter and a smaller axis for thickness.
          const dims = [size.x, size.y, size.z].sort((a, b) => a - b)
          const bladeThickness = dims[0]
          const bladeDiameter = dims[2]
          const s = (this.radius * 2) / bladeDiameter
          const thicknessScale = (this.thickness / bladeThickness) * 0.9
          const thicknessAxis = size.z <= size.x && size.z <= size.y ? 'z' : size.x <= size.y ? 'x' : 'y'

          model.scale.set(s, s, s)
          if (thicknessAxis === 'z') model.scale.z *= thicknessScale
          else if (thicknessAxis === 'x') model.scale.x *= thicknessScale
          else model.scale.y *= thicknessScale

          // Center model at paddle origin so position/rotation control remains consistent.
          const scaledBox = new THREE.Box3().setFromObject(model)
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
          model.position.sub(scaledCenter)
          // Keep blade/handle roughly aligned with existing vertical-handle assumption.
          model.position.y += 0.02
        }

        // Orient so the paddle faces forward for the owning side.
        model.rotation.y += this.isPlayerOne ? 0 : Math.PI

        model.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })

        this.group.add(model)
      })
      .catch((err) => {
        console.error('Failed to load ping pong paddle model:', err)
      })

    // Orient paddle so facing is correct before/without model-specific tuning as well.
    if (!isPlayerOne) {
      this.group.rotation.y = Math.PI
    }
    this.smoothedRotation.copy(this.group.rotation)
  }

  /** Gets bounding sphere center & radius for physics collision */
  getWorldCenter(target: THREE.Vector3): THREE.Vector3 {
    return this.group.getWorldPosition(target)
  }

  /**
   * 1) Pembatasan koordinat (clamp/bounding box) + deteksi tumbukan sederhana
   * terhadap permukaan/badan meja virtual dan batas net.
   * - mencegah bat melewati net atau sisi meja lawan
   * - mencegah center bat turun menembus permukaan meja (dengan clearance radius)
   */
  static constrainPosition(pos: THREE.Vector3, bounds: PaddleBounds, paddleRadius = 0.09): THREE.Vector3 {
    // Clamp bounding box area pemain
    pos.x = THREE.MathUtils.clamp(pos.x, bounds.minX, bounds.maxX)
    pos.y = THREE.MathUtils.clamp(pos.y, bounds.minY, bounds.maxY)
    pos.z = THREE.MathUtils.clamp(pos.z, bounds.minZ, bounds.maxZ)

    // Deteksi tumbukan sederhana dengan bidang meja: pastikan tidak menembus batas bawah.
    if (pos.y < bounds.minY) {
      pos.y = bounds.minY
    }

    // Batas ekstra berbasis radius agar tepi blade tidak "keluar" terlalu jauh dari area aman X.
    const radialMargin = paddleRadius * 0.15
    pos.x = THREE.MathUtils.clamp(pos.x, bounds.minX + radialMargin, bounds.maxX - radialMargin)

    return pos
  }

  /** Batas area default: sisi pemain 1 (Z positif, di sekitar ujung meja, tidak maju ke atas meja). */
  static getDefaultBounds(side: 'player1' | 'player2'): PaddleBounds {
    // TABLE_WIDTH=1.525, TABLE_LENGTH=2.74, TABLE_HEIGHT=0.76, permukaan atas ~0.7875.
    // Clearance mencakup blade (radius 0.09) + gagang + margin kemiringan agar tidak tembus meja.
    const tableTop = 0.7875
    const minY = tableTop + 0.155
    const maxY = 1.48
    const xReach = 1.05
    const tableEnd = TABLE_LENGTH / 2 // 1.37
    if (side === 'player1') {
      return { minX: -xReach, maxX: xReach, minY, maxY, minZ: tableEnd + 0.02, maxZ: tableEnd + 0.50 }
    }
    return { minX: -xReach, maxX: xReach, minY, maxY, minZ: -(tableEnd + 0.50), maxZ: -(tableEnd + 0.02) }
  }

  /** Batas rotasi default: bat tetap menghadap lapangan/bola, tahan input tangan terbalik. */
  static getDefaultRotationLimits(side: 'player1' | 'player2'): PaddleRotationLimits {
    if (side === 'player1') {
      return {
        minPitchX: -0.85, maxPitchX: 0.22,   // kemiringan ayun, jangan jungkir balik
        minYawY: -0.55, maxYawY: 0.55,        // tetap menghadap ke depan (arah bola/lapangan)
        minRollZ: -0.7, maxRollZ: 0.7,
      }
    }
    // Player 2 menghadap arah berlawanan (basis yaw ~ PI), pitch normal (tidak terbalik)
    return {
      minPitchX: -0.22, maxPitchX: 0.85,
      minYawY: Math.PI - 0.55, maxYawY: Math.PI + 0.55,
      minRollZ: -0.7, maxRollZ: 0.7,
    }
  }

  /**
   * 2) Koreksi rotasi: kunci Euler angles ke batas aman + smoothing (Lerp/exp)
   * agar tidak berputar liar/mendadak terbalik dari deteksi tangan tidak stabil.
   * `desired` bisa berasal dari orientasi tangan/gesture; hasil selalu terkontrol.
   */
  applyStableRotation(desired: THREE.Euler, delta: number, limits: PaddleRotationLimits, lerpSpeed = 14): void {
    // Normalisasi tiap sumbu relatif ke center range limitnya (bukan paksa ke [-PI,PI]),
    // supaya P2 (pitch/yaw berbasis PI) dan input gesture tidak terbalik.
    const targetX = THREE.MathUtils.clamp(
      this.normalizeAngle(desired.x, limits.minPitchX, limits.maxPitchX),
      limits.minPitchX,
      limits.maxPitchX,
    )
    const targetY = THREE.MathUtils.clamp(
      this.normalizeAngle(desired.y, limits.minYawY, limits.maxYawY),
      limits.minYawY,
      limits.maxYawY,
    )
    const targetZ = THREE.MathUtils.clamp(
      this.normalizeAngle(desired.z, limits.minRollZ, limits.maxRollZ),
      limits.minRollZ,
      limits.maxRollZ,
    )

    const t = 1 - Math.exp(-lerpSpeed * Math.max(delta, 0))
    this.smoothedRotation.x = THREE.MathUtils.lerp(this.smoothedRotation.x, targetX, t)
    this.smoothedRotation.y = THREE.MathUtils.lerp(this.smoothedRotation.y, targetY, t)
    this.smoothedRotation.z = THREE.MathUtils.lerp(this.smoothedRotation.z, targetZ, t)

    this.group.rotation.set(this.smoothedRotation.x, this.smoothedRotation.y, this.smoothedRotation.z)
  }

  /** Normalisasi sudut ke sekitar center rentang [min,max] (aman untuk range berbasis PI, mis. P2). */
  private normalizeAngle(angle: number, min: number, max: number): number {
    const center = (min + max) / 2
    let a = angle - center
    a = THREE.MathUtils.euclideanModulo(a + Math.PI, Math.PI * 2) - Math.PI
    return a + center
  }

  /** Terapkan posisi + rotasi stabil sekaligus (nyaman untuk loop update/gesture input). */
  updateControlled(
    targetPos: THREE.Vector3,
    desiredRotation: THREE.Euler,
    delta: number,
    bounds: PaddleBounds,
    limits: PaddleRotationLimits,
  ): void {
    PingpongPaddle.constrainPosition(targetPos, bounds, this.radius)
    this.group.position.copy(targetPos)
    this.applyStableRotation(desiredRotation, delta, limits)
  }
}
