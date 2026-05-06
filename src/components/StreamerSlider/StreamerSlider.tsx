import { type CSSProperties, useRef, useEffect, useCallback } from 'react'
import type { StreamerSlideData } from '@/types'
import { useSlider } from '@/hooks/useSlider'
import { useAudio } from '@/hooks/useAudio'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import styles from './StreamerSlider.module.css'

interface StreamerSliderProps {
  slides: StreamerSlideData[]
  logoUrl?: string
  homeHref?: string
  navItems?: { label: string; href: string; active?: boolean; target?: string; key?: string }[]
  verticalText?: string
  autoPlayMs?: number
  audioVolume?: number
  onMenuClick?: () => void
}

const DEFAULT_NAV = [
  { label: 'Info', href: '#', active: true },
  { label: 'Clip', href: '#' },
  { label: 'Live', href: '#' },
]

const RAIN_COUNT = 40
const MAX_GAMES = 4
const SCROLL_THRESHOLD = 50
const SCROLL_COOLDOWN = 550

function StreamerSlider({
  slides,
  logoUrl,
  homeHref = '#splash',
  navItems = DEFAULT_NAV,
  verticalText = 'FUCK ENTERTAINMENT',
  autoPlayMs = 0,
  audioVolume = 0.85,
  onMenuClick,
}: StreamerSliderProps) {
  const { current, goTo, goNext, goPrev } = useSlider({ total: slides.length, autoPlayMs })
  const activeSlide = slides[current]
  const rootRef = useRef<HTMLDivElement>(null)
  useMouseParallax(rootRef, 14)
  const { play } = useAudio()
  const currentRef = useRef(current)
  useEffect(() => {
    currentRef.current = current
  }, [current])

  const flashElem = useRef<HTMLDivElement>(null)
  const transitionBusy = useRef(false)
  const triggerFlash = useCallback((action: () => void) => {
    if (transitionBusy.current) return
    transitionBusy.current = true
    action()
    flashElem.current?.classList.add(styles.flashActive)
    setTimeout(() => flashElem.current?.classList.remove(styles.flashActive), 100)
    setTimeout(() => {
      transitionBusy.current = false
    }, 350)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let acc = 0
    let pendingDir = 0

    function trigger(dir: number) {
      pendingDir = 0
      triggerFlash(() => {
        if (dir > 0) goNext()
        else goPrev()
      })
      setTimeout(() => {
        acc = 0
        if (pendingDir !== 0) {
          const d = pendingDir
          pendingDir = 0
          const cur = currentRef.current
          if (!((d > 0 && cur >= slides.length - 1) || (d < 0 && cur <= 0))) {
            trigger(d)
          }
        }
      }, SCROLL_COOLDOWN)
    }

    const handler = (e: WheelEvent) => {
      acc += e.deltaY
      if (Math.abs(acc) < SCROLL_THRESHOLD) {
        e.preventDefault()
        return
      }
      const dir = acc > 0 ? 1 : -1
      acc = 0
      const cur = currentRef.current
      if ((dir > 0 && cur >= slides.length - 1) || (dir < 0 && cur <= 0)) return
      e.preventDefault()
      if (transitionBusy.current) {
        pendingDir = dir // last intent wins
        return
      }
      trigger(dir)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [slides.length, goNext, goPrev, triggerFlash])

  const navWin = Math.min(5, slides.length)
  const navStart = Math.max(0, Math.min(current - Math.floor(navWin / 2), slides.length - navWin))
  const navSlides = slides.slice(navStart, navStart + navWin)

  return (
    <div
      id="streamerSlider"
      ref={rootRef}
      className={styles.root}
      style={
        activeSlide.accentColor
          ? ({ '--ss-accent': activeSlide.accentColor } as CSSProperties)
          : undefined
      }
    >
      <div className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />

      <div className={styles.rainContainer} aria-hidden="true">
        {Array.from({ length: RAIN_COUNT }, (_, i) => (
          <i key={i} className={styles.rain} />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <a href={homeHref} className={styles.headerLogoLink} aria-label="回到首頁">
              <div className={styles.headerLogo}>
                {logoUrl ? (
                  <span
                    className={styles.headerLogoImg}
                    style={{ maskImage: `url('${logoUrl}')`, WebkitMaskImage: `url('${logoUrl}')` }}
                    aria-hidden="true"
                  />
                ) : (
                  <span className={styles.headerLogoText}>FE</span>
                )}
              </div>
            </a>
            <div className={styles.headerRight}>
              <nav className={styles.headerMenu}>
                <ul>
                  {navItems.map((item) => (
                    <li key={item.label} className={item.active ? styles.active : ''}>
                      <a
                        href={
                          item.key === 'contact' ? (activeSlide.contactUrl ?? item.href) : item.href
                        }
                        target={item.target}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <button
                type="button"
                className={styles.hamburger}
                onClick={onMenuClick}
                aria-label="開啟選單"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div ref={flashElem} className={styles.flash} aria-hidden="true" />

      <section className={styles.bannerSection}>
        <div className={styles.bannerInner}>
          <div className={styles.bgLayer} aria-hidden="true">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${styles.bgItem}${index === current ? ` ${styles.bgActive}` : ''}`}
                style={
                  slide.backgroundImage
                    ? { backgroundImage: `url('${slide.backgroundImage}')` }
                    : undefined
                }
              />
            ))}
          </div>

          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide}${index === current ? ` ${styles.active}` : ''}`}
              aria-hidden={index !== current}
            >
              <div className={styles.verticalLabel}>
                <h6>{verticalText}</h6>
                <span className={styles.slideIndex} aria-hidden="true">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </span>
              </div>

              <div className={styles.characterImg}>
                {logoUrl && (
                  <div
                    className={styles.slideBgLogo}
                    style={{ maskImage: `url('${logoUrl}')`, WebkitMaskImage: `url('${logoUrl}')` }}
                    aria-hidden="true"
                  />
                )}
                <div className={styles.mainImg}>
                  <div
                    className={styles.parallaxLayer}
                    onClick={() => slide.audioSrc && play(slide.audioSrc, audioVolume)}
                    style={
                      {
                        cursor: slide.audioSrc ? 'pointer' : 'default',
                        '--photo-url': `url('${slide.photo}')`,
                      } as CSSProperties
                    }
                  >
                    <img
                      src={slide.photo}
                      alt={slide.name}
                      loading={index === current ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.content}>
                <p className={styles.handle}>{slide.handle}</p>
                <h1>{slide.name}</h1>

                <div className={styles.infoBox}>
                  <div className={styles.infoBoxImg}>
                    <img
                      src={slide.navThumbnail}
                      alt={slide.name}
                      loading={index === current ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                  <div className={styles.infoBoxContent}>
                    <h5>{slide.category}</h5>
                    <p>{slide.bio}</p>
                  </div>
                </div>

                <div className={styles.gamesGrid}>
                  {Array.from({ length: MAX_GAMES }, (_, i) => {
                    const game = slide.games[i]
                    return (
                      <div
                        key={i}
                        className={`${styles.gameItem}${!game ? ` ${styles.empty}` : ''}`}
                      >
                        {game && (
                          <>
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
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button type="button" className={styles.ctaBtn} onClick={slide.onCtaClick}>
                  {slide.ctaLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        <nav className={styles.navThumbs} aria-label="Slide navigation">
          <div className={styles.navThumbsInner}>
            {navSlides.map((slide, wi) => {
              const index = navStart + wi
              return (
                <button
                  key={slide.id}
                  type="button"
                  className={`${styles.navItem}${index === current ? ` ${styles.active}` : ''}`}
                  onClick={() => triggerFlash(() => goTo(index))}
                  aria-label={`Go to ${slide.name}`}
                  aria-current={index === current ? 'true' : undefined}
                >
                  <img src={slide.navThumbnail} alt="" />
                </button>
              )
            })}
          </div>
        </nav>
      </section>
    </div>
  )
}

export default StreamerSlider
