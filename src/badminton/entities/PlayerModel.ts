import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

/** Public paths of the assets, served from public/models by Vite (Tahap 2.3). */
export const BADMINTON_PLAYER_URL = '/models/badminton/players/BadmintonPlayer_Animated_2_10.glb'
export const BADMINTON_PLAYER_RED_URL = '/models/badminton/players/BadmintonPlayerRed_Animated_2_10.glb'

/** Node names inside the GLB. */
const RIGHT_HAND_NODE = 'RightHand'
const LEFT_HAND_NODE = 'LeftHand'
const RACKET_NODE = 'BadmintonRacket'

const FALLBACK_CLIP = 'Idle'

/** The 26 animation clips shipped with BadmintonPlayer_Animated.glb / BadmintonPlayerRed_Animated.glb. */
export type PlayerClip =
  | 'Idle'
  | 'Ready'
  | 'DefensiveReady'
  | 'SplitStep'
  | 'WalkForward'
  | 'WalkBackward'
  | 'ShuffleLeft'
  | 'ShuffleRight'
  | 'LungeForehand'
  | 'LungeBackhand'
  | 'Recovery'
  | 'Jump'
  | 'Landing'
  | 'ServeShort'
  | 'ServeLong'
  | 'ForehandClear'
  | 'BackhandClear'
  | 'Smash'
  | 'JumpSmash'
  | 'DropShot'
  | 'ForehandDrive'
  | 'BackhandDrive'
  | 'NetShot'
  | 'NetKill'
  | 'DefensiveBlock'
  | 'Lift'

/** One-shot strokes / serves: played once, then the model returns to Ready. */
const ONE_SHOT_CLIPS = new Set<PlayerClip>([
  'ServeShort',
  'ServeLong',
  'ForehandClear',
  'BackhandClear',
  'Smash',
  'JumpSmash',
  'DropShot',
  'ForehandDrive',
  'BackhandDrive',
  'NetShot',
  'NetKill',
  'DefensiveBlock',
  'Lift',
])

/** Looping movement / stance clips. */
const LOOP_CLIPS = new Set<PlayerClip>([
  'Idle',
  'Ready',
  'DefensiveReady',
  'SplitStep',
  'WalkForward',
  'WalkBackward',
  'ShuffleLeft',
  'ShuffleRight',
  'LungeForehand',
  'LungeBackhand',
  'Recovery',
  'Jump',
  'Landing',
])

const REST_CLIP = 'Ready'

interface PlayerAsset {
  source: THREE.Group
  clips: THREE.AnimationClip[]
}

/** One entry per GLB: every file is fetched at most once per page load. */
const assetPromises = new Map<string, Promise<PlayerAsset>>()
const resolvedAssets = new Map<string, PlayerAsset>()

function loadAsset(url: string): Promise<PlayerAsset> {
  const cached = assetPromises.get(url)
  if (cached) return cached

  const promise = new Promise<PlayerAsset>((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => {
        resolvedAssets.set(url, { source: gltf.scene, clips: gltf.animations })
        resolve(resolvedAssets.get(url) as PlayerAsset)
      },
      undefined,
      (error) => reject(error),
    )
  })

  assetPromises.set(url, promise)
  return promise
}

/**
 * Crossfade used when a swing takes over from the resting clip. Kept short so
 * the swing reads as one clear motion instead of a slow blend into the stance.
 */
const SWING_FADE = 0.06

/**
 * Badminton player backed by a GLB from public/models: skinned mesh, 22 bones
 * and a racket bound to the right hand.
 *
 * Two variants exist, each its own file and its own skeleton:
 *   BADMINTON_PLAYER_URL      -> blue jersey
 *   BADMINTON_PLAYER_RED_URL  -> red jersey
 *
 * Scope is deliberately narrow: loading, cloning, animation playback and node
 * access. Gameplay, physics and hand tracking stay outside this class.
 */
export class BadmintonPlayerModel {
  readonly group = new THREE.Group()

  private mixer: THREE.AnimationMixer
  private actions = new Map<string, THREE.AnimationAction>()
  private current: THREE.AnimationAction | null = null
  private currentName: string | null = null
  private swingActive = false

  private constructor(
    root: THREE.Object3D,
    clips: THREE.AnimationClip[],
    private url: string,
  ) {
    this.group.add(root)
    this.mixer = new THREE.AnimationMixer(root)

    for (const clip of clips) {
      const action = this.mixer.clipAction(clip)
      action.enabled = true
      action.setLoop(THREE.LoopRepeat, Infinity)
      this.actions.set(clip.name, action)
    }

    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }

  /** Loads one GLB (once per url) and returns a player instance for it. */
  static async load(url: string = BADMINTON_PLAYER_URL): Promise<BadmintonPlayerModel> {
    const asset = await loadAsset(url)
    return new BadmintonPlayerModel(asset.source, asset.clips, url)
  }

