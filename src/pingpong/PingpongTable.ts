import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/** Regulation-inspired dimensions in metres; X = width, Z = table length. */
export const TABLE_WIDTH = 1.525
export const TABLE_LENGTH = 2.74
export const TABLE_HEIGHT = 0.76

const TABLE_MODEL_URL = '/models/low_poly_table_tennis.glb'
let tableGltfPromise: Promise<THREE.Group> | null = null

function loadTableModel(): Promise<THREE.Group> {
  if (!tableGltfPromise) {
    tableGltfPromise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        TABLE_MODEL_URL,
        (gltf) => resolve(gltf.scene),
        undefined,
        reject,
      )
    })
  }
  return tableGltfPromise
}

/** The central table loaded from GLB model, fitted to gameplay dimensions. */
export class PingpongTable {
  readonly group = new THREE.Group()

  constructor() {
    loadTableModel()
      .then((scene) => {
        const model = scene.clone(true)
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        if (size.x > 0 && size.y > 0 && size.z > 0) {
          const sx = TABLE_WIDTH / size.x
          const sz = TABLE_LENGTH / size.z
          // Fit X/Z to regulation size and use the same horizontal scale for height to preserve proportions.
          model.scale.set(sx, sx, sz)

          const scaledBox = new THREE.Box3().setFromObject(model)
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
          const scaledMaxY = scaledBox.max.y

          model.position.x += -scaledCenter.x
          model.position.z += -scaledCenter.z
          // Align model's top surface to the gameplay table height.
          model.position.y += TABLE_HEIGHT - scaledMaxY
        } else {
          model.position.set(0, 0, 0)
        }

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
        console.error('Failed to load ping pong table model:', err)
      })
  }
}
