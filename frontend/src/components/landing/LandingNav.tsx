'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LandingNav() {
  const [sysStatus, setSysStatus] = useState('SYSTEM: ONLINE')
  const statuses = ['SYSTEM: ONLINE', 'SYSTEM: PROCESSING', 'SYSTEM: IDLE', 'SYSTEM: UPDATING']

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setSysStatus(statuses[Math.floor(Math.random() * statuses.length)])
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
      <div className="flex items-center gap-4">
        <span className="mono text-xs text-white opacity-80 font-bold tracking-widest">[ RIG V.2.0 ]</span>
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex items-center gap-8">
        <span className="mono text-xs text-white opacity-60 hidden md:block">
          <span>{sysStatus}</span> {'//'} LATENCY: 4ms
        </span>
        <Link href="/console">
          <button className="btn-primary">Connect RIG</button>
        </Link>
      </div>
    </nav>
  )
}
