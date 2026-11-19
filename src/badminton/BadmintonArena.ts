import * as THREE from 'three'
import type { Stage } from '../core/Stage.ts'
import { BadmintonAIController } from './controllers/AIController.ts'
import { BadmintonBarriers } from './environment/Barriers.ts'
import { BadmintonCourt, HALF_LENGTH, HALF_WIDTH } from './court/Court.ts'
import { BadmintonHall } from './environment/Hall.ts'
import { BadmintonHallLights } from './environment/HallLights.ts'
import { BadmintonNet, NET_HEIGHT } from './court/Net.ts'
import { BadmintonPlayerBench } from './environment/PlayerBench.ts'
import { BadmintonPlayerCamera } from './BadmintonPlayerCamera.ts'
import { BadmintonRacketHitDetection } from './physics/RacketHitDetection.ts'
import type { RacketHit } from './physics/RacketHitDetection.ts'
import { RacketSurfaceCollision } from './physics/RacketSurfaceCollision.ts'
import { BadmintonShuttlecock } from './entities/Shuttlecock.ts'
import { attachRacketProToPlayers } from './entities/RacketPro.ts'
import { BadmintonShuttlecockPhysics } from './physics/ShuttlecockPhysics.ts'
import {
  SERVE_CONTACT_TIME,
  SERVE_TARGET_DEPTH,
  SERVE_TARGET_X,
  solveServeVelocity,
  type ServeClipName,
} from './physics/ServeTrajectory.ts'
import { selectRedShot, type ShotTechnique } from './controllers/RedShotSelector.ts'
import { BadmintonSwingInput } from './input/SwingInput.ts'
import { HandGestureController } from './input/gesture/HandGestureController.ts'
import type { MovementBounds } from './controllers/Movement.ts'
import { BadmintonAnimationController } from './animation/AnimationController.ts'
import { BadmintonPlayerController } from './controllers/PlayerController.ts'
import { BadmintonMatchManager, type MatchState, type Player } from './match/MatchManager.ts'
import { BadmintonScoreboard } from './match/Scoreboard.ts'
import { BadmintonPointCelebration } from './match/PointCelebration.ts'
import {
  BADMINTON_PLAYER_RED_URL,
  BADMINTON_PLAYER_URL,
  BadmintonPlayerModel,
  type PlayerClip,
} from './entities/PlayerModel.ts'
import { BadmintonRefereeChair } from './environment/RefereeChair.ts'
import { BadmintonSignage } from './environment/Signage.ts'
import { BadmintonTribune } from './environment/Tribune.ts'

/**
 * Playable half per player: inside the court lines with a safety margin, and
 * never crossing the net at Z = 0.
 */
const MARGIN_SIDE = 0.35
const MARGIN_BACK = 0.35
const MARGIN_NET = 0.45

const BLUE_BOUNDS: MovementBounds = {
  minX: -(HALF_WIDTH - MARGIN_SIDE),
  maxX: HALF_WIDTH - MARGIN_SIDE,
  minZ: -(HALF_LENGTH - MARGIN_BACK),
  maxZ: -MARGIN_NET,
}

const RED_BOUNDS: MovementBounds = {
  minX: -(HALF_WIDTH - MARGIN_SIDE),
  maxX: HALF_WIDTH - MARGIN_SIDE,
  minZ: MARGIN_NET,
  maxZ: HALF_LENGTH - MARGIN_BACK,
}

/** Posisi siap (home) AI Blue saat tidak mengejar shuttlecock. */
const BLUE_HOME = new THREE.Vector3(0, 0, -3.2)

/** Scratch vectors reused when serving the practice feed. */
const feedPosition = new THREE.Vector3()
const feedVelocity = new THREE.Vector3()

/** Scratch vectors untuk siklus official serve (tangan kiri & raket server). */
const handWorldPos = new THREE.Vector3()
const racketWorldPos = new THREE.Vector3()

/**
 * Klip official serve yang dipakai. Default konsisten: ServeShort (servis
 * pendek tunggal). ServeLong tersedia dan teraudit (kontak @0.917 s); cukup
 * ganti konstanta ini untuk memakainya.
 */
const SERVE_CLIP: ServeClipName = 'ServeShort'

/** Shuttlecock duduk di telapak tangan kiri: sedikit di atas node tangan. */
const SERVE_HOLD_OFFSET_Y = 0.05

/** Jarak garis servis pendek dari net (sama dengan rumus serve lama). */
const SHORT_SERVICE_LINE = 1.98

/**
 * Demo trajectory for normal gameplay: served from the red side towards blue,
 * clearing the 1.524 m net and landing inside the court. It is not aimed at the
 * player's racket, so normal play keeps its original behaviour; use the practice
 * feed (KeyT) to rehearse shots.
 */
const DEMO_LAUNCH = {
  position: new THREE.Vector3(0, 1.5, 3.5),
  velocity: new THREE.Vector3(0, 3.08, -8.46),
}

/**
 * Practice feed, only used while hit test mode is on (KeyT).
 *
 * Measured from the GLB, not guessed. The Forehand clip moves the racket head
 * (node RacketFrame) through X 0.207..0.499, Y 0.924..1.673, Z -0.438..-0.228
 * in player-local metres, inside a reach of 0.325 m. The whole body plus racket
 * sweeps X -0.782..1.025, Y 0.000..2.240, Z -0.661..0.226.
 *
 * The shuttlecock is therefore served from 1.0 m in front of the player, so it
 * clearly leaves the body instead of appearing inside it: the spawn sits 0.339 m
 * outside the swept body envelope and 0.98 m away from the racket head.
 *
 * The lob is tuned so its apex crosses the edited ForehandClear contact pose
 * near (0.35, 1.70, -0.43) at 0.51 s. Triangle contact, not the old handle
 * reach sphere, decides whether that pass actually scores as a hit.
 *
 * offset   is player-local (model forward = -Z), velocity is world metres per
 * second. Both are relative to the player's live transform, so the feed follows
 * the player wherever they stand.
 */
const PRACTICE_FEED = {
  offset: new THREE.Vector3(0.3, 0.5, -1),
  velocity: new THREE.Vector3(0.1011, 4.8522, 1.112),
}

/**
 * Jeda (detik) setelah selebrasi poin benar-benar selesai. Selama jeda ini
 * servis berikutnya belum boleh dimulai; setelahnya permainan menunggu tombol
 * ENTER (Tahap 2.12).
 */
const POST_CELEBRATION_WAIT_SECONDS = 1.0

/**
 * Badminton arena prototype: court, net, shuttlecock, two GLB players and the
 * surrounding sports hall. Red is the human player (keyboard), blue is the AI
 * opponent. Shuttlecock flight, racket hit detection and a repeatable practice
 * feed are in place; rally, scoring and opponent shots are not.
 */
