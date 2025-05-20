"use client"

import { useEffect, useRef, useState } from "react"
import { renderPlayerShip, renderAsteroid, renderPlanet, renderBullet, renderExplosion } from "./game-objects"

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  scale?: number
  type?: string
  variant?: number
  active?: boolean
}

interface Bullet extends GameObject {
  speed: number
}

interface Enemy extends GameObject {
  speed: number
  health: number
  rotationSpeed: number
}

interface Explosion extends GameObject {
  radius: number
  maxRadius: number
  opacity: number
  particles: Particle[]
}

interface Particle {
  x: number
  y: number
  radius: number
  color: string
  velocity: { x: number; y: number }
  opacity: number
  gravity: number
}

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
}

export default function VibeSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  // Use refs for values that shouldn't trigger re-renders
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

  useEffect(() => {
    // Update the ref when state changes
    scoreRef.current = score
    gameOverRef.current = gameOver
  }, [score, gameOver])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Reset score at the start of a new game
    scoreRef.current = 0

    // Game state
    let animationFrameId: number
    let lastTime = 0
    let enemySpawnTimer = 0
    let bulletTimer = 0
    let shakeIntensity = 0
    const shakeDecay = 0.9
    let shakeOffsetX = 0
    let shakeOffsetY = 0

    // Create stars for background
    const stars: Star[] = []
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
      })
    }

    // Game objects
    const player: GameObject = {
      x: canvas.width / 2 - 25,
      y: canvas.height - 80,
      width: 50,
      height: 60,
      rotation: 0,
    }

    const bullets: Bullet[] = []
    const enemies: Enemy[] = []
    const explosions: Explosion[] = []
    const keys: Record<string, boolean> = {}

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Check collisions
    const checkCollision = (rect1: GameObject, rect2: GameObject) => {
      // Use smaller hitboxes for better gameplay feel
      const margin = 0.7
      return (
        rect1.x + (rect1.width * (1 - margin)) / 2 < rect2.x + rect2.width * margin &&
        rect1.x + rect1.width * margin > rect2.x + (rect2.width * (1 - margin)) / 2 &&
        rect1.y + (rect1.height * (1 - margin)) / 2 < rect2.y + rect2.height * margin &&
        rect1.y + rect1.height * margin > rect2.y + (rect2.height * (1 - margin)) / 2
      )
    }

    // Spawn enemy
    const spawnEnemy = () => {
      const types = ["meteor", "planet"]
      const type = Math.random() > 0.8 ? "planet" : "meteor"
      const variant = Math.floor(Math.random() * (type === "meteor" ? 3 : 4)) + 1
      const size = type === "meteor" ? 40 + Math.random() * 30 : 70 + Math.random() * 40

      const enemy: Enemy = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: type === "meteor" ? 1 + Math.random() * 2 : 0.5 + Math.random() * 0.8,
        health: type === "meteor" ? 1 : 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        type,
        variant,
        scale: 1,
      }
      enemies.push(enemy)
    }

    // Shoot bullet
    const shootBullet = () => {
      const bullet: Bullet = {
        x: player.x + player.width / 2 - 4,
        y: player.y,
        width: 8,
        height: 20,
        speed: 10,
      }
      bullets.push(bullet)
    }

    // Create explosion
    const createExplosion = (x: number, y: number, size: number) => {
      const particles: Particle[] = []
      const particleCount = Math.floor(size / 5)

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3 + 1
        const radius = Math.random() * 3 + 1

        particles.push({
          x: 0,
          y: 0,
          radius,
          color: getExplosionColor(),
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          opacity: 1,
          gravity: 0.05,
        })
      }

      const explosion: Explosion = {
        x,
        y,
        width: 0,
        height: 0,
        radius: size / 4,
        maxRadius: size,
        opacity: 1,
        particles,
      }

      explosions.push(explosion)

      // Add screen shake based on explosion size
      shakeIntensity = Math.min(size / 20, 10)
    }

    // Get random explosion color
    const getExplosionColor = () => {
      const colors = [
        "#fef08a", // yellow-200
        "#fdba74", // orange-300
        "#f87171", // red-400
        "#fb923c", // orange-400
        "#fbbf24", // amber-400
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Draw engine particles
    const drawEngineParticles = () => {
      if (Math.random() > 0.3) {
        const x = player.x + player.width / 2
        const y = player.y + player.height - 5

        ctx.beginPath()
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
        gradient.addColorStop(0.2, "rgba(255, 165, 0, 0.6)")
        gradient.addColorStop(0.4, "rgba(255, 0, 0, 0.4)")
        gradient.addColorStop(1, "rgba(255, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.arc(x, y, 15, 0, Math.PI, true)
        ctx.fill()
      }
    }

    // Draw stars
    const drawStars = (deltaTime: number) => {
      ctx.save()

      // Update and draw stars
      for (const star of stars) {
        star.y += (star.speed * deltaTime) / 16

        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      }

      ctx.restore()
    }

    // Apply screen shake
    const applyScreenShake = () => {
      if (shakeIntensity > 0) {
        shakeOffsetX = (Math.random() - 0.5) * shakeIntensity
        shakeOffsetY = (Math.random() - 0.5) * shakeIntensity
        shakeIntensity *= shakeDecay

        if (shakeIntensity < 0.1) shakeIntensity = 0

        ctx.save()
        ctx.translate(shakeOffsetX, shakeOffsetY)
      }
    }

    // Reset screen shake
    const resetScreenShake = () => {
      if (shakeIntensity > 0) {
        ctx.restore()
      }
    }

    // Game loop
    const gameLoop = (timestamp: number) => {
      // Calculate delta time
      const deltaTime = timestamp - lastTime
      lastTime = timestamp

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#0f172a") // slate-900
      gradient.addColorStop(1, "#1e293b") // slate-800
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      drawStars(deltaTime)

      // Apply screen shake
      applyScreenShake()

      // Move player
      if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= 6
        player.rotation = -0.1
      } else if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += 6
        player.rotation = 0.1
      } else {
        player.rotation = 0
      }

      // Auto shoot with spacebar
      if (keys[" "]) {
        bulletTimer += deltaTime
        if (bulletTimer > 200) {
          // Shoot every 200ms
          shootBullet()
          bulletTimer = 0
        }
      }

      // Draw engine particles
      drawEngineParticles()

      // Draw player
      renderPlayerShip({
        ctx,
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
        rotation: player.rotation,
      })

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]
        bullet.y -= bullet.speed

        // Remove bullets that are off screen
        if (bullet.y + bullet.height < 0) {
          bullets.splice(i, 1)
          continue
        }

        // Draw bullet
        renderBullet({ ctx, x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height })
      }

      // Spawn enemies
      enemySpawnTimer += deltaTime
      if (enemySpawnTimer > 1200) {
        // Spawn every 1.2 seconds
        spawnEnemy()
        enemySpawnTimer = 0
      }

      // Update enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.y += enemy.speed
        enemy.rotation! += enemy.rotationSpeed

        // Check if enemy is off screen
        if (enemy.y > canvas.height) {
          enemies.splice(i, 1)
          continue
        }

        // Check collision with player
        if (checkCollision(enemy, player)) {
          // Update the gameOver ref and state
          gameOverRef.current = true
          setGameOver(true)

          // Create explosion at player position
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, player.width * 2)

          // Update the final score
          setScore(scoreRef.current)

          // Cancel animation frame
          cancelAnimationFrame(animationFrameId)
          return
        }

        // Check collision with bullets
        let hitByBullet = false
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bullet = bullets[j]
          if (checkCollision(bullet, enemy)) {
            enemy.health--
            bullets.splice(j, 1)
            hitByBullet = true

            // Create small hit effect
            createExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 20)

            if (enemy.health <= 0) {
              createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 1.5)
              enemies.splice(i, 1)

              // Update score ref (not state)
              scoreRef.current += enemy.type === "planet" ? 30 : 10
            }
            break
          }
        }

        // Skip drawing if enemy was destroyed
        if (hitByBullet && enemy.health <= 0) continue

        // Draw enemy based on type
        if (enemy.type === "meteor") {
          renderAsteroid({
            ctx,
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height,
            rotation: enemy.rotation,
            variant: enemy.variant,
          })
        } else {
          renderPlanet({
            ctx,
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height,
            variant: enemy.variant,
          })
        }
      }

      // Update and draw explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]

        // Update explosion
        explosion.radius += 2
        explosion.opacity -= 0.03

        // Update particles
        for (const particle of explosion.particles) {
          particle.x += particle.velocity.x
          particle.y += particle.velocity.y
          particle.velocity.y += particle.gravity
          particle.opacity -= 0.02
        }

        // Remove faded explosions
        if (explosion.opacity <= 0) {
          explosions.splice(i, 1)
          continue
        }

        // Draw explosion
        renderExplosion({
          ctx,
          x: explosion.x,
          y: explosion.y,
          width: explosion.radius * 2,
          height: explosion.radius * 2,
        })

        // Draw particles
        for (const particle of explosion.particles) {
          if (particle.opacity <= 0) continue

          ctx.beginPath()
          ctx.arc(explosion.x + particle.x, explosion.y + particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fillStyle = particle.color.replace(")", `, ${particle.opacity})`)
          ctx.fill()
          ctx.closePath()
        }
      }

      // Reset screen shake
      resetScreenShake()

      // Draw score with glow effect
      ctx.save()
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 24px 'Arial', sans-serif"
      ctx.shadowColor = "#3b82f6"
      ctx.shadowBlur = 10
      ctx.fillText(`SCORE: ${scoreRef.current}`, 20, 40)
      ctx.restore()

      // Add vignette effect
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width,
      )
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)")
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.4)")
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Continue game loop if not game over
      if (!gameOverRef.current) {
        animationFrameId = requestAnimationFrame(gameLoop)
      }
    }

    // Start game
    animationFrameId = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameOver]) // Only depend on gameOver, not score

  const handleRestart = () => {
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border border-gray-700 rounded-lg shadow-lg bg-slate-900"
      />

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-blue-500 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Game Over</h2>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 my-2 rounded-full"></div>
            <p className="text-blue-300 mb-6 text-xl">
              Final Score: <span className="text-2xl font-bold text-white">{score}</span>
            </p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 font-bold text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
