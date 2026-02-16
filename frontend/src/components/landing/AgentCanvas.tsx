'use client'
import { useEffect, useRef } from 'react'

// Configuration constants
const CONFIG = {
  centerDot: { radius: 5, pulseAmount: 1.2 },
  orbitalRings: [
    { radiusX: 60, radiusY: 25, speed: 0.3, opacity: 0.25, lineWidth: 1.5 },
    { radiusX: 90, radiusY: 45, speed: -0.2, opacity: 0.18, lineWidth: 1.2 },
    { radiusX: 120, radiusY: 60, speed: 0.4, opacity: 0.12, lineWidth: 1 }
  ],
  agents: [
    { baseRadius: 70, speed: 0.8, offset: 0 },
    { baseRadius: 95, speed: 1.2, offset: 1.5 },
    { baseRadius: 110, speed: 0.6, offset: 3 },
    { baseRadius: 85, speed: 1.4, offset: 4.5 },
    { baseRadius: 100, speed: 1.0, offset: 2 },
    { baseRadius: 75, speed: 1.3, offset: 5 }
  ],
  trail: { length: 0, fadeSpeed: 1 },
  particles: { count: 50, driftSpeed: 0.02 },
  timeSpeed: 0.015
}

interface Position {
  x: number
  y: number
}

interface AgentState {
  id: number
  config: typeof CONFIG.agents[0]
  trail: Position[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

export default function AgentCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize agent states with trail history
    const agents: AgentState[] = CONFIG.agents.map((config, id) => ({
      id,
      config,
      trail: []
    }))

    // Initialize particles
    const particles: Particle[] = []
    for (let i = 0; i < CONFIG.particles.count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.particles.driftSpeed,
        vy: (Math.random() - 0.5) * CONFIG.particles.driftSpeed
      })
    }

    let time = 0
    let animationId: number

    // Calculate agent position at given time
    const getAgentPosition = (agent: AgentState, t: number): Position => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      const baseAngle = t * agent.config.speed + agent.config.offset
      const radiusVariation = Math.sin(t * 2.5 + agent.id * 0.7) * 12
      const radius = agent.config.baseRadius + radiusVariation
      const wobbleX = Math.sin(t * 3 + agent.id) * 6
      const wobbleY = Math.cos(t * 2.5 + agent.id * 1.3) * 4

      return {
        x: cx + Math.cos(baseAngle) * radius + wobbleX,
        y: cy + Math.sin(baseAngle) * radius + wobbleY
      }
    }

    // Update particles
    const updateParticles = () => {
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })
    }

    // Draw particles with subtle glow
    const drawParticles = () => {
      particles.forEach(p => {
        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw orbital rings with glow
    const drawOrbitalRings = (cx: number, cy: number, t: number) => {
      CONFIG.orbitalRings.forEach(ring => {
        const angle = t * ring.speed
        const radiusVariation = Math.sin(t * 1.5) * 5
        const radiusX = ring.radiusX + radiusVariation
        const radiusY = ring.radiusY + radiusVariation * 0.5
        const opacityPulse = Math.sin(t * 2) * 0.05
        const opacity = ring.opacity + opacityPulse

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)

        // Glow layer
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)'
        ctx.shadowBlur = 8
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.lineWidth = ring.lineWidth
        ctx.beginPath()
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0

        ctx.restore()
      })
    }

    // Draw connection lines with gradient
    const drawConnectionLines = (cx: number, cy: number, t: number) => {
      agents.forEach(agent => {
        const pos = getAgentPosition(agent, t)
        const distance = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2)

        // Gradient from center to agent
        const gradient = ctx.createLinearGradient(cx, cy, pos.x, pos.y)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')

        const thicknessPulse = Math.sin(t * 2.5 + agent.id) * 0.4 + 1
        ctx.strokeStyle = gradient
        ctx.lineWidth = thicknessPulse
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      })
    }

    // Draw agent trails (subtle)
    const drawAgentTrails = () => {
      agents.forEach(agent => {
        agent.trail.forEach((pos, i) => {
          const age = agent.trail.length - i
          const normalizedAge = age / CONFIG.trail.length
          const opacity = (1 - normalizedAge) * 0.4
          const size = 1.5 * (1 - normalizedAge * 0.7) + 0.5

          // Subtle glow
          const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 2.5)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.6})`)
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, size * 2.5, 0, Math.PI * 2)
          ctx.fill()

          // Core dot
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
          ctx.fill()
        })
      })
    }

    // Draw agent nodes (minimal)
    const drawAgentNodes = (t: number) => {
      agents.forEach(agent => {
        const pos = getAgentPosition(agent, t)

        // Tiny subtle glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 4)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Small agent node
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw central hub (minimal)
    const drawCentralHub = (cx: number, cy: number, t: number) => {
      const pulseRadius = 4 + Math.sin(t * 3) * 0.8

      // Subtle glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 3)
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      glow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, pulseRadius * 3, 0, Math.PI * 2)
      ctx.fill()

      // Central dot
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.beginPath()
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Main animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update time
      time += CONFIG.timeSpeed

      // Update particles
      updateParticles()

      // DRAWING ORDER (back to front):

      // 1. Particle background
      drawParticles()

      // 2. Orbital rings
      drawOrbitalRings(cx, cy, time)

      // 3. Connection lines
      drawConnectionLines(cx, cy, time)

      // 4. Agent nodes (no trails)
      drawAgentNodes(time)

      // 5. Central hub with glow
      drawCentralHub(cx, cy, time)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
