import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/** Public path of the pro racket asset (Tahap 2.6B), served by Vite. */
export const BADMINTON_RACKET_PRO_URL =
  '/models/badminton/equipment/BadmintonRacket_Pro_Ready.glb'

/**
 * Cache loader: GLB raket Pro hanya di-fetch satu kali per halaman walau
 * dipakai dua pemain. Geometri & material di-share dari sumber cache;
 * instance pemain TIDAK boleh dispose resource bersama ini.
 */
let racketProPromise: Promise<THREE.Group> | null = null

export function loadRacketPro(): Promise<THREE.Group> {
  if (racketProPromise) return racketProPromise

  racketProPromise = new Promise<THREE.Group>((resolve, reject) => {
    new GLTFLoader().load(
      BADMINTON_RACKET_PRO_URL,
      (gltf) => {
        const source = gltf.scene as THREE.Group
        // Validasi node sebelum dipakai (wajib ada dan tidak duplikat).
        const root = source.getObjectByName('BadmintonRacket')
        const frame = source.getObjectByName('RacketFrame')
        if (!root || !frame) {
          const err = new Error(
            `BadmintonRacket/RacketFrame tidak ditemukan di ${BADMINTON_RACKET_PRO_URL}`,
          )
          console.error(`[BADMINTON-DIAG] racketPro: cache loader GAGAL validasi node — ${err.message}`)
          racketProPromise = null
          reject(err)
          return
        }
        console.info(
          `[BADMINTON-DIAG] racketPro: cache loader sukses url=${BADMINTON_RACKET_PRO_URL} (satu kali per halaman), root="BadmintonRacket", node "RacketFrame" valid`,
        )
        resolve(source)
      },
      undefined,
      (error) => {
        console.error(
          `[BADMINTON-DIAG] racketPro: GAGAL memuat GLB url=${BADMINTON_RACKET_PRO_URL} — raket bawaan pemain dipertahankan`,
          error,
        )
        racketProPromise = null
        reject(error)
      },
    )
  })

  return racketProPromise
}

export interface RacketAttachResult {
  ok: boolean
  /** Alasan kegagalan ('' saat ok). */
  reason: string
  /** World position node RacketFrame setelah pemasangan. */
  frameWorld: THREE.Vector3 | null
}

const FAIL = (reason: string): RacketAttachResult => ({
  ok: false,
  reason,
  frameWorld: null,
})

/**
 * Mengganti raket bawaan satu pemain dengan klon Racket Pro.
 *
 * Urutan aman (audit Tahap 2.6A):
 *  1. clone + validasi model BARU lebih dulu — bila gagal, raket lama utuh.
 *  2. simpan transform lokal raket lama (runtime aktual, bukan angka laporan).
 *  3. lepas sub-tree lama, pasang root baru sebagai child RightHand dengan
 *     transform lokal lama -> world pos RacketFrame identik dengan sebelumnya.
 *  4. bila pemasangan melempar error, raket lama dikembalikan.
 *
 * Aman terhadap animasi: tidak ada track animasi pada node raket lama
 * (audit 2.6A), jadi melepasnya tidak memengaruhi skeleton/klip.
 * Geometri lama TIDAK di-dispose (asset pemain tetap ter-cache utuh).
 */
