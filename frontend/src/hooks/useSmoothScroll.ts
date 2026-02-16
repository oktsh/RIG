import { useEffect } from 'react'

export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const href = target.getAttribute('href')

      if (href?.startsWith('#')) {
        e.preventDefault()
        const element = document.querySelector(href)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
