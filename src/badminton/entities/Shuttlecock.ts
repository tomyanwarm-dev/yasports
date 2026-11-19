import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/** Public path of the shuttlecock asset (Tahap 2.4), served by Vite. */
export const BADMINTON_SHUTTLECOCK_URL =
  '/models/badminton/equipment/BadmintonShuttlecock.glb'

/**
 * Skala visual GLB. Audit GLB (Tahap 2.4): panjang model 0.0710 m sepanjang
 * sumbu Y; spesifikasi shuttlecock game (dan model prosedural lama) 0.085 m.
 * 0.085 / 0.0710 = 1.196 -> 1.2, sehingga ukuran visual identik dengan
 * shuttlecock lama: natural dibanding tangan (~0.1 m) dan raket (~0.67 m).
 */
const SHUTTLE_MODEL_SCALE = 1.2

/** Real shuttlecock size in metres: 0.085 long, 0.065 skirt diameter. */
const TOTAL_LENGTH = 0.085
const HALF_LENGTH = TOTAL_LENGTH / 2
const SKIRT_RADIUS = 0.0325
const CORK_RADIUS = 0.013
const FEATHER_COUNT = 8

const UP = new THREE.Vector3(0, 1, 0)
const FORWARD = new THREE.Vector3()

/**
 * Shuttlecock visual. Sejak Tahap 2.4 memakai model GLB
 * (BadmintonShuttlecock.glb) menggantikan visual prosedural.
 *
 * Audit GLB (headless, Node + GLTFLoader):
 *   - 56 node, 24 mesh, tanpa texture (material warna datar phong/lambert).
 *   - Sumbu memanjang Y = 0.0710 m; cork di -Y (bawah), bulu di +Y (atas)
 *     -> konvensi sama persis dengan model prosedural ("-Y = cork"), sehingga
 *     logika orientasi lama tetap dipakai tanpa koreksi.
 *   - Origin model di (0,0,0) tetapi geometri tergeser (pusat ~ +0.0251 Y);
 *     pusat ulang dilakukan lewat holder agar pivot = titik physics.
 *
 * Selama GLB belum termuat, visual prosedural dipakai sebagai fallback;
 * jika GLB gagal dimuat, error diagnostik ditampilkan dan fallback tetap
 * dipakai (tidak dianggap sukses secara diam-diam).
 *
 * This class owns look and transform only. Flight behaviour lives in
 * BadmintonShuttlecockPhysics, so rendering stays independent of simulation.
 */
export class BadmintonShuttlecock {
  readonly group = new THREE.Group()

  private readonly body = new THREE.Group()
  /** Visual prosedural: fallback sampai GLB termuat (lalu dihapus dari body). */
  private readonly procedural: THREE.Group
  /** Visual GLB (null selama loading atau bila loading gagal). */
  private glbVisual: THREE.Group | null = null
  private readonly targetQuaternion = new THREE.Quaternion()
  private velocity = new THREE.Vector3()

  constructor(parent?: THREE.Object3D) {
    this.group.name = 'shuttlecock'
    this.group.add(this.body)

    this.procedural = new THREE.Group()
    this.procedural.name = 'shuttlecock-procedural'
    this.procedural.add(
      this.createCork(),
      this.createCollar(),
      this.createSkirt(),
      this.createFeathers(),
      this.createTipRing(),
    )
    this.body.add(this.procedural)

    this.loadGlbVisual()
    parent?.add(this.group)
  }

  setPosition(position: THREE.Vector3): void {
    this.group.position.copy(position)
  }

  getPosition(): THREE.Vector3 {
    return this.group.position
  }

  setVelocity(velocity: THREE.Vector3): void {
    this.velocity.copy(velocity)
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity
  }

  /**
   * Orients the shuttlecock cork-first along its flight direction, like a real
   * shuttle falling. Rotation is smoothed so a nearly zero velocity does not
   * produce jitter.
   */
  update(delta: number): void {
    const speed = this.velocity.length()
    if (speed < 0.05) {
      this.body.quaternion.slerp(IDENTITY, Math.min(delta * 4, 1))
      return
    }

    // Local -Y points at the cork, so up must oppose the travel direction.
    // GLB juga ber-cork di -Y, jadi rumus ini berlaku untuk kedua visual.
    FORWARD.copy(this.velocity).normalize().negate()
    this.targetQuaternion.setFromUnitVectors(UP, FORWARD)
    this.body.quaternion.slerp(this.targetQuaternion, Math.min(delta * 12, 1))
  }

