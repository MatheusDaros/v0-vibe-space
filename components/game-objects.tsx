// This file contains the rendering functions for all game objects
// These functions will be imported into the main game component

export interface RenderProps {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  variant?: number
  health?: number
  color?: string
}

// Player Ship
export function renderPlayerShip({ ctx, x, y, width, height, rotation = 0 }: RenderProps) {
  const centerX = x + width / 2
  const centerY = y + height / 2

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)

  // Ship body
  ctx.fillStyle = "#4ade80" // green-500
  ctx.beginPath()
  ctx.moveTo(0, -height / 2) // Nose of the ship
  ctx.lineTo(width / 2, height / 3) // Right wing
  ctx.lineTo(width / 4, height / 2) // Right back
  ctx.lineTo(-width / 4, height / 2) // Left back
  ctx.lineTo(-width / 2, height / 3) // Left wing
  ctx.closePath()
  ctx.fill()

  // Cockpit
  ctx.fillStyle = "#bfdbfe" // blue-100
  ctx.beginPath()
  ctx.ellipse(0, -height / 6, width / 6, height / 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Engine glow
  const engineGradient = ctx.createRadialGradient(0, height / 2, 0, 0, height / 2, height / 3)
  engineGradient.addColorStop(0, "rgba(252, 211, 77, 0.9)") // amber-300
  engineGradient.addColorStop(0.6, "rgba(239, 68, 68, 0.7)") // red-500
  engineGradient.addColorStop(1, "rgba(239, 68, 68, 0)")

  ctx.fillStyle = engineGradient
  ctx.beginPath()
  ctx.moveTo(width / 8, height / 2)
  ctx.lineTo(0, height / 2 + height / 4)
  ctx.lineTo(-width / 8, height / 2)
  ctx.closePath()
  ctx.fill()

  // Ship details
  ctx.strokeStyle = "#1e40af" // blue-800
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -height / 2)
  ctx.lineTo(0, height / 6)
  ctx.stroke()

  ctx.restore()
}

// Asteroid/Meteor
export function renderAsteroid({ ctx, x, y, width, height, rotation = 0, variant = 1 }: RenderProps) {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const radius = Math.min(width, height) / 2

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)

  // Base asteroid shape with jagged edges
  ctx.beginPath()

  // Different variants have different shapes
  const points = 8 + variant
  const irregularity = 0.4 // How irregular the shape is

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const distance = radius * (1 + Math.sin(i * variant) * irregularity)

    const pointX = Math.cos(angle) * distance
    const pointY = Math.sin(angle) * distance

    if (i === 0) {
      ctx.moveTo(pointX, pointY)
    } else {
      ctx.lineTo(pointX, pointY)
    }
  }

  ctx.closePath()

  // Color based on variant
  let baseColor
  switch (variant) {
    case 1:
      baseColor = "#6b7280" // gray-500
      break
    case 2:
      baseColor = "#92400e" // amber-800
      break
    case 3:
      baseColor = "#78716c" // stone-500
      break
    default:
      baseColor = "#6b7280" // gray-500
  }

  // Create a gradient for 3D effect
  const gradient = ctx.createRadialGradient(-radius / 3, -radius / 3, 0, 0, 0, radius * 1.5)
  gradient.addColorStop(0, lightenColor(baseColor, 30))
  gradient.addColorStop(0.5, baseColor)
  gradient.addColorStop(1, darkenColor(baseColor, 30))

  ctx.fillStyle = gradient
  ctx.fill()

  // Crater details
  const craterCount = 3 + variant
  for (let i = 0; i < craterCount; i++) {
    const craterAngle = Math.random() * Math.PI * 2
    const craterDistance = Math.random() * radius * 0.7
    const craterX = Math.cos(craterAngle) * craterDistance
    const craterY = Math.sin(craterAngle) * craterDistance
    const craterRadius = radius * (0.1 + Math.random() * 0.15)

    ctx.beginPath()
    ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2)
    ctx.fillStyle = darkenColor(baseColor, 40)
    ctx.fill()
  }

  ctx.restore()
}

