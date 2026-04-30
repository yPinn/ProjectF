import type { Member, StreamStatus } from '@/types'
import { hexToRgb } from '@/utils/color'
import { twitchUrl } from '@/utils/url'
import { useInView } from '@/hooks/useInView'
import GameIcon from '@/components/GameIcon/GameIcon'
import styles from './MemberCard.module.css'

interface Props {
  member: Member
  index: number
  status?: StreamStatus
}

export default function MemberCard({ member, index, status }: Props) {
  const { ref, inView } = useInView<HTMLAnchorElement>()
  const rgb = hexToRgb(member.color)

  return (
    <a
      ref={ref}
      href={twitchUrl(member.username)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${inView ? styles.visible : ''}`}
      style={
        {
          '--accent-color': member.color,
          '--accent-rgb': rgb,
          transitionDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
    >
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name ?? member.username}
              className={styles.avatarImg}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <span className={styles.avatarText}>{(member.name ?? member.username)[0]}</span>
          )}
        </div>
        {status?.isLive && <span className={styles.liveDot} aria-label="直播中" />}
      </div>

      <div className={styles.info}>
        <div className={styles.name}>{member.name ?? member.username}</div>
        <div className={styles.handle}>twitch.tv/{member.username}</div>
        <div className={styles.tags}>
          {member.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              <GameIcon tag={tag} size={12} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}
