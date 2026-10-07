import * as THREE from 'three'
import { BadmintonRacket } from './BadmintonRacket.ts'

/**
 * The player faces +Z, so its right side is -X and its left side is +X.
 * Every number below is a local offset in metres.
 */
const HIP_HEIGHT = 0.92
const TORSO_HEIGHT = 0.46
const SHOULDER_X = 0.2
const SHOULDER_Y = TORSO_HEIGHT

/** Torso leans forward so the stance reads as ready, not standing. */
const TORSO_LEAN = 0.15

const HIP_X = 0.19
const KNEE_HEIGHT = 0.5
const ANKLE_HEIGHT = 0.085
const KNEE_BEND = 0.16
/** Right foot a little ahead of the left: light staggered stance. */
const STAGGER_Z = 0.16

const ELBOW = new THREE.Vector3(-0.27, 0.2, 0.1)
const WRIST = new THREE.Vector3(0, -0.1, 0.24)

const LEFT_ELBOW = new THREE.Vector3(0.27, 0.22, 0.02)
const LEFT_WRIST = new THREE.Vector3(0.04, -0.19, 0.24)

/** Ready pose only: racket tilted forward at about chest height. */
const RACKET_PITCH = -0.75
const RACKET_YAW = -0.3
const RACKET_ROLL = 0.15

/**
 * Badminton player in a static ready stance, built from primitives only.
 *
 * Structure:
 *   group
 *   ├── pelvis
 *   │   └── body (leaning forward)
 *   │       ├── torso, head
 *   │       ├── leftShoulder  -> leftArm  (elbow pivot) -> leftHand
 *   │       └── rightShoulder -> rightArm (elbow pivot) -> rightHand -> racket
 *   ├── leftLeg  (hip) -> leftShin -> leftFoot
 *   └── rightLeg (hip) -> rightShin -> rightFoot
 */
export class BadmintonPlayer {
  readonly group = new THREE.Group()

  readonly pelvis = new THREE.Group()
  readonly body = new THREE.Group()
  readonly torso = new THREE.Group()
  readonly head = new THREE.Group()
  readonly leftShoulder = new THREE.Group()
  readonly rightShoulder = new THREE.Group()
  readonly leftArm = new THREE.Group()
  readonly rightArm = new THREE.Group()
  readonly leftHand = new THREE.Group()
  readonly rightHand = new THREE.Group()
  readonly leftLeg = new THREE.Group()
  readonly rightLeg = new THREE.Group()
  readonly leftShin = new THREE.Group()
  readonly rightShin = new THREE.Group()
  readonly leftFoot = new THREE.Group()
  readonly rightFoot = new THREE.Group()
  readonly racket = new BadmintonRacket()

  private jersey: THREE.MeshStandardMaterial
  private shorts: THREE.MeshStandardMaterial
  private skin: THREE.MeshStandardMaterial
  private shoe: THREE.MeshStandardMaterial

