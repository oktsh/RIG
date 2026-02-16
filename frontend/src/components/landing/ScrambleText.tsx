'use client'
import { useState, useEffect } from 'react'

export default function ScrambleText() {
  const [text, setText] = useState('INITIALIZING...')

  useEffect(() => {
    const words = ['INDEXING_DATA', 'PARSING_DOCS', 'GENERATING_VECTORS', 'READY']
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_[]#'
    let index = 0
    let scrambleInterval: ReturnType<typeof setInterval> | null = null

    const scramble = (targetText: string) => {
      if (scrambleInterval) clearInterval(scrambleInterval)
      let iterations = 0
      scrambleInterval = setInterval(() => {
        setText(targetText.split('')
          .map((letter, idx) => {
            if (idx < iterations) return targetText[idx]
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join(''))

        if (iterations >= targetText.length) {
          clearInterval(scrambleInterval!)
          scrambleInterval = null
        }
        iterations += 1 / 2
      }, 30)
    }

    const mainInterval = setInterval(() => {
      index = (index + 1) % words.length
      scramble(words[index])
    }, 4000)

    return () => {
      clearInterval(mainInterval)
      if (scrambleInterval) clearInterval(scrambleInterval)
    }
  }, [])

  return (
    <div className="text-2xl text-white font-mono tracking-widest opacity-80 mb-6 min-h-[40px]">
      {text}
    </div>
  )
}
