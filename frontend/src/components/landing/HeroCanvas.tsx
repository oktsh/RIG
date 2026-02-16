'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050505, 0.08)

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 1, 2)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x050505, 0)

    // Wireframe grid geometry
    const geometry = new THREE.PlaneGeometry(30, 30, 60, 60)
    const material = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 2.2
    scene.add(plane)

    // Particle system (500 particles floating in space)
    const pGeometry = new THREE.BufferGeometry()
    const pCount = 500
    const pPositions = new Float32Array(pCount * 3)

    for (let i = 0; i < pCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * 20
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    const pMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    })
    const particles = new THREE.Points(pGeometry, pMaterial)
    scene.add(particles)

    // Animation loop with vertex displacement
    let time = 0
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      // Animate vertices (3-wave displacement)
      const positions = geometry.attributes.position
      const vertex = new THREE.Vector3()

      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i)

        const distance = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y)
        const wave1 = Math.sin(distance * 0.3 - time * 1.5) * 0.5
        const wave2 = Math.sin(distance * 0.5 + time * 0.8) * 0.3
        const wave3 = Math.cos(vertex.x * 0.2 + time) * Math.sin(vertex.y * 0.2 - time) * 0.2

        vertex.z = wave1 + wave2 + wave3
        positions.setZ(i, vertex.z)
      }
      positions.needsUpdate = true

      // Animate plane z-position (depth movement)
      plane.position.z = Math.sin(time * 0.3) * 0.5

      // Rotate particles
      particles.rotation.y = time * 0.1

      // Rotate camera slowly
      camera.position.x = Math.sin(time * 0.05) * 5
      camera.position.z = Math.cos(time * 0.05) * 5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      pGeometry.dispose()
      pMaterial.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  )
}
