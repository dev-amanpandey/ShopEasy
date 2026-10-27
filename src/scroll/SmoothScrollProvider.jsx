import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ScrollContext = createContext(null)
export const useSmoothScroll = () => useContext(ScrollContext)

const SmoothScrollProvider = ({ children }) => {
  const root = useRef(null)
  const lenisRef = useRef(null)
  const location = useLocation()

  useGSAP(() => {
    const useSmoothMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = useSmoothMotion ? new Lenis({ lerp: 0.09, smoothWheel: true }) : null
    lenisRef.current = lenis
    const tick = (time) => lenis?.raf(time * 1000)
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const bar = document.querySelector('.scroll-progress')
      const header = document.querySelector('.site-header')
      if (!bar || !header) return

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (trigger) => {
          gsap.set(bar, { scaleX: trigger.progress })
          const y = trigger.scroll()
          header.classList.toggle('is-solid', y > 60)
          header.classList.toggle('is-hidden', trigger.direction === 1 && y > 200)
          if (trigger.direction === -1 || y <= 200) header.classList.remove('is-hidden')
        },
      })
    })

    const onAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')
      const target = id === '#' ? null : document.querySelector(id)
      if (id !== '#' && !target) return
      event.preventDefault()
      if (lenis) lenis.scrollTo(target || 0, { duration: 1.4 })
      else if (target) target.scrollIntoView({ behavior: 'auto' })
      else window.scrollTo(0, 0)
    }
    document.addEventListener('click', onAnchorClick)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh, true)
    document.fonts?.ready.then(refresh)
    const onImageLoad = (event) => {
      if (event.target instanceof HTMLImageElement) requestAnimationFrame(refresh)
    }
    document.addEventListener('load', onImageLoad, true)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      window.removeEventListener('load', refresh, true)
      document.removeEventListener('load', onImageLoad, true)
      mm.revert()
      if (lenis) gsap.ticker.remove(tick)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, { scope: root })

  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash)
      requestAnimationFrame(() => {
        const target = document.querySelector(id)
        if (target) {
          if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.4 })
          else target.scrollIntoView({ behavior: 'auto' })
        }
      })
    } else {
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
    }
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname, location.hash])

  const setScrollStopped = useCallback((stopped) => {
    if (stopped) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [])
  const scrollContext = useMemo(() => ({ setScrollStopped }), [setScrollStopped])

  return (
    <ScrollContext.Provider value={scrollContext}>
      <div ref={root} className="smooth-scroll-root">
        <div className="scroll-progress" aria-hidden="true" />
        {children}
      </div>
    </ScrollContext.Provider>
  )
}

export default SmoothScrollProvider