  /** Puts the shuttlecock back at rest: upright, cork down, no motion. */
  reset(position: THREE.Vector3): void {
    this.setPosition(position)
    this.setVelocity(ZERO)
    this.body.quaternion.identity()
  }

  dispose(): void {
    this.group.removeFromParent()
    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose()
    })
  }

  /**
   * Memuat visual GLB satu kali. Sukses: prosedural dihapus, GLB dipusatkan
   * ulang pada pivot dan diskalakan. Gagal: error diagnostik keras, fallback
   * prosedural dipertahankan.
   */
  private loadGlbVisual(): void {
    new GLTFLoader().load(
      BADMINTON_SHUTTLECOCK_URL,
      (gltf) => {
        if (this.glbVisual) return // satu shuttlecock GLB saja
        const source = gltf.scene as THREE.Group

        const box = new THREE.Box3().setFromObject(source)
        const center = box.getCenter(new THREE.Vector3())
        const dims = box.getSize(new THREE.Vector3())

        // Pusatkan ulang pivot: geometri GLB tidak berpusat di (0,0,0).
        const holder = new THREE.Group()
        holder.name = 'shuttlecock-glb'
        holder.position.set(-center.x, -center.y, -center.z)
        holder.scale.setScalar(SHUTTLE_MODEL_SCALE)
        holder.add(source)

        let meshCount = 0
        source.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            meshCount++
          }
        })

        this.body.add(holder)
        this.procedural.removeFromParent()
        this.glbVisual = holder

        console.info(
          `[BADMINTON-DIAG] shuttlecock: GLB loaded url=${BADMINTON_SHUTTLECOCK_URL}, meshes=${meshCount}, dims=(${dims.x.toFixed(4)},${dims.y.toFixed(4)},${dims.z.toFixed(4)}) x${SHUTTLE_MODEL_SCALE}, center=((${center.x.toFixed(4)},${center.y.toFixed(4)},${center.z.toFixed(4)})) dipusatkan, orientasi cork=-Y (bawah) bulu=+Y (atas)`
        )
      },
      undefined,
      (error) => {
        console.error(
          `[BADMINTON-DIAG] shuttlecock: GAGAL memuat GLB url=${BADMINTON_SHUTTLECOCK_URL} — fallback visual prosedural tetap dipakai`,
          error,
        )
      },
    )
  }

  private createCork(): THREE.Mesh {
    const cork = new THREE.Mesh(
      new THREE.SphereGeometry(CORK_RADIUS, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }),
    )
    cork.scale.set(1, 1.3, 1)
    cork.position.y = -HALF_LENGTH + CORK_RADIUS * 1.3
    cork.castShadow = true
    return cork
  }

  private createCollar(): THREE.Mesh {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(CORK_RADIUS * 1.1, CORK_RADIUS * 1.5, 0.006, 14),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.25 }),
    )
    collar.position.y = -HALF_LENGTH + CORK_RADIUS * 2.6
    return collar
  }

  private createSkirt(): THREE.Mesh {
    const height = HALF_LENGTH - CORK_RADIUS * 2.6
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(SKIRT_RADIUS * 0.45, SKIRT_RADIUS, height, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7,
        emissive: 0x64748b,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
      }),
    )
    skirt.position.y = -HALF_LENGTH + CORK_RADIUS * 2.6 + height / 2
    skirt.castShadow = true
    return skirt
  }

  /** A few flat feathers to read as a feather skirt without heavy geometry. */
  private createFeathers(): THREE.Group {
    const feathers = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.75,
      side: THREE.DoubleSide,
    })
    const height = HALF_LENGTH - CORK_RADIUS * 2.6

    for (let i = 0; i < FEATHER_COUNT; i++) {
      const angle = (i / FEATHER_COUNT) * Math.PI * 2
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.013, height * 0.9), material)
      const radius = SKIRT_RADIUS * 0.66
      feather.position.set(
        Math.cos(angle) * radius,
        -HALF_LENGTH + CORK_RADIUS * 2.6 + height * 0.5,
        Math.sin(angle) * radius,
      )
      feather.rotation.y = -angle
      feather.rotation.x = -0.12
      feathers.add(feather)
    }

    return feathers
  }

  private createTipRing(): THREE.Mesh {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(SKIRT_RADIUS * 0.92, 0.0025, 6, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = HALF_LENGTH - 0.002
    return ring
  }
}

const IDENTITY = new THREE.Quaternion()
const ZERO = new THREE.Vector3()
