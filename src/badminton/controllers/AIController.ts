import * as THREE from 'three'
import type { BadmintonAnimationController } from '../animation/AnimationController.ts'
import { BadmintonMovement } from './Movement.ts'
import type { MovementBounds, MoveIntent } from './Movement.ts'
import type { PlayerClip } from '../entities/PlayerModel.ts'
import type { ShuttlecockPhase } from '../physics/ShuttlecockPhysics.ts'
import { rankBlueTechniques } from './BlueShotSelector.ts'

export type AiMode = 'patrol' | 'intercept' | 'recover'
/** Nama lama dipertahankan agar impor luar tidak rusak. */
export type AiState = AiMode
export type AiDifficultyName = 'easy' | 'normal' | 'hard'

/**
 * Parameter balancing AI Blue (Tahap 2.13). Semua nilai dapat ditimpa lewat
 * `options.balance`, jadi tuning berikutnya tidak perlu mengubah logika.
 */
export interface AiBalance {
  /** Jeda sebelum AI mulai bereaksi pada shuttle/serve yang datang (detik). */
  reactionDelay: number
  /** 0..1. Semakin rendah, semakin meleset bacaan awal lintasan (gravitasi taksiran). */
  predictionAccuracy: number
  /** Kecepatan gerak horizontal AI (m/s). */
  movementSpeed: number
  /** Galat acak maksimum pada titik stance intersepsi (meter). */
  interceptionError: number
  /** Galat acak waktu mulai ayunan (detik). */
  swingTimingError: number
  /** 0..1. Peluang memakai pukulan terbaik; sisanya pukulan lembut/berisiko. */
  returnAccuracy: number
}

/** Preset kesulitan. NORMAL adalah default Tahap 2.13. */
export const AI_BALANCE: Record<AiDifficultyName, AiBalance> = {
  easy: {
    reactionDelay: 0.28,
    predictionAccuracy: 0.78,
    movementSpeed: 3.0,
    interceptionError: 0.09,
    swingTimingError: 0.05,
    returnAccuracy: 0.62,
  },
  normal: {
    // Tahap 2.16: kecepatan/reaksi disesuaikan agar stance intersepsi di net
    // masih bisa dijangkau dari home (0,-3.2). Masih realistis (bukan teleport)
    // dan returnAccuracy sengaja < 1 supaya Red tetap punya peluang poin.
    // 2.16B: zona power butuh ayunan lebih awal. Reaksi 0.12 s + 4.2 m/s
    // tidak sempat mencapai stance kontak yang lebih dekat net.
    reactionDelay: 0.08,
    predictionAccuracy: 0.9,
    // Sprint badminton nyata 4–6 m/s; 5.6 masih realistis dan memungkinkan
    // teknik lead-panjang dipakai tanpa teleport atau membekukan gerak.
    movementSpeed: 5.6,
    interceptionError: 0.008,
    // Kontak LATE fatal (~7 m/s shuttle vs ~1.3 m/s raket): galat timing 6 ms
    // saja sudah ≈ 0.04 m, di luar radius 0.035 m. Diperketap jadi 2 ms supaya
    // pukulan yang memang terjangkau tidak gugur karena galat internal AI.
    swingTimingError: 0.002,
    returnAccuracy: 0.9,
  },
  hard: {
    reactionDelay: 0.08,
    predictionAccuracy: 0.97,
    movementSpeed: 4.8,
    interceptionError: 0.02,
    swingTimingError: 0.008,
    returnAccuracy: 0.95,
  },
}

const IDLE_MIN = 0.5
const IDLE_MAX = 1.1
const MOVE_MIN = 1.0
const MOVE_MAX = 2.2

/** Prediksi lintasan: horizon maksimum (detik). */
const PREDICT_HORIZON = 2.5
/** Dianggap sampai di titik target/home bila lebih dekat dari ini (meter). */
const ARRIVE_TOLERANCE = 0.25
const HOME_TOLERANCE = 0.35
/**
 * Toleransi tiba di stance intersepsi. Jauh lebih ketat dari patroli: zona
 * kontak raket hanya ~0.035 m, jadi galat tubuh maksimum harus tetap di
 * dalam lebar permukaan raket terukur (~0.2 m).
 */
// Stance intersepsi harus presisi: toleransi kontak raket hanya 0.035 m,
// jadi Blue harus berhenti jauh lebih dekat ke stance ideal daripada
// toleransi patroli biasa.
const INTERCEPT_ARRIVE_TOLERANCE = 0.025
/** Batas waktu maksimal mode recover sebelum kembali patroli. */
const RECOVER_MAX = 2.5

/** Kontak hanya dihitung di sisi Blue (shuttle sudah melewati bidang net). */
const ZONE_SIDE_Z = -0.05
/** Toleransi tinggi shuttle terhadap tinggi zona kontak klip (meter). */
const ZONE_HEIGHT_TOLERANCE = 0.07
/** Jarak tubuh ke stance saat ayunan boleh dimulai (meter). */
/** Jeda antar percobaan swing agar tidak spam saat shuttle masih dekat. */
const SWING_RETRY_COOLDOWN = 0.9
const SWING_BUSY_COOLDOWN = 0.35

/** Radius patroli lateral di sekitar home, supaya AI tidak stray terlalu jauh. */
const PATROL_RADIUS = 1.0
const PATROL_DEPTH_RADIUS = 0.55

/**
 * Waktu AI "membaca ulang" lintasan dengan gravitasi asli setelah bacaan awal
 * yang meleset (predictionAccuracy). Semakin lama, semakin lama koreksi.
 */
const READ_REFINE_TIME = 0.45

/**
 * Titik lintasan menurun busur servis pendek resmi (terukur, probe 2.13C):
 * dari kontak raket Red (0.78, 1.30, 4.22) dengan velocity (0.76, 3.34,
 * -7.47), shuttle turun melewati ketinggian zona kontak di x = ±1.216,
 * z = -0.097 (tanda x mengikuti sisi servis). Geometri z identik untuk kedua
 * sisi karena posisi z Red tidak bercermin.
 */
const SERVE_CROSS_X = 1.216
const SERVE_CROSS_Z = -0.097

