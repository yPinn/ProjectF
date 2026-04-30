interface BasePerson {
  /** Populated at runtime from Twitch display_name; falls back to username */
  name?: string
  username: string
  photo?: string
  color: string
  tags: string[]
}

export interface Streamer extends BasePerson {
  title: string
  bio: string
  audio: string
}

export interface Mascot extends BasePerson {
  title?: string
  bio?: string
  audio?: string
}

export type Member = BasePerson

export type TagIconMap = Record<string, string>

export interface StreamStatus {
  isLive: boolean
  viewerCount?: number
  title?: string
  gameName?: string
}

export interface StreamerGame {
  name: string
  icon: string
  raw?: boolean
}

export interface StreamerSlideData {
  id: string
  backgroundImage?: string
  navThumbnail: string
  photo: string
  handle: string
  name: string
  category: string
  bio: string
  games: StreamerGame[]
  ctaLabel: string
  onCtaClick?: () => void
  accentColor?: string
}
