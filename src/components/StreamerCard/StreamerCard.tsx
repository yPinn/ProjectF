import { useState } from 'react'
import type { Streamer, Mascot } from '@/types'
import { hexToRgb } from '@/utils/color'
import { useInView } from '@/hooks/useInView'
import GameIcon from '@/components/GameIcon/GameIcon'
import styles from './StreamerCard.module.css'

interface Props {
  person: Streamer | Mascot
  index: number
  onClick: (person: Streamer | Mascot) => void
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export default function StreamerCard({ person, index, onClick }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rgb = hexToRgb(person.color)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty(
      '--mouse-x',
      `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
    )
    e.currentTarget.style.setProperty(
      '--mouse-y',
      `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`,
    )
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.5
    setRipples((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: e.clientX - rect.left - size / 2,
        y: e.clientY - rect.top - size / 2,
        size,
      },
    ])
  }

  const removeRipple = (id: number) => setRipples((prev) => prev.filter((r) => r.id !== id))

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      className={`${styles.card} ${inView ? styles.visible : ''}`}
      style={
        {
          '--accent-color': person.color,
          '--accent-rgb': rgb,
          transitionDelay: `${index * 80}ms`,
        } as React.CSSProperties
      }
      onClick={() => onClick(person)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(person)}
      onMouseMove={handleMouseMove}
      onPointerDown={handlePointerDown}
    >
      {/* ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: `rgba(${rgb},0.15)`,
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
            pointerEvents: 'none',
            transform: 'scale(0)',
            animation: 'rippleOut 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
            zIndex: 3,
          }}
          onAnimationEnd={() => removeRipple(r.id)}
        />
      ))}

      {/* left: info */}
      <div className={styles.info}>
        {'title' in person && person.title && <div className={styles.badge}>★ {person.title}</div>}
        <div className={styles.name}>{person.name}</div>
        <div className={styles.handle}>twitch.tv/{person.username}</div>
        {'bio' in person && person.bio && <p className={styles.bio}>{person.bio}</p>}
        <div className={styles.tags}>
          {person.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              <GameIcon tag={tag} size={14} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* right: photo */}
      <div className={styles.photoWrap}>
        {person.photo ? (
          <img
            className={styles.photo}
            src={person.photo}
            alt={person.name}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <span className={styles.phIcon}>{person.name[0]}</span>
          </div>
        )}
      </div>
    </article>
  )
}
