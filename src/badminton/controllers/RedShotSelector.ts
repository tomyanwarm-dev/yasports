import type * as THREE from 'three'
import type { PlayerClip } from '../entities/PlayerModel.ts'

/**
 * Pemilih teknik pukulan Red (Tahap 2.15).
 *
 * Murni dan deterministik: hanya membaca posisi/kecepatan shuttle relatif
 * terhadap tubuh Red, lalu memilih salah satu klip one-shot yang tersedia di
 * GLB. Tidak menyentuh physics, collision, atau animasi AI Blue.
 *
 * Koordinat: Red menghadap -Z (rotation.y = 0). "Depan" = shuttle lebih dekat
 * ke net daripada Red (z lebih kecil); "kanan" = world +X = sisi forehand.
 *
 * Tahap 2.19: `preferredTechnique` adalah hint dari pengenal gesture. Hint
 * hanya dipakai bila geometri shuttle memang mengizinkan kategori teknik itu;
 * tanpa hint, hasil seleksi 100% identik dengan Tahap 2.15.
 */
export type ShotTechnique = 'smash' | 'clear' | 'drop' | 'lift' | 'net' | 'drive' | 'block'

export interface RedShotInput {
  shuttlePosition: THREE.Vector3
  shuttleVelocity: THREE.Vector3
  playerPosition: THREE.Vector3
  playerYaw: number
  /** Teknik yang dikenali dari lintasan tangan (opsional, hanya bias). */
  preferredTechnique?: ShotTechnique
  /** JumpSmash requires a live player jump as well as a valid shuttle window. */
  isJumping?: boolean
}

/** Batas ketinggian (m) yang membedakan kategori teknik. */
export const HEIGHT_OVERHEAD = 2.0
export const HEIGHT_JUMP = 2.35
export const HEIGHT_LOW = 0.95
/** Jarak horizontal maksimum (m) untuk teknik dekat net. */
export const NEAR_DISTANCE = 2.0

/**
 * Pilih klip pukulan untuk Red.
 *
 * Urutan keputusan: tinggi -> jarak -> forehand/backhand -> arah shuttle.
 * Semua klip yang dikembalikan adalah one-shot yang didukung `playSwing`.
 */
export function selectRedShot(input: RedShotInput): PlayerClip {
  const { shuttlePosition: s, shuttleVelocity: v, playerPosition: p, playerYaw } = input

  // Transform ke ruang lokal Red. Model forward = -Z, right = +X pada yaw 0.
  const sin = Math.sin(playerYaw)
  const cos = Math.cos(playerYaw)
  const dxw = s.x - p.x
  const dzw = s.z - p.z
  // Local +z = depan tubuh; local +x = sisi kanan (forehand).
  const forward = -dzw * cos - dxw * sin
  const side = dxw * cos - dzw * sin
  const distance = Math.hypot(dxw, dzw)

  const isForehand = side >= 0
  const incoming = v.z > 0.05 // shuttle menuju sisi Red
  const pref = input.preferredTechnique

  // Overhead: clear / smash / jump smash / drop shot.
  if (s.y >= HEIGHT_OVERHEAD) {
    if (pref === 'drop') return 'DropShot'
    if (pref === 'clear') return isForehand ? 'ForehandClear' : 'BackhandClear'
    if (pref === 'smash') {
      return input.isJumping && s.y >= HEIGHT_JUMP && distance < 2.6 && incoming ? 'JumpSmash' : 'Smash'
    }
    if (input.isJumping && s.y >= HEIGHT_JUMP && distance < 2.6 && incoming) {
      return isForehand ? 'JumpSmash' : 'Smash'
    }
    return isForehand ? 'ForehandClear' : 'BackhandClear'
  }

  // Shuttle rendah: lift / net shot / defensive block.
  if (s.y < HEIGHT_LOW) {
    if (pref === 'lift') return 'Lift'
    if (pref === 'net' && distance < NEAR_DISTANCE + 0.6) return 'NetShot'
    if (pref === 'block') return 'DefensiveBlock'
    if (distance < NEAR_DISTANCE && forward > 0) {
      return isForehand ? 'NetShot' : 'DefensiveBlock'
    }
    return isForehand ? 'Lift' : 'DefensiveBlock'
  }

  // Ketinggian menengah: drive bila dekat, clear/block bila jauh.
  if (pref === 'drive' && distance < 2.4) {
    return isForehand ? 'ForehandDrive' : 'BackhandDrive'
  }
  if (pref === 'block' && distance < 2.4) return 'DefensiveBlock'
  // Kontak drive hasil kalibrasi berada di tinggi 1,5-1,65 m. Batas lama
  // 1,45 m membuat hampir semua pukulan menengah dekat salah terklasifikasi
  // sebagai Clear, sehingga lead/zone reception tidak cocok.
  if (distance < 1.9 && s.y < 1.75) {
    return isForehand ? 'ForehandDrive' : 'BackhandDrive'
  }
  if (!incoming && distance < 1.6) return 'DefensiveBlock'
  return isForehand ? 'ForehandClear' : 'BackhandClear'
}

/**
 * Waktu dari requestSwing sampai kontak raket nyata untuk sebuah klip Red.
 *
 * Angka-angka ini berasal dari kalibrasi sweep collision 2.16B dengan GLB Red:
 * shuttle diparkir pada permukaan raket hasil sweep, ayunan asli dilepaskan,
 * lalu `RacketHit.clipTime` saat kontak sah dicatat. Memakai lead klip yang
 * tepat mencegah ayunan dimulai terlalu awal/terlambat terhadap prediksi
 * intersepsi.
 */
export function swingLeadForClip(clip: PlayerClip | undefined): number {
  switch (clip) {
    case 'ForehandDrive':
    case 'BackhandDrive':
    case 'NetShot':
    case 'NetKill':
    case 'DropShot': return 0.12
    case 'BackhandClear':
    case 'Smash':
    case 'JumpSmash': return 0.17
    case 'ForehandClear': return 0.27
    case 'Lift': return 0.35
    case 'DefensiveBlock': return 0.6
    default: return 0.2
  }
}

/** Teknik footwork untuk lunge berdasarkan sisi shuttle (lokal Red). */
export function selectRedLunge(sideLocal: number): PlayerClip {
  return sideLocal >= 0 ? 'LungeForehand' : 'LungeBackhand'
}
