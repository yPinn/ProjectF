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
  size: number
  speedY: number
  baseAlpha: number
  alpha: number
  r: number
  g: number
  b: number
  layer: number
  twinkle: number
  twinkleSpd: number
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

    function randColor(): [number, number, number] {
      return COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    function makeStar(li: number, yOverride?: number): Star {
      const L = LAYERS[li]
      const [r, g, b] = randColor()
      return {
        x: Math.random() * W,
        y: yOverride ?? Math.random() * H,
        size: L.sizeRange[0] + Math.random() * (L.sizeRange[1] - L.sizeRange[0]),
        speedY: L.speedY * (0.7 + Math.random() * 0.6),
        baseAlpha: L.opacity * (0.5 + Math.random() * 0.5),
        alpha: 0,
        r,
        g,
        b,
        layer: li,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpd: L.twinkleRate * (0.5 + Math.random()),
      }
    }

    function init() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
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
        const glowR = s.size * (s.layer === 2 ? 5 : 3)

        ctx.save()
        ctx.globalAlpha = a

        const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, glowR)
        glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${a * 0.55})`)
        glow.addColorStop(0.4, `rgba(${s.r},${s.g},${s.b},${a * 0.12})`)
        glow.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(dx, dy, glowR, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},1)`
        ctx.beginPath()
        ctx.arc(dx, dy, s.size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }
      rafId = requestAnimationFrame(draw)
    }

    const onScroll = () => {
      scrollY = window.scrollY
    }
    const onResize = () => init()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    init()
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}
