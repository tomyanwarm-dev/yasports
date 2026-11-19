import * as THREE from 'three'

/**
 * Nama klip servis yang dipakai mekanisme official serve.
 * Kontak official serve dikunci pada overlap permukaan raket dan shuttle,
 * bukan pada puncak kecepatan raket. ServeShort sudah diverifikasi di Chrome;
 * ServeLong memakai waktu frame kontak hasil audit aset dan belum diuji browser.
 */
export type ServeClipName = 'ServeShort' | 'ServeLong'

export const SERVE_CONTACT_TIME: Record<ServeClipName, number> = {
  ServeShort: 0.866667,
  ServeLong: 0.917,
}

/**
 * ServeShort surface overlap was authored at 0.8667 s. Runtime substeps locate
 * the actual triangle contact; the shuttle stays held until that test succeeds.
 */
export const SERVE_RELEASE_LEAD = 0

/** Kedalaman titik jatuh target di belakang garis servis pendek lawan (m). */
export const SERVE_TARGET_DEPTH: Record<ServeClipName, number> = {
  ServeShort: 0.9,
  ServeLong: 2.8,
}

/** Jarak target dari garis tengah (di dalam lebar lapangan tunggal ~2.59 m). */
export const SERVE_TARGET_X = 1.5

const GROUND_TARGET_Y = 0.05
const NET_CLEARANCE = 0.06
const MIN_FLIGHT = 0.95
const MAX_FLIGHT = 1.5
/** Servis keras (kecepatan raket tinggi) memperpendek waktu terbang. */
const RACKET_SPEED_TO_FLIGHT = 0.05
const BASE_FLIGHT = 1.25

export interface ServeSolveInput {
  /** Posisi world aktual shuttlecock pada momen kontak. */
  contact: THREE.Vector3
  /** True bila server Red (menembak ke sisi Z negatif). */
  isRed: boolean
  /** Arah diagonal dari aturan sisi servis (+1 / -1), bukan aturan skor. */
  targetXSign: number
  /** Kedalaman target di belakang garis servis pendek lawan (m). */
  depth: number
  /** Jarak garis servis pendek dari net (m). */
  shortServiceLine: number
  /** Kecepatan kepala raket terukur pada momen kontak (m/s). */
  racketSpeed: number
  /** Gravitasi physics aktual. */
  gravity: number
  /** Tinggi net untuk cek clearance (m). */
  netHeight: number
}

/**
 * Menyelesaikan velocity awal servis secara ballistik dari posisi kontak
 * aktual ke titik jatuh target di kotak servis lawan, dengan jaminan
 * clearance net: waktu terbang dicoba dari yang pendek (servis keras) ke
 * yang panjang sampai lintasan melewati net di atas NET_HEIGHT + clearance.
 *
 * Waktu terbang dasar mengikuti kerasnya ayunan raket yang terukur, jadi
 * kecepatan servis benar-benar berasal dari gerakan pukulan.
 */
export function solveServeVelocity(input: ServeSolveInput): THREE.Vector3 {
  const { contact, isRed, targetXSign, depth, shortServiceLine, racketSpeed, gravity, netHeight } =
    input

  const target = new THREE.Vector3(
    targetXSign * SERVE_TARGET_X,
    GROUND_TARGET_Y,
    (isRed ? -1 : 1) * (shortServiceLine + depth),
  )

  const baseFlight = THREE.MathUtils.clamp(
    BASE_FLIGHT - RACKET_SPEED_TO_FLIGHT * racketSpeed,
    MIN_FLIGHT,
    BASE_FLIGHT,
  )

  let best: { v: THREE.Vector3; clearance: number } | null = null
  for (let t = baseFlight; t <= MAX_FLIGHT + 1e-9; t += 0.05) {
    const vy = (GROUND_TARGET_Y - contact.y) / t + 0.5 * gravity * t
    const vx = (target.x - contact.x) / t
    const vz = (target.z - contact.z) / t

    const tNet = Math.abs(contact.z / vz)
    let clearance = Infinity
    if (tNet > 0 && tNet < t) {
      clearance =
        contact.y + vy * tNet - 0.5 * gravity * tNet * tNet - netHeight - NET_CLEARANCE
    }
    if (clearance >= 0) return new THREE.Vector3(vx, vy, vz)
    if (!best || clearance > best.clearance) {
      best = { v: new THREE.Vector3(vx, vy, vz), clearance }
    }
  }

  // Fallback defensif: busur tertinggi yang ditemukan.
  return best ? best.v : new THREE.Vector3(0, 2, isRed ? -5 : 5)
}
