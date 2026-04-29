import type { Member } from '@/types'
import { hexToRgb } from '@/utils/color'
import { useInView } from '@/hooks/useInView'
import GameIcon from '@/components/GameIcon/GameIcon'
import styles from './MemberCard.module.css'

interface Props {
  member: Member
  index: number
}

export default function MemberCard({ member, index }: Props) {
  const { ref, inView } = useInView<HTMLAnchorElement>()
  const rgb = hexToRgb(member.color)

  return (
    <a
      ref={ref}
      href={member.twitch}
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
      <div className={styles.avatar}>
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className={styles.avatarImg}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className={styles.avatarText}>{member.name[0]}</span>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.name}>{member.name}</div>
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