  /**
   * Builds another player from this variant's already loaded asset. Uses
   * SkeletonUtils so bone bindings stay valid, and creates a separate
   * AnimationMixer for the new skeleton.
   */
  createClone(): BadmintonPlayerModel {
    const asset = resolvedAssets.get(this.url)
    if (!asset) {
      throw new Error(`${this.url} belum selesai dimuat`)
    }
    const root = cloneSkeleton(asset.source)
    return new BadmintonPlayerModel(root, asset.clips, this.url)
  }

  /** Lepaskan aksi sebelumnya sebelum memutar klip berikutnya. */
  private releaseCurrent(): void {
    const current = this.current
    if (!current) return
    if (current.isRunning()) {
      current.fadeOut(SWING_FADE)
      return
    }
    // One-shot dengan clampWhenFinished tetap terikat di mixer dengan bobot
    // penuh setelah selesai. stop() melepaskannya agar pose beku itu tidak
    // bercampur dengan klip berikutnya (penyebab raket servis tidak sampai).
    current.stop()
  }

  /** Plays a resting clip by name, crossfading out whatever is running. */
  play(name: PlayerClip): void {
    const action = this.resolveAction(name)
    if (!action || action === this.current) return

    this.releaseCurrent()

    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.clampWhenFinished = false
    action.setEffectiveWeight(1)
    action.play()
    this.current = action
    this.currentName = name
    this.swingActive = false
  }

  /**
   * Plays a one-shot stroke / serve clip (e.g. ForehandClear, ServeLong, Smash).
   * It plays a single time and then returns to the resting clip, so Ready and
   * Idle are never left in a broken state.
   */
  playSwing(name: PlayerClip): boolean {
    // Unknown clip names fall back to a resting clip instead of breaking.
    if (!ONE_SHOT_CLIPS.has(name)) {
      this.play(name)
      return false
    }

    const action = this.resolveAction(name)
    if (!action || action === this.current) return false

    this.releaseCurrent()

    // The clip drives every bone it tracks (66 tracks over all 22 bones), so the
    // swing comes from the model itself rather than from moving the racket.
    // Starting from a zero weight would show the old pose for the first few
    // frames, so the swing starts at full weight and the stance is faded out.
    action.reset()
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.setEffectiveWeight(1)
    action.play()

    this.current = action
    this.currentName = name
    this.swingActive = true
    return true
  }

  /** Advances this player's animation. Call once per frame with delta time. */
  update(delta: number): void {
    this.mixer.update(delta)

    if (this.swingActive && this.current) {
      const duration = this.current.getClip().duration
      if (!this.current.isRunning() || this.current.time >= duration) {
        this.swingActive = false
        this.play(REST_CLIP)
      }
    }
  }

  dispose(): void {
    this.mixer.stopAllAction()
    this.mixer.uncacheRoot(this.group)
  }

  getRightHand(): THREE.Object3D | null {
    return this.group.getObjectByName(RIGHT_HAND_NODE) ?? null
  }

  getLeftHand(): THREE.Object3D | null {
    return this.group.getObjectByName(LEFT_HAND_NODE) ?? null
  }

  getRacket(): THREE.Object3D | null {
    return this.group.getObjectByName(RACKET_NODE) ?? null
  }

  /** Duration of a clip in seconds, or 0 when the clip is not available. */
  clipDuration(clip: PlayerClip): number {
    return this.actions.get(clip)?.getClip().duration ?? 0
  }

  hasClip(name: string): boolean {
    return this.actions.has(name)
  }

  get clipNames(): string[] {
    return [...this.actions.keys()]
  }

  get playingClip(): string | null {
    return this.currentName
  }

  /** Current one-shot action time, exposed for bounded badminton diagnostics. */
  get playingClipTime(): number {
    return this.current?.time ?? 0
  }

  get playingClipTimeScale(): number {
    return this.current?.getEffectiveTimeScale() ?? 1
  }

  /** Evaluate the current clip at an intermediate pose, then restore its live pose. */
  withCurrentClipAtTime<T>(time: number, inspect: () => T): T {
    const action = this.current
    if (!action) return inspect()
    const liveTime = action.time
    action.time = THREE.MathUtils.clamp(time, 0, action.getClip().duration)
    this.mixer.update(0)
    this.group.updateMatrixWorld(true)
    try {
      return inspect()
    } finally {
      action.time = liveTime
      this.mixer.update(0)
      this.group.updateMatrixWorld(true)
    }
  }

  private resolveAction(name: string): THREE.AnimationAction | null {
    return (
      this.actions.get(name) ??
      this.actions.get(FALLBACK_CLIP) ??
      this.actions.values().next().value ??
      null
    )
  }
}
