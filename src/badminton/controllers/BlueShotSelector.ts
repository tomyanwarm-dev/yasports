import type * as THREE from 'three'
import type { PlayerClip } from '../entities/PlayerModel.ts'

/**
 * Pemilih teknik AI Blue (Tahap 2.16).
 *
 * Murni dan deterministik: hanya membaca titik kontak yang diprediksi,
 * kecepatan shuttle, dan sisi tubuh. Tidak menyentuh physics, collision, atau
 * animasi. Output berupa skor; zona yang tersedia tetap ditentukan oleh
 * `CLIP_ZONES` di AIController (hanya klip dengan zona terukur yang boleh
 * dipilih, jadi tidak ada klip yang dipaksakan di luar jangkauan raket).
 *
 * Koordinat dunia: Blue menghadap +Z (rotation.y = PI), sehingga sisi kanan
 * lokal (forehand) = world -X. `sideLocal` dihitung dari yaw agar tetap benar
 * bila orientasi berubah.
 */

export interface BlueTechniqueContext {
  clip: PlayerClip
  /** Titik lintasan shuttle pada saat kontak (dunia). */
  contact: THREE.Vector3
  /** Posisi tubuh Blue (dunia). */
  player: THREE.Vector3
  /** Yaw tubuh Blue (radian). */
  playerYaw: number
  /** Kecepatan shuttle saat diprediksi (dunia). */
  velocity: THREE.Vector3
  /** Urutan preferensi dasar CLIP_PREFERENCE (semakin kecil semakin awal). */
  baseRank: number
  /** Jumlah kandidat; dipakai untuk menormalkan bobot preferensi. */
  rankCount: number
  /** Titik kontak spesifik per klip (zona tiap teknik berbeda). */
  contacts?: Partial<Record<PlayerClip, THREE.Vector3>>
  /** Nomor ancaman sejak AI aktif; dipakai rotasi teknik deterministik. */
  threatIndex?: number
  /** Teknik terakhir yang benar-benar diswing; dihindari agar tidak monoton. */
  lastClip?: PlayerClip | null
  /** Peran zona 2.16B per klip. Zona power mendapat bobot hasil pukulan. */
  roles?: Partial<Record<PlayerClip, 'net' | 'drive' | 'clear' | 'lift' | 'smash'>>
}

/** Afinitas sisi: +1 forehand, -1 backhand, 0 netral. */
const SIDE_AFFINITY: Partial<Record<PlayerClip, number>> = {
  ForehandClear: 1,
  ForehandDrive: 1,
  Smash: 1,
  BackhandClear: -1,
  BackhandDrive: -1,
  DefensiveBlock: -0.5,
  Lift: 0.5,
  DropShot: 0,
  NetKill: 0,
}

/** Klip yang wajar untuk shuttle tinggi / rendah / cepat / dalam. */
const HIGH_CLIPS = new Set<PlayerClip>(['ForehandClear', 'BackhandClear', 'Smash'])
const LOW_CLIPS = new Set<PlayerClip>(['NetKill', 'DefensiveBlock', 'DropShot'])
const FAST_CLIPS = new Set<PlayerClip>(['DefensiveBlock', 'NetKill'])
const DEEP_CLIPS = new Set<PlayerClip>(['Lift', 'BackhandClear', 'DefensiveBlock'])

/**
 * Rotasi teknik rally. Bukan RNG: ancaman ke-N memprioritaskan satu teknik,
 * lalu `lastClip` memberi penalti pengulangan. Semua kandidat tetap harus lolos
 * filter feasibilitas di AIController sebelum masuk ke sini.
 */
const RALLY_ROTATION: readonly PlayerClip[] = [
  'DefensiveBlock',
  'Lift',
  'BackhandDrive',
  'NetKill',
  'ForehandDrive',
  'Smash',
  'JumpSmash',
  'BackhandClear',
  'ForehandClear',
  'DropShot',
]

/** Geometri persilangan servis pendek resmi (Tahap 2.13C), dipakai untuk mengunci DropShot. */
const SERVE_CROSS_X = 1.216
const SERVE_CROSS_Z = -0.097