export function attachRacketProToPlayer(
  label: 'red' | 'blue',
  playerGroup: THREE.Object3D,
  racketSource: THREE.Group,
): RacketAttachResult {
  const rightHand = playerGroup.getObjectByName('RightHand')
  if (!rightHand) {
    console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — node "RightHand" tidak ditemukan`)
    return FAIL('RightHand tidak ditemukan')
  }

  const oldRacket = playerGroup.getObjectByName('BadmintonRacket')
  if (!oldRacket) {
    console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — raket bawaan "BadmintonRacket" tidak ditemukan`)
    return FAIL('raket bawaan tidak ditemukan')
  }

  // 1. Clone + validasi model baru SEBELUM menyentuh raket lama.
  const newRoot = racketSource.clone()
  newRoot.name = 'BadmintonRacket'
  const newFrame = newRoot.getObjectByName('RacketFrame')
  if (!newFrame) {
    console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — klon tanpa node "RacketFrame", raket bawaan dipertahankan`)
    return FAIL('klon tanpa RacketFrame')
  }
  let frameCount = 0
  newRoot.traverse((o) => {
    if (o.name === 'RacketFrame') frameCount++
  })
  if (frameCount !== 1) {
    console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — klon punya ${frameCount} node "RacketFrame", raket bawaan dipertahankan`)
    return FAIL(`klon punya ${frameCount} RacketFrame`)
  }

  // 2. Transform lokal runtime aktual raket lama (relatif RightHand).
  const oldPos = oldRacket.position.clone()
  const oldQuat = oldRacket.quaternion.clone()
  const oldScale = oldRacket.scale.clone()

  // 3. Lepas lama, pasang baru dengan transform yang sama.
  const oldParent = oldRacket.parent ?? rightHand
  oldParent.remove(oldRacket)
  try {
    newRoot.position.copy(oldPos)
    newRoot.quaternion.copy(oldQuat)
    newRoot.scale.copy(oldScale)
    rightHand.add(newRoot)
  } catch (error) {
    // Pulihkan hierarki lama agar pemain tidak pernah tanpa raket.
    rightHand.add(oldRacket)
    oldRacket.position.copy(oldPos)
    oldRacket.quaternion.copy(oldQuat)
    oldRacket.scale.copy(oldScale)
    console.error(
      `[BADMINTON-DIAG] racketPro[${label}]: GAGAL saat pemasangan, raket bawaan dipulihkan`,
      error,
    )
    return FAIL('pemasangan gagal, raket lama dipulihkan')
  }

  // 4. Verifikasi: raket lama hilang, nama tidak duplikat di pemain.
  let rootCount = 0
  let frameInPlayer = 0
  let oldMeshLeft = 0
  playerGroup.traverse((o) => {
    if (o.name === 'BadmintonRacket') rootCount++
    if (o.name === 'RacketFrame') frameInPlayer++
    if (o.name === 'RacketStrings' || o.name === 'RacketShaft' || o.name === 'RacketHandle' || o.name === 'RacketGrip') {
      oldMeshLeft++
    }
  })
  if (rootCount !== 1 || frameInPlayer !== 1 || oldMeshLeft !== 0) {
    console.error(
      `[BADMINTON-DIAG] racketPro[${label}]: hierarki tidak bersih — BadmintonRacket=${rootCount}, RacketFrame=${frameInPlayer}, mesh lama tersisa=${oldMeshLeft}`,
    )
  }

  playerGroup.updateMatrixWorld(true)
  const frameWorld = newFrame.getWorldPosition(new THREE.Vector3())

  const deg = (q: THREE.Quaternion): string => {
    const e = new THREE.Euler().setFromQuaternion(q)
    return `(${((e.x * 180) / Math.PI).toFixed(1)},${((e.y * 180) / Math.PI).toFixed(1)},${((e.z * 180) / Math.PI).toFixed(1)})deg`
  }
  console.info(
    `[BADMINTON-DIAG] racketPro[${label}]: SUKSES — root="BadmintonRacket" child dari "RightHand", RacketFrame=1 node, raket lama terlepas (mesh lama tersisa=${oldMeshLeft}), transform lokal pos=(${oldPos.x.toFixed(4)},${oldPos.y.toFixed(4)},${oldPos.z.toFixed(4)}) rot=${deg(oldQuat)} scale=(${oldScale.x.toFixed(2)},${oldScale.y.toFixed(2)},${oldScale.z.toFixed(2)}), world RacketFrame=(${frameWorld.x.toFixed(4)},${frameWorld.y.toFixed(4)},${frameWorld.z.toFixed(4)})`,
  )

  return { ok: true, reason: '', frameWorld }
}

/**
 * Ganti raket pada kedua pemain. GLB dimuat satu kali dari cache.
 * Kegagalan pada satu pemain tidak menghentikan pemain lain, dan kegagalan
 * total tidak menghentikan arena (raket bawaan tetap terpasang).
 */
export async function attachRacketProToPlayers(
  blueGroup: THREE.Object3D,
  redGroup: THREE.Object3D,
): Promise<{ blue: RacketAttachResult; red: RacketAttachResult }> {
  let source: THREE.Group
  try {
    source = await loadRacketPro()
  } catch {
    // Error sudah dilog di loader; arena lanjut dengan raket bawaan.
    const fail = FAIL('GLB raket Pro gagal dimuat')
    return { blue: fail, red: fail }
  }

  const blue = attachRacketProToPlayer('blue', blueGroup, source)
  const red = attachRacketProToPlayer('red', redGroup, source)
  if (!blue.ok || !red.ok) {
    console.error(
      `[BADMINTON-DIAG] racketPro: ringkasan — blue=${blue.ok ? 'OK' : `GAGAL (${blue.reason})`}, red=${red.ok ? 'OK' : `GAGAL (${red.reason})`}`,
    )
  }
  return { blue, red }
}
