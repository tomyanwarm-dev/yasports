import * as THREE from 'three'
import { AmbientParticles } from './scene/AmbientParticles.ts'
import { MenuDecorations } from './scene/MenuDecorations.ts'

export class Game {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera

  private renderer: THREE.WebGLRenderer
  private clock = new THREE.Clock()
  private backdrop: THREE.Object3D
  private decorations = new MenuDecorations()
  private particles = new AmbientParticles()
  private shadowPlane: THREE.Mesh
  private elapsed = 0
  private frameId = 0
  private running = false
  private parallax = new THREE.Vector2()
  private parallaxTarget = new THREE.Vector2()
  private baseCameraPosition = new THREE.Vector3()
  private onResize = () => this.resize()
  private onPointerMove = (event: PointerEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = (event.clientY / window.innerHeight) * 2 - 1
    this.parallaxTarget.set(x, y)
  }

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.classList.add('game-canvas')
    this.container.append(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    this.camera.position.set(0, 1.2, 8)
    this.baseCameraPosition.copy(this.camera.position)

    this.scene.fog = new THREE.FogExp2(0x060b16, 0.032)

    this.backdrop = this.createBackdrop()
    this.shadowPlane = this.createShadowPlane()

    this.scene.add(this.backdrop, this.shadowPlane, this.createLights())
    this.scene.add(this.decorations.group, this.particles.points)

    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointerMove)
    this.resize()
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.clock.start()
    this.loop()
  }

  dispose(): void {
    this.running = false
    cancelAnimationFrame(this.frameId)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  private loop = (): void => {
    if (!this.running) return
    this.frameId = requestAnimationFrame(this.loop)
    const delta = this.clock.getDelta()
    this.elapsed += delta

    this.backdrop.rotation.y += delta * 0.04
    this.decorations.update(this.elapsed)
    this.particles.update(this.elapsed)
    this.updateParallax(delta)

    this.renderer.render(this.scene, this.camera)
  }

  private updateParallax(delta: number): void {
    const smoothing = 1 - Math.exp(-delta * 2.5)
    this.parallax.lerp(this.parallaxTarget, smoothing)

    this.camera.position.x = this.baseCameraPosition.x + this.parallax.x * 0.45
    this.camera.position.y = this.baseCameraPosition.y - this.parallax.y * 0.28
    this.decorations.group.rotation.y = this.parallax.x * 0.05
    this.decorations.group.position.x = this.parallax.x * 0.12
  }

  private resize(): void {
    const { clientWidth, clientHeight } = this.container
    if (clientWidth === 0 || clientHeight === 0) return
    this.camera.aspect = clientWidth / clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)

    const halfHeight = this.camera.position.distanceTo(
      new THREE.Vector3(0, this.camera.position.y, 0),
    ) * Math.tan((this.camera.fov * Math.PI) / 360)
    this.decorations.setLayout(clientWidth, halfHeight * this.camera.aspect)
  }

  private createLights(): THREE.Group {
    const lights = new THREE.Group()

    lights.add(new THREE.AmbientLight(0x9ec5ff, 0.45))

    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(4.5, 6, 6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 24
    key.shadow.camera.left = -8
    key.shadow.camera.right = 8
    key.shadow.camera.top = 8
    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.0015
    lights.add(key)

    const fill = new THREE.DirectionalLight(0x60a5fa, 0.7)
    fill.position.set(-6, 2, 4)
    lights.add(fill)

    const rimLeft = new THREE.PointLight(0x38bdf8, 12, 14, 2)
    rimLeft.position.set(-5.5, 1.4, -2.5)
    lights.add(rimLeft)

    const rimRight = new THREE.PointLight(0x22d3ee, 10, 14, 2)
    rimRight.position.set(5.5, 1.8, -2)
    lights.add(rimRight)

    return lights
  }

  private createShadowPlane(): THREE.Mesh {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 18),
      new THREE.ShadowMaterial({ opacity: 0.35 }),
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -1.85
    plane.receiveShadow = true
    return plane
  }

  private createBackdrop(): THREE.Object3D {
    const group = new THREE.Group()

    const floor = new THREE.GridHelper(40, 40, 0x1f4b7a, 0x14283f)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2
    group.add(floor)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.02, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85 }),
    )
    ring.position.y = 0.5
    group.add(ring)

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.6, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.45 }),
    )
    outerRing.position.y = 0.5
    outerRing.rotation.x = 0.35
    group.add(outerRing)

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    halo.position.set(0, 0.5, -1.2)
    group.add(halo)

    return group
  }
}