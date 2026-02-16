'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import HeroCanvas from '@/components/landing/HeroCanvas'
import ScrambleText from '@/components/landing/ScrambleText'
import AgentCanvas from '@/components/landing/AgentCanvas'
import LandingNav from '@/components/landing/LandingNav'
import { landingContent } from '@/lib/content'

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('dimmed')
        } else {
          entry.target.classList.add('dimmed')
        }
      })
    }, { threshold: 0.5 })

    document.querySelectorAll('.section-container').forEach(sec => {
      observer.observe(sec)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-container">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <header className="relative w-full h-screen flex flex-col justify-end p-6 md:p-12 overflow-hidden">
        <HeroCanvas />

        {/* Grid background overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grid-bg"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="mono text-xs text-gray-500 mb-4 flex items-center gap-2">
              <span>{landingContent.hero.badge.prefix}</span>
              <div className="h-[1px] w-12 bg-gray-800"></div>
              <span className={landingContent.hero.badge.statusColor}>{landingContent.hero.badge.status}</span>
            </div>
            <h1 className="hero-title text-white">
              {landingContent.hero.title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h1>
          </div>
          <div className="md:col-span-4 fade-in-up flex flex-col gap-6" style={{ animationDelay: '0.4s' }}>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              {landingContent.hero.description}
            </p>
            <div className="mono text-xs text-gray-600 flex justify-between w-full max-w-[200px]">
              <span>{landingContent.hero.stats.cpu}</span>
              <span>{landingContent.hero.stats.mem}</span>
              <span>{landingContent.hero.stats.net}</span>
            </div>
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white opacity-30"></div>
        <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white opacity-30"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white opacity-30"></div>
        <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white opacity-30"></div>
      </header>

      <main className="w-full relative z-10 bg-[#050505]">
        {/* Section 1: Prompts & Context Rules */}
        <section className="min-h-[80vh] w-full flex items-center justify-center p-6 md:p-12 border-t border-[#1a1a1a]">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center group section-container">

            <div className="order-2 md:order-1">
              <div className="mono text-xs text-gray-500 mb-6 flex items-center gap-2">
                <span>{landingContent.sections[0].badge.number}</span>
                <div className="h-[1px] w-8 bg-gray-800"></div>
                <span>{landingContent.sections[0].badge.label}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 tracking-tight">
                {landingContent.sections[0].title.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                {landingContent.sections[0].description}
              </p>
              <ul className="mono text-xs text-gray-500 space-y-3 border-l border-gray-800 pl-4">
                {landingContent.sections[0].features?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 md:order-2 relative aspect-video bg-[#0a0a0a] active-card group-hover:bg-[#0e0e0e] transition-colors duration-500 flex items-center justify-center overflow-hidden border border-[#1a1a1a]">
              <div className="bracket-corner bl-tl"></div>
              <div className="bracket-corner bl-tr"></div>
              <div className="bracket-corner bl-br"></div>
              <div className="bracket-corner bl-bl"></div>

              {/* Code stream */}
              <div className="absolute inset-4 overflow-hidden opacity-70">
                <div className="font-mono text-[10px] text-gray-600 leading-relaxed whitespace-pre">
                  {landingContent.sections[0].codeSnippet}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Custom Agents */}
        <section className="min-h-[80vh] w-full flex items-center justify-center p-6 md:p-12 border-t border-[#1a1a1a]">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center section-container group">

            <div className="relative aspect-square md:aspect-video bg-[#0a0a0a] active-card flex items-center justify-center overflow-hidden group-hover:bg-[#0e0e0e] transition-colors duration-500 border border-[#1a1a1a]">
              <div className="bracket-corner bl-tl"></div>
              <div className="bracket-corner bl-tr"></div>
              <div className="bracket-corner bl-br"></div>
              <div className="bracket-corner bl-bl"></div>

              <AgentCanvas />

              <div className="absolute top-4 left-4 mono text-[10px] text-gray-500">
                {landingContent.sections[1].canvasLabels?.agentId}
              </div>
              <div className="absolute bottom-4 right-4 mono text-[10px] text-green-900 bg-green-500/10 px-2 py-1 border border-green-500/20">
                {landingContent.sections[1].canvasLabels?.status}
              </div>
            </div>

            <div>
              <div className="mono text-xs text-gray-500 mb-6 flex items-center gap-2">
                <span>{landingContent.sections[1].badge.number}</span>
                <div className="h-[1px] w-8 bg-gray-800"></div>
                <span>{landingContent.sections[1].badge.label}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 tracking-tight">
                {landingContent.sections[1].title.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                {landingContent.sections[1].description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {landingContent.sections[1].agentTypes?.map((agent, i) => (
                  <div key={i} className="p-4 border border-[#1a1a1a] hover:border-white/20 transition-colors">
                    <div className="mono text-xs text-gray-500 mb-2">{agent.type}</div>
                    <div className="text-white text-sm">{agent.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Guides */}
        <section className="min-h-[80vh] w-full flex items-center justify-center p-6 md:p-12 border-t border-[#1a1a1a]">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center section-container group">

            <div className="order-2 md:order-1">
              <div className="mono text-xs text-gray-500 mb-6 flex items-center gap-2">
                <span>{landingContent.sections[2].badge.number}</span>
                <div className="h-[1px] w-8 bg-gray-800"></div>
                <span>{landingContent.sections[2].badge.label}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 tracking-tight">
                {landingContent.sections[2].title.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                {landingContent.sections[2].description}
              </p>
              <button className="btn-primary">
                {landingContent.sections[2].button}
              </button>
            </div>

            <div className="order-1 md:order-2 relative aspect-video bg-[#0a0a0a] active-card flex items-center justify-center overflow-hidden group-hover:bg-[#0e0e0e] transition-colors duration-500 border border-[#1a1a1a]">
              <div className="bracket-corner bl-tl"></div>
              <div className="bracket-corner bl-tr"></div>
              <div className="bracket-corner bl-br"></div>
              <div className="bracket-corner bl-bl"></div>

              <div className="text-center w-full max-w-md p-8">
                <ScrambleText />

                <div className="flex items-center gap-2 mb-2">
                  <div className="h-[1px] bg-gray-800 flex-grow"></div>
                  <span className="mono text-[10px] text-gray-600">{landingContent.sections[2].sourceLabel}</span>
                  <div className="h-[1px] bg-gray-800 flex-grow"></div>
                </div>

                <div className="space-y-1">
                  <div className="h-1 bg-gray-800 w-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="h-1 bg-gray-800 w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-1 bg-gray-800 w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-1 bg-gray-800 w-1/2 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="w-full py-32 px-6 border-t border-[#1a1a1a] flex flex-col items-center justify-center text-center bg-[#050505]">
          <h2 className="text-5xl md:text-7xl font-medium text-white mb-12 tracking-tighter">
            {landingContent.footer.title}
          </h2>
          <div className="flex flex-col items-center gap-6">
            <Link href="/console">
              <button className="btn-primary scale-125">
                {landingContent.footer.cta}
              </button>
            </Link>
            <span className="mono text-[10px] text-gray-600 uppercase mt-4">
              {landingContent.footer.legal.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </span>
          </div>
          <div className="mt-24 mono text-[10px] text-gray-700 w-full max-w-7xl flex justify-between border-t border-[#111] pt-6">
            <span>{landingContent.footer.copyright}</span>
            <span>{landingContent.footer.connectionStatus}</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
