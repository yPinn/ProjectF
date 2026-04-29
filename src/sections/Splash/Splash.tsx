import { useEffect, useRef } from 'react'
import Particles from '@/components/Particles/Particles'
import styles from './Splash.module.css'

export default function Splash() {
  const contentRef = useRef<HTMLDivElement>(null)
  const glowTopRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${y * 0.35}px)`
          contentRef.current.style.opacity = String(Math.max(0, 1 - y / 400))
        }
        if (glowTopRef.current) {
          glowTopRef.current.style.transform = `translateX(-50%) translateY(${y * 0.15}px)`
        }
        if (gridRef.current) {
          gridRef.current.style.transform = `translateY(${y * 0.08}px)`
        }
        ticking = false
      })
      ticking = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className={styles.splash} id="splash">
      <div ref={gridRef} className={styles.bgGrid} />
      <div ref={glowTopRef} className={styles.glowTop} />
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
