import { type CSSProperties, useEffect, useRef, useState } from 'react'
import type { StreamerSlideData } from '@/types'
import { useSlider } from '@/hooks/useSlider'
import { useCarouselInput } from '@/hooks/useCarouselInput'
import { useInView } from '@/hooks/useInView'
import Portrait from '@/components/Portrait/Portrait'
import styles from './Roster.module.css'

interface Props {
  slides: StreamerSlideData[]
  onOpen: (index: number) => void
  onApproach: () => void
}

function Arrow({ previous = false }: { previous?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={previous ? 'M14 5 7 12l7 7' : 'm10 5 7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default function Roster({ slides, onOpen, onApproach }: Props) {
  const { current, goTo, goNext, goPrev } = useSlider({ total: slides.length })
  const input = useCarouselInput(goNext, goPrev)
  const { ref, inView } = useInView<HTMLElement>({ rootMargin: '600px 0px' })
  const railRef = useRef<HTMLDivElement>(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  const active = slides[current]

  useEffect(() => {
    if (inView) onApproach()
  }, [inView, onApproach])

  useEffect(() => {
    // Keep the active thumbnail in view without moving the document vertically.
    const rail = railRef.current
    const button = rail?.children[current] as HTMLElement | undefined
    if (rail && button) {
      rail.scrollTo({
        left: button.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + button.offsetWidth / 2,
        behavior: 'instant',
      })
    }
  }, [current])

  useEffect(() => {
    if (!autoRotate || paused || slides.length < 2) return
    const element = ref.current
    if (!element) return
    let visible = false
    let timer: ReturnType<typeof setInterval> | undefined
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      clearInterval(timer)
      if (visible && !document.hidden && !motion.matches) timer = setInterval(goNext, 5000)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        update()
      },
      { threshold: 0.35 },
    )
    observer.observe(element)
    document.addEventListener('visibilitychange', update)
    motion.addEventListener('change', update)
    return () => {
      clearInterval(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
      motion.removeEventListener('change', update)
    }
  }, [autoRotate, paused, goNext, slides.length, ref])

  if (!active) return null

  const positions = Array.from(
    { length: Math.min(5, slides.length) },
    (_, index) => index - Math.floor(Math.min(5, slides.length) / 2),
  )

  return (
    <section
      id="roster"
      ref={ref}
      className={styles.section}
      aria-labelledby="roster-title"
      aria-roledescription="輪播"
      style={{ '--member-accent': active.accentColor ?? '#00f5ff' } as CSSProperties}
      onKeyDown={input.onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => {
        setFocused(true)
        onApproach()
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <div>
            <h2 id="roster-title">
              選一個，<span>認識一下。</span>
            </h2>
            <p>每個人，都有自己的主場。</p>
          </div>
          <div className={styles.headingMeta}>
            <span>實況主陣容</span>
            <span>
              {String(current + 1).padStart(2, '0')}{' '}
              <span className={styles.total}>/ {String(slides.length).padStart(2, '0')}</span>
            </span>
          </div>
        </header>

        <div
          className={styles.stage}
          role="group"
          aria-label="人物展示台，左右滑動或使用方向鍵切換"
          onTouchStart={input.onTouchStart}
          onTouchEnd={input.onTouchEnd}
          onTouchCancel={input.onTouchCancel}
        >
          <div className={styles.arch} aria-hidden="true" />
          <div className={styles.stageWord} aria-hidden="true">
            FUCK ENT.
          </div>
          <div className={styles.floor} aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          {positions.map((offset) => {
            const index = (current + offset + slides.length) % slides.length
            const slide = slides[index]
            const selected = offset === 0
            return (
              <button
                type="button"
                key={slide.id}
                className={`${styles.member} ${selected ? styles.selected : ''}`}
                style={
                  {
                    '--offset': offset,
                    '--distance': Math.abs(offset),
                    '--member-accent': slide.accentColor ?? '#00f5ff',
                    zIndex: 5 - Math.abs(offset),
                  } as CSSProperties
                }
                onClick={() => (selected ? onOpen(current) : goTo(index))}
                aria-label={selected ? `查看 ${slide.name} 的介紹` : `選擇 ${slide.name}`}
                tabIndex={selected || Math.abs(offset) === 1 ? 0 : -1}
              >
                <span className={styles.bay} aria-hidden="true" />
                <Portrait
                  slide={slide}
                  loading="lazy"
                  sizes={
                    selected ? '(max-width: 640px) 65vw, 420px' : '(max-width: 640px) 35vw, 260px'
                  }
                  width={slide.photoWidth}
                  height={slide.photoHeight}
                />
                <span className={styles.base} aria-hidden="true" />
                {!selected && <span className={styles.sideName}>{slide.name}</span>}
                {selected && slide.missingPhoto && (
                  <span className={styles.photoPending}>形象照準備中</span>
                )}
              </button>
            )
          })}
          <button
            type="button"
            className={`${styles.arrow} ${styles.previous}`}
            onClick={goPrev}
            aria-label="上一位實況主"
          >
            <Arrow previous />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={goNext}
            aria-label="下一位實況主"
          >
            <Arrow />
          </button>
        </div>

        <div className={styles.selection}>
          <div
            className={styles.identity}
            aria-live={autoRotate ? 'off' : 'polite'}
            aria-atomic="true"
          >
            <p>{active.category}</p>
            <h3>{active.name}</h3>
            <span>{active.handle}</span>
          </div>
          <button type="button" className={styles.open} onClick={() => onOpen(current)}>
            查看介紹 <Arrow />
          </button>
        </div>

        <div ref={railRef} className={styles.rail} role="group" aria-label="所有實況主">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={`${styles.thumbnail} ${index === current ? styles.current : ''}`}
              aria-label={`選擇 ${slide.name}`}
              aria-pressed={index === current}
              title={slide.name}
            >
              <Portrait slide={slide} thumbnail loading="lazy" width="56" height="56" />
            </button>
          ))}
        </div>
        <div className={styles.footer}>
          <p>左右切換人物，點選進入介紹</p>
          <button
            type="button"
            onClick={() => setAutoRotate((value) => !value)}
            aria-pressed={autoRotate}
          >
            {autoRotate ? '停止自動輪替' : '自動輪替'}
            <span className={autoRotate ? styles.on : styles.off} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
