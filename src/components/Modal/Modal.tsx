import { useEffect } from 'react'
import type { Streamer, Mascot } from '@/types'
import { hexToRgb } from '@/utils/color'
import { useAudio } from '@/hooks/useAudio'
import GameIcon from '@/components/GameIcon/GameIcon'
import styles from './Modal.module.css'

interface Props {
  person: Streamer | Mascot | null
  onClose: () => void
}

export default function Modal({ person, onClose }: Props) {
  const { play, stop } = useAudio()
  const isOpen = person !== null
  const rgb = person ? hexToRgb(person.color) : '0,245,255'

  useEffect(() => {
    if (isOpen && person) {
      document.body.style.overflow = 'hidden'
      if ('audio' in person && person.audio) play(person.audio)
    } else {
      document.body.style.overflow = ''
      stop()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, person?.username]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!person) return null

  const avatarContent = person.photo ? (
    <img
      src={person.photo}
      alt={person.name}
      className={styles.avatarImg}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  ) : (
    <span className={styles.avatarText} style={{ color: person.color }}>
      {person.name[0]}
    </span>
  )

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="關閉">
          ✕
        </button>

        <div
          className={styles.accentBar}
          style={{ background: `linear-gradient(90deg, ${person.color}, transparent)` }}
        />

        <div className={styles.body}>
          {/* Header */}
          <div className={styles.header}>
            <div
              className={styles.avatar}
              style={{
                background: `rgba(${rgb},0.12)`,
                border: `2px solid ${person.color}`,
                boxShadow: `0 0 0 3px rgba(${rgb},0.15), 0 0 24px rgba(${rgb},0.12)`,
              }}
            >
              {avatarContent}
            </div>
            <div>
              <div className={styles.name} style={{ color: person.color }}>
                {person.name}
              </div>
              <div className={styles.handle}>@{person.username}</div>
            </div>
          </div>

          {/* Bio */}
          {'bio' in person && person.bio && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>關於</div>
              <p className={styles.bio}>{person.bio}</p>
            </div>
          )}

          {/* Tags */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>遊戲</div>
            <div className={styles.tagList}>
              {person.tags.map((tag) => (
                <span
                  key={tag}
                  className={styles.tagLarge}
                  style={{
                    borderColor: `rgba(${rgb},0.35)`,
                    color: person.color,
                    background: `rgba(${rgb},0.07)`,
                  }}
                >
                  <GameIcon tag={tag} size={18} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Twitch */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Twitch</div>
            <a
              href={person.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.twitchBtn}
            >
              <svg className={styles.twitchIcon} viewBox="0 0 24 24" aria-hidden>
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              前往 Twitch 頻道{'　'}twitch.tv/{person.username}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
