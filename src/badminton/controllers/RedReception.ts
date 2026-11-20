import * as THREE from 'three'
import type { PlayerClip } from '../entities/PlayerModel.ts'
import type { MovementBounds } from './Movement.ts'
import { selectRedShot, swingLeadForClip } from './RedShotSelector.ts'

/**
 * Perencana penerimaan Red (Tahap 2.20A).
 *
 * Zona di bawah berasal dari kalibrasi kontak nyata raket Red
 * (probe 2.16b-red-cal): shuttle diparkir pada titik permukaan raket hasil
 * sweep GLB, ayunan asli dilepaskan lewat `BadmintonRacketHitDetection`, dan
 * hanya entri dengan `RacketHit` sah yang dipakai. `right`/`forward` adalah
 * offset player-local (model menghadap -Z), `height` adalah tinggi kontak, dan
 * `lead` adalah waktu dari requestSwing sampai kontak terjadi.
 *
 * Planner ini TIDAK menggerakkan shuttle, tidak membuat pukulan, dan tidak
 * mengubah animasi. Ia hanya memilih stance + klip; kontak tetap diputuskan
 * oleh RacketSurfaceCollision produksi.
 */
export interface RedReceptionZone {
  clip: PlayerClip
  /** Offset local ke sisi kanan model (m). */
  right: number
  /** Offset local ke depan model (m). */
  forward: number
  /** Tinggi kontak (m). */
  height: number
  /** Waktu ayunan sebelum kontak (s). */
  lead: number
  /** Klip lain yang memakai zona yang sama. */
  aliases?: readonly PlayerClip[]
}

const RECEPTION_ZONES: readonly RedReceptionZone[] = [
  {
    clip: 'DefensiveBlock',
    right: 0.716,
    forward: 0.538,
    height: 1.53,
    lead: swingLeadForClip('DefensiveBlock'),
    aliases: ['DefensiveBlock'],
  },
  {
    clip: 'ForehandDrive',
    right: 0.676,
    forward: 0.594,
    height: 1.59,
    lead: swingLeadForClip('ForehandDrive'),
    aliases: ['ForehandDrive'],
  },
  {
    clip: 'NetKill',
    right: 0.707,
    forward: 0.597,
    height: 1.52,
    lead: swingLeadForClip('NetKill'),
    aliases: ['NetKill'],
  },
  {
    clip: 'Smash',
    right: 0.654,
    forward: 0.605,
    height: 1.65,
    lead: swingLeadForClip('Smash'),
    aliases: ['Smash'],
  },
  {
    clip: 'Lift',
    right: 0.712,
    forward: 0.606,
    height: 1.49,
    lead: swingLeadForClip('Lift'),
    aliases: ['Lift'],
  },
  {
    clip: 'ForehandClear',
    right: 0.64,
    forward: 0.422,
    height: 1.886,
    lead: swingLeadForClip('ForehandClear'),
    aliases: ['ForehandClear'],
  },
]

export interface RedReceptionInput {
  shuttlePosition: THREE.Vector3
  shuttleVelocity: THREE.Vector3
  gravity: number
  playerPosition: THREE.Vector3
  playerYaw: number
  bounds: MovementBounds
  speed: number
  isJumping?: boolean
}

export interface RedReceptionPlan {
  /** Klip hasil selector yang dipakai untuk ayunan. */
  clip: PlayerClip
  /** Titik dunia yang diprediksi berada pada zona raket. */
  contact: THREE.Vector3
  /** Detik dari sekarang sampai shuttle tiba di titik kontak. */
  contactTime: number
  /** Posisi tubuh Red agar zona raket berada di lintasan. */
  stanceX: number
  stanceZ: number
  /** Waktu dari requestSwing sampai kontak klip terpilih. */
  lead: number
}

/** Waktu turun melewati `height`; hanya akar saat shuttle sedang turun. */
function descendingTime(y: number, vy: number, gravity: number, height: number): number | null {
  if (y <= height && vy < 0) return 0
  const a = -0.5 * gravity
  const b = vy
  const c = y - height
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const root = Math.sqrt(disc)
  const candidates = [(-b - root) / (2 * a), (-b + root) / (2 * a)]
    .filter((time) => time > 0)
    .sort((left, right) => left - right)
  for (const time of candidates) {
    if (vy - gravity * time <= 0) return time
  }
  return null
}

/**
 * Pilih satu rencana kontak realistis. Null berarti shuttle bukan ancaman atau
 * sudah terlalu rendah/terlalu jauh untuk dijangkau dengan footwork normal.
 */
export function planRedReception(input: RedReceptionInput): RedReceptionPlan | null {
  const { shuttlePosition: p, shuttleVelocity: v, playerPosition, playerYaw } = input
  // Hanya shuttle yang menuju sisi Red (world +Z) yang perlu diterima.
  if (v.z <= 0.05) return null

  const cos = Math.cos(playerYaw)
  const sin = Math.sin(playerYaw)
  const candidates: RedReceptionPlan[] = []

  for (const zone of RECEPTION_ZONES) {
    const time = descendingTime(p.y, v.y, input.gravity, zone.height)
    if (time === null || time <= 0.02 || time > 2) continue

    const contact = new THREE.Vector3(
      p.x + v.x * time,
      zone.height,
      p.z + v.z * time,
    )
    // Jangan pernah merencanakan kontak di sisi Blue / di atas net.
    if (contact.z <= 0.12) continue

    // Local (right, -forward) dirotasi ke world oleh yaw player.
    const offsetX = zone.right * cos - zone.forward * sin
    const offsetZ = -zone.right * sin - zone.forward * cos
    const stanceX = THREE.MathUtils.clamp(contact.x - offsetX, input.bounds.minX, input.bounds.maxX)
    const stanceZ = THREE.MathUtils.clamp(contact.z - offsetZ, input.bounds.minZ, input.bounds.maxZ)

    // Teknik dipilih dari posisi stance pada saat kontak, bukan dari posisi Red
    // sebelum ia bergerak. Kalau tidak, semua pukulan dekat terlihat "jauh"
    // dan selector salah memilih Clear.
    const stancePosition = new THREE.Vector3(stanceX, 0, stanceZ)
    const selected = selectRedShot({
      shuttlePosition: contact,
      shuttleVelocity: v,
      playerPosition: stancePosition,
      playerYaw,
      isJumping: input.isJumping,
    })
    if (!zone.aliases?.includes(selected)) continue

    candidates.push({
      clip: selected,
      contact,
      contactTime: time,
      stanceX,
      stanceZ,
      lead: swingLeadForClip(selected),
    })
  }

  if (candidates.length === 0) return null

  // Utamakan rencana yang masih memberi waktu bergerak + mengayun. Bila semua
  // mepet, pilih yang paling tidak mepet; trigger tetap menunggu jarak stance
  // dan timing sebelum meminta swing.
  candidates.sort((a, b) => {
    const travelA = Math.hypot(a.stanceX - playerPosition.x, a.stanceZ - playerPosition.z) / Math.max(input.speed, 0.1)
    const travelB = Math.hypot(b.stanceX - playerPosition.x, b.stanceZ - playerPosition.z) / Math.max(input.speed, 0.1)
    return (b.contactTime - b.lead - travelB) - (a.contactTime - a.lead - travelA)
  })
  return candidates[0]
}
