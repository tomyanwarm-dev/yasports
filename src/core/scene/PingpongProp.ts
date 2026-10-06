import * as THREE from 'three'
import { PingpongTable, TABLE_HEIGHT } from './PingpongTable.ts'

/**
 * Pingpong menu prop: table (delegated to PingpongTable) + paddle + ball.
 * Nothing here drives gameplay; it only supplies idle motion for the menu.
 */
export class PingpongProp {
  readonly group = new THREE.Group()
  private paddle = new THREE.Group()
  private ball = new THREE.Group()
  private table = new PingpongTable()

  constructor() {
    this.group.add(this.table.group, this.createPaddle(), this.createBall())

    this.paddle.position.set(0.62, 0.42, 0.55)
    this.paddle.rotation.set(-0.15, -0.55, 0.1)
    this.group.add(this.paddle)

    this.ball.position.set(-0.05, TABLE_HEIGHT + 0.3, 0.12)
    this.group.add(this.ball)
  }

  update(elapsed: number): void {
    this.paddle.rotation.y = -0.55 + Math.sin(elapsed * 0.28) * 0.22
    this.paddle.rotation.z = 0.1 + Math.cos(elapsed * 0.22) * 0.07
    this.paddle.position.y = 0.42 + Math.sin(elapsed * 0.45) * 0.07

    const bounce = Math.abs(Math.sin(elapsed * 0.9))
    this.ball.position.y = TABLE_HEIGHT + 0.12 + bounce * 0.16
    this.ball.position.x = -0.05 + Math.sin(elapsed * 0.35) * 0.14
    this.ball.rotation.set(elapsed * 0.5, elapsed * 0.7, 0)
  }

  private createPaddle(): THREE.Group {
    const paddle = new THREE.Group()

    const shape = new THREE.Shape()
    shape.absellipse(0, 0, 0.16, 0.19, 0, Math.PI * 2, false, 0)
    const blade = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSize: 0.007,
        bevelThickness: 0.005,
        bevelSegments: 2,
        curveSegments: 24,
      }),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.88 }),
    )
    paddle.add(blade)

    const rubber = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 }),
    )
    rubber.scale.set(0.15, 0.18, 1)
    rubber.position.z = 0.024
    paddle.add(rubber)

    const neck = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.1, 0.035),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 }),
    )
    neck.position.set(0, -0.23, 0.004)
    paddle.add(neck)

    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.7,
    })
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.028, 0.26, 14),
      handleMaterial,
    )
    handle.position.set(0, -0.42, 0.004)
    paddle.add(handle)

    for (const y of [-0.34, -0.5]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.032, 0.005, 6, 18),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 }),
      )
      ring.rotation.x = Math.PI / 2
      ring.position.set(0, y, 0.004)
      paddle.add(ring)
    }

    const butt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.034, 0.05, 14),
      handleMaterial,
    )
    butt.position.set(0, -0.57, 0.004)
    paddle.add(butt)

    return paddle
  }

  private createBall(): THREE.Group {
    const ball = new THREE.Group()
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 14),
      new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        roughness: 0.25,
        metalness: 0.05,
        emissive: 0x7c2d12,
        emissiveIntensity: 0.35,
      }),
    )
    ball.add(sphere)
    return ball
  }
}