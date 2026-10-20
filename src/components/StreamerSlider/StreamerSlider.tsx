import { type CSSProperties, useRef, useEffect, useState } from 'react'
import type { StreamerSlideData } from '@/types'
import { useCarouselInput } from '@/hooks/useCarouselInput'
import { useAudio } from '@/hooks/useAudio'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import Portrait from '@/components/Portrait/Portrait'
import TwitchClipPlayer from '@/components/TwitchClipPlayer/TwitchClipPlayer'
import assets from '@/data/assets.json'
import styles from './StreamerSlider.module.css'

interface Props {
  slides: StreamerSlideData[]
  current: number
  onSelect: (index: number) => void
}

export default function StreamerSlider({ slides, current, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  useMouseParallax(rootRef, 14)
  const { play, stop } = useAudio()
  const activeSlide = slides[current]
  const [view, setView] = useState<'info' | 'clip'>('info')
  const goNext = () => onSelect((current + 1) % slides.length)
  const goPrev = () => onSelect((current - 1 + slides.length) % slides.length)
  const input = useCarouselInput(goNext, goPrev)

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const element = rootRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop()
    })
    const onVisibility = () => {
      if (document.hidden) stop()
    }
    observer.observe(element)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [current, stop])

  if (!activeSlide) return null
  const navStart = Math.max(0, Math.min(current - 2, slides.length - 5))
  const logoUrl = assets.logo

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      aria-label="實況主介紹，使用左右方向鍵切換人物"
      className={`${styles.root}${view === 'clip' ? ` ${styles.clipMode}` : ''}`}
      style={{ '--ss-accent': activeSlide.accentColor ?? '#826dff' } as CSSProperties}
      {...input}
    >
      <div className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <a href="#splash" className={styles.headerLogoLink} aria-label="回到首頁">
              <div className={styles.headerLogo}>
                <span
                  className={styles.headerLogoImg}
                  style={{ maskImage: `url('${logoUrl}')`, WebkitMaskImage: `url('${logoUrl}')` }}
                  aria-hidden="true"
                />
              </div>
            </a>
            <div className={styles.headerRight}>
              <nav className={styles.headerMenu} aria-label="人物資訊導覽">
                <ul>
                  <li className={view === 'info' ? styles.active : undefined}>
                    <button
                      type="button"
                      aria-pressed={view === 'info'}
                      aria-controls="streamer-description"
                      onClick={() => {
                        setView('info')
                        rootRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
                      }}
                    >
                      Info
                    </button>
                  </li>
                  <li className={view === 'clip' ? styles.active : undefined}>
                    <button
                      type="button"
                      aria-pressed={view === 'clip'}
                      aria-controls="streamer-description"
                      onClick={() => {
                        stop()
                        setView('clip')
                        rootRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
                      }}
                    >
                      Clip
                    </button>
                  </li>
                  <li className={!activeSlide.contactUrl ? styles.navDisabled : undefined}>
                    {activeSlide.contactUrl ? (
                      <a href={activeSlide.contactUrl} target="_blank" rel="noopener noreferrer">
                        Contact
                      </a>
                    ) : (
                      <span aria-disabled="true">Contact</span>
                    )}
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.bannerSection} aria-label={`${activeSlide.name} 的介紹`}>
        <div className={styles.bannerInner}>
          <div className={`${styles.slide} ${styles.active}`} key={activeSlide.id}>
            <div className={styles.verticalLabel}>
              <h6>Fuck Entertainment</h6>
              <span className={styles.slideIndex} aria-hidden="true">
                <span>{String(current + 1).padStart(2, '0')}</span>
              </span>
            </div>
            <div className={styles.characterImg}>
              <div
                className={styles.slideBgLogo}
                style={{ maskImage: `url('${logoUrl}')`, WebkitMaskImage: `url('${logoUrl}')` }}
                aria-hidden="true"
              />
              <div className={styles.mainImg}>
                <button
                  type="button"
                  className={styles.parallaxLayer}
                  onClick={() => activeSlide.audioSrc && play(activeSlide.audioSrc)}
                  disabled={!activeSlide.audioSrc}
                  aria-label={
                    activeSlide.audioSrc
                      ? `播放 ${activeSlide.name} 的語音`
                      : `${activeSlide.name} 的形象照`
                  }
                >
                  <Portrait
                    slide={activeSlide}
                    sizes="(max-width: 640px) 85vw, 48vw"
                    width={activeSlide.photoWidth}
                    height={activeSlide.photoHeight}
                  />
                  {activeSlide.audioSrc && (
                    <span className={styles.audioHint}>點選人物播放語音</span>
                  )}
                </button>
              </div>
            </div>
            <div className={styles.content} aria-live="polite">
              <p className={styles.handle}>{activeSlide.handle}</p>
              <h2>{activeSlide.name}</h2>
              <div id="streamer-description" className={styles.description}>
                {view === 'clip' ? (
                  <TwitchClipPlayer
                    key={activeSlide.id}
                    username={activeSlide.id}
                    name={activeSlide.name}
                  />
                ) : (
                  <div className={styles.infoBox}>
                    <div className={styles.infoBoxImg}>
                      <Portrait slide={activeSlide} thumbnail width="56" height="56" />
                    </div>
                    <div className={styles.infoBoxContent}>
                      <h3>{activeSlide.category}</h3>
                      <p>{activeSlide.bio}</p>
                    </div>
                  </div>
                )}
              </div>
              {view === 'info' && (
                <>
                  <div className={styles.gamesGrid}>
                    {activeSlide.games.map((game) => (
                      <div key={game.name} className={styles.gameItem}>
                        <div className={styles.gameImg}>
                          {game.raw ? (
                            <img src={game.icon} alt={game.name} className={styles.gameIcon} />
                          ) : (
                            <span
                              className={styles.gameIcon}
                              role="img"
                              aria-label={game.name}
                              style={{
                                maskImage: `url('${game.icon}')`,
                                WebkitMaskImage: `url('${game.icon}')`,
                              }}
                            />
                          )}
                        </div>
                        <p>{game.name}</p>
                      </div>
                    ))}
                  </div>
                  <button type="button" className={styles.ctaBtn} onClick={activeSlide.onCtaClick}>
                    {activeSlide.ctaLabel}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <nav className={styles.navThumbs} aria-label="切換實況主">
          <div className={styles.navThumbsInner}>
            {slides.slice(navStart, navStart + 5).map((slide, offset) => (
              <button
                key={slide.id}
                type="button"
                className={`${styles.navItem}${navStart + offset === current ? ` ${styles.active}` : ''}`}
                onClick={() => onSelect(navStart + offset)}
                aria-label={`查看 ${slide.name} 的介紹`}
                aria-current={navStart + offset === current ? 'true' : undefined}
              >
                <Portrait slide={slide} thumbnail width="60" height="60" />
              </button>
            ))}
          </div>
        </nav>
      </section>
    </div>
  )
}
