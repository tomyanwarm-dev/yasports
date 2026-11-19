import fs from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
THREE.DefaultLoadingManager.setURLModifier(url => `http://yasports.local${url}`)
import { BadmintonPlayerModel, BADMINTON_PLAYER_URL } from '../../src/badminton/entities/PlayerModel.ts'
import { BadmintonAnimationController } from '../../src/badminton/animation/AnimationController.ts'
import { BadmintonAIController } from '../../src/badminton/controllers/AIController.ts'
import { BadmintonRacketHitDetection } from '../../src/badminton/physics/RacketHitDetection.ts'
import { BadmintonShuttlecockPhysics } from '../../src/badminton/physics/ShuttlecockPhysics.ts'
import { loadRacketPro, attachRacketProToPlayer } from '../../src/badminton/entities/RacketPro.ts'

const originalFetch = globalThis.fetch
globalThis.ProgressEvent ??= class ProgressEvent extends Event { constructor(type, init = {}) { super(type); Object.assign(this, init) } }
globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input)
  if (url.startsWith('http://yasports.local/models/')) {
    const file = path.join(process.cwd(), 'public', new URL(url).pathname.slice(1).replaceAll('/', path.sep))
    return new Response(await fs.readFile(file), { status: 200, headers: { 'content-type': 'model/gltf-binary' } })
  }
  return originalFetch(input, init)
}
const oldRandom = Math.random
let seed = 0x213a
Math.random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 }
const logs = []
const originalInfo = console.info
console.info = (...args) => { logs.push(args.join(' ')) }
try {
  const blue = await BadmintonPlayerModel.load(BADMINTON_PLAYER_URL)
  blue.group.position.set(-0.9, 0, -4.6)
  blue.group.rotation.y = Math.PI
  const racket = await loadRacketPro()
  attachRacketProToPlayer('blue', blue.group, racket)
  const animation = new BadmintonAnimationController(blue)
  animation.playLoop('Ready')
  originalInfo(JSON.stringify({ clips: blue.clipNames, liftDuration: blue.clipDuration('Lift'), hasLift: blue.hasClip('Lift'), actionGroups: blue.clipNames.map(n => ({ n, sameAsReady: blue.actions.get(n) === blue.actions.get('Ready') })) }))
  const nativePlayOneShot = animation.playOneShot.bind(animation)
  animation.playOneShot = clip => {
    const before = { active: animation.playingClip, model: blue.playingClip, oneShot: animation.isPlayingOneShot, same: blue.current === blue.actions.get(clip) }
    const result = nativePlayOneShot(clip)
    logs.push(`DEBUG playOneShot clip=${clip} before=${JSON.stringify(before)} result=${result} after=${animation.playingClip}/${blue.playingClip}/${animation.isPlayingOneShot}`)
    return result
  }
  const hitDetection = new BadmintonRacketHitDetection(blue, {}, animation)
  const bounds = { minX: -2.7, maxX: 2.7, minZ: -6.35, maxZ: -0.45 }
  const shuttle = new BadmintonShuttlecockPhysics({
    bounds: { minX: -3.05, maxX: 3.05, minZ: -6.7, maxZ: 6.7 },
    resetPoint: new THREE.Vector3(0, 1, 4),
  })
  const requests = []
  let currentElapsed = 0
  const ai = new BadmintonAIController(blue.group, bounds, undefined, animation, {
    shuttle,
    home: new THREE.Vector3(0, 0, -3.2),
    difficulty: 'normal',
    balance: { reactionDelay: 0.05, predictionAccuracy: 1, movementSpeed: 4.8, interceptionError: 0, swingTimingError: 0, returnAccuracy: 1 },
    requestSwing: clip => {
      const ok = hitDetection.requestSwing(clip)
      requests.push({ clip, ok, animation: animation.playingClip, modelClip: blue.playingClip, sameAction: blue.current === blue.actions.get(clip), oneShot: animation.isPlayingOneShot, elapsed: currentElapsed })
      return ok
    },
  })
  ai.enable()
  const starts = [{ name: 'captured-home-high-strike', p: [0.777, 1.302, 4.221], v: [0.76, 3.34, -7.47] }]
  const results = []
  const descendingTime = (y, vy, gravity, height) => {
    const a = -0.5 * gravity, b = vy, c = y - height
    const disc = b * b - 4 * a * c
    if (disc < 0) return null
    const root = Math.sqrt(disc)
    const t1 = (-b - root) / (2 * a), t2 = (-b + root) / (2 * a)
    const t = [t1, t2].filter(t => t > 0).sort((a, b) => a - b)[0]
    if (t === undefined || vy - gravity * t > 0) return null
    return t
  }
  const nativePlanInterception = ai.planInterception.bind(ai)
  ai.planInterception = () => {
    const ok = nativePlanInterception()
    if (ok) {
      
      const p = shuttle.getPosition(), v = shuttle.getVelocity()
      const t = descendingTime(p.y, v.y, shuttle.getGravity(), ai.plannedStrikeHeight)
      if (t !== null) ai.interceptTarget.set(
        THREE.MathUtils.clamp(p.x + v.x * t + 0.72, bounds.minX, bounds.maxX),
        0,
        THREE.MathUtils.clamp(p.z + v.z * t - 0.47, bounds.minZ, bounds.maxZ),
      )
    }
    return ok
  }
  for (const scenario of starts) {
    shuttle.reset()
    for (let i = 0; i < 65; i++) { animation.update(1/60); ai.update(1/60) }
    blue.group.position.set(0, 0, -3.2)
    blue.group.rotation.y = Math.PI
    hitDetection.resetSwing()
    animation.stop()
    logs.length = 0
    shuttle.reset()
    shuttle.launch(new THREE.Vector3(...scenario.p), new THREE.Vector3(...scenario.v))
    let minimum = Infinity, minAt = null, firstIntercept = null, lastPos = null, hit = null
    let elapsed = 0, traceAt = 0
    const trace = []
    for (let frame = 0; frame < 180 && shuttle.getPhase() === 'flying'; frame++) {
      const dt = 1 / 60
      animation.update(dt)
      ai.update(dt)
      shuttle.update(dt)
      const result = hitDetection.update(dt, shuttle.getPosition())
      elapsed += dt
      currentElapsed = elapsed
      if (elapsed >= traceAt && elapsed > 0.3 && shuttle.getPhase() === 'flying') {
        traceAt += 0.1
        const p = shuttle.getPosition(), v = shuttle.getVelocity()
        let h = ai.plannedStrikeHeight
        if (h > p.y + 0.1) h = Math.max(0.3, Math.min(1.9, p.y))
        const tContact = descendingTime(p.y, v.y, shuttle.getGravity(), h)
        const cx = tContact === null ? null : p.x + v.x * tContact
        const cz = tContact === null ? null : p.z + v.z * tContact
        const clip = cx === null ? null : ai.pickSwingClip(h, cx - blue.group.position.x, cz)
        const lead = clip === null ? null : ai.swingLead(clip) + ai.swingTimingOffset
        const distance = cx === null ? null : Math.hypot(cx - blue.group.position.x, cz - blue.group.position.z)
        trace.push({ elapsed: +elapsed.toFixed(3), shuttle: p.toArray().map(n=>+n.toFixed(2)), vel: v.toArray().map(n=>+n.toFixed(2)), planned: +ai.plannedStrikeHeight.toFixed(2), actualHeight: +h.toFixed(2), tContact: tContact === null ? null : +tContact.toFixed(3), distance: distance === null ? null : +distance.toFixed(2), reachWithApproach: lead === null ? null : +(0.85 + Math.max(0, lead) * 3.25).toFixed(2), lead: lead === null ? null : +lead.toFixed(3), clip, blue: blue.group.position.toArray().map(n=>+n.toFixed(2)), mode: ai.currentState })
      }
      if (ai.currentState === 'intercept' && !firstIntercept) firstIntercept = { elapsed, pos: blue.group.position.toArray(), clip: animation.playingClip }
      if (animation.isPlayingOneShot || hitDetection.isSwinging) {
        blue.group.updateMatrixWorld(true)
        const contact = { point: new THREE.Vector3(), distance: 0, surfaceVelocity: new THREE.Vector3() }
        hitDetection.surface.measureClosest(shuttle.getPosition(), contact)
        if (contact.distance < minimum) { minimum = contact.distance; minAt = { elapsed, shuttle: shuttle.getPosition().toArray(), blue: blue.group.position.toArray(), closest: contact.point.toArray(), head: hitDetection.surface.getHeadWorldCenter(new THREE.Vector3()).toArray(), clip: animation.playingClip } }
      }
      if (result) {
        hit = { elapsed, clip: result.clip, distance: result.surfaceDistance, point: result.point.toArray(), velocity: result.velocity.toArray() }
        shuttle.launch(shuttle.getPosition(), result.velocity)
      }
      lastPos = blue.group.position.toArray()
    }
    results.push({ name: scenario.name, firstIntercept, lastBluePos: lastPos, minimumDuringSwing: minimum, minAt, hit, requests: [...requests], trace: results.length === 0 ? trace : [], aiLogs: logs.filter(line => line.includes('AI:') || line.includes('requestSwing:') || line.includes('DEBUG')) })
    requests.length = 0
  }
  originalInfo(JSON.stringify(results.map(r => ({ name: r.name, firstIntercept: r.firstIntercept, lastBluePos: r.lastBluePos, minimumDuringSwing: r.minimumDuringSwing, minAt: r.minAt, hit: r.hit, requests: r.requests, swings: r.aiLogs.filter(s=>s.includes('AI: swing')) })), null, 2))
} finally {
  console.info = originalInfo
  Math.random = oldRandom
  globalThis.fetch = originalFetch
}



