import { useEffect, useRef } from 'react'
import styles from './Starfield.module.css'

const COLORS: [number, number, number][] = [
  [200, 230, 255],
  [0, 245, 255],
  [191, 95, 255],
  [255, 45, 120],
  [255, 215, 0],
]

const LAYERS = [
  {
    count: 120,
    sizeRange: [0.4, 1.0] as [number, number],
    speedY: 0.018,
    opacity: 0.35,
    twinkleRate: 0.003,
  },
  {
    count: 60,
    sizeRange: [0.8, 1.6] as [number, number],
    speedY: 0.042,
    opacity: 0.55,
    twinkleRate: 0.006,
  },
  {
    count: 20,
    sizeRange: [1.4, 2.2] as [number, number],
    speedY: 0.07,
    opacity: 0.7,
    twinkleRate: 0.008,
  },
]

interface Star {
  x: number
  y: number
  dotR: number
  speedY: number
  baseAlpha: number
  alpha: number
  layer: number
  twinkle: number
  twinkleSpd: number
  /** Pre-rendered radial gradient sprite — created once, reused every frame */
  glow: HTMLCanvasElement
  glowHalf: number
  /** Pre-computed rgb() string to avoid per-frame string allocation */
  fill: string
}

/**
 * Creates a small offscreen canvas with the star's glow baked in at full opacity.
 * At draw time we set globalAlpha to scale it, matching the original a²×0.55 math:
 *   stop0 rendered at alpha=1, stop0.4 at 0.218 (= 0.12/0.55), stop1 at 0.
 *   globalAlpha = a*a*0.55 → effective center alpha = a²×0.55  ✓
 */
function makeGlowSprite(
  r: number,
  g: number,
  b: number,
  glowR: number,
): { canvas: HTMLCanvasElement; half: number } {
  const dim = Math.ceil(glowR * 2) + 2
  const offscreen = document.createElement('canvas')
  offscreen.width = dim
  offscreen.height = dim
  const octx = offscreen.getContext('2d')!
  const cx = dim / 2
  const grad = octx.createRadialGradient(cx, cx, 0, cx, cx, glowR)
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.218)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  octx.fillStyle = grad
  octx.beginPath()
  octx.arc(cx, cx, glowR, 0, Math.PI * 2)
  octx.fill()
  return { canvas: offscreen, half: cx }
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0,
      H = 0,
      rafId = 0,
      scrollY = 0
    let stars: Star[] = []
    let resizeTimer: ReturnType<typeof setTimeout>

    function randColor(): [number, number, number] {
      return COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    function makeStar(li: number, yOverride?: number): Star {
      const L = LAYERS[li]
      const [r, g, b] = randColor()
      const size = L.sizeRange[0] + Math.random() * (L.sizeRange[1] - L.sizeRange[0])
      const glowR = size * (li === 2 ? 5 : 3)
      const { canvas: glow, half: glowHalf } = makeGlowSprite(r, g, b, glowR)
      return {
        x: Math.random() * W,
        y: yOverride ?? Math.random() * H,
        dotR: size * 0.5,
        speedY: L.speedY * (0.7 + Math.random() * 0.6),
        baseAlpha: L.opacity * (0.5 + Math.random() * 0.5),
        alpha: 0,
        layer: li,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpd: L.twinkleRate * (0.5 + Math.random()),
        glow,
        glowHalf,
        fill: `rgb(${r},${g},${b})`,
      }
    }

    function init() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
      stars = LAYERS.flatMap((_, li) =>
        Array.from({ length: LAYERS[li].count }, () => makeStar(li)),
      )
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      for (const s of stars) {
        s.twinkle += s.twinkleSpd
        s.alpha += (s.baseAlpha * (0.75 + 0.25 * Math.sin(s.twinkle)) - s.alpha) * 0.06

        const pf = [0.02, 0.06, 0.14][s.layer]
        const dx = s.x
        const dy = s.y - scrollY * pf
        s.y += s.speedY
        if (s.y > H + 4) Object.assign(s, makeStar(s.layer, -4))

        const a = Math.max(0, Math.min(1, s.alpha))

        // Glow: drawImage from pre-rendered sprite, globalAlpha = a²×0.55
        ctx.globalAlpha = a * a * 0.55
        ctx.drawImage(s.glow, dx - s.glowHalf, dy - s.glowHalf)

        // Solid core dot
        ctx.globalAlpha = a
        ctx.fillStyle = s.fill
        ctx.beginPath()
        ctx.arc(dx, dy, s.dotR, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }

    const onScroll = () => {
      scrollY = window.scrollY
    }
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(init, 150)
    }
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId)
      else rafId = requestAnimationFrame(draw)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    init()
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}
