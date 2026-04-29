import React from 'react'
import type { SlideData } from './types'
import { useSlider } from './useSlider'
import './HeroSliderLayout.css'

interface HeroSliderLayoutProps {
  /** 要顯示的幻燈片資料陣列（至少 1 筆） */
  slides: SlideData[]
  /**
   * Header logo 圖片 URL
   * @default Valorant logo
   */
  logoUrl?: string
  /**
   * Header 導覽連結
   * @default ['Latest', 'Collection', 'Career', 'Store']
   */
  navItems?: { label: string; href: string; active?: boolean }[]
  /**
   * 自動播放間隔（ms），0 = 停用
   * @default 0
   */
  autoPlayMs?: number
  /**
   * 是否顯示底部鍵盤提示文字
   * @default true
   */
  showHint?: boolean
}

const DEFAULT_NAV = [
  { label: 'Latest', href: '#', active: true },
  { label: 'Collection', href: '#' },
  { label: 'Career', href: '#' },
  { label: 'Store', href: '#' },
]

const DEFAULT_LOGO = 'https://www.yudiz.com/codepen/valorant-characters/valorant.svg'

const RAIN_COUNT = 10

export const HeroSliderLayout: React.FC<HeroSliderLayoutProps> = ({
  slides,
  logoUrl = DEFAULT_LOGO,
  navItems = DEFAULT_NAV,
  autoPlayMs = 0,
  showHint = true,
}) => {
  const { current, goTo } = useSlider({ total: slides.length, autoPlayMs })
  const activeSlide = slides[current]

  return (
    <div className="hsl-root" data-theme={activeSlide.theme}>
      {/* Rain particles */}
      {Array.from({ length: RAIN_COUNT }, (_, i) => (
        <i key={i} className="hsl-rain" aria-hidden="true" />
      ))}

      {/* Header */}
      <header className="hsl-header">
        <div className="hsl-header-logo">
          <img src={logoUrl} alt="Logo" />
        </div>
        <nav className="hsl-header-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.label} className={item.active ? 'active' : ''}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hsl-slide${index === current ? ' is-active' : ''}`}
          style={{ backgroundImage: `url('${slide.backgroundImage}')` }}
          aria-hidden={index !== current}
        >
          <div className="hsl-slide-inner">
            {/* Left vertical label */}
            <div className="hsl-col-left">
              <h6>{slide.verticalLabel}</h6>
              <img src={slide.sideLogoUrl} alt="" aria-hidden="true" />
            </div>

            {/* Character image */}
            <div className="hsl-col-image">
              <img src={slide.characterImage} alt={slide.characterName} />
            </div>

            {/* Content */}
            <div className="hsl-col-content">
              <p className="hsl-role">{slide.role}</p>
              <h1 className="hsl-name">{slide.characterName}</h1>

              {/* Info box */}
              <div className="hsl-info-box">
                <div className="hsl-info-box-icon">
                  <img src={slide.infoIcon} alt="" aria-hidden="true" />
                </div>
                <div>
                  <p className="hsl-info-type">{slide.infoType}</p>
                  <p className="hsl-info-desc">{slide.description}</p>
                </div>
              </div>

              {/* Abilities */}
              <div className="hsl-abilities">
                {slide.abilities.map((ability) => (
                  <div key={ability.key} className="hsl-ability">
                    <div className="hsl-ability-img">
                      <img src={ability.icon} alt={`Ability ${ability.key}`} />
                    </div>
                    <p className="hsl-ability-key">{ability.key}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className="hsl-cta"
                onClick={slide.onCtaClick}
                style={
                  slide.ctaButtonImage
                    ? ({
                        '--hsl-cta-custom-bg': `url('${slide.ctaButtonImage}')`,
                      } as React.CSSProperties)
                    : undefined
                }
                data-custom-bg={slide.ctaButtonImage ? 'true' : undefined}
                aria-label={slide.ctaLabel}
              >
                <span>{slide.ctaLabel}</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Right nav dots */}
      <nav className="hsl-nav-dots" aria-label="Slide navigation">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hsl-nav-dot${index === current ? ' is-active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Go to ${slide.characterName}`}
            aria-current={index === current ? 'true' : undefined}
          >
            <img src={slide.navIconUrl} alt="" aria-hidden="true" />
          </button>
        ))}
      </nav>

      {showHint && (
        <p className="hsl-hint" aria-hidden="true">
          ← → Switch character
        </p>
      )}
    </div>
  )
}

export default HeroSliderLayout
