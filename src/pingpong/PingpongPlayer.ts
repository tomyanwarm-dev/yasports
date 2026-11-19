import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

/**
 * Ping Pong player character: rigged glTF model (skeleton `Player_Skeleton`,
 * clips `Idle`/`Ready`/`Forehand`) with per-instance skeletons via
 * `SkeletonUtils.clone`, per-instance `AnimationMixer`, hand attach points
 * (`R_Hand_Attach` / `L_Hand_Attach`) and an NPC mohawk head.
 *
 * Low-poly meshes stay in place as fallback until the glTF is ready or if the
 * load fails; when glTF is ready it takes over the main `group`.
 */

const PLAYER_MODEL_URL = '/models/pemain_pingpong_rigged.glb'
/** Model 3D karakter musuh (versi jersey putih): dipakai oleh NPC. */
const NPC_MODEL_URL = '/models/pemain_pingpong_jersey_putih_mohawk.glb'
/** Faktor pengurangan tinggi glTF terhadap fallback: lebih kecil agar bat tidak terlihat terlalu besar saat dipegang. */
const PLAYER_HEIGHT_FACTOR = 0.95

type SwingClipName = 'Idle' | 'Ready' | 'Forehand'
type PlayerHand = 'right' | 'left'

interface PlayerAsset {
  scene: THREE.Group
  clips: THREE.AnimationClip[]
}

const playerAssetPromises = new Map<string, Promise<PlayerAsset>>()

/** One GLB per page load; each player clones it with SkeletonUtils so rigs don't share. */
function loadPlayerAsset(url: string): Promise<PlayerAsset> {
  const cached = playerAssetPromises.get(url)
  if (cached) return cached
  const promise = new Promise<PlayerAsset>((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => resolve({ scene: gltf.scene, clips: gltf.animations }),
      undefined,
      (error) => reject(error),
    )
  })
  playerAssetPromises.set(url, promise)
  return promise
}

export class PingpongPlayer {
  readonly group = new THREE.Group()
  readonly rightArm = new THREE.Group()
  readonly leftArm = new THREE.Group()
  readonly headGroup = new THREE.Group()
  private rightUpperArm!: THREE.Mesh
  private rightForearm!: THREE.Mesh
  private torsoMesh!: THREE.Mesh
  private readonly fallbackGroup = new THREE.Group()

  readonly isNPC: boolean

  private mixer: THREE.AnimationMixer | null = null
  private actions = new Map<string, THREE.AnimationAction>()
  private currentAction: THREE.AnimationAction | null = null
  private currentName: SwingClipName | null = null

  private gltfRoot: THREE.Object3D | null = null
  private hasGltf = false
  private rightAttachNode: THREE.Object3D | null = null
  private leftAttachNode: THREE.Object3D | null = null
  private readonly modelUrl: string
  private paddleGroup: THREE.Group | null = null
  private paddleHand: PlayerHand = 'right'
  private paddlePositionOffset = new THREE.Vector3()
  private readonly paddleRotationOffset = new THREE.Euler(0, 0, 0)
  private readonly paddleRotationOffsetQuat = new THREE.Quaternion(0, 0, 0, 1)
  private loadPromise: Promise<void> | null = null
  private mohawkMeshes: THREE.Mesh[] = []
  private mohawkMaterial: THREE.Material | null = null
  private mohawkGeometry: THREE.ConeGeometry | null = null

  constructor(color: number, isNPC: boolean = false) {
    this.isNPC = isNPC
    this.modelUrl = isNPC ? NPC_MODEL_URL : PLAYER_MODEL_URL

    this.fallbackGroup.add(
      this.createLegs(),
      this.createTorso(color),
      this.createLeftArm(),
      this.createRightArm(),
      this.createHead(),
    )
    this.group.add(this.fallbackGroup)

    if (isNPC) {
      // NPC faces toward Player 1 (positive Z)
      this.group.rotation.y = 0
    } else {
      // Player 1 faces toward NPC (negative Z)
      this.group.rotation.y = Math.PI
    }

    // glTF loads async: fallback stays until the rigged model is ready.
    void this.loadModels()
  }

