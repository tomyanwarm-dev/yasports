import * as THREE from 'three'

export type SponsorIconType =
  | 'shield'
  | 'paddle'
  | 'bolt'
  | 'chevron'
  | 'target'
  | 'wave'
  | 'crown'
  | 'hexagon'

export interface SponsorBrand {
  id: string
  name: string
  tagline: string
  bgColor: string
  bgSecondary: string
  accentColor: string
  textColor: string
  icon: SponsorIconType
}

/**
 * Diverse fictional sports sponsor brands for GOR barriers, tribune fascia,
 * and wall billboards so the arena feels like a real multi-sponsor tournament.
 */
export const SPONSOR_BRANDS: SponsorBrand[] = [
  {
    id: 'yasports',
    name: 'YASPORTS',
    tagline: 'OFFICIAL GOR ARENA',
    bgColor: '#0b1730',
    bgSecondary: '#162d59',
    accentColor: '#38bdf8',
    textColor: '#f8fafc',
    icon: 'shield',
  },
  {
    id: 'spinmaster',
    name: 'SPINMASTER',
    tagline: 'PRO BLADES & RUBBER',
    bgColor: '#5c0f1e',
    bgSecondary: '#881337',
    accentColor: '#fb7185',
    textColor: '#fff1f2',
    icon: 'paddle',
  },
  {
    id: 'volt-hydrate',
    name: 'VOLT HYDRATE',
    tagline: 'ISOTONIC SPORT FUEL',
    bgColor: '#063d2d',
    bgSecondary: '#065f46',
    accentColor: '#a3e635',
    textColor: '#f7fee7',
    icon: 'bolt',
  },
  {
    id: 'apex-kinetics',
    name: 'APEX KINETICS',
    tagline: 'PRO ATHLETIC WEAR',
    bgColor: '#172554',
    bgSecondary: '#1d4ed8',
    accentColor: '#60a5fa',
    textColor: '#eff6ff',
    icon: 'chevron',
  },
  {
    id: 'turbo-3star',
    name: 'TURBO 3-STAR',
    tagline: 'OFFICIAL MATCH BALL',
    bgColor: '#18181b',
    bgSecondary: '#27272a',
    accentColor: '#fbbf24',
    textColor: '#fefce8',
    icon: 'target',
  },
  {
    id: 'aerogrip',
    name: 'AEROGRIP',
    tagline: 'COURT FOOTWEAR',
    bgColor: '#1e1b4b',
    bgSecondary: '#312e81',
    accentColor: '#22d3ee',
    textColor: '#ecfeff',
    icon: 'wave',
  },
  {
    id: 'titan-energy',
    name: 'TITAN SPORT',
    tagline: 'PEAK PERFORMANCE',
    bgColor: '#1e293b',
    bgSecondary: '#334155',
    accentColor: '#fb923c',
    textColor: '#fff7ed',
    icon: 'crown',
  },
  {
    id: 'procourt',
    name: 'PROCOURT',
    tagline: 'TOURNAMENT MAT TECH',
    bgColor: '#0f3d3e',
    bgSecondary: '#115e59',
    accentColor: '#2dd4bf',
    textColor: '#f0fdfa',
    icon: 'hexagon',
  },
  {
    id: 'vortex-carbon',
    name: 'VORTEX CARBON',
    tagline: 'ULTRA LIGHT SERIES',
    bgColor: '#3b0764',
    bgSecondary: '#581c87',
    accentColor: '#f472b6',
    textColor: '#fdf2f8',
    icon: 'chevron',
  },
  {
    id: 'nusantara-open',
    name: 'NUSANTARA CUP',
    tagline: 'NATIONAL TABLE TENNIS',
    bgColor: '#0c354f',
    bgSecondary: '#075985',
    accentColor: '#facc15',
    textColor: '#fef9c3',
    icon: 'shield',
  },
]

const sponsorTextureCache = new Map<string, THREE.CanvasTexture>()