/**
 * Zona kontak raket hasil kalibrasi ulang (probe 2.13C, closed-loop): Blue
 * diparkir di stance, shuttle diparkir di titik busur servis, klip diayun
 * via requestSwing (jalur nyata), lalu sweep permukaan diverifikasi mencapai
 * shuttle (minDist 0.0004-0.011 m) dan hit sah terdaftar dengan velocity
 * keluar vz > 0.
 *   dx/dz = offset world titik permukaan kontak dari origin pemain,
 *   dy    = tinggi kontak,
 *   lead  = clipTime kontak (waktu dari mulai ayunan ke titik kontak).
 * Pengukuran lama (2.13B) invalid: sampler membaca pose sebelum mixer update
 * sehingga merekam pose Ready yang statis, bukan lintasan ayunan.
 */
interface ClipZone {
  dx: number
  dy: number
  dz: number
  lead: number
  /** Peran hasil pukulan; dipakai untuk memilih varian zona yang sesuai. */
  role?: 'net' | 'drive' | 'clear' | 'lift' | 'smash'
  /**
   * Velocity hasil kalibrasi untuk varian ini. Dipakai untuk memperkirakan
   * landing saat membandingkan varian zona; bukan menggantikan hit nyata.
   */
  aimV?: readonly [number, number, number]
}

const CLIP_ZONES: Partial<Record<PlayerClip, ClipZone>> = {
  // Enam zona asli hasil kalibrasi closed-loop 2.13C — tidak diubah.
  DropShot: { dx: -0.527, dy: 1.593, dz: 0.586, lead: 0.167 },
  ForehandDrive: { dx: -0.536, dy: 1.628, dz: 0.569, lead: 0.467 },
  BackhandDrive: { dx: -0.586, dy: 1.621, dz: 0.63, lead: 0.4 },
  NetKill: { dx: -0.538, dy: 1.532, dz: 0.562, lead: 0.6 },
  DefensiveBlock: { dx: -0.559, dy: 1.526, dz: 0.549, lead: 0.6 },
  Smash: { dx: -0.553, dy: 1.625, dz: 0.568, lead: 0.533 },
  // Tahap 2.16: zona tambahan dari kalibrasi sweep collision nyata (probe
  // 2.16-calibration). Titik kontak = permukaan raket GLB pada clipTime lead;
  // ketiganya terbukti menghasilkan hit sah dengan velocity vz > 0 (ke Red).
  ForehandClear: { dx: -1.299, dy: 1.798, dz: -0.235, lead: 0.94 },
  BackhandClear: { dx: -0.467, dy: 1.78, dz: -2.607, lead: 1.06 },
  Lift: { dx: 1.256, dy: 1.787, dz: -0.124, lead: 1.0 },
}

/**
 * Zona rally 2.16A hasil sweep collision menyeluruh (probe 2.16a, 102 titik).
 * Beda dari zona lama: lead pendek (0.15–0.45 s) dan kontak dekat tubuh,
 * sehingga AI benar-benar sempat mencapai stance dari home sebelum swing.
 * Semua entri di sini lolos hit nyata: surfaceDistance ≤ 0.027 m, vz > 0,
 * landing di area Red. Zona DropShot lama dipertahankan untuk servis 2.13C;
 * entri DropShot di sini hanya dipakai untuk rally.
 */
const RALLY_ZONES: Partial<Record<PlayerClip, ClipZone>> = {
  // Semua lead di bawah berasal dari sweep 2.16A yang diperluas (142 titik).
  // lead minimal = 10% durasi klip + margin; kontak nyata d ≤ 0.011 m.
  DropShot: { dx: -0.629, dy: 1.673, dz: 0.589, lead: 0.2 },
  NetKill: { dx: -0.692, dy: 1.513, dz: 0.592, lead: 0.2 },
  DefensiveBlock: { dx: -0.708, dy: 1.492, dz: 0.516, lead: 0.2 },
  ForehandDrive: { dx: -0.681, dy: 1.575, dz: 0.562, lead: 0.15 },
  BackhandDrive: { dx: -0.662, dy: 1.548, dz: 0.59, lead: 0.15 },
  // ForehandClear hanya lolos kontak pada lead panjang (0.45 s, d=0.027 m).
  ForehandClear: { dx: -0.61, dy: 1.89, dz: 0.44, lead: 0.45 },
  BackhandClear: { dx: -0.695, dy: 1.51, dz: 0.574, lead: 0.2 },
  Lift: { dx: -0.694, dy: 1.51, dz: 0.574, lead: 0.2 },
  Smash: { dx: -0.639, dy: 1.647, dz: 0.591, lead: 0.2 },
  JumpSmash: { dx: -0.698, dy: 1.524, dz: 0.551, lead: 0.2 },
}

/**
 * Varian zona "power" 2.16B. Masih berasal dari sweep collision nyata yang
 * sama dengan 2.16A, tetapi mengambil titik lead yang lebih lambat ketika
 * kepala raket sedang melaju cepat. Kecepatan keluar naik 6–10 m/s tanpa
 * menyentuh `minHitSpeed`, `powerScale`, atau collision defaults.
 *
 * Semua entri lolos kontak nyata: surfaceDistance ≤ 0.032 m, vz > 0, landing
 * masih di dalam lapangan (HALF_LENGTH = 6.7 m). Dipilih hanya bila shuttle
 * masih memberi waktu untuk mengayun (`margin ≥ 0.02 s`); kalau tidak, zona
 * dasar 2.16A tetap dipakai sehingga penerimaan tidak regression.
 */
const POWER_ZONES: Partial<Record<PlayerClip, ClipZone>> = {
  // NetKill lead 0.75: d=0.0316 m, speed=9.51, landing z≈4.5 (clear dalam).
  NetKill: { dx: -0.468, dy: 1.779, dz: 0.61, lead: 0.75, role: 'clear', aimV: [5.29, 5.35, 5.81] },
  // DefensiveBlock lead 0.75: d=0.023 m, speed=7.77, landing z≈5.5.
  DefensiveBlock: { dx: -0.5, dy: 1.764, dz: 0.574, lead: 0.75, role: 'clear', aimV: [3.96, 3.92, 5.42] },
  // JumpSmash lead 0.75: d=0.0205 m, speed=6.25, landing z≈3.2 (masih sah).
  JumpSmash: { dx: -0.479, dy: 1.963, dz: 0.37, lead: 0.75, role: 'smash', aimV: [4.29, 3.0, 3.42] },
}

interface ZoneVariant {
  zone: ClipZone
  time: number
  x: number
  z: number
  stanceX: number
  stanceZ: number
  margin: number
}