  constructor(color: number) {
    this.jersey = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    this.shorts = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    this.skin = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
    this.shoe = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })

    this.group.add(this.createLegs(), this.pelvis)
    this.pelvis.position.y = HIP_HEIGHT
    this.pelvis.add(this.createPelvisMesh())
    this.pelvis.add(this.body)
    this.body.add(
      this.createTorso(),
      this.createHead(),
      this.createShoulder(this.leftShoulder, -SHOULDER_X, LEFT_ELBOW, this.leftArm),
      this.createShoulder(this.rightShoulder, SHOULDER_X, ELBOW, this.rightArm),
    )

    this.createArm(this.leftArm, this.leftHand, LEFT_WRIST)
    this.createArm(this.rightArm, this.rightHand, WRIST)
    this.attachRacket(this.rightHand)
  }

  /** Access points for the future hand-tracking / gameplay layer. */
  getRightHand(): THREE.Group {
    return this.rightHand
  }

  getLeftHand(): THREE.Group {
    return this.leftHand
  }

  getRacket(): BadmintonRacket {
    return this.racket
  }

  /** Racket stays parented to the hand so one hand transform drives it. */
  private attachRacket(hand: THREE.Group): void {
    this.racket.group.rotation.set(RACKET_PITCH, RACKET_YAW, RACKET_ROLL)
    this.racket.group.position.set(0, -0.02, 0.04)
    hand.add(this.racket.group)
  }

  private createLegs(): THREE.Group {
    const legs = new THREE.Group()

    for (const [hip, shin, foot, sign, stagger] of [
      [this.leftLeg, this.leftShin, this.leftFoot, 1, -STAGGER_Z],
      [this.rightLeg, this.rightShin, this.rightFoot, -1, STAGGER_Z],
    ] as [THREE.Group, THREE.Group, THREE.Group, number, number][]) {
      hip.position.set(sign * HIP_X, HIP_HEIGHT, stagger)
      hip.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -HIP_HEIGHT + KNEE_HEIGHT, 0), 0.075, this.shorts))
      legs.add(hip)

      shin.position.y = -(HIP_HEIGHT - KNEE_HEIGHT)
      shin.rotation.x = KNEE_BEND
      shin.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -(KNEE_HEIGHT - ANKLE_HEIGHT), 0), 0.06, this.skin))
      hip.add(shin)

      foot.position.set(0, -(KNEE_HEIGHT - ANKLE_HEIGHT), 0)
      foot.rotation.x = -KNEE_BEND
      foot.add(this.createShoe())
      shin.add(foot)
    }

    return legs
  }

  /** Sole, heel and toe so the shoe reads as footwear, not a small cylinder. */
  private createShoe(): THREE.Group {
    const shoe = new THREE.Group()

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.028, 0.27), this.shoe)
    sole.position.y = -0.055
    sole.castShadow = true
    shoe.add(sole)

    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.08), this.shoe)
    heel.position.set(0, -0.02, -0.085)
    heel.castShadow = true
    shoe.add(heel)

    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.055, 0.11), this.shoe)
    toe.position.set(0, -0.025, 0.07)
    toe.castShadow = true
    shoe.add(toe)

    return shoe
  }

  private createTorso(): THREE.Group {
    this.body.position.y = HIP_HEIGHT
    this.body.rotation.x = TORSO_LEAN

    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.22, 6, 14), this.jersey)
    chest.position.y = 0.3
    chest.scale.set(1.12, 1, 0.85)
    chest.castShadow = true
    this.torso.add(chest)

    const waist = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.12, 5, 12), this.shorts)
    waist.position.y = 0.11
    waist.scale.set(1.05, 1, 0.85)
    this.torso.add(waist)

    return this.torso
  }

  private createPelvisMesh(): THREE.Mesh {
    const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.1, 5, 12), this.shorts)
    hips.scale.set(1.1, 1, 0.85)
    hips.castShadow = true
    return hips
  }

  private createHead(): THREE.Group {
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.08, 10),
      this.skin,
    )
    neck.position.y = TORSO_HEIGHT - 0.02
    this.head.add(neck)

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), this.skin)
    skull.position.y = TORSO_HEIGHT + 0.14
    skull.scale.set(0.95, 1.08, 1)
    skull.castShadow = true
    this.head.add(skull)

    // Counteracts the torso lean so the head still looks at the opponent.
    this.head.position.y = 0
    this.head.rotation.x = -TORSO_LEAN * 0.8
    return this.head
  }

  private createShoulder(
    shoulder: THREE.Group,
    x: number,
    elbow: THREE.Vector3,
    arm: THREE.Group,
  ): THREE.Group {
    shoulder.position.set(x, SHOULDER_Y, 0)

    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), this.jersey)
    joint.castShadow = true
    shoulder.add(joint)

    const elbowLocal = new THREE.Vector3(elbow.x - x, elbow.y - SHOULDER_Y, elbow.z)
    shoulder.add(limb(new THREE.Vector3(0, 0, 0), elbowLocal, 0.055, this.skin))

    arm.position.copy(elbowLocal)
    shoulder.add(arm)
    return shoulder
  }

  /** arm is the elbow pivot; the hand is a direct child so the chain stays flat. */
  private createArm(
    arm: THREE.Group,
    hand: THREE.Group,
    wrist: THREE.Vector3,
  ): void {
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), this.skin)
    elbowJoint.castShadow = true
    arm.add(elbowJoint)

    arm.add(limb(new THREE.Vector3(0, 0, 0), wrist, 0.05, this.skin))

    hand.position.copy(wrist)
    hand.add(this.createHand())
    arm.add(hand)
  }

  private createHand(): THREE.Mesh {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), this.skin)
    hand.scale.set(1, 0.85, 1.15)
    hand.castShadow = true
    return hand
  }
}

/** Capsule-like limb spanning two points, used for arms and legs. */
function limb(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material): THREE.Mesh {
  const direction = new THREE.Vector3().subVectors(to, from)
  const length = direction.length()
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(length - radius * 2, 0.01), 4, 10),
    material,
  )
  mesh.position.copy(from).addScaledVector(direction, 0.5)
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  )
  mesh.castShadow = true
  return mesh
}
