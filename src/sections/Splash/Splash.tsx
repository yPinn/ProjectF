import { useEffect, useRef } from 'react'
import Particles from '@/components/Particles/Particles'
import styles from './Splash.module.css'

export default function Splash() {
  const contentRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    let prevY = -1

    function tick() {
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
      rafId = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId)
      else rafId = requestAnimationFrame(tick)
    }

    document.addEventListener('visibilitychange', onVisibility)
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <section className={styles.splash} id="splash">
      <div ref={gridRef} className={styles.bgGrid} />
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />
      <Particles />

      <div ref={contentRef} className={styles.content}>
        <img className={styles.logo} src="/images/logo.png" alt="法克娛樂 FUCK Entertainment" />

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