/** Urutan preferensi dasar. DropShot lebih dulu untuk busur servis pendek;
 *  `BlueShotSelector` hanya mengurutkan ulang kandidat yang benar-benar layak,
 *  dan mengunci DropShot pada geometri servis resmi. */
const CLIP_PREFERENCE: PlayerClip[] = [
  'DropShot',
  'ForehandDrive',
  'BackhandDrive',
  'NetKill',
  'DefensiveBlock',
  'Smash',
  'ForehandClear',
  'BackhandClear',
  'Lift',
]

/** Klip lembut/defensif untuk pukulan yang tidak akurat (returnAccuracy). */
const SOFT_CLIPS: PlayerClip[] = ['DropShot', 'NetKill', 'DefensiveBlock']
/** Akses baca status shuttlecock; dipenuhi BadmintonShuttlecockPhysics apa adanya. */
export interface ShuttlecockReader {
  getPosition(): THREE.Vector3
  getVelocity(): THREE.Vector3
  getPhase(): ShuttlecockPhase
  getGravity(): number
  /** Sumber launch terakhir; dipakai untuk membedakan servis resmi dari rally. */
  getLaunchSource?(): string | null
}

/**
 * Persepsi AI terhadap siklus official serve yang terlihat (publik): titik
 * jatuh target menurut aturan servis resmi (target + diagonal sisi servis),
 * tersedia sejak rally berakhir sehingga penerima sempat bersiap.
 */
export interface AiServePerception {
  getExpectedLanding(): THREE.Vector3 | null
}

/** Opsi AI. Semua opsional: tanpa options, AI berperilaku seperti patroli lama. */
export interface BadmintonAIOptions {
  /** Persepsi: posisi/velocity/phase shuttlecock terkini. */
  shuttle?: ShuttlecockReader
  /** Memicu swing Blue lewat BadmintonRacketHitDetection.requestSwing (API Red). */
  requestSwing?: (clip: PlayerClip) => boolean
  /** Posisi siap (home) saat tidak ada ancaman. */
  home?: THREE.Vector3
  /** Preset kesulitan awal. Default NORMAL (Tahap 2.13). */
  difficulty?: AiDifficultyName
  /** Override per parameter untuk balancing berikutnya. */
  balance?: Partial<AiBalance>
  /** Persepsi siklus official serve (disediakan BadmintonArena). */
  servePerception?: AiServePerception
}

interface ReceptionPlan {
  clip: PlayerClip
  zone: ClipZone
  /** Detik dari sekarang sampai shuttle berada di zona kontak. */
  contactTime: number
  /** Posisi tubuh agar zona kontak tepat berada di lintasan shuttle. */
  stanceX: number
  stanceZ: number
  /** contactTime - lead - waktuTempuh; positif berarti masih sempat. */
  margin: number
}

/**
 * Waktu (detik) sampai shuttle turun melewati ketinggian `height`.
 * Hanya akar positif yang masih turun (vy < 0) yang dipakai.
 */
function descendingTime(
  y: number,
  vy: number,
  gravity: number,
  height: number,
): number | null {
  const a = -0.5 * gravity
  const b = vy
  const c = y - height
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const root = Math.sqrt(disc)
  const t1 = (-b - root) / (2 * a)
  const t2 = (-b + root) / (2 * a)
  // Bisa ada dua akar positif: shuttle NAIK melewati tinggi zona lalu TURUN
  // melewatinya lagi. Hanya lintasan turun yang bisa dipukul balik secara
  // wajar, jadi ambil akar positif pertama yang turun (bukan sekadar akar
  // terkecil — bug lama membuat rencana selalu gagal saat shuttle masih naik).
  const candidates = [t1, t2].filter((t) => t > 0).sort((x, y) => x - y)
  for (const t of candidates) {
    if (vy - gravity * t <= 0) return t
  }
  return null
}

/**
 * Controller AI untuk pemain Blue.
 *
 * Tiga mode:
 *   - patrol    : tidak ada ancaman; kembali ke sekitar home dan bergerak kecil.
 *   - intercept : shuttle/serve menuju Blue; bergerak ke stance yang membuat
 *                 zona kontak raket tepat berada di lintasan shuttle.
 *   - recover   : rally selesai; kembali ke home.
 *
 * Penerimaan servis memakai pipeline nyata: persepsi siklus servis resmi ->
 * antisipasi stance -> prediksi lintasan -> gerak -> pilih klip berdasarkan
 * zona raket terukur -> minta swing -> RacketHitDetection Blue menguji kontak
 * mesh raket (satu hit per swing). Tidak ada pemindahan shuttlecock.
 */
export class BadmintonAIController {
  private readonly movement: BadmintonMovement
  private readonly bounds: MovementBounds
  private readonly balance: AiBalance

  private mode: AiMode = 'patrol'
  /** Sub-state patroli (perilaku lama, dipertahankan). */
  private patrolState: 'idle' | 'moveLeft' | 'moveRight' = 'idle'
  private timer = this.randomBetween(IDLE_MIN, IDLE_MAX)
  private active = false

  private readonly interceptTarget = new THREE.Vector3()
  private readonly interceptOffset = new THREE.Vector3()
  private swingCooldown = 0
  private recoverTimer = 0

  /** Status satu shuttle yang datang; error dibangkitkan sekali per shuttle. */
  private threatActive = false
  private reactionRemaining = 0
  private threatElapsed = 0
  private initialGravityBias = 0
  private swingTimingOffset = 0
  private erraticSwing = false

  /** Rencana intersepsi aktif (diisi decideIntent, dipakai swing decision). */
  private plan: ReceptionPlan | null = null
  /** Teknik yang dikunci untuk satu shuttle datang, agar stance tidak berubah-ubah. */
  private lockedClip: PlayerClip | null = null
  /**
   * Varian zona dari teknik terkunci. Tanpa ini, varian power (lead panjang)
   * yang sama muncul lagi sebagai zona dasar sehingga lock guard mengira
   * teknik power sudah tidak aktif dan menggantinya dengan drive/base tepat
   * sebelum jendela swing terbuka.
   */
  private lockedRole: ClipZone['role'] = undefined
  /** Nomor ancaman untuk rotasi teknik deterministik (bukan RNG tiap frame). */
  private threatIndex = 0
  /** Teknik terakhir yang benar-benar diswing; dipakai selector untuk anti-ulang. */
  private lastShotClip: PlayerClip | null = null
  /** Waktu ancaman saat plan terakhir diganti; mencegah stance oscillate. */
  private lastPlanChangeElapsed = 0
  /** Sisa waktu gerak dibekukan saat ayunan berjalan (agar pose raket stabil). */
  private swingLockRemaining = 0
  /** Jeda reaksi terhadap persiapan servis resmi lawan. */
  private prepActive = false
  private prepReactionRemaining = 0
  /** Aktif saat Blue menjadi server: AI diam di posisi siap servis, tidak patroli. */
  private serveHoldActive = false

