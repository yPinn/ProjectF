import gameData from '@/data/games.json'
import type { TagIconMap } from '@/types'

const map = gameData as TagIconMap

function resolve(tag: string): string | undefined {
  const lower = tag.toLowerCase()
  for (const [key, src] of Object.entries(map)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return src
  }
}

interface Props {
  tag: string
  size?: number
  className?: string
}

export default function GameIcon({ tag, size = 14, className }: Props) {
  const src = resolve(tag)
  if (!src) return null
  return (
    <img
      src={src}
      alt={tag}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', borderRadius: 2, opacity: 0.9, flexShrink: 0 }}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