// Planet
export function renderPlanet({ ctx, x, y, width, height, variant = 1 }: RenderProps) {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const radius = Math.min(width, height) / 2

  // Planet base
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)

  // Different planet types
  let baseColor, ringColor, hasRings, hasAtmosphere

  switch (variant) {
    case 1: // Gas giant (Jupiter-like)
      baseColor = "#f97316" // orange-500
      ringColor = "#fbbf24" // amber-400
      hasRings = false
      hasAtmosphere = true
      break
    case 2: // Ringed planet (Saturn-like)
      baseColor = "#eab308" // yellow-500
      ringColor = "#a16207" // yellow-800
      hasRings = true
      hasAtmosphere = false
      break
    case 3: // Ice planet
      baseColor = "#60a5fa" // blue-400
      ringColor = "#93c5fd" // blue-300
      hasRings = Math.random() > 0.5
      hasAtmosphere = true
      break
    case 4: // Rocky planet
      baseColor = "#ef4444" // red-500
      ringColor = "#b91c1c" // red-700
      hasRings = false
      hasAtmosphere = Math.random() > 0.7
      break
    default:
      baseColor = "#8b5cf6" // violet-500
      ringColor = "#7c3aed" // violet-600
      hasRings = Math.random() > 0.6
      hasAtmosphere = Math.random() > 0.5
  }

  // Create gradient for 3D effect
  const gradient = ctx.createRadialGradient(centerX - radius / 3, centerY - radius / 3, 0, centerX, centerY, radius)
  gradient.addColorStop(0, lightenColor(baseColor, 30))
  gradient.addColorStop(0.7, baseColor)
  gradient.addColorStop(1, darkenColor(baseColor, 20))

  ctx.fillStyle = gradient
  ctx.fill()

  // Add atmosphere if needed
  if (hasAtmosphere) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2)
    const atmosphereGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.1)
    atmosphereGradient.addColorStop(0, "rgba(255, 255, 255, 0)")
    atmosphereGradient.addColorStop(1, `${lightenColor(baseColor, 50)}80`) // 50% opacity
    ctx.fillStyle = atmosphereGradient
    ctx.fill()
  }

  // Add rings if needed
  if (hasRings) {
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radius * 1.8, radius * 0.3, Math.PI / 6, 0, Math.PI * 2)
    ctx.strokeStyle = ringColor
    ctx.lineWidth = radius * 0.2
    ctx.stroke()

    // Add highlight to rings
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radius * 1.8, radius * 0.3, Math.PI / 6, 0, Math.PI)
    ctx.strokeStyle = lightenColor(ringColor, 30)
    ctx.lineWidth = radius * 0.1
    ctx.stroke()
  }

  // Surface details
  const detailCount = 3 + variant
  for (let i = 0; i < detailCount; i++) {
    const detailAngle = Math.random() * Math.PI * 2
    const detailDistance = Math.random() * radius * 0.7
    const detailX = centerX + Math.cos(detailAngle) * detailDistance
    const detailY = centerY + Math.sin(detailAngle) * detailDistance
    const detailRadius = radius * (0.05 + Math.random() * 0.1)

    ctx.beginPath()
    ctx.arc(detailX, detailY, detailRadius, 0, Math.PI * 2)
    ctx.fillStyle = variant === 3 ? lightenColor(baseColor, 30) : darkenColor(baseColor, 30)
    ctx.fill()
  }
}

// Bullet/Projectile
export function renderBullet({ ctx, x, y, width, height }: RenderProps) {
  const centerX = x + width / 2
  const centerY = y + height / 2

  // Glowing effect
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 2)
  glowGradient.addColorStop(0, "rgba(59, 130, 246, 0.9)") // blue-500
  glowGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.5)")
  glowGradient.addColorStop(1, "rgba(59, 130, 246, 0)")

  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, width, 0, Math.PI * 2)
  ctx.fill()

  // Bullet core
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.arc(centerX, centerY, width / 3, 0, Math.PI * 2)
  ctx.fill()

  // Trailing effect
  ctx.beginPath()
  ctx.moveTo(centerX - width / 4, centerY)
  ctx.lineTo(centerX + width / 4, centerY)
  ctx.lineTo(centerX, centerY + height)
  ctx.closePath()
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
  ctx.fill()
}

// Explosion
export function renderExplosion({ ctx, x, y, width, height, color = "#fbbf24" }: RenderProps) {
  const centerX = x
  const centerY = y
  const radius = Math.max(width, height) / 2

  // Outer glow
  const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  outerGradient.addColorStop(0, "rgba(251, 191, 36, 0.8)") // amber-400
  outerGradient.addColorStop(0.5, "rgba(239, 68, 68, 0.6)") // red-500
  outerGradient.addColorStop(1, "rgba(239, 68, 68, 0)")

  ctx.fillStyle = outerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  // Inner bright core
  const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.5)
  innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
  innerGradient.addColorStop(0.5, "rgba(251, 191, 36, 0.8)") // amber-400
  innerGradient.addColorStop(1, "rgba(251, 191, 36, 0)")

  ctx.fillStyle = innerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Explosion rays
  const rayCount = 8
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2
    const rayLength = radius * (0.8 + Math.random() * 0.4)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength)
    ctx.lineWidth = 3 + Math.random() * 3
    ctx.strokeStyle = "rgba(251, 191, 36, 0.7)" // amber-400
    ctx.stroke()
  }
}

// Utility functions for color manipulation
function lightenColor(color: string, percent: number): string {
  const num = Number.parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}

function darkenColor(color: string, percent: number): string {
  const num = Number.parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = ((num >> 8) & 0x00ff) - amt
  const B = (num & 0x0000ff) - amt

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}
