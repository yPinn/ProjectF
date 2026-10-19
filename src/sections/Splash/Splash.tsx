import { useEffect, useRef } from 'react'
import Particles from '@/components/Particles/Particles'
import styles from './Splash.module.css'

export default function Splash() {
  const contentRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId = 0
    let prevY = -1
    let visible = true
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function tick() {
      rafId = 0
      if (!visible || document.hidden || motion.matches) return
      const y = window.scrollY
      if (y !== prevY) {
        prevY = y
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${y * 0.35}px)`
          contentRef.current.style.opacity = String(Math.max(0, 1 - y / 400))
        }
        if (gridRef.current) {
          gridRef.current.style.transform = `translateY(${y * 0.08}px)`
        }
      }
    }

    const schedule = () => {
      if (!rafId && visible && !document.hidden && !motion.matches)
        rafId = requestAnimationFrame(tick)
    }
    const onVisibility = () => {
      cancelAnimationFrame(rafId)
      rafId = 0
      if (motion.matches) {
        contentRef.current?.style.removeProperty('transform')
        contentRef.current?.style.removeProperty('opacity')
        gridRef.current?.style.removeProperty('transform')
        prevY = -1
      } else schedule()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    const section = contentRef.current?.closest('section')
    if (section) observer.observe(section)

    window.addEventListener('scroll', schedule, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onVisibility)
    schedule()
    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onVisibility)
    }
  }, [])

  return (
    <section className={styles.splash} id="splash">
      <div ref={gridRef} className={styles.bgGrid} />
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />
      <Particles />

      <div ref={contentRef} className={styles.content}>
        <img
          className={styles.logo}
          src="/images/optimized/logo.webp"
          alt="法克娛樂 FUCK Entertainment"
          width="512"
          height="512"
          fetchPriority="high"
        />

        <div className={styles.tag}>SINCE 2026 ／ TAIWAN</div>

        <h1 className={styles.title}>
          <span className={styles.titleZh} data-text="法克娛樂">
            法克娛樂
          </span>
          <span className={styles.titleEn}>FUCK ENTERTAINMENT</span>
        </h1>

        <p className={styles.sub}>
          頂級實況娛樂經紀公司{'　'}／{'　'}TOP TIER STREAMER AGENCY
        </p>

        <div className={styles.divider}>
          <div className={styles.line} />
          <div className={styles.diamond} />
          <div className={styles.line} />
        </div>

        <div className={styles.scrollHint}>
          <div className={styles.scrollArrow} />
          <span>向下滑動</span>
        </div>
      </div>
    </section>
  )
}