function drawSponsorIcon(
  ctx: CanvasRenderingContext2D,
  icon: SponsorIconType,
  cx: number,
  cy: number,
  radius: number,
  accent: string,
  fg: string,
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = accent
  ctx.strokeStyle = fg
  ctx.lineWidth = Math.max(3, radius * 0.12)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  switch (icon) {
    case 'shield': {
      ctx.beginPath()
      ctx.moveTo(0, -radius)
      ctx.lineTo(radius * 0.85, -radius * 0.55)
      ctx.lineTo(radius * 0.65, radius * 0.45)
      ctx.lineTo(0, radius)
      ctx.lineTo(-radius * 0.65, radius * 0.45)
      ctx.lineTo(-radius * 0.85, -radius * 0.55)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break
    }
    case 'paddle': {
      ctx.rotate(-0.35)
      ctx.beginPath()
      ctx.ellipse(0, -radius * 0.2, radius * 0.68, radius * 0.78, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = fg
      ctx.fillRect(-radius * 0.16, radius * 0.48, radius * 0.32, radius * 0.52)
      ctx.beginPath()
      ctx.arc(radius * 0.72, -radius * 0.65, radius * 0.22, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(radius * 0.15, -radius)
      ctx.lineTo(-radius * 0.65, radius * 0.1)
      ctx.lineTo(-radius * 0.05, radius * 0.1)
      ctx.lineTo(-radius * 0.2, radius)
      ctx.lineTo(radius * 0.68, -radius * 0.1)
      ctx.lineTo(radius * 0.05, -radius * 0.1)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'chevron': {
      for (const offset of [-0.32, 0.22]) {
        ctx.beginPath()
        ctx.moveTo(-radius * 0.55, offset * radius - radius * 0.4)
        ctx.lineTo(0, offset * radius + radius * 0.15)
        ctx.lineTo(radius * 0.55, offset * radius - radius * 0.4)
        ctx.lineWidth = Math.max(5, radius * 0.24)
        ctx.strokeStyle = accent
        ctx.stroke()
      }
      break
    }
    case 'target': {
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2)
      ctx.strokeStyle = accent
      ctx.lineWidth = Math.max(4, radius * 0.18)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.48, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'wave': {
      ctx.lineWidth = Math.max(5, radius * 0.22)
      ctx.strokeStyle = accent
      for (const yOff of [-0.32, 0.25]) {
        ctx.beginPath()
        ctx.moveTo(-radius * 0.85, yOff * radius)
        ctx.quadraticCurveTo(-radius * 0.3, (yOff - 0.5) * radius, 0, yOff * radius)
        ctx.quadraticCurveTo(radius * 0.3, (yOff + 0.5) * radius, radius * 0.85, yOff * radius)
        ctx.stroke()
      }
      break
    }
    case 'crown': {
      ctx.beginPath()
      ctx.moveTo(-radius * 0.85, radius * 0.55)
      ctx.lineTo(-radius * 0.95, -radius * 0.4)
      ctx.lineTo(-radius * 0.35, radius * 0.05)
      ctx.lineTo(0, -radius * 0.75)
      ctx.lineTo(radius * 0.35, radius * 0.05)
      ctx.lineTo(radius * 0.95, -radius * 0.4)
      ctx.lineTo(radius * 0.85, radius * 0.55)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'hexagon': {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = Math.cos(angle) * radius * 0.9
        const y = Math.sin(angle) * radius * 0.9
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break
    }
  }
  ctx.restore()
}

/**
 * Creates (and caches) a crisp sports sponsor board CanvasTexture suitable for
 * court barriers, tribune fascia, and GOR wall billboards.
 */
export function createSponsorBoardTexture(
  brand: SponsorBrand,
  width = 512,
  height = 192,
): THREE.CanvasTexture {
  const key = `${brand.id}:${width}x${height}`
  const cached = sponsorTextureCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Rich angled gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, brand.bgColor)
    grad.addColorStop(1, brand.bgSecondary)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Subtle sport speed stripes on the right side
    ctx.save()
    ctx.globalAlpha = 0.14
    ctx.fillStyle = brand.accentColor
    for (let i = 0; i < 3; i++) {
      const x = width - 95 + i * 28
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 18, 0)
      ctx.lineTo(x - 16, height)
      ctx.lineTo(x - 34, height)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    // Top and bottom accent trims
    ctx.fillStyle = brand.accentColor
    ctx.fillRect(0, 0, width, Math.max(4, height * 0.04))
    ctx.fillRect(0, height - Math.max(4, height * 0.04), width, Math.max(4, height * 0.04))

    // Left emblem
    const iconRadius = height * 0.25
    const iconX = height * 0.45
    const iconY = height * 0.5
    drawSponsorIcon(ctx, brand.icon, iconX, iconY, iconRadius, brand.accentColor, brand.textColor)

    // Brand name & tagline
    const textX = iconX + iconRadius + height * 0.18
    ctx.fillStyle = brand.textColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${Math.round(height * 0.3)}px system-ui, Segoe UI, Roboto, sans-serif`
    ctx.fillText(brand.name, textX, height * 0.41)

    ctx.fillStyle = brand.accentColor
    ctx.font = `700 ${Math.round(height * 0.135)}px system-ui, Segoe UI, Roboto, sans-serif`
    ctx.fillText(brand.tagline, textX, height * 0.72)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  sponsorTextureCache.set(key, texture)
  return texture
}

/**
 * Creates a wide GOR header or arena signage CanvasTexture.
 */
export function createArenaBannerTexture(
  title: string,
  subtitle: string,
  bgColor = '#0b1220',
  accentColor = '#38bdf8',
  textColor = '#f8fafc',
  width = 1024,
  height = 256,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Inner glow frame
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, width - 20, height - 20)

    // Side accent bars
    ctx.fillStyle = accentColor
    ctx.fillRect(24, 34, 14, height - 68)
    ctx.fillRect(width - 38, 34, 14, height - 68)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = textColor
    ctx.font = '900 72px system-ui, Segoe UI, Roboto, sans-serif'
    ctx.fillText(title, width / 2, height * 0.4)

    ctx.fillStyle = accentColor
    ctx.font = '700 32px system-ui, Segoe UI, Roboto, sans-serif'
    ctx.fillText(subtitle, width / 2, height * 0.73)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
