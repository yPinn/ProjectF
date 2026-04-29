import styles from './Particles.module.css'

const COLORS = ['#00f5ff', '#bf5fff', '#ff2d78', '#ffd700', '#39ff14']

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const particles = Array.from({ length: 15 }, (_, i) => {
  const size = rand(1, 4)
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    id: i,
    left: `${rand(0, 100)}%`,
    bottom: `${rand(0, 20)}%`,
    size,
    color,
    shadow: `0 0 ${size * 3}px ${color}`,
    duration: `${rand(6, 14)}s`,
    delay: `${rand(0, 6)}s`,
    drift: `${(Math.random() - 0.5) * 120}px`,
  }
})

export default function Particles() {
  return (
    <div className={styles.container} aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={
            {
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: p.shadow,
              animationDuration: p.duration,
              animationDelay: p.delay,
              '--drift': p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