  /** Sisa durasi klip footwork reaktif Recovery / Jump / Landing (detik). */
  private recoveryAnimRemaining = 0
  private jumpAnimRemaining = 0
  private landingAnimRemaining = 0
  /** Jump hanya dipicu sekali per ancaman agar tidak berulang tiap frame. */
  private jumpUsedThisThreat = false

  constructor(
    private player: THREE.Object3D,
    bounds: MovementBounds,
    speed: number = 2.6,
    private readonly animationController?: BadmintonAnimationController,
    private readonly options: BadmintonAIOptions = {},
  ) {
    const preset = AI_BALANCE[options.difficulty ?? 'normal']
    this.balance = { ...preset, ...options.balance }
    // Tanpa preset eksplisit, pertahankan argumen speed lama (kompatibilitas).
    if (options.difficulty === undefined && options.balance?.movementSpeed === undefined) {
      this.balance.movementSpeed = speed
    }
    this.movement = new BadmintonMovement(player, bounds, this.balance.movementSpeed)
    this.bounds = bounds
  }

  enable(): void {
    this.active = true
  }

  disable(): void {
    this.active = false
  }

  /**
   * Arena mengoordinasikan siklus servis: saat Blue menjadi server, AI berhenti
   * mengirim intent reli/patroli dan kembali ke posisi siap servis. Ini bukan
   * pembekuan permanen — status dilepas begitu shuttle diluncurkan.
   */
  setServeHold(active: boolean): void {
    if (this.serveHoldActive === active) return
    this.serveHoldActive = active
    if (!active) return
    this.endThreat()
    this.plan = null
    this.lockedClip = null
    this.lockedRole = undefined
    this.swingCooldown = 0
    this.swingLockRemaining = 0
    this.prepActive = false
    this.prepReactionRemaining = 0
    this.recoveryAnimRemaining = 0
    this.jumpAnimRemaining = 0
    this.landingAnimRemaining = 0
    this.jumpUsedThisThreat = false
    // Mode intercept memakai toleransi kedatangan ketat, sehingga posisi siap
    // servis presisi (bukan toleransi patroli 0.25 m).
    this.setMode('intercept')
    this.animationController?.stop()
  }

  /** True hanya saat AI sedang menunggu servisnya sendiri. */
  get isHoldingForServe(): boolean {
    return this.serveHoldActive
  }

  update(delta: number): void {
    if (!this.active) return

    this.swingCooldown = Math.max(0, this.swingCooldown - delta)
    this.swingLockRemaining = Math.max(0, this.swingLockRemaining - delta)

    // Selama ayunan berjalan gerak dibekukan agar pose raket mengikuti klip
    // persis seperti saat zona kontak diukur (buku buku tetap di stance).
    const frozen = this.swingLockRemaining > 0
    const intent = frozen ? { x: 0, z: 0 } : this.decideIntent(delta)
    this.movement.apply(intent, delta)
    this.updateAnimation(frozen ? { x: 0, z: 0 } : intent, delta)
    this.updateSwingDecision(delta)
  }

  get currentState(): AiMode {
    return this.mode
  }

  /** Parameter balancing yang sedang dipakai (read-only untuk diagnosa). */
  get balanceParameters(): Readonly<AiBalance> {
    return this.balance
  }

  /** Keputusan intent gerakan per frame berdasarkan status shuttlecock. */
  private decideIntent(delta: number): MoveIntent {
    const shuttle = this.options.shuttle
    // Saat Blue menjadi server, satu-satunya tujuan adalah posisi siap servis.
    // Tidak ada patroli, recover acak, atau anticipasi servis lawan.
    if (this.serveHoldActive) {
      const home = this.options.home
      return home ? this.moveToward(home) : { x: 0, z: 0 }
    }
    if (!shuttle) return this.patrolIntent(delta)

    const phase = shuttle.getPhase()
    const v = shuttle.getVelocity()
    // Shuttle yang terbang ke arah Blue (z negatif) adalah ancaman. Kondisi ini
    // tetap berlaku setelah shuttle melewati net, sampai shuttle berbalik arah
    // (dipukul Blue) atau berhenti terbang.
    const incoming = phase === 'flying' && v.z < -0.05

    if (!incoming) {
      if (this.threatActive) this.endThreat()
      this.plan = null
      // Persiapan servis resmi lawan dievaluasi lebih dulu: penerimaan sudah
      // boleh menggeser stance tanpa memicu log/lintasan recover tiap frame.
      const prepTarget = this.planServeAnticipation(delta)
      if (prepTarget) {
        this.setMode('intercept')
        return this.moveToward(this.interceptTarget)
      }
      if (this.mode === 'intercept') {
        this.setMode('recover')
        this.recoverTimer = RECOVER_MAX
      }
      return this.mode === 'recover' ? this.recoverIntent(delta) : this.patrolIntent(delta)
    }

    if (!this.threatActive) this.beginThreat()
    this.threatElapsed += delta
    this.plan = null

    // Reaction delay: AI belum boleh bergerak mengejar, hanya siap.
    if (this.reactionRemaining > 0) {
      this.reactionRemaining = Math.max(0, this.reactionRemaining - delta)
      return { x: 0, z: 0 }
    }

    if (this.planReception()) {
      this.setMode('intercept')
      return this.moveToward(this.interceptTarget)
    }

    if (this.mode === 'intercept') {
      this.setMode('recover')
      this.recoverTimer = RECOVER_MAX
    }
    return this.mode === 'recover' ? this.recoverIntent(delta) : this.patrolIntent(delta)
  }

