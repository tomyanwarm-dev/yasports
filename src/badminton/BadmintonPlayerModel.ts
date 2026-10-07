import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

/** Public paths of the assets, served from public/models by Vite. */
export const BADMINTON_PLAYER_URL = '/models/BadmintonPlayer.glb'
export const BADMINTON_PLAYER_RED_URL = '/models/BadmintonPlayerRed.glb'

/** Node names inside the GLB. */
const RIGHT_HAND_NODE = 'RightHand'
const LEFT_HAND_NODE = 'LeftHand'
const RACKET_NODE = 'BadmintonRacket'

const FALLBACK_CLIP = 'Idle'

export type PlayerClip = 'Ready' | 'Idle'

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

  /** Plays a clip by name, crossfading out whatever is running. */
  play(name: PlayerClip): void {
    const action = this.resolveAction(name)
    if (!action || action === this.current) return

    if (this.current && this.current.isRunning()) {
      this.current.fadeOut(0.25)
    }

    action.reset()
    action.setEffectiveWeight(1)
    action.play()
    this.current = action
    this.currentName = name
  }

  /** Advances this player's animation. Call once per frame with delta time. */
  update(delta: number): void {
    this.mixer.update(delta)
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

  hasClip(name: string): boolean {
    return this.actions.has(name)
  }

  get clipNames(): string[] {
    return [...this.actions.keys()]
  }

  get playingClip(): string | null {
    return this.currentName
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