  /** True when the rigged glTF model replaced the fallback (also on load failure: false). */
  get isModelReady(): boolean {
    return this.hasGltf
  }

  /** Loads the rigged player model and activates animations + attach points. Idempotent. */
  loadModels(): Promise<void> {
    this.loadPromise ??= this.doLoadModels()
    return this.loadPromise
  }

  private async doLoadModels(): Promise<void> {
    try {
      const asset = await loadPlayerAsset(this.modelUrl)
      const root = cloneSkeleton(asset.scene as THREE.Object3D) as THREE.Group

      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true
          obj.receiveShadow = false
        }
      })

      // Skala: padankan tinggi glTF dengan low-poly fallback, lalu kecilkan sedikit
      // agar bat yang dipegang tetap terlihat pas ukurannya.
      const fallbackSize = new THREE.Box3().setFromObject(this.fallbackGroup).getSize(new THREE.Vector3())
      const gltfSize = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3())
      if (gltfSize.y > 0) root.scale.setScalar((fallbackSize.y / gltfSize.y) * PLAYER_HEIGHT_FACTOR)

      this.gltfRoot = root
      this.hasGltf = true

      // glTF takes over; fallbackGroup stays mounted but is hidden.
      this.fallbackGroup.visible = false
      this.group.add(root)

      this.findAttachNodes(root)
      this.createMixerActions(asset.clips)
      this.attachMohawk()
      this.attachPaddle(this.paddleGroup, this.paddleHand)
    } catch (error) {
      // glTF failed: fallback low-poly remains in use.
      console.error('PingpongPlayer: gagal memuat model glTF:', error)
    }
  }

  /** Attach a paddle group to the glTF hand attach point. Returns true when attached. */
  attachPaddle(
    paddleGroup: THREE.Group | null,
    hand: PlayerHand = 'right',
    options?: { positionOffset?: THREE.Vector3; rotationOffset?: THREE.Euler },
  ): boolean {
    this.paddleGroup = paddleGroup
    this.paddleHand = hand
    if (options?.positionOffset) this.paddlePositionOffset.copy(options.positionOffset)
    if (options?.rotationOffset) {
      this.paddleRotationOffset.copy(options.rotationOffset)
      this.paddleRotationOffsetQuat.setFromEuler(this.paddleRotationOffset, false)
    }

    if (!this.hasGltf || !paddleGroup) return false

    const attach = hand === 'right' ? this.rightAttachNode : this.leftAttachNode
    if (!attach) return false

    if (paddleGroup.parent && paddleGroup.parent !== attach) paddleGroup.parent.remove(paddleGroup)
    if (!paddleGroup.parent) attach.add(paddleGroup)
    // Kalibrasi offset bawaan: nyatakan di attach node local space.
    paddleGroup.position.copy(this.paddlePositionOffset)
    paddleGroup.quaternion.copy(this.paddleRotationOffsetQuat)
    return true
  }

  /** Kalibrasi posisi bet terhadap attach point (dari attaches satu arah dengan pemain). */
  setPaddleCalibration(positionOffset?: THREE.Vector3, rotationOffset?: THREE.Euler): void {
    if (positionOffset) this.paddlePositionOffset.copy(positionOffset)
    if (rotationOffset) {
      this.paddleRotationOffset.copy(rotationOffset)
      this.paddleRotationOffsetQuat.setFromEuler(this.paddleRotationOffset, false)
    }
    if (this.paddleGroup) {
      this.paddleGroup.position.copy(this.paddlePositionOffset)
      this.paddleGroup.quaternion.copy(this.paddleRotationOffsetQuat)
    }
  }

  /**
   * Set the absolute WORLD pose of an attached paddle (Arena resolves the
   * desired world pose from its own input/NPC logic every frame).
   * Offset posisi/rotasi digabungkan dengan `pos/quat` yang diberikan Arena
   * sehingga bisa dikalibrasi tanpa mengubah logika Arena.
   */
  applyPaddleWorldPose(pos: THREE.Vector3, quat: THREE.Quaternion): boolean {
    const group = this.paddleGroup
    if (!group || !group.parent) return false

    group.parent.updateWorldMatrix(true, true)

    const rotatedOffset = new THREE.Vector3()
      .copy(this.paddlePositionOffset)
      .applyQuaternion(quat)
    const worldPos = new THREE.Vector3().copy(pos).add(rotatedOffset)
    const worldQuat = new THREE.Quaternion().copy(quat).multiply(this.paddleRotationOffsetQuat)

    const desired = new THREE.Matrix4().compose(worldPos, worldQuat, new THREE.Vector3(1, 1, 1))
    const local = new THREE.Matrix4().copy(group.parent.matrixWorld).invert().multiply(desired)
    local.decompose(group.position, group.quaternion, group.scale)
    group.updateMatrix()
    return true
  }

  /** Plays a clip by name, cross-fading out whatever is running. */
  playAnimation(name: SwingClipName, fadeDuration = 0.15): void {
    const action = this.resolveAction(name)
    if (!action || action === this.currentAction) return

    if (this.currentAction && this.currentAction.isRunning()) {
      this.currentAction.fadeOut(fadeDuration)
    }
    action.reset()
    action.setEffectiveWeight(1)
    action.play()
    this.currentAction = action
    this.currentName = name
  }

  /** Advance animations; call once per frame with delta (seconds). */
  update(delta: number): void {
    if (!this.mixer) return
    this.mixer.update(delta)
  }

  /**
   * Swing right arm forward for a strike.
   * With glTF: triggers `Forehand` (LoopOnce) when progress > 0.1 and returns to
   * `Ready` when progress <= 0.02 while the previous clip was `Forehand`.
   * Without glTF (fallback): rotates the right arm toward +Z, as before.
   */
  setSwingProgress(progress: number): void {
    if (!this.hasGltf) {
      const angle = progress * Math.PI * 0.45
      this.rightArm.rotation.x = -angle
      this.rightArm.rotation.y = progress * 0.3
      return
    }
    if (progress > 0.1 && this.currentName !== 'Forehand') {
      this.playAnimation('Forehand', 0.1)
    } else if (progress <= 0.02 && this.currentName === 'Forehand') {
      this.playAnimation('Ready', 0.25)
    }
  }

  private findAttachNodes(root: THREE.Object3D): void {
    this.rightAttachNode = root.getObjectByName('R_Hand_Attach') ?? null
    this.leftAttachNode = root.getObjectByName('L_Hand_Attach') ?? null
  }

  private createMixerActions(clips: THREE.AnimationClip[]): void {
    const root = this.gltfRoot
    if (!root) return

    this.mixer = new THREE.AnimationMixer(root)
    for (const clip of clips) {
      const action = this.mixer.clipAction(clip)
      action.enabled = true
      if (clip.name === 'Forehand') {
        action.setLoop(THREE.LoopOnce, 1)
        action.clampWhenFinished = true
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity)
      }
      this.actions.set(clip.name, action)
    }
  }

  private resolveAction(name: SwingClipName): THREE.AnimationAction | null {
    const exact = this.actions.get(name)
    if (exact) return exact
    // Graceful fallbacks if the model uses different clip names.
    if (name === 'Forehand') return this.actions.get('Ready') ?? this.actions.get('Idle') ?? null
    if (name === 'Ready') return this.actions.get('Idle') ?? this.actions.get('Forehand') ?? null
    return this.actions.get('Ready') ?? this.actions.get('Idle') ?? null
  }

  /** Mohawk: alternating spike row above the Head bone of the NPC. */
  private attachMohawk(): void {
    this.removeMohawk()
    if (!this.isNPC) return

    const head = this.gltfRoot
      ? this.gltfRoot.getObjectByName('Head') ?? this.headGroup
      : this.headGroup
    if (!head) return

    const material = new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.2, metalness: 0.05 })
    this.mohawkMaterial = material
    this.mohawkGeometry = new THREE.ConeGeometry(0.024, 0.09, 4)

    const spikes = 6
    for (let i = 0; i < spikes; i++) {
      const spike = new THREE.Mesh(this.mohawkGeometry, material)
      const j = i - (spikes - 1) / 2
      spike.position.set(j * 0.05, 0.05 + i * 0.012, 0.02)
      spike.rotation.y = i % 2 === 0 ? 0.25 : -0.25
      spike.castShadow = true
      head.add(spike)
      this.mohawkMeshes.push(spike)
    }
  }

  private removeMohawk(): void {
    for (const spike of this.mohawkMeshes) spike.parent?.remove(spike)
    this.mohawkMeshes = []
    this.mohawkMaterial?.dispose()
    this.mohawkMaterial = null
    this.mohawkGeometry?.dispose()
    this.mohawkGeometry = null
  }

  // --- Low-poly fallback (tetap ada selam glTF belum siap/gagal dimuat) ---

  private createLegs(): THREE.Group {
    const legs = new THREE.Group()
    const shortsMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })

    for (const sign of [-1, 1]) {
      const legGroup = new THREE.Group()

      // Shorts
      const short = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.28, 10),
        shortsMaterial,
      )
      short.position.set(sign * 0.12, 0.68, 0)
      short.castShadow = true
      legs.add(short)

      // Leg skin
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.055, 0.55, 10),
        skinMaterial,
      )
      leg.position.set(sign * 0.12, 0.32, 0)
      leg.castShadow = true
      legs.add(leg)

      // Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.07, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 }),
      )
      shoe.position.set(sign * 0.12, 0.035, 0.03)
      shoe.castShadow = true
      legs.add(shoe)
    }

    return legs
  }

  private createTorso(color: number): THREE.Mesh {
    this.torsoMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.44, 6, 14),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    )
    this.torsoMesh.position.y = 1.12
    this.torsoMesh.castShadow = true
    return this.torsoMesh
  }

  private createLeftArm(): THREE.Group {
    const material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.045, 0.42, 4, 10),
      material,
    )
    arm.position.set(-0.23, 1.08, 0)
    arm.rotation.z = -0.2
    arm.castShadow = true
    this.leftArm.add(arm)
    return this.leftArm
  }

  private createRightArm(): THREE.Group {
    this.rightArm.position.set(0.2, 1.25, 0)
    const material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })

    // Upper arm
    this.rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.25, 8),
      material,
    )
    this.rightUpperArm.position.set(0.05, -0.1, 0.08)
    this.rightUpperArm.rotation.x = -Math.PI / 4
    this.rightUpperArm.castShadow = true
    this.rightArm.add(this.rightUpperArm)

    // Forearm extending forward ready to hold paddle
    this.rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.035, 0.25, 8),
      material,
    )
    this.rightForearm.position.set(0.08, -0.18, 0.22)
    this.rightForearm.rotation.x = -Math.PI / 2.2
    this.rightForearm.castShadow = true
    this.rightArm.add(this.rightForearm)

    return this.rightArm
  }

  private createHead(): THREE.Group {
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 14),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    skull.castShadow = true
    this.headGroup.add(skull)

    // Headband
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.015, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }),
    )
    headband.rotation.x = Math.PI / 2
    headband.position.y = 0.03
    this.headGroup.add(headband)

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    )
    neck.position.y = -0.13
    this.headGroup.add(neck)

    this.headGroup.position.y = 1.54
    return this.headGroup
  }
}