export class BadmintonArena implements Stage {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)

  readonly court = new BadmintonCourt()
  readonly net = new BadmintonNet()
  readonly shuttlecock = new BadmintonShuttlecock()
  readonly shuttlecockPhysics = new BadmintonShuttlecockPhysics({
    resetPoint: DEMO_LAUNCH.position,
  })

  private modelPlayers: BadmintonPlayerModel[] = []
  /** Red is the human player, blue is the AI opponent. */
  private redController: BadmintonPlayerController | null = null
  private gestureController: HandGestureController | null = null
  private blueAiController: BadmintonAIController | null = null
  private playerCamera: BadmintonPlayerCamera | null = null
  private mounted = false
  /** True while a fresh shuttlecock (demo shot or practice feed) is pending. */
  private feedArmed = false
  /**
   * True hanya ketika servis resmi diminta lewat tombol ENTER dan siklusnya
   * belum dimulai.
   */
  private pendingServe = false
  /**
   * True setelah poin diberikan dan rally selesai (POINT PAUSED) sampai servis
   * berikutnya dimulai. Servis TIDAK pernah dijalankan otomatis: arena menunggu
   * ENTER (Tahap 2.12).
   */
  private awaitingServeEnter = false
  private redHitDetection: BadmintonRacketHitDetection | null = null
  private blueHitDetection: BadmintonRacketHitDetection | null = null
  private redModel: BadmintonPlayerModel | null = null
  private redAnimController: BadmintonAnimationController | null = null
  private blueAnimController: BadmintonAnimationController | null = null
  private matchManager: BadmintonMatchManager | null = null
  private scoreboard: BadmintonScoreboard | null = null
  private pointCelebration: BadmintonPointCelebration | null = null
  /**
   * Snapshot skor terakhir untuk mendeteksi penambahan poin nyata.
   * `onScoreChange` juga dipanggil saat reset game/interval, jadi selebrasi
   * hanya boleh muncul ketika salah satu angka naik pada game yang sama.
   */
  private lastScoreSnapshot: { red: number; blue: number; gameNumber: number } | null = null
  /**
   * Sisa jeda (detik) setelah selebrasi poin sebelum ENTER diterima. Selama
   * nilainya > 0, ENTER diabaikan agar urutan transisi tidak terlewati.
   */
  private serveWaitRemaining = 0
  private lastHitBy: Player | null = null
  private readonly swingInput = new BadmintonSwingInput('Space', () => this.onSwingInput())
  private readonly hitTestToggle = new BadmintonSwingInput('KeyT', () => this.onToggleHitTest())
  private readonly startMatchInput = new BadmintonSwingInput('Enter', () => this.onStartMatchInput())
  private hitTestMode = false
  private jumpRemaining = 0
  private landingRemaining = 0
  private jumping = false
  private lastHit: RacketHit | null = null

  private _lastPhasePhysics: string | null = null
  private _lastPendingServe: boolean | null = null
  private _lastAwaitingServeEnter: boolean | null = null
  private _lastFeedArmed: boolean | null = null
  private _rallyCounter = 0
  private _launchCounter = 0
  /** Indeks rotasi peran pukulan Blue (Tahap 2.16B), deterministic per launch. */
  private _blueAimIndex = 0
  private _lastLogTime = 0
  private _lastLaunchSource = '-'
  private _rallyEndProcessed = false
  /** Jumlah retry otomatis saat kontak servis terlewat karena frame sangat lambat. */
  private _serveTimeoutRetries = 0

  /** Lifecycle official serve: idle -> shuttle held through racket contact -> physics flight. */
  private serveState: 'idle' | 'holding' | 'released' = 'idle'
  private servePlayer: Player | null = null
  private serveElapsed = 0
  private serveLaunched = false
  private serveRacketSpeed = 0
  private _lastServeSurfaceSample = -1
  private serveSurface: RacketSurfaceCollision | null = null
  private readonly servePrevRacketMatrix = new THREE.Matrix4()
  private readonly serveSampleRacketMatrix = new THREE.Matrix4()
  private readonly serveSweepRacketMatrix = new THREE.Matrix4()
  private readonly servePrevShuttlePos = new THREE.Vector3()
  private readonly serveSampleShuttlePos = new THREE.Vector3()
  private readonly serveSweepShuttlePos = new THREE.Vector3()
  private servePrevClipTime = 0
  private readonly serveSurfaceContact = {
    point: new THREE.Vector3(),
    distance: Infinity,
    surfaceVelocity: new THREE.Vector3(),
  }
  private serveContactPos = new THREE.Vector3()
  /** Server yang terakhir dilog saat POINT PAUSED (shuttle di tangan). */
  private _pointPausedHandServer: Player | null = null

  readonly hall = new BadmintonHall()
  readonly hallLights = new BadmintonHallLights()
  readonly tribune = new BadmintonTribune()
  readonly benches = new BadmintonPlayerBench()
  readonly refereeChair = new BadmintonRefereeChair()
  readonly signage = new BadmintonSignage()
  readonly barriers = new BadmintonBarriers()

  constructor() {
    this.scene.background = new THREE.Color(0x0a1424)
    this.scene.fog = new THREE.Fog(0x0a1424, 22, 62)

    this.scene.add(this.hall.group)
    this.scene.add(this.court.group, this.net.group)
    this.scene.add(this.createLights())
    this.scene.add(this.hallLights.group)

    this.scene.add(this.shuttlecock.group)

    // Mulai dalam keadaan tersembunyi: shuttlecock tidak boleh terlihat atau
    // aktif sebelum mekanisme permainan (servis resmi / practice feed) memanggil
    // launch. Visibilitas diatur ulang ke true di sana.
    this.shuttlecock.group.visible = false

    this.scene.add(
      this.refereeChair.group,
      this.barriers.group,
      this.tribune.group,
      this.benches.group,
      this.signage.group,
    )

    this.camera.position.set(0, 7.2, 13.6)
    this.camera.lookAt(0, 1.1, 0)

    this.gestureController = new HandGestureController({
      onStroke: (technique) => this.onSwingInput(technique),
    })

    void this.loadModelPlayers()
  }

  /** Advances the GLB animations, the controllers, then the gameplay camera. */
  update(delta: number): void {
    this.gestureController?.update()
    this.redAnimController?.update(delta)
    this.blueAnimController?.update(delta)
    // Suap awareness shuttle hanya untuk footwork reaktif Red (SplitStep/Lunge).
    this.redController?.setShuttleAwareness(
      this.shuttlecockPhysics.getPosition(),
      this.shuttlecockPhysics.getVelocity(),
      this.shuttlecockPhysics.getPhase(),
    )
    this.redController?.update(delta)
    this.updateJump(delta)
    this.blueAiController?.update(delta)

    // Physics selalu berjalan agar reset timer berjalan setelah shuttlecock
    // mendarat. Saat Practice Feed OFF, resetTimer akan habis dan phase menjadi
    // 'idle'; servis berikutnya tetap menunggu ENTER, tidak pernah otomatis
    // (Tahap 2.12).
    const event = this.shuttlecockPhysics.update(delta)

    // Log perubahan phase physics
    const currentPhase = this.shuttlecockPhysics.getPhase()
    if (currentPhase !== this._lastPhasePhysics) {
      console.info(
        `[BADMINTON-DIAG] update: physics phase changed ${this._lastPhasePhysics} -> ${currentPhase}, pos=${this.shuttlecockPhysics.getPosition().toArray().map((v) => v.toFixed(2)).join(',')}, vel=${this.shuttlecockPhysics.getVelocity().toArray().map((v) => v.toFixed(2)).join(',')}, rally=${this._rallyCounter}, launch=${this._launchCounter}, src=${this._lastLaunchSource}`
      )
      this._lastPhasePhysics = currentPhase
    }

    // Log perubahan pendingServe
    if (this.pendingServe !== this._lastPendingServe) {
      console.info(
        `[BADMINTON-DIAG] update: pendingServe changed ${this._lastPendingServe} -> ${this.pendingServe}`
      )
      this._lastPendingServe = this.pendingServe
    }

    // Log perubahan awaitingServeEnter (POINT PAUSED menunggu Enter)
    if (this.awaitingServeEnter !== this._lastAwaitingServeEnter) {
      console.info(
        `[BADMINTON-DIAG] update: awaitingServeEnter changed ${this._lastAwaitingServeEnter} -> ${this.awaitingServeEnter}`
      )
      this._lastAwaitingServeEnter = this.awaitingServeEnter
    }

    // Log perubahan feedArmed
    if (this.feedArmed !== this._lastFeedArmed) {
      console.info(
        `[BADMINTON-DIAG] update: feedArmed changed ${this._lastFeedArmed} -> ${this.feedArmed}`
      )
      this._lastFeedArmed = this.feedArmed
    }

    if (event === 'landed' || event === 'outOfBounds') {
      console.info(
        `[BADMINTON-DIAG] update: physics event ${event}, pos=${this.shuttlecockPhysics.getPosition().toArray().map((v) => v.toFixed(2)).join(',')}, velocity=${this.shuttlecockPhysics.getVelocity().toArray().map((v) => v.toFixed(2)).join(',')}`
      )
      this.handleRallyEnd(event)
      // Hanya re-arm Practice Feed saat hitTestMode aktif.
      if (this.hitTestMode) this.feedArmed = true
    }

    this.matchManager?.updateInterval(delta)

    const hit = this.redHitDetection?.update(delta, this.shuttlecockPhysics.getPosition())
    // Selama official serve disiapkan (shuttle di tangan), kontak raket diabaikan
    // agar swing tidak memicu peluncuran kedua.
    if (hit && this.serveState === 'idle') {
      console.info(
        `[BADMINTON-DIAG] update: racket HIT detected! clip=${hit.clip} surfaceDistance=${hit.surfaceDistance.toFixed(4)}m speed=${hit.speed.toFixed(2)} pos=${hit.point.toArray().map((v) => v.toFixed(2)).join(',')}, velocity=${hit.velocity.toArray().map((v) => v.toFixed(2)).join(',')}`
      )
      this.applyHit(hit, 'red')
    }

    // Pemeriksaan kontak raket Blue setiap frame (API dan pola sama dengan Red).
    const blueHit = this.blueHitDetection?.update(delta, this.shuttlecockPhysics.getPosition())
    if (blueHit && this.serveState === 'idle') {
      console.info(
        `[BADMINTON-DIAG] update: BLUE racket HIT detected! clip=${blueHit.clip} surfaceDistance=${blueHit.surfaceDistance.toFixed(4)}m speed=${blueHit.speed.toFixed(2)} pos=${blueHit.point.toArray().map((v) => v.toFixed(2)).join(',')}, velocity=${blueHit.velocity.toArray().map((v) => v.toFixed(2)).join(',')}`
      )
      this.applyHit(blueHit, 'blue')
    }

    // Jeda pasca-selebrasi (Tahap 2.12): hitung mundur 1 detik setelah banner
    // benar-benar hilang. Fungsi ini hanya membuka gerbang ENTER; tidak pernah
    // memulai servis sendiri.
    this.tickServeWait(delta)

    // Official serve: gate mengonsumsi permintaan servis (pendingServe) yang
    // hanya datang dari tombol ENTER. Siklus servis resmi tetap satu jalur.
    // Jika animasi sibuk, beginOfficialServe menunda dan pendingServe
    // dipertahankan untuk dicoba frame berikutnya.
    if (this.pendingServe && this.shuttlecockPhysics.isReadyToLaunch()) {
      console.info(
        `[BADMINTON-DIAG] update: pendingServe=true, isReadyToLaunch=true, hitTestMode=${this.hitTestMode}, feedArmed=${this.feedArmed}, memulai persiapan official serve`
      )
      this.beginOfficialServe()
    }

    if (this.serveState !== 'idle') {
      // Servis berlangsung: shuttle mengikuti tangan kiri server, bukan physics.
      this.updateOfficialServe(delta)
    } else if (
      this.awaitingServeEnter &&
      this.shuttlecockPhysics.getPhase() === 'idle' &&
      !this.hitTestMode &&
      this.matchManager &&
      !this.matchManager.isMatchOver()
    ) {
      // POINT PAUSED (Tahap 2.4): shuttle TIDAK melayang di titik reset.
      // Tampilkan di tangan kiri server BERIKUTNYA sampai pemain menekan Enter.
      const hand =
        this.playerModelOf(this.matchManager.getServer())?.getLeftHand() ?? null
      if (hand) {
        hand.getWorldPosition(handWorldPos)
        handWorldPos.y += SERVE_HOLD_OFFSET_Y
        this.shuttlecock.setPosition(handWorldPos)
        this.shuttlecock.setVelocity(racketWorldPos.set(0, 0, 0))
        this.shuttlecock.group.visible = true
        const server = this.matchManager.getServer()
        if (this._pointPausedHandServer !== server) {
          this._pointPausedHandServer = server
          console.info(
            `[BADMINTON-DIAG] update: POINT PAUSED — shuttle ditampilkan di tangan kiri server berikutnya (${server}), tekan ENTER untuk servis`
          )
        }
      } else {
        // Model belum termuat: sinkronisasi normal sebagai fallback.
        this.shuttlecock.setPosition(this.shuttlecockPhysics.getPosition())
        this.shuttlecock.setVelocity(this.shuttlecockPhysics.getVelocity())
      }
    } else {
      this._pointPausedHandServer = null
      this.shuttlecock.setPosition(this.shuttlecockPhysics.getPosition())
      this.shuttlecock.setVelocity(this.shuttlecockPhysics.getVelocity())
    }
    this.shuttlecock.update(delta)

    // Temporary 2.10 browser driver: gives the test harness simulation-space
    // shuttle coordinates so Space can be triggered from the measured feed arc.
    if (typeof window !== 'undefined' && (this.hitTestMode || this.serveState !== 'idle')) {
      ;(window as Window & { __badminton210?: unknown }).__badminton210 = {
        phase: this.shuttlecockPhysics.getPhase(),
        position: this.shuttlecockPhysics.getPosition().toArray(),
        velocity: this.shuttlecockPhysics.getVelocity().toArray(),
        source: this._lastLaunchSource,
        hitTestMode: this.hitTestMode,
        serveState: this.serveState,
        serveElapsed: this.serveElapsed,
      }
    }

    // Log posisi dan velocity berkala saat flying untuk diagnosing lintasan
    const currentTime = Date.now()
    if (this.shuttlecockPhysics.getPhase() === 'flying' && currentTime - this._lastLogTime >= 500) {
      const physicsPos = this.shuttlecockPhysics.getPosition()
      const physicsVel = this.shuttlecockPhysics.getVelocity()
      const visualPos = this.shuttlecock.group.position
      const visualPosWorld = this.shuttlecock.group.getWorldPosition(new THREE.Vector3())
      console.info(
        `[BADMINTON-DIAG] update: flying pos=(${physicsPos.x.toFixed(2)},${physicsPos.y.toFixed(2)},${physicsPos.z.toFixed(2)}) vel=(${physicsVel.x.toFixed(2)},${physicsVel.y.toFixed(2)},${physicsVel.z.toFixed(2)}) visual=(${visualPos.x.toFixed(2)},${visualPos.y.toFixed(2)},${visualPos.z.toFixed(2)}) world=(${visualPosWorld.x.toFixed(2)},${visualPosWorld.y.toFixed(2)},${visualPosWorld.z.toFixed(2)}) rally=${this._rallyCounter} launch=${this._launchCounter} src=${this._lastLaunchSource}`
      )
      this._lastLogTime = currentTime
    }

    // Practice feed (KeyT): hanya dari Red, tidak mengubah server pertandingan.
    // Tidak berjalan selama official serve disiapkan, dan tidak boleh mencuri
    // slot pendingServe yang diminta pemain lewat Enter (Tahap 2.1).
    if (
      this.hitTestMode &&
      !this.pendingServe &&
      this.serveState === 'idle' &&
      this.shuttlecockPhysics.isReadyToLaunch()
    ) {
      this.launchPracticeFeed()
    }

    this.playerCamera?.update(delta)
  }

  /**
   * Peran teknik Blue untuk pengaraman hasil pukulan (Tahap 2.16B).
   * Dipakai setelah kontak raket nyata terverifikasi; tidak mengubah klip,
   * animasi, collision, atau pergerakan pemain.
   */
  private static readonly BLUE_SHOT_ROLES: Partial<Record<PlayerClip, 'net' | 'drive' | 'clear' | 'lift' | 'smash'>> = {
    DropShot: 'net',
    NetKill: 'net',
    ForehandDrive: 'drive',
    BackhandDrive: 'drive',
    ForehandClear: 'clear',
    BackhandClear: 'clear',
    DefensiveBlock: 'clear',
    Lift: 'lift',
    Smash: 'smash',
    JumpSmash: 'smash',
  }

  /**
   * Arahkan hasil kontak Blue ke titik jatuh yang dihitung (2.16B).
   *
   * Kontak tetap berasal dari `RacketHitDetection` — fungsi ini hanya memilih
   * arah keluar, bukan membuat/mengganti kontak, memindahkan shuttlecock, atau
   * mengubah kontrol Red. Besarnya kecepatan berasal dari kecepatan raket hasil
   * kontak; speed hanya dinaikkan seperlunya sampai target terjangkau, lalu
   * dihitung sudut elevasi (busur rendah/tinggi sesuai peran teknik) sehingga
   * lintasan mendarat di target dan melewati net.
   */
  private aimBlueVelocity(hit: RacketHit, origin: THREE.Vector3): THREE.Vector3 {
    // Rotasi hasil pukulan: radius kontak raket hanya ~0.035 m, sehingga klip
    // yang benar-benar terpilih sering sama (drive). Variasi hasil tetap
    // dijamin deterministik lewat nomor launch, bukan RNG per frame.
    // Semua varian dipilih supaya waktu tempuh masih memberi ruang bagi Red
    // mengayun (kontak DefensiveBlock aktual ada di clipTime ≈0,6 s).
    const rotation: readonly string[] = ['drive', 'clear', 'drive', 'lift', 'clear', 'drive']
    const clipRole = BadmintonArena.BLUE_SHOT_ROLES[hit.clip] ?? 'drive'
    const role: string = rotation[this._blueAimIndex++ % rotation.length] ?? clipRole
    const red = this.playerModelOf('red')
    const redX = red?.group.position.x ?? 0
    const side = this._launchCounter % 2 === 0 ? 1 : -1
    // Target x sengaja dekat tengah: kalau mengikuti posisi Red yang sudah
    // bergeser, beberapa exchange berikutnya memaksa Red return dari sisi
    // lapangan dan shuttle keluar garis.
    const targetX = THREE.MathUtils.clamp(redX * 0.25 + side * 0.6, -1.0, 1.0)
    // Kedalaman minimum dijaga agar shuttle tidak tiba di raket Red lebih
    // cepat daripada waktu ayunan teknik penerimaan (≈0,6 s). Posisi Red tetap
    // dipakai untuk arah x; kedalaman memakai rentang teknik yang terukur.
    // Target relatif pendek (~3 m) sengaja dipilih: Red memukul dari titik itu
    // dan return-nya masih menyentuh tinggi raket Blue setelah melewati net.
    // Target dalam memaksa Red memukul dari belakang, lalu shuttle turun di
    // sisi Red sebelum sempat dijangkau Blue.
    const depth =
      role === 'net'
        ? 2.0
        : role === 'smash'
          ? 2.6
          : role === 'clear'
            ? 3.2
            : role === 'lift'
              ? 3.3
              : 2.8
    let targetZ = THREE.MathUtils.clamp(depth, 0.75, HALF_LENGTH - 0.6)

    const gravity = this.shuttlecockPhysics.getGravity()
    const solve = (dx: number, dz: number, speed: number, highArc: boolean): THREE.Vector3 | null => {
      const distance = Math.hypot(dx, dz)
      if (distance < 0.2) return null
      const dy = 0.05 - origin.y
      const a = (gravity * distance * distance) / (2 * speed * speed)
      const disc = distance * distance - 4 * a * (dy + a)
      if (disc < 0 || a <= 0) return null
      const tan = highArc
        ? (distance + Math.sqrt(disc)) / (2 * a)
        : (distance - Math.sqrt(disc)) / (2 * a)
      const cos = 1 / Math.sqrt(1 + tan * tan)
      const horizontal = speed * cos
      return new THREE.Vector3(
        (dx / distance) * horizontal,
        speed * tan * cos,
        (dz / distance) * horizontal,
      )
    }

    const clearsNet = (velocity: THREE.Vector3): boolean => {
      if (velocity.z <= 0.05) return false
      const t = -origin.z / velocity.z
      if (t <= 0) return false
      return origin.y + velocity.y * t - 0.5 * gravity * t * t > NET_HEIGHT + 0.12
    }

    // Red memakai teknik dengan kontak aktual sekitar 0,6 s setelah ayunan
    // dimulai. Beri waktu minimum sebelum shuttle turun ke tinggi raket agar
    // penerimaan masih sempat dipicu, walau kontak Blue terjadi dekat net.
    const MIN_REACH_TIME = 0.68
    const reachTime = (velocity: THREE.Vector3): number => {
      const disc = velocity.y * velocity.y - 2 * gravity * (1.5 - origin.y)
      if (disc < 0) return 0
      return (velocity.y + Math.sqrt(disc)) / gravity
    }
    const acceptable = (velocity: THREE.Vector3): boolean =>
      clearsNet(velocity) && reachTime(velocity) >= MIN_REACH_TIME

    let aimed: THREE.Vector3 | null = null
    let x = targetX
    for (let attempt = 0; attempt < 12 && !aimed; attempt++) {
      const dx = x - origin.x
      const dz = targetZ - origin.z
      for (let speed = hit.speed; speed <= 12.5 && !aimed; speed += 0.5) {
        const low = solve(dx, dz, speed, false)
        if (low && acceptable(low)) {
          aimed = low
          break
        }
        const high = solve(dx, dz, speed, true)
        if (high && acceptable(high)) {
          aimed = high
          break
        }
      }
      if (!aimed) {
        // Target terlalu jauh untuk kecepatan wajar: tarik mendekat sedikit,
        // tetap di dalam lapangan Red.
        x = THREE.MathUtils.lerp(x, origin.x + Math.sign(x - origin.x) * 0.8, 0.12)
        targetZ = THREE.MathUtils.lerp(targetZ, origin.z + 1.6, 0.12)
      }
    }

    if (!aimed) return hit.velocity.clone()
    aimed.clampLength(4.5, 14)
    return aimed
  }

  /**
   * Replaces the shuttlecock velocity with the racket impulse. The shuttlecock
   * keeps the exact position it already had, so a hit never teleports it onto
   * the racket, and the pending feed is cancelled so the struck trajectory
   * survives instead of being overwritten by a fresh launch.
   */
  private applyHit(hit: RacketHit, player: Player): void {
    this._launchCounter += 1
    this._lastLaunchSource = player === 'red' ? 'applyHit-red' : 'applyHit-blue'
    this._rallyEndProcessed = false
    const origin = this.shuttlecockPhysics.getPosition().clone()
    const outgoing = player === 'blue' ? this.aimBlueVelocity(hit, origin) : hit.velocity.clone()
    console.info(
      `[BADMINTON-DIAG] applyHit: launch#${this._launchCounter} rally#${this._rallyCounter} src=${this._lastLaunchSource} player=${player} clip=${hit.clip} speed=${hit.speed.toFixed(2)} point=(${hit.point.x.toFixed(2)},${hit.point.y.toFixed(2)},${hit.point.z.toFixed(2)}) racketVel=(${hit.velocity.x.toFixed(2)},${hit.velocity.y.toFixed(2)},${hit.velocity.z.toFixed(2)}) outgoing=(${outgoing.x.toFixed(2)},${outgoing.y.toFixed(2)},${outgoing.z.toFixed(2)})`
    )
    this.shuttlecockPhysics.launch(origin, outgoing)
    this.feedArmed = false
    this.lastHit = hit
    this.lastHitBy = player
    console.info(
      `[BADMINTON-DIAG] applyHit: after launch launch#${this._launchCounter} rally#${this._rallyCounter} player=${player} pos=${this.shuttlecockPhysics.getPosition().toArray().map((v) => v.toFixed(2)).join(',')}, vel=${this.shuttlecockPhysics.getVelocity().toArray().map((v) => v.toFixed(2)).join(',')}`
    )
  }

  /**
   * Menangani akhir reli ketika shuttlecock mendarat atau keluar lapangan.
   * Menentukan pemenang reli berdasarkan posisi mendarat:
   *   - Mendarat di sisi Red (z > 0): Red kehilangan poin → Blue menang
   *   - Mendarat di sisi Blue (z < 0): Blue kehilangan poin → Red menang
   *   - Keluar lapangan: pemain yang terakhir memukul kehilangan poin
   */
  private handleRallyEnd(event: 'landed' | 'outOfBounds'): void {
    // [BADMINTON-DIAG] Dedup: satu reli hanya boleh menghasilkan satu log dan
    // satu awardPoint. Flag ini direset setiap kali launch() dipanggil lagi.
    if (this._rallyEndProcessed) {
      console.info(
        `[BADMINTON-DIAG] handleRallyEnd: DUPLICATE event=${event} rally=${this._rallyCounter} diabaikan`
      )
      return
    }
    this._rallyEndProcessed = true

    if (!this.matchManager) return
    if (this.matchManager.isMatchOver()) return

    let winner: Player | null = null

    if (event === 'landed') {
      const pos = this.shuttlecockPhysics.getPosition()
      // Pemain di sisi tempat shuttlecock mendarat kehilangan poin
      winner = pos.z > 0 ? 'blue' : 'red'
    } else {
      // outOfBounds: pemain yang terakhir memukul kehilangan poin
      if (this.lastHitBy === 'red') winner = 'blue'
      else if (this.lastHitBy === 'blue') winner = 'red'
      // Jika lastHitBy tidak diketahui, winner tetap null (tidak memberikan poin)
    }

    console.info(
      `[BADMINTON-DIAG] handleRallyEnd: rally=${this._rallyCounter} event=${event}, pos=(${this.shuttlecockPhysics.getPosition().x.toFixed(2)},${this.shuttlecockPhysics.getPosition().y.toFixed(2)},${this.shuttlecockPhysics.getPosition().z.toFixed(2)}), winner=${winner}`
    )

    if (winner) {
      // awardPoint memicu onScoreChange secara sinkron; callback itulah yang
      // menampilkan selebrasi poin (Tahap 2.11), bukan jalur kedua di sini.
      this.matchManager.awardPoint(winner)
      // AI Blue harus berhenti dari intent reli/patroli begitu poin selesai.
      // Jika Blue menjadi server, ia kembali ke posisi siap servis dan diam.
      this.blueAiController?.setServeHold(this.matchManager.getServer() === 'blue')
      // Servis berikutnya TIDAK dijalankan otomatis (Tahap 2.12). Arena masuk
      // ke POINT PAUSED: setelah banner selesai masih ada jeda 1 detik, lalu
      // servis hanya dimulai ketika pemain menekan ENTER.
      this.awaitingServeEnter = true
      this.serveWaitRemaining = this.hitTestMode ? 0 : POST_CELEBRATION_WAIT_SECONDS
      console.info(
        `[BADMINTON-DIAG] handleRallyEnd: after awardPoint rally=${this._rallyCounter} winner=${winner}, new server=${this.matchManager?.getServer()}, serveSide=${this.matchManager?.getServeSide()}, score=${this.matchManager?.getState().currentGame.red}-${this.matchManager?.getState().currentGame.blue}, pendingServe=${this.pendingServe}, serveWaitRemaining=${this.serveWaitRemaining.toFixed(2)}s`
      )
      console.info(
        `[BADMINTON-DIAG] handleRallyEnd: POINT PAUSED — selebrasi poin berjalan, setelah itu tunggu ${POST_CELEBRATION_WAIT_SECONDS.toFixed(1)}s lalu tekan ENTER`
      )
    } else {
      // Tidak ada winner: poin tidak diberikan, tetapi siklus servis harus
      // tetap bisa dilanjutkan — tunggu Enter untuk servis berikutnya.
      this.awaitingServeEnter = true
      this.serveWaitRemaining = 0
      this.blueAiController?.setServeHold(this.matchManager?.getServer() === 'blue')
      console.info(
        `[BADMINTON-DIAG] handleRallyEnd: no winner (hasContact=false), pendingServe unchanged, POINT PAUSED — tekan ENTER untuk servis berikutnya`
      )
    }
  }

  /**
   * Satu-satunya jalur selebrasi poin (Tahap 2.11).
   *
   * `onScoreChange` juga dipanggil saat startMatch, reset, advanceGame, dan
   * interval, jadi hanya delta skor positif pada game yang sama yang dianggap
   * sebagai poin baru. Ini juga yang menjamin satu rally = satu notifikasi.
   */
  private handleScoreChange(state: MatchState): void {
    const previous = this.lastScoreSnapshot

    this.scoreboard?.update(state)
    this.lastScoreSnapshot = {
      red: state.currentGame.red,
      blue: state.currentGame.blue,
      gameNumber: state.gameNumber,
    }

    if (!previous || previous.gameNumber !== state.gameNumber) return

    const redDelta = state.currentGame.red - previous.red
    const blueDelta = state.currentGame.blue - previous.blue
    if (redDelta <= 0 && blueDelta <= 0) return

    // Dalam satu rally hanya satu pemain bisa menambah poin; jika data tidak
    // normal, ambil delta terbesar agar banner tetap menunjuk pemain yang benar.
    const player: Player = redDelta >= blueDelta ? 'red' : 'blue'
    this.showPointCelebration(previous, state, player)
  }

  /** Tampilkan banner untuk poin yang baru saja diberikan MatchManager. */
  private showPointCelebration(
    previous: { red: number; blue: number; gameNumber: number },
    state: MatchState,
    player: Player
  ): void {
    // Practice feed (KeyT) punya siklusnya sendiri dan tidak memakai POINT
    // PAUSED; jangan menampilkan selebrasi pertandingan di sana.
    if (!this.pointCelebration || this.hitTestMode) return

    this.pointCelebration.show({
      player,
      scoreBefore: { red: previous.red, blue: previous.blue },
      scoreAfter: { red: state.currentGame.red, blue: state.currentGame.blue },
      gameNumber: state.gameNumber,
      gamesWon: state.gamesWon,
    })
  }

  /**
   * Menghitung jeda 1 detik setelah banner poin benar-benar hilang.
   *
   * Fungsi ini HANYA membuka gerbang ENTER; tidak pernah memulai servis
   * sendiri. Servis berikutnya tetap memakai mekanisme official serve yang
   * sama setelah pemain menekan ENTER (Tahap 2.12).
   */
  private tickServeWait(delta: number): void {
    if (!this.awaitingServeEnter || this.hitTestMode) return
    if (this.serveWaitRemaining <= 0) return
    // Jeda baru mulai dihitung setelah selebrasi poin selesai sepenuhnya.
    if (this.pointCelebration?.isActive) return

    this.serveWaitRemaining = Math.max(0, this.serveWaitRemaining - delta)
    if (this.serveWaitRemaining === 0) {
      const manager = this.matchManager
      console.info(
        `[BADMINTON-DIAG] tickServeWait: jeda pasca-selebrasi selesai, menunggu ENTER — server=${manager?.getServer()}, serveSide=${manager?.getServeSide()}, status=${manager?.getState().status}`
      )
    }
  }

  /**
   * Space starts a swing. It never launches or moves the shuttlecock: the
   * practice feed runs on its own cycle while hit test mode is enabled, so a
   * press can only ever produce a hit through the real collision test.
   *
   * A false return from requestSwing means a swing is already running, so the
   * press is simply ignored: playing Ready here would cut the running Forehand
   * short. Returning to the stance is handled by BadmintonPlayerModel.update
   * once the swing clip finishes.
   */
  private onSwingInput = (technique?: ShotTechnique): void => {
    console.info(
      `[BADMINTON-DIAG] onSwingInput dipanggil technique=${technique ?? 'keyboard'} shuttle=${this.shuttlecockPhysics.getPosition().toArray().map(v=>v.toFixed(3)).join(',')} phase=${this.shuttlecockPhysics.getPhase()}`
    )
    const p = this.shuttlecockPhysics.getPosition()
    const v = this.shuttlecockPhysics.getVelocity()
    const model = this.playerModelOf('red')
    const clip = model
      ? selectRedShot({
          shuttlePosition: p,
          shuttleVelocity: v,
          playerPosition: model.group.position,
          playerYaw: model.group.rotation.y,
          isJumping: this.jumping,
          // Hint gesture hanya bias; geometri shuttle tetap menentukan teknik.
          ...(technique ? { preferredTechnique: technique } : {}),
        })
      : undefined
    const started = this.redHitDetection?.requestSwing(clip)
    console.info(
      `[BADMINTON-DIAG] onSwingInput clip=${clip} hasil=${started} shuttle=(${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)})`
    )
  }

  /** KeyT toggles the practice feed used to test hitting. */
  private onToggleHitTest = (): void => {
    this.hitTestMode = !this.hitTestMode

    // feedArmed hanya dihidupkan saat Practice Feed diaktifkan. Saat dimatikan,
    // feedArmed harus false sehingga tidak ada shuttlecock baru yang diluncurkan
    // setelah shuttlecock saat ini selesai terbang.
    this.feedArmed = this.hitTestMode

    // reset physics hanya saat menyala feed, agar siklus baru segera dimulai.
    // Saat dimatikan, jangan memanggil reset: shuttlecock yang sedang terbang
    // harus tetap menyelesaikan lintasannya sesuai physics normal.
    if (this.hitTestMode) this.shuttlecockPhysics.reset()

    console.info(
      `[BADMINTON-DIAG] onToggleHitTest: hitTestMode=${this.hitTestMode}, feedArmed=${this.feedArmed}`
    )
    console.info(
      `[BADMINTON-DIAG] onToggleHitTest: physics.phase=${this.shuttlecockPhysics.getPhase()}, isReadyToLaunch=${this.shuttlecockPhysics.isReadyToLaunch()}`
    )
  }

  /**
   * Gate gestur servis: mirror semua syarat yang membuat ENTER diterima.
   * Keputusan akhir tetap di onStartMatchInput, jadi tidak ada servis palsu.
   */
  private canGestureServe(): boolean {
    const state = this.matchManager?.getState()
    const phase = this.shuttlecockPhysics.getPhase()
    if (this.pointCelebration?.isActive) return false
    if (this.awaitingServeEnter && this.serveWaitRemaining > 0) return false
    if (this.matchManager?.isMatchOver() || this.matchManager?.isInInterval()) return false
    if (this.serveState !== 'idle' || this.pendingServe) return false
    if (phase === 'flying' || phase === 'resetting') return false
    return state?.status === 'ready' || this.awaitingServeEnter
  }

  /**
   * Enter: satu tekan = satu siklus servis.
   *
   * Sejak Tahap 2.12 servis berikutnya TIDAK pernah otomatis. Setelah poin,
   * arena menunggu banner selesai + 1 detik, lalu ENTER memulai servis resmi
   * dengan server/sisi terbaru dari MatchManager.
   *
   * | Kondisi                | Perilaku                                              |
   * | READY (belum mulai)    | mulai pertandingan + siapkan servis pertama           |
   * | SERVING (serveState≠idle) | diabaikan                                          |
   * | RALLY (phase flying)   | diabaikan                                             |
   * | POINT PAUSED (idle)    | mulai servis berikutnya (server/sisi dari MatchManager)|
   * | Banner poin aktif      | diabaikan (tunggu banner + jeda 1 detik selesai)      |
   * | Jeda pasca-selebrasi   | diabaikan (belum boleh servis)                        |
   * | physics resetting      | diabaikan total (tidak di-queue; tunggu Enter baru)    |
   * | INTERVAL               | diabaikan (aturan interval MatchManager tetap berlaku) |
   * | MATCH OVER             | diabaikan                                             |
   */
  private onStartMatchInput = (): void => {
    const stateBefore = this.matchManager?.getState()
    const phase = this.shuttlecockPhysics.getPhase()
    console.info(
      `[BADMINTON-DIAG] onStartMatchInput: status=${stateBefore?.status}, server=${stateBefore?.server}, serveSide=${stateBefore?.serveSide}, score=${stateBefore?.currentGame.red}-${stateBefore?.currentGame.blue}, phase=${phase}, serveState=${this.serveState}, pendingServe=${this.pendingServe}, awaitingServeEnter=${this.awaitingServeEnter}, serveWaitRemaining=${this.serveWaitRemaining.toFixed(2)}`
    )

    // Selama banner poin tampil, seluruh urutan transisi harus selesai dulu.
    // ENTER tidak boleh melewati selebrasi (Tahap 2.12).
    if (this.pointCelebration?.isActive) {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: selebrasi poin aktif, Enter diabaikan`)
      return
    }

    // Jeda 1 detik setelah banner hilang belum selesai: ENTER diabaikan.
    if (this.awaitingServeEnter && this.serveWaitRemaining > 0) {
      console.info(
        `[BADMINTON-DIAG] onStartMatchInput: jeda pasca-selebrasi tersisa ${this.serveWaitRemaining.toFixed(2)}s, Enter diabaikan`
      )
      return
    }

    // MATCH OVER: Enter tidak boleh memulai servis lagi.
    if (this.matchManager?.isMatchOver()) {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: MATCH OVER, Enter diabaikan`)
      return
    }

    // INTERVAL: jangan melewati interval secara tidak sengaja.
    if (this.matchManager?.isInInterval()) {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: INTERVAL, Enter diabaikan`)
      return
    }

    // SERVING: siklus official serve sedang berjalan, diabaikan.
    if (this.serveState !== 'idle') {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: SERVING (serveState=${this.serveState}), Enter diabaikan`)
      return
    }

    // Servis sudah diminta dan menunggu dikonsumsi gate update: ENTER berulang
    // tidak boleh mengantrekan servis kedua.
    if (this.pendingServe) {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: pendingServe sudah aktif, Enter diabaikan`)
      return
    }

    // RALLY: shuttlecock masih terbang, diabaikan.
    if (phase === 'flying') {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: RALLY (flying), Enter diabaikan`)
      return
    }

    // Physics masih resetting: diabaikan total, TIDAK di-queue. Pemain harus
    // menekan Enter lagi setelah reset selesai.
    if (phase === 'resetting') {
      console.info(`[BADMINTON-DIAG] onStartMatchInput: RESET, Enter diabaikan (tidak di-queue)`)
      return
    }

    // READY: pertandingan belum dimulai — mulai pertandingan dan siapkan
    // servis pertama dari server yang ditentukan MatchManager.
    if (stateBefore?.status === 'ready' && this.matchManager) {
      this.matchManager.startMatch()
      this.pendingServe = true
      this.serveWaitRemaining = 0
      this._serveTimeoutRetries = 0
      this.blueAiController?.setServeHold(this.matchManager.getServer() === 'blue')
      const stateAfter = this.matchManager.getState()
      console.info(
        `[BADMINTON-DIAG] onStartMatchInput: MATCH START, status=${stateAfter.status}, server=${stateAfter.server}, serveSide=${stateAfter.serveSide}, pendingServe=true (servis pertama)`
      )
      return
    }

    // POINT PAUSED: poin sudah diberikan, banner + jeda sudah selesai — mulai
    // servis berikutnya dari server/sisi MatchManager terbaru.
    if (this.awaitingServeEnter) {
      this.awaitingServeEnter = false
      this.pendingServe = true
      this.serveWaitRemaining = 0
      this._serveTimeoutRetries = 0
      this.blueAiController?.setServeHold(stateBefore?.server === 'blue')
      console.info(
        `[BADMINTON-DIAG] onStartMatchInput: NEXT SERVE, server=${stateBefore?.server}, serveSide=${stateBefore?.serveSide}, pendingServe=true`
      )
      return
    }

    // Kondisi lain (mis. idle tanpa POINT PAUSED): tidak ada siklus servis,
    // tidak ada yang dijadwalkan.
    console.info(`[BADMINTON-DIAG] onStartMatchInput: tidak ada siklus servis yang menunggu, Enter diabaikan`)
  }

  /**
   * Practice feed (KeyT): selalu diluncurkan dari sisi Red, tidak mengubah
   * server pertandingan. Digunakan hanya untuk latihan pukulan.
   */
  private launchPracticeFeed(): void {
    this.feedArmed = false

    // Tunjukkan shuttlecock baru saja sebelum diluncurkan, agar tidak terlihat
    // di posisi default (0,0,0) saat arena baru dibuka.
    this.shuttlecock.group.visible = true

    if (this.hitTestMode && this.redModel) {
      const player = this.redModel.group

      // The offset is player-local (model forward = -Z), so the feed is always
      // served from the same place relative to the player and its facing, never
      // from a fixed world spot that would be wrong after moving.
      feedPosition.copy(PRACTICE_FEED.offset).applyQuaternion(player.quaternion).add(player.position)

      // The lob direction is rotated the same way, so it keeps heading towards
      // the net regardless of the player's yaw.
      feedVelocity.copy(PRACTICE_FEED.velocity).applyQuaternion(player.quaternion)

      // PENTING: JANGAN memanggil this.shuttlecock.reset() di sini.
      // reset() mengatur phase ke 'idle' dan velocity ke nol, yang langsung
      // membatalkan launch() di atas. shuttlecock harus tetap terbang sesuai
      // fisika hingga mendarat atau keluar lapangan.
      this._launchCounter += 1
      this._rallyCounter += 1
      this._lastLaunchSource = 'practice-feed'
      this._rallyEndProcessed = false
      console.info(
        `[BADMINTON-DIAG] launchPracticeFeed: launch#${this._launchCounter} rally#${this._rallyCounter} src=practice-feed offset=${feedPosition.x.toFixed(2)},${feedPosition.y.toFixed(2)},${feedPosition.z.toFixed(2)} velocity=${feedVelocity.x.toFixed(2)},${feedVelocity.y.toFixed(2)},${feedVelocity.z.toFixed(2)}`
      )
      this.shuttlecockPhysics.launch(feedPosition, feedVelocity)
      console.info(
        `[BADMINTON-DIAG] launchPracticeFeed: after launch launch#${this._launchCounter} rally#${this._rallyCounter} pos=${this.shuttlecockPhysics.getPosition().toArray().map((v) => v.toFixed(2)).join(',')} phase=${this.shuttlecockPhysics.getPhase()}`
      )
    }
  }

  /**
   * Official serve versi realistis (Tahap 2.0).
   *
   * Lifecycle: shuttlecock dipindahkan ke tangan kiri server (mengikuti world
   * transform bone LeftHand), animasi ServeShort dimainkan, shuttle tetap
   * dipegang sampai mesh senar bertemu shuttle, lalu physics mengambil alih.
   * Tidak ada lagi peluncuran dari koordinat tetap di lapangan.
   */
  private beginOfficialServe(): void {
    if (!this.matchManager || this.modelPlayers.length < 2) return

    const server = this.matchManager.getServer()
    const serveSide = this.matchManager.getServeSide()
    const model = this.playerModelOf(server)
    const anim = server === 'red' ? this.redAnimController : this.blueAnimController
    if (!anim || !model || !model.getLeftHand()) return

    // Blue sebagai server: AI harus sudah diam di posisi siap servis sebelum
    // animasi diputar, supaya tangan (tempat shuttle dipegang) tidak bergerak.
    if (server === 'blue') {
      this.blueAiController?.setServeHold(true)
      const p = model.group.position
      const dist = Math.hypot(p.x - BLUE_HOME.x, p.z - BLUE_HOME.z)
      if (dist > 0.08) {
        console.info(
          `[BADMINTON-DIAG] officialServe: menunggu Blue di posisi siap servis (dist=${dist.toFixed(3)}m)`
        )
        return
      }
    }

    const started = anim.playOneShot(SERVE_CLIP)
    if (!started) {
      // One-shot lain sedang berjalan: coba lagi frame berikutnya.
      console.info(`[BADMINTON-DIAG] officialServe: animasi sibuk, pendingServe dipertahankan`)
      return
    }
    this.pendingServe = false

    this.servePlayer = server
    this.serveState = 'holding'
    this.serveElapsed = 0
    this.serveLaunched = false
    this.serveRacketSpeed = 0
    this._lastServeSurfaceSample = -1
    this.shuttlecock.group.visible = true
    model.group.updateMatrixWorld(true)
    this.serveSurface = new RacketSurfaceCollision(model.group)
    this.serveSurface.root.updateWorldMatrix(true, false)
    this.servePrevRacketMatrix.copy(this.serveSurface.root.matrixWorld)
    this.servePrevClipTime = anim.playingClipTime
    model.getLeftHand()?.getWorldPosition(handWorldPos)
    handWorldPos.y += SERVE_HOLD_OFFSET_Y
    this.servePrevShuttlePos.copy(handWorldPos)

    console.info(
      `[BADMINTON-DIAG] officialServe: persiapan server=${server} serveSide=${serveSide} clip=${SERVE_CLIP} kontak@${SERVE_CONTACT_TIME[SERVE_CLIP].toFixed(3)}s, shuttle pindah ke tangan kiri server`
    )
  }

  /** Shuttle remains in the left hand until the racket surface actually overlaps it. */
  private updateOfficialServe(delta: number): void {
    const model = this.servePlayer ? this.playerModelOf(this.servePlayer) : null
    const hand = model?.getLeftHand()
    if (!model || !hand || !this.serveSurface) {
      this.abortOfficialServe('model/tangan server tidak tersedia')
      return
    }

    this.serveElapsed += delta
    const contactTime = SERVE_CONTACT_TIME[SERVE_CLIP]

    // Fase holding: shuttlecock mengikuti world transform tangan kiri server.
    if (this.serveState === 'holding') {
      hand.getWorldPosition(handWorldPos)
      handWorldPos.y += SERVE_HOLD_OFFSET_Y
      this.shuttlecock.setPosition(handWorldPos)
      this.shuttlecock.setVelocity(racketWorldPos.set(0, 0, 0))
    }

    this.serveSurface.root.updateWorldMatrix(true, false)
    const surfaceSample = Math.floor(this.serveElapsed / 0.04)
    if (
      this.serveElapsed >= contactTime - 0.12 &&
      this.serveElapsed <= contactTime + 0.45 &&
      surfaceSample !== this._lastServeSurfaceSample
    ) {
      this._lastServeSurfaceSample = surfaceSample
      this.serveSurface.measureClosest(this.shuttlecock.getPosition(), this.serveSurfaceContact)
      const activeClip = this.servePlayer === 'red'
        ? this.redAnimController?.playingClip
        : this.blueAnimController?.playingClip
      const activeClipTime = this.servePlayer === 'red'
        ? this.redAnimController?.playingClipTime
        : this.blueAnimController?.playingClipTime
      const activeClipTimeScale = this.servePlayer === 'red'
        ? this.redAnimController?.playingClipTimeScale
        : this.blueAnimController?.playingClipTimeScale
      console.info(
        `[BADMINTON-DIAG] officialServe: surfaceSample t=${this.serveElapsed.toFixed(3)}s clip=${activeClip}@${activeClipTime?.toFixed(3)}s scale=${activeClipTimeScale?.toFixed(3)} distance=${this.serveSurfaceContact.distance.toFixed(4)}m shuttle=${this.shuttlecock.getPosition().toArray().map(v=>v.toFixed(3)).join(',')} closest=${this.serveSurfaceContact.point.toArray().map(v=>v.toFixed(3)).join(',')}`
      )
    }
    if (
      this.serveState === 'holding' &&
      this.serveElapsed >= contactTime &&
      !this.serveLaunched
    ) {
      const controller = this.servePlayer === 'red' ? this.redAnimController : this.blueAnimController
      const clipTime = controller?.playingClip === SERVE_CLIP ? controller.playingClipTime : this.servePrevClipTime
      const clipDelta = Math.max(0, clipTime - this.servePrevClipTime)
      const sampleCount = THREE.MathUtils.clamp(Math.ceil(clipDelta * 120), 1, 64)
      this.serveSweepRacketMatrix.copy(this.servePrevRacketMatrix)
      this.serveSweepShuttlePos.copy(this.servePrevShuttlePos)
      let contact: ReturnType<RacketSurfaceCollision['findSweptContact']> = null

      for (let i = 1; i <= sampleCount && !contact; i++) {
        const sampleTime = THREE.MathUtils.lerp(this.servePrevClipTime, clipTime, i / sampleCount)
        const sample = () => {
          this.serveSurface!.root.updateWorldMatrix(true, false)
          this.serveSampleRacketMatrix.copy(this.serveSurface!.root.matrixWorld)
          hand!.getWorldPosition(this.serveSampleShuttlePos)
          this.serveSampleShuttlePos.y += SERVE_HOLD_OFFSET_Y
          return this.serveSurface!.findSweptContact(
            this.serveSweepRacketMatrix,
            this.serveSampleRacketMatrix,
            this.serveSweepShuttlePos,
            this.serveSampleShuttlePos,
            Math.max(delta / sampleCount, 1 / 240),
            0.035,
            this.serveSurfaceContact,
          )
        }
        contact = controller?.playingClip === SERVE_CLIP
          ? controller.withCurrentClipAtTime(sampleTime, sample)
          : sample()
        this.serveSweepRacketMatrix.copy(this.serveSampleRacketMatrix)
        this.serveSweepShuttlePos.copy(this.serveSampleShuttlePos)
      }

      this.servePrevClipTime = clipTime
      if (contact) this.shuttlecock.setPosition(this.serveSampleShuttlePos)
      if (contact) {
        this.serveState = 'released'
        this.serveRacketSpeed = contact.surfaceVelocity.length()
        this._serveTimeoutRetries = 0
        console.info(
          `[BADMINTON-DIAG] officialServe: KONTAK meshDistance=${contact.distance.toFixed(4)}m t=${this.serveElapsed.toFixed(3)}s clipTime=${(this.servePlayer === 'red' ? this.redAnimController?.playingClipTime : this.blueAnimController?.playingClipTime)?.toFixed(3)}s racketSurfaceSpeed=${this.serveRacketSpeed.toFixed(2)}m/s pos=${this.shuttlecock.getPosition().toArray().map((v) => v.toFixed(3)).join(',')}`
        )
        this.launchServeFromContact()
      }
    }

    // Frame sangat lambat dapat mengakhiri clip sebelum sweep sempat memeriksa
    // pose kontak (serveState tetap 'holding' selamanya). UlangiServis resmi
    // yang sama dari awal; kontak tetap berasal dari mesh raket. Setelah beberapa
    // retry, kembalikan kendali ke pemain lewat ENTER (Tahap 2.12).
    if (
      this.serveState === 'holding' &&
      !this.serveLaunched &&
      this.serveElapsed > contactTime + 0.9
    ) {
      this._serveTimeoutRetries += 1
      if (this._serveTimeoutRetries >= 3) {
        console.info(
          `[BADMINTON-DIAG] officialServe: kontak terlewat 3x pada frame lambat, menunggu ENTER lagi`
        )
        this.serveState = 'idle'
        this.servePlayer = null
        this.pendingServe = false
        this.awaitingServeEnter = true
        this.serveWaitRemaining = 0
        return
      }
      console.info(
        `[BADMINTON-DIAG] officialServe: kontak terlewat (retry ${this._serveTimeoutRetries}), mengulang animasi servis yang sama`
      )
      this.abortOfficialServe('kontak terlewat pada frame lambat')
      return
    }

    this.serveSurface.root.updateWorldMatrix(true, false)
    this.servePrevRacketMatrix.copy(this.serveSurface.root.matrixWorld)
    this.servePrevShuttlePos.copy(this.shuttlecock.getPosition())
  }

  /** Meluncurkan shuttlecock dari posisi kontak aktual dengan velocity servis. */
  private launchServeFromContact(): void {
    const server = this.servePlayer
    if (!server || !this.matchManager) {
      this.abortOfficialServe('server/matchManager hilang saat kontak')
      return
    }

    const isRed = server === 'red'
    const serveSide = this.matchManager.getServeSide()
    const isRight = serveSide === 'right'
    // Arah diagonal dari aturan sisi servis (sama dengan konvensi serve lama).
    const targetXSign = isRed ? (isRight ? 1 : -1) : isRight ? -1 : 1

    this.serveContactPos.copy(this.shuttlecock.getPosition())
    const velocity = solveServeVelocity({
      contact: this.serveContactPos,
      isRed,
      targetXSign,
      depth: SERVE_TARGET_DEPTH[SERVE_CLIP],
      shortServiceLine: SHORT_SERVICE_LINE,
      racketSpeed: this.serveRacketSpeed,
      gravity: this.shuttlecockPhysics.getGravity(),
      netHeight: NET_HEIGHT,
    })

    this._launchCounter += 1
    this._rallyCounter += 1
    this._lastLaunchSource = 'official-serve'
    this._rallyEndProcessed = false

    console.info(
      `[BADMINTON-DIAG] officialServe: launch#${this._launchCounter} rally#${this._rallyCounter} player=${server} t=${this.serveElapsed.toFixed(3)}s racketSurfaceSpeed=${this.serveRacketSpeed.toFixed(2)}m/s surfaceDistance=${this.serveSurfaceContact.distance.toFixed(4)}m pos=${this.serveContactPos.toArray().map((v) => v.toFixed(3)).join(',')} velocity=${velocity.toArray().map((v) => v.toFixed(2)).join(',')}`
    )
    this.shuttlecockPhysics.launch(this.serveContactPos, velocity)
    this.serveLaunched = true
    this.serveState = 'idle'
    this.servePlayer = null
    // Rally dimulai: AI Blue kembali berperilaku normal (menerima/menyerang).
    this.blueAiController?.setServeHold(false)
    console.info(
      `[BADMINTON-DIAG] officialServe: after launch launch#${this._launchCounter} pos=${this.shuttlecockPhysics.getPosition().toArray().map((v) => v.toFixed(2)).join(',')} phase=${this.shuttlecockPhysics.getPhase()} velocity=${this.shuttlecockPhysics.getVelocity().toArray().map((v) => v.toFixed(2)).join(',')}`
    )
  }

  /** Safety: batalkan siklus servis bila data server tidak lengkap. */
  private abortOfficialServe(reason: string): void {
    this.serveState = 'idle'
    this.servePlayer = null
    this.pendingServe = true
    console.info(`[BADMINTON-DIAG] officialServe: dibatalkan (${reason}), pendingServe dipulihkan`)
  }

  /** Model GLB untuk sebuah pemain: indeks 0 = Blue, 1 = Red (loadModelPlayers). */
  private playerModelOf(player: Player): BadmintonPlayerModel | null {
    return player === 'red' ? (this.modelPlayers[1] ?? null) : (this.modelPlayers[0] ?? null)
  }

  private onJumpKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'CapsLock' || event.repeat || this.jumping || this.landingRemaining > 0) return
    this.jumping = true
    this.jumpRemaining = 0.55
    this.redAnimController?.playLoop('Jump')
  }

  private updateJump(delta: number): void {
    if (this.jumping) {
      this.jumpRemaining = Math.max(0, this.jumpRemaining - delta)
      if (this.jumpRemaining === 0) {
        this.jumping = false
        this.landingRemaining = 0.28
        this.redAnimController?.playLoop('Landing')
      }
      return
    }
    if (this.landingRemaining > 0) {
      this.landingRemaining = Math.max(0, this.landingRemaining - delta)
      if (this.landingRemaining === 0) this.redAnimController?.playLoop('Ready')
    }
  }

  /** Enables control only while this arena is the visible stage. */
  enter(): void {
    this.mounted = true
    this.setControllersActive(true)
    this.swingInput.enable()
    this.hitTestToggle.enable()
    this.startMatchInput.enable()
    window.addEventListener('keydown', this.onJumpKeyDown)
    this.gestureController?.mount()

    // HUD dilepas saat exit(); pasang kembali supaya tautan Badminton tetap
    // menampilkan skor setelah keluar-masuk.
    if (this.scoreboard && !this.scoreboard.element.isConnected) {
      document.body.appendChild(this.scoreboard.element)
    }
    if (this.pointCelebration && !this.pointCelebration.element.isConnected) {
      document.body.appendChild(this.pointCelebration.element)
    }
  }

  exit(): void {
    this.mounted = false
    this.setControllersActive(false)
    this.swingInput.disable()
    this.hitTestToggle.disable()
    this.startMatchInput.disable()
    window.removeEventListener('keydown', this.onJumpKeyDown)
    this.jumping = false
    this.jumpRemaining = 0
    this.landingRemaining = 0
    this.gestureController?.unmount()
    this.scoreboard?.resetMotion()
    this.scoreboard?.element.remove()
    // Banner selalu dihentikan saat arena dilepas agar timer animasi tidak
    // berjalan di latar belakang.
    this.pointCelebration?.detach()
    this.pointCelebration?.element.remove()
  }

  /** True while the repeatable practice feed replaces the demo shuttlecock. */
  get hitTesting(): boolean {
    return this.hitTestMode
  }

  /** Terima pemenang reli dari sumber eksternal (keyboard, AI, MediaPipe nanti). */
  awardPoint(winner: Player): void {
    this.matchManager?.awardPoint(winner)
  }

  /** Status pertandingan saat ini (baca saja). */
  get matchState() {
    return this.matchManager?.getState()
  }

  /** True jika sedang dalam interval 60 detik. */
  get inInterval(): boolean {
    return this.matchManager?.isInInterval() ?? false
  }

  /** Sisa waktu interval dalam detik. */
  get intervalSecondsRemaining(): number {
    return this.matchManager?.getIntervalSecondsRemaining() ?? 0
  }

  /** Pemenang pertandingan jika selesai. */
  get matchWinner(): Player | null {
    return this.matchManager?.getMatchWinner() ?? null
  }

  /** Pemain yang melakukan servis saat ini. */
  get currentServer(): Player | null {
    return this.matchManager?.getServer() ?? null
  }

  /** Sisi servis saat ini (kanan/kiri). */
  get currentServeSide(): 'right' | 'left' | null {
    return this.matchManager?.getServeSide() ?? null
  }

  /** Last racket contact, for debugging and manual testing. */
  get hit(): RacketHit | null {
    return this.lastHit
  }

  /** Read-only access to the loaded model players, empty while still loading. */
  get players(): readonly BadmintonPlayerModel[] {
    return this.modelPlayers
  }

  /** Human player controller (red, keyboard). */
  get humanController(): BadmintonPlayerController | null {
    return this.redController
  }

  /** Opponent controller (blue, AI). */
  get aiController(): BadmintonAIController | null {
    return this.blueAiController
  }

  /** Scoreboard UI element (dapat ditampung ke layar Badminton oleh MenuManager). */
  get scoreboardElement(): HTMLElement | null {
    return this.scoreboard?.element ?? null
  }

  private setControllersActive(active: boolean): void {
    if (active) {
      this.redController?.enable()
      this.blueAiController?.enable()
      return
    }
    this.redController?.disable()
    this.blueAiController?.disable()
  }

  /**
   * Loads both player variants (blue on the far -Z side, red on the near +Z
   * side). No primitive placeholder is used any more: the arena shows the GLB
   * players only.
   *
   * The new GLBs are authored with forward = -Z at rotation 0, so each player
   * is rotated to face the net at Z = 0: blue on the -Z side needs PI, red on
   * the +Z side needs 0.
   */
  private async loadModelPlayers(): Promise<void> {
    try {
      const [blue, red] = await Promise.all([
        BadmintonPlayerModel.load(BADMINTON_PLAYER_URL),
        BadmintonPlayerModel.load(BADMINTON_PLAYER_RED_URL),
      ])

      blue.group.position.set(-0.9, 0, -4.6)
      red.group.position.set(0.9, 0, 4.6)

      blue.group.rotation.y = Math.PI
      red.group.rotation.y = 0

      // Tahap 2.6B: ganti raket bawaan Red & Blue dengan Racket Pro SEBELUM
      // hit detection dibuat, agar resolveRacket() menemukan node baru.
      // Kegagalan tidak menghentikan arena: raket bawaan dipertahankan.
      await attachRacketProToPlayers(blue.group, red.group)

      const blueAnim = new BadmintonAnimationController(blue)
      const redAnim = new BadmintonAnimationController(red)
      blueAnim.playLoop('Ready')
      redAnim.playLoop('Ready')
      this.blueAnimController = blueAnim
      this.redAnimController = redAnim

      // Human plays red from behind the net; blue is the AI opponent.
      this.redController = new BadmintonPlayerController(red.group, RED_BOUNDS, {}, redAnim)
      // Hit detection Blue: instance sendiri, objek/animasi/raket milik Blue.
      this.blueHitDetection = new BadmintonRacketHitDetection(blue, {}, blueAnim)
      this.blueAiController = new BadmintonAIController(blue.group, BLUE_BOUNDS, undefined, blueAnim, {
        shuttle: {
          getPosition: () => this.shuttlecockPhysics.getPosition(),
          getVelocity: () => this.shuttlecockPhysics.getVelocity(),
          getPhase: () => this.shuttlecockPhysics.getPhase(),
          getGravity: () => this.shuttlecockPhysics.getGravity(),
          getLaunchSource: () => this._lastLaunchSource,
        },
        requestSwing: (clip) => this.blueHitDetection?.requestSwing(clip) ?? false,
        home: BLUE_HOME,
        difficulty: 'normal',
        // Persepsi siklus official serve Red (Tahap 2.13): titik jatuh target
        // menurut aturan servis resmi. Aktif sejak rally berakhir (server
        // sudah diketahui publik dari papan skor) sehingga AI sempat berjalan
        // ke stance penerimaan sebelum shuttle diluncurkan.
        servePerception: {
          getExpectedLanding: () => {
            if (!this.matchManager) return null
            if (this.matchManager.getServer() !== 'red') return null
            if (this.shuttlecockPhysics.getPhase() === 'flying') return null
            const isRight = this.matchManager.getServeSide() === 'right'
            // Red menembak ke sisi Z negatif; diagonal mengikuti sisi servis.
            const targetXSign = isRight ? 1 : -1
            return new THREE.Vector3(
              targetXSign * SERVE_TARGET_X,
              0.05,
              -(SHORT_SERVICE_LINE + SERVE_TARGET_DEPTH[SERVE_CLIP]),
            )
          },
        },
      })
      this.redHitDetection = new BadmintonRacketHitDetection(red, {}, redAnim)
      this.redModel = red
      this.playerCamera = new BadmintonPlayerCamera(this.camera, red.group)

      // Match & scoring system (best of 3, 21 points per game)
      this.matchManager = new BadmintonMatchManager({
        onScoreChange: (state) => {
          console.info(
            `[skor] Game ${state.gameNumber}: Red ${state.currentGame.red} - ${state.currentGame.blue} Blue`
          )
          // Scoreboard + selebrasi poin, hanya dari delta skor nyata.
          this.handleScoreChange(state)
        },
        onGameOver: (winner, gameNumber) => {
          console.info(`[skor] Game ${gameNumber} selesai: pemenang ${winner}`)
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onMatchOver: (winner) => {
          console.info(`[skor] Pertandingan selesai: pemenang ${winner}`)
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onServeChange: (server, serveSide) => {
          console.info(`[skor] Servis: ${server} dari sisi ${serveSide}`)
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onIntervalStart: (seconds) => {
          console.info(`[skor] Interval ${seconds} detik dimulai`)
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onIntervalTick: (secondsRemaining) => {
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onIntervalEnd: () => {
          console.info('[skor] Interval selesai')
          this.scoreboard?.update(this.matchManager!.getState())
        },
        onSideChange: () => {
          console.info('[skor] Pemain bertukar sisi')
          this.scoreboard?.update(this.matchManager!.getState())
        },
      })

      // Scoreboard UI (MatchManager dimulai melalui tombol Enter, tidak otomatis)
      this.scoreboard = new BadmintonScoreboard()
      document.body.appendChild(this.scoreboard.element)
      this.scoreboard.update(this.matchManager.getState())

      // Point celebration overlay (Tahap 2.11): satu instance per arena,
      // HTML di atas canvas Three.js (z-index 40) dan tidak menangkap input.
      this.pointCelebration = new BadmintonPointCelebration()
      document.body.appendChild(this.pointCelebration.element)

      const initialState = this.matchManager.getState()
      this.lastScoreSnapshot = {
        red: initialState.currentGame.red,
        blue: initialState.currentGame.blue,
        gameNumber: initialState.gameNumber,
      }

      if (this.mounted) this.setControllersActive(true)

      this.scene.add(blue.group, red.group)
      this.modelPlayers = [blue, red]
    } catch (error) {
      console.error('Gagal memuat model player GLB', error)
    }
  }

  private createLights(): THREE.Group {
    const lights = new THREE.Group()

    lights.add(new THREE.HemisphereLight(0xbcd8ff, 0x0b1526, 0.55))
    lights.add(new THREE.AmbientLight(0x93c5fd, 0.2))

    const key = new THREE.DirectionalLight(0xffffff, 1.35)
    key.position.set(6, 12, 7)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 44
    key.shadow.camera.left = -12
    key.shadow.camera.right = 12
    key.shadow.camera.top = 14
    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.0015
    lights.add(key)

    const fill = new THREE.DirectionalLight(0x60a5fa, 0.45)
    fill.position.set(-7, 5, -5)
    lights.add(fill)

    return lights
  }
}