/**
 * Skor teknik untuk satu kandidat. Semakin tinggi semakin sesuai.
 * Preferensi dasar tetap berbobot supaya klip yang sudah terkalibrasi dan
 * paling andal (lead awal) tidak kalah tanpa alasan.
 */
export function blueTechniqueScore(ctx: BlueTechniqueContext): number {
  const { clip, player, playerYaw, velocity, baseRank, rankCount } = ctx
  // Zona tiap teknik punya dy/dz berbeda, jadi skor harus membaca kontak
  // milik klip itu sendiri—bukan kontak kandidat pertama seperti sebelumnya.
  const contact = ctx.contacts?.[clip] ?? ctx.contact
  let score = (rankCount - baseRank) * 0.6

  // Sisi relatif tubuh. Model forward = -Z pada yaw 0; untuk Blue yaw = PI.
  const sin = Math.sin(playerYaw)
  const cos = Math.cos(playerYaw)
  const dxw = contact.x - player.x
  const dzw = contact.z - player.z
  const sideLocal = dxw * cos - dzw * sin
  const affinity = SIDE_AFFINITY[clip] ?? 0
  if (affinity !== 0 && Math.abs(sideLocal) > 0.15) {
    score += affinity * sideLocal >= 0 ? 2.2 : -2.2
  }

  // Tinggi kontak.
  if (contact.y >= 1.75) score += HIGH_CLIPS.has(clip) ? 3 : LOW_CLIPS.has(clip) ? -1.5 : 0
  else if (contact.y >= 1.6) score += clip === 'ForehandDrive' || clip === 'BackhandDrive' ? 2 : 0
  else score += LOW_CLIPS.has(clip) ? 2.5 : HIGH_CLIPS.has(clip) ? -2 : 0

  // Kecepatan datang (pukulan keras lebih baik diblock).
  const speed = Math.hypot(velocity.x, velocity.z)
  if (speed >= 9) score += FAST_CLIPS.has(clip) ? 2.5 : -1

  // Kedalaman area Blue.
  if (contact.z <= -2.4) score += DEEP_CLIPS.has(clip) ? 2 : LOW_CLIPS.has(clip) ? -1.5 : 0

  // Zona power 2.16B sudah lolos uji sempat-swing dan menghasilkan raket
  // jauh lebih cepat. Beri bobot agar kandidat ini tidak kalah dari drive
  // hanya karena margin kedatangannya lebih kecil (lead lebih panjang).
  if (ctx.roles?.[clip] !== undefined) score += 6

  // Rotasi deterministik per ancaman + penalti pengulangan. Hanya aktif bila
  // controller mengirim nomor ancaman; test deterministik lama tetap valid.
  if (ctx.threatIndex !== undefined) {
    const preferred = RALLY_ROTATION[(ctx.threatIndex - 1 + RALLY_ROTATION.length) % RALLY_ROTATION.length]
    if (clip === preferred) score += 5
    if (ctx.lastClip) score += clip === ctx.lastClip ? -3 : 2
  }

  // Busur servis pendek resmi (Tahap 2.13C): kontak di x ≈ ±1.216,
  // z ≈ -0.097, y ≈ 1.59. Diperketat agar pukulan net dalam rally tidak ikut
  // terkunci DropShot.
  const serveArc =
    Math.abs(Math.abs(contact.x) - SERVE_CROSS_X) <= 0.22 &&
    Math.abs(contact.z - SERVE_CROSS_Z) <= 0.14 &&
    contact.y >= 1.5 && contact.y <= 1.72
  if (serveArc) score += clip === 'DropShot' ? 12 : -4

  return score
}

/** Urutkan klip kandidat berdasarkan skor, stabil pada preferensi dasar. */
export function rankBlueTechniques(clips: readonly PlayerClip[], ctx: Omit<BlueTechniqueContext, 'clip' | 'baseRank' | 'rankCount'>): PlayerClip[] {
  return clips
    .map((clip, baseRank) => ({ clip, baseRank, score: blueTechniqueScore({ ...ctx, clip, baseRank, rankCount: clips.length }) }))
    .sort((a, b) => b.score - a.score || a.baseRank - b.baseRank)
    .map((entry) => entry.clip)
}