  /** Mulai satu ancaman baru: reaction delay dan galat persepsi per shuttle. */
  private beginThreat(): void {
    this.threatActive = true
    this.threatElapsed = 0
    this.threatIndex += 1
    this.lockedClip = null
    this.lockedRole = undefined
    this.lastPlanChangeElapsed = 0
    this.jumpUsedThisThreat = false
    this.jumpAnimRemaining = 0
    this.landingAnimRemaining = 0
    this.reactionRemaining = Math.max(
      0,
      this.balance.reactionDelay + this.randomBetween(-0.04, 0.04),
    )

    // Galat posisi: AI salah membaca titik intersepsi, bukan gerak acak tiap
    // frame. Offset tetap selama shuttle yang sama masih datang.
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * this.balance.interceptionError
    this.interceptOffset.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)

    // Galat bacaan awal: gravitasi taksiran berbeda dari physics asli, lalu
    // AI membaca ulang lintasan seiring shuttle mendekat (READ_REFINE_TIME).
    const readError = (1 - this.balance.predictionAccuracy) * 0.6
    this.initialGravityBias = this.randomBetween(-readError, readError)

    // Galat waktu ayunan asimetris ke arah EARLY: kontak LATE mematikan
    // (shuttle ~7.5 m/s vs raket ~1.3 m/s — terlambat 4 ms ≈ 0.03 m),
    // sedangkan EARLY aman karena shuttle masih terbang menuju permukaan
    // raket. Pukulan "berisiko" tetap bisa terlambat, tapi dalam batas kecil.
    this.erraticSwing = Math.random() > this.balance.returnAccuracy
    this.swingTimingOffset = this.erraticSwing
      ? this.randomBetween(-0.012, this.balance.swingTimingError * 2.5)
      : this.randomBetween(0, this.balance.swingTimingError)
  }

  private endThreat(): void {
    this.threatActive = false
    this.lockedClip = null
    this.reactionRemaining = 0
    this.threatElapsed = 0
    this.interceptOffset.set(0, 0, 0)
    this.swingLockRemaining = 0
    this.jumpAnimRemaining = 0
    this.landingAnimRemaining = 0
  }

  /** Gravitasi taksiran: bacaan awal meleset, lalu menyatu ke nilai asli. */
  private estimatedGravity(actual: number): number {
    const blend = Math.min(1, this.threatElapsed / READ_REFINE_TIME)
    return actual * (1 + this.initialGravityBias * (1 - blend))
  }

  /**
   * Antisipasi siklus official serve lawan: sebelum shuttle diluncurkan, AI
   * sudah bergerak ke stance penerimaan (net-front untuk servis pendek).
   * Sumber data hanya persepsi publik: titik jatuh target menurut aturan
   * servis resmi (target X + kedalaman + diagonal sisi servis).
   */
  private planServeAnticipation(delta: number): boolean {
    const perception = this.options.servePerception
    if (!perception) {
      this.prepActive = false
      return false
    }
    const landing = perception.getExpectedLanding()
    if (!landing) {
      if (this.prepActive) {
        this.prepActive = false
        this.prepReactionRemaining = 0
      }
      return false
    }
    if (!this.prepActive) {
      this.prepActive = true
      this.prepReactionRemaining = Math.max(
        0,
        this.balance.reactionDelay + this.randomBetween(-0.04, 0.04),
      )
    }
    if (this.prepReactionRemaining > 0) {
      this.prepReactionRemaining = Math.max(0, this.prepReactionRemaining - delta)
      return false
    }

    // Gunakan zona DropShot: satu-satunya klip yang reachability-nya nyaman
    // untuk busur servis pendek (trigger 0.41 s setelah peluncuran).
    const zone = CLIP_ZONES.DropShot
    if (!zone) return false

    // Titik lintasan menurun busur servis pendek resmi, terukur (probe 2.13C).
    // Tanda x mengikuti sisi servis; geometri z identik untuk kedua sisi.
    // Taksiran ini hanya untuk bersiap; koreksi eksak berlangsung setelah
    // peluncuran dari velocity shuttle yang sudah terbaca.
    const targetXSign = landing.x >= 0 ? 1 : -1
    const crossX = targetXSign * SERVE_CROSS_X
    const crossZ = SERVE_CROSS_Z

    this.interceptTarget.set(
      THREE.MathUtils.clamp(crossX - zone.dx, this.bounds.minX, this.bounds.maxX),
      0,
      THREE.MathUtils.clamp(crossZ - zone.dz, this.bounds.minZ, this.bounds.maxZ),
    )
    return true
  }

  /**
   * Pilih rencana intersepsi: cari waktu saat lintasan shuttle melintasi zona
   * kontak sebuah klip di sisi Blue, lalu hitung stance tubuh yang membuat
   * zona itu tepat berada di lintasan, dan cek apakah AI sempat sampai sebelum
   * ayunan harus dimulai.
   */
  private planReception(): boolean {
    const shuttle = this.options.shuttle
    if (!shuttle) return false

    const p = shuttle.getPosition()
    const v = shuttle.getVelocity()
    const gravity = this.estimatedGravity(shuttle.getGravity())
    const position = this.player.position
    const speed = this.balance.movementSpeed

    let best: ReceptionPlan | null = null
    let bestEffort: ReceptionPlan | null = null
    const feasible: ReceptionPlan[] = []
    const catchable: ReceptionPlan[] = []
    const contacts: Partial<Record<PlayerClip, THREE.Vector3>> = {}
    let contextContact: THREE.Vector3 | null = null

    // Servis resmi 2.13C tetap memakai zona DropShot lama. Sumber launch
    // eksplisit lebih aman daripada `prepActive` (yang juga menyala saat
    // menunggu servis berikutnya, sehingga secara keliru membuat rally
    // memakai zona lama DropShot dan tidak pernah bervariasi).
    const launchSource = shuttle.getLaunchSource?.() ?? ''
    const serveReception = launchSource === 'official-serve' && this.threatElapsed < 0.9

    // Pukulan "berisiko" (erratic) memakai klip lembut lebih dulu; galat waktu
    // ayunan yang digandakan pada shuttle ini yang membuatnya sering meleset.
    const basePreference = this.erraticSwing
      ? [...SOFT_CLIPS, ...CLIP_PREFERENCE.filter((clip) => !SOFT_CLIPS.includes(clip))]
      : [...CLIP_PREFERENCE]
    // Komitmen teknik per shuttle: klip yang sudah dipilih tetap diuji lebih
    // dulu supaya stance tidak berpindah-pindah tiap frame (penyebab swing
    // tidak pernah dilepaskan pada pukulan wide).
    const preference = this.lockedClip && basePreference.includes(this.lockedClip)
      ? [this.lockedClip, ...basePreference.filter((clip) => clip !== this.lockedClip)]
      : basePreference
    const isLockedVariant = (clip: PlayerClip, z: ClipZone): boolean =>
      clip === this.lockedClip && this.lockedRole !== undefined && z.role === this.lockedRole

    const preferVariant = (clip: PlayerClip, a: ZoneVariant, b: ZoneVariant): boolean => {
      // Histeresis: varian power yang sudah dipilih untuk klip terkunci tidak
      // boleh berganti ke zona dasar tepat sebelum jendela swing terbuka.
      const aLocked = isLockedVariant(clip, a.zone) && a.time > a.zone.lead * 0.5
      const bLocked = isLockedVariant(clip, b.zone) && b.time > b.zone.lead * 0.5
      if (aLocked !== bLocked) return aLocked
      const aFeasible = a.margin >= 0.02
      const bFeasible = b.margin >= 0.02
      if (aFeasible !== bFeasible) return aFeasible
      const aPower = a.zone.role !== undefined
      const bPower = b.zone.role !== undefined
      if (aPower !== bPower) {
        // Varian power hanya berguna bila kontak masih cukup dalam. Kalau
        // shuttle sudah dekat net, net shot zona dasar lebih wajar.
        const power = aPower ? a : b
        return power.z <= -0.8 ? aPower : !aPower
      }
      return a.margin > b.margin
    }

    for (const clip of preference) {
      const baseZone = (serveReception ? CLIP_ZONES[clip] : RALLY_ZONES[clip]) ?? CLIP_ZONES[clip]
      if (!baseZone) continue
      if (!this.animationController || this.animationController.hasClip(clip) === false) continue

      // Satu klip boleh punya dua zona: zona dasar 2.16A (lead pendek, aman)
      // dan zona power 2.16B (lead lebih panjang, raket lebih cepat). Pilih
      // satu varian terbaik sebelum teknik masuk ke selector agar test
      // deterministik lama yang berbasis nama klip tetap berlaku.
      const zones = serveReception ? [baseZone] : [baseZone, POWER_ZONES[clip]].filter(
        (z): z is ClipZone => z !== undefined,
      )
      let chosen: ZoneVariant | null = null
      for (const zone of zones) {
        // RacketHitDetection membuka contactWindow pada 10% durasi klip. Bila
        // lead lebih pendek, shuttle tiba sebelum ayunan sah untuk kontak
        // (penyebab miss BackhandClear/Smash dengan minD ≈ 0.013 m).
        const clipDuration = this.animationController.clipDuration(clip)
        if (zone.lead < clipDuration * 0.1 + 0.01) continue

        const time = descendingTime(p.y, v.y, gravity, zone.dy)
        if (time === null || time <= 0.02 || time > PREDICT_HORIZON) continue

        const x = p.x + v.x * time
        const z = p.z + v.z * time
        if (z > ZONE_SIDE_Z) continue
        if (z < this.bounds.minZ - 0.8) continue

        // Tinggi lintasan pada saat melintas sudah sama dengan dy zona (akar
        // persis), jadi cukup cek posisi stance di dalam bounds.
        const stanceX = x - zone.dx
        const stanceZ = z - zone.dz
        if (stanceX < this.bounds.minX || stanceX > this.bounds.maxX) continue
        if (stanceZ < this.bounds.minZ || stanceZ > this.bounds.maxZ) continue

        const travel = Math.hypot(stanceX - position.x, stanceZ - position.z) / speed
        const margin = time - zone.lead - travel
        const variant: ZoneVariant = { zone, time, x, z, stanceX, stanceZ, margin }
        if (!chosen || preferVariant(clip, variant, chosen)) chosen = variant
      }
      if (!chosen) continue

      const { zone, time, x, z, stanceX, stanceZ, margin } = chosen
      const candidate: ReceptionPlan = {
        clip,
        zone,
        contactTime: time,
        stanceX: stanceX + this.interceptOffset.x,
        stanceZ: stanceZ + this.interceptOffset.z,
        margin,
      }
      const contact = new THREE.Vector3(x, zone.dy, z)
      contacts[clip] = contact
      // Buffer kecil: margin nol secara teoretis cukup, tetapi guard presisi
      // stance di updateSwingDecision yang menahan swing bila belum tiba.
      if (margin >= 0.02) feasible.push(candidate)
      // Semua teknik yang masih sempat diswing ikut dinilai selector. Tanpa
      // kumpulan ini, drive (lead terpendek) selalu menang margin dan rotasi
      // teknik tidak pernah berpengaruh.
      if (time > zone.lead * 0.5) {
        catchable.push(candidate)
        if (!contextContact) contextContact = contact
        if (!bestEffort || margin > bestEffort.margin) bestEffort = candidate
      }
    }

    // Penilaian selektif: kandidat dengan margin jauh lebih buruk dibuang,
    // sisanya dinilai selector (rotasi anti-ulang + sisi + tinggi). Setiap klip
    // dinilai pada kontak zonanya sendiri, bukan kontak kandidat pertama.
    const pool = feasible.length > 0 ? feasible : catchable
    // Kalau tidak ada teknik dengan margin aman, jangan biarkan selector
    // memilih klip yang lebih buruk hanya karena preferensi teknik; ambil
    // kandidat dengan margin terbaik supaya kontak tetap terjadi.
    if (feasible.length === 0 && bestEffort) best = bestEffort
    if (feasible.length > 0 && pool.length > 0 && contextContact) {
      const bestMargin = Math.max(...pool.map((plan) => plan.margin))
      // Zona power sengaja memakai lead lebih panjang, sehingga margin > 0
      // tetapi lebih kecil dari drive. Jangan buang hanya karena selisih
      // margin — setelah lolos uji sempat-swing, kualitas landing yang penting.
      const shortlist = pool.filter(
        (plan) =>
          (plan.zone.role !== undefined && plan.margin >= 0.02) ||
          plan.margin >= bestMargin - 0.1,
      )
      const roles: Partial<Record<PlayerClip, 'net' | 'drive' | 'clear' | 'lift' | 'smash'>> = {}
      for (const plan of shortlist) if (plan.zone.role) roles[plan.clip] = plan.zone.role
      const ranked = rankBlueTechniques(
        shortlist.map((plan) => plan.clip),
        {
          contact: contextContact,
          contacts,
          player: position,
          playerYaw: this.player.rotation.y,
          velocity: v,
          threatIndex: this.threatIndex,
          lastClip: this.lastShotClip,
          roles,
        },
      )
      best = ranked
        .map((clip) => shortlist.find((plan) => plan.clip === clip))
        .find((plan): plan is ReceptionPlan => plan !== undefined) ?? shortlist[0]
    }

    let pick = best ?? bestEffort
    if (!pick) return false

    // Kunci stance tetap, tetapi rotasi boleh mengganti teknik bila margin
    // kedatangannya tidak lebih buruk secara signifikan. Batas 0.08 s memberi
    // ruang bagi Clear/Lift/Smash untuk benar-benar terpakai tanpa memaksa
    // teknik yang jelas terlambat.
    if (this.lockedClip && best) {
      const locked = pool.find((plan) => plan.clip === this.lockedClip)
      if (!locked) {
        if (this.swingCooldown <= 0) {
          this.lockedClip = null
          this.lockedRole = undefined
        }
      } else if (best.clip !== locked.clip) {
        if (
          this.swingCooldown <= 0 &&
          this.threatElapsed - this.lastPlanChangeElapsed > 0.08
        ) {
          // Teknik power yang sudah feasible boleh mengganti kunci base;
          // sebaliknya kandidat base tidak boleh memaksa power keluar hanya
          // karena margin lebih besar (lead power memang lebih panjang).
          const canOverride =
            best.zone.role !== undefined ||
            (locked.zone.role === undefined && best.margin >= locked.margin - 0.08)
          pick = canOverride ? best : locked
        } else {
          // Jendela anti-oscillate: sebelum 0.08 s berlalu, kunci teknik lama.
          // Tanpa else ini `pick` tetap `best` sehingga plan berpindah tiap
          // frame dan swing tidak pernah dilepaskan tepat waktu.
          pick = locked
        }
      }
    }

    if (this.lockedClip !== pick.clip || this.lockedRole !== pick.zone.role) {
      this.lastPlanChangeElapsed = this.threatElapsed
    }
    this.plan = pick
    this.lockedClip = pick.clip
    this.lockedRole = pick.zone.role
    this.interceptTarget.set(
      THREE.MathUtils.clamp(pick.stanceX, this.bounds.minX, this.bounds.maxX),
      0,
      THREE.MathUtils.clamp(pick.stanceZ, this.bounds.minZ, this.bounds.maxZ),
    )
    return true
  }

  /** Intent untuk bergerak ke titik dunia tertentu (nol bila sudah sampai). */
  private moveToward(target: THREE.Vector3): MoveIntent {
    const dx = target.x - this.player.position.x
    const dz = target.z - this.player.position.z
    const distance = Math.hypot(dx, dz)
    // Stance intersepsi harus presisi (zona raket sempit); patroli boleh longgar.
    const tolerance =
      this.mode === 'intercept' ? INTERCEPT_ARRIVE_TOLERANCE : ARRIVE_TOLERANCE
    if (distance <= tolerance) return { x: 0, z: 0 }
    // Konversi arah dunia -> intent lokal (invers dari intentToWorld di
    // Movement.ts), sehingga sistem koordinat pemain tidak diubah.
    const yaw = this.player.rotation.y
    const sin = Math.sin(yaw)
    const cos = Math.cos(yaw)
    const wx = dx / distance
    const wz = dz / distance
    return { x: wx * cos - wz * sin, z: -wx * sin - wz * cos }
  }

  /** Kembali ke posisi home, lalu lanjut patroli. */
  private recoverIntent(delta: number): MoveIntent {
    const home = this.options.home
    if (!home) {
      this.setMode('patrol')
      this.resetPatrol()
      return { x: 0, z: 0 }
    }
    this.recoverTimer -= delta
    const distance = Math.hypot(home.x - this.player.position.x, home.z - this.player.position.z)
    if (distance <= HOME_TOLERANCE || this.recoverTimer <= 0) {
      this.setMode('patrol')
      this.resetPatrol()
      return { x: 0, z: 0 }
    }
    return this.moveToward(home)
  }

  /** Patroli lama: jeda acak berganti arah kiri/kanan di sekitar home. */
  private patrolIntent(delta: number): MoveIntent {
    const home = this.options.home
    if (home) {
      const dx = this.player.position.x - home.x
      const dz = this.player.position.z - home.z
      // Jangan stray terlalu jauh dari posisi siap; ini juga membuat AI tidak
      // otomatis mustahil menjangkau servis hanya karena patroli acak.
      if (Math.abs(dx) > PATROL_RADIUS || Math.abs(dz) > PATROL_DEPTH_RADIUS) {
        return this.moveToward(home)
      }
    }

    this.timer -= delta
    if (this.timer <= 0) this.chooseNextPatrolState()
    return this.patrolCurrentIntent()
  }

  private resetPatrol(): void {
    this.patrolState = 'idle'
    this.timer = this.randomBetween(IDLE_MIN, IDLE_MAX)
  }

  private setMode(mode: AiMode): void {
    if (this.mode === mode) return
    // Sesudah mengejar shuttle, putar Recovery singkat sebelum kembali patroli.
    if (mode === 'recover' && this.mode === 'intercept' && !this.serveHoldActive) {
      this.recoveryAnimRemaining = 0.45
    }
    this.mode = mode
  }

  /**
   * Footwork Blue (Tahap 2.16): klip yang benar-benar diputar dipilih dari
   * intent gerak + persepsi shuttle. Tidak memotong one-shot dan tidak
   * mengubah posisi/kecepatan — hanya animasi, sehingga collision tetap sah.
   */
  private updateAnimation(intent: MoveIntent, delta: number): void {
    const anim = this.animationController
    if (!anim) return

    const previousJump = this.jumpAnimRemaining
    this.jumpAnimRemaining = Math.max(0, this.jumpAnimRemaining - delta)
    this.landingAnimRemaining = Math.max(0, this.landingAnimRemaining - delta)
    this.recoveryAnimRemaining = Math.max(0, this.recoveryAnimRemaining - delta)
    if (previousJump > 0 && this.jumpAnimRemaining === 0) this.landingAnimRemaining = 0.3

    if (anim.isPlayingOneShot) return
    if (this.serveHoldActive) {
      // Ready stabil, bukan stop() tiap frame yang bisa memicu crossfade.
      if (anim.playingClip !== 'Ready') anim.stop()
      return
    }
    if (this.swingLockRemaining > 0) return

    if (this.jumpAnimRemaining > 0) { anim.playLoop('Jump'); return }
    if (this.landingAnimRemaining > 0) { anim.playLoop('Landing'); return }
    if (this.recoveryAnimRemaining > 0) { anim.playLoop('Recovery'); return }

    const shuttle = this.options.shuttle
    let incoming = false
    let distance = Infinity
    let height = Infinity
    let sideLocal = 0
    if (shuttle) {
      const s = shuttle.getPosition()
      const v = shuttle.getVelocity()
      incoming = shuttle.getPhase() === 'flying' && v.z < -0.05
      if (incoming) {
        const dx = s.x - this.player.position.x
        const dz = s.z - this.player.position.z
        distance = Math.hypot(dx, dz)
        height = s.y
        const sin = Math.sin(this.player.rotation.y)
        const cos = Math.cos(this.player.rotation.y)
        // Sisi kanan lokal (forehand) relatif terhadap orientasi Blue.
        sideLocal = dx * cos - dz * sin
      }
    }

    const moving = intent.x !== 0 || intent.z !== 0

    // SplitStep saat diam menghadapi shuttle yang datang (siap bereaksi).
    if (incoming && !moving && distance < 3.4) {
      anim.playLoop('SplitStep')
      return
    }

    // Lunge saat shuttle rendah & dekat dan Blue meraih.
    if (incoming && moving && height < 1.3 && distance < 2.2) {
      anim.playLoop(sideLocal >= 0 ? 'LungeForehand' : 'LungeBackhand')
      return
    }

    // Jump -> Landing untuk shuttle tinggi yang dekat; cukup sekali per ancaman.
    if (incoming && moving && height >= 2.1 && distance < 2.6 && !this.jumpUsedThisThreat) {
      this.jumpUsedThisThreat = true
      this.jumpAnimRemaining = 0.28
      anim.playLoop('Jump')
      return
    }

    let clip: PlayerClip
    if (!moving) {
      anim.stop()
      return
    }
    if (Math.abs(intent.x) >= Math.abs(intent.z)) {
      clip = intent.x > 0 ? 'ShuffleRight' : 'ShuffleLeft'
    } else {
      clip = intent.z > 0 ? 'WalkForward' : 'WalkBackward'
    }

    anim.playLoop(clip)
  }

  /**
   * Keputusan swing Blue. Rencana intersepsi sudah menentukan stance klip;
   * ayunan dimulai tepat `lead` detik sebelum shuttle mencapai zona kontak,
   * sehingga permukaan raket menyapu shuttle pada momen yang tepat. Kontak
   * tetap harus lolos RacketHitDetection (mesh raket + satu hit per swing).
   */
  private updateSwingDecision(delta: number): void {
    const shuttle = this.options.shuttle
    const requestSwing = this.options.requestSwing
    if (!shuttle || !requestSwing) return
    if (this.swingCooldown > 0) return
    if (shuttle.getPhase() !== 'flying') return
    if (!this.threatActive || this.reactionRemaining > 0) return
    if (!this.plan) return

    const v = shuttle.getVelocity()
    if (v.z >= 0) return // tidak menuju sisi Blue

    const { clip, zone, contactTime } = this.plan
    // Waktu mulai ayunan ideal; tolak bila shuttle sudah melampaui rencana.
    // Threshold delta*0.75 (bukan 0.5): kesalahan frame diserap ke arah EARLY,
    // karena kontak LATE fatal — shuttle ~7.5 m/s vs raket ~1.3 m/s, terlambat
    // 4 ms sudah meleset ~0.03 m; sedangkan EARLY aman karena shuttle masih
    // terbang masuk ke permukaan raket.
    const finalLead = zone.lead + this.swingTimingOffset
    if (contactTime - finalLead > delta * 0.75) return
    if (contactTime < zone.lead * 0.5) return // terlambat total, jangan buang swing

    const finalClip = clip

    // Ayunan hanya boleh dimulai bila tubuh masih sempat tiba di stance sebelum
    // permukaan raket mencapai zona kontak (atau sudah berada di stance).
    const dxStance = this.plan.stanceX - this.player.position.x
    const dzStance = this.plan.stanceZ - this.player.position.z
    const stanceDistance = Math.hypot(dxStance, dzStance)
    const arrivalTime = stanceDistance / this.balance.movementSpeed
    if (arrivalTime > Math.max(contactTime - finalLead, 0) + 0.06) return
    // Waktu tempuh teoritis bisa menipu saat rencana diambil dari bestEffort
    // (margin negatif): AI sempat "bergak walau belum sampai stance, lalu gerak
    // dibekukan. Radius kontak hanya 0.035 m, jadi swing hanya dilepas bila
    // tubuh benar-benar sudah berada di stance.
    if (stanceDistance > 0.075) return

    if (requestSwing(finalClip)) {
      this.lastShotClip = finalClip
      const duration = this.animationController?.clipDuration(finalClip) ?? 1.2
      // Bekukan gerak selama sapuan raket masih relevan, bukan seluruh klip.
      this.swingCooldown = SWING_RETRY_COOLDOWN
      this.swingLockRemaining = Math.min(duration, zone.lead + 0.3)
    } else {
      // Swing sedang berjalan; coba lagi setelah jeda pendek.
      this.swingCooldown = SWING_BUSY_COOLDOWN
    }
  }

  private patrolCurrentIntent(): MoveIntent {
    if (this.patrolState === 'moveLeft') return { x: -1, z: 0 }
    if (this.patrolState === 'moveRight') return { x: 1, z: 0 }
    return { x: 0, z: 0 }
  }

  private chooseNextPatrolState(): void {
    switch (this.patrolState) {
      case 'idle':
        this.patrolState = Math.random() < 0.5 ? 'moveLeft' : 'moveRight'
        this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX)
        break
      case 'moveLeft':
      case 'moveRight':
        if (Math.random() < 0.35) {
          this.patrolState = 'idle'
          this.timer = this.randomBetween(IDLE_MIN, IDLE_MAX)
        } else {
          this.patrolState = this.patrolState === 'moveLeft' ? 'moveRight' : 'moveLeft'
          this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX)
        }
        break
    }
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }

  /** Kept for symmetry with the player controller. */
  get position(): THREE.Vector3 {
    return this.player.position
  }
}
