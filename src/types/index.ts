export interface Streamer {
  username: string
  /** Populated at runtime from Twitch display_name; falls back to username */
  name?: string
  photo?: string
  color: string
  tags: string[]
  section: 'slider'
  title: string
  bio: string
  audio: string
}

export interface Member {
  username: string
  /** Populated at runtime from Twitch display_name; falls back to username */
  name?: string
  photo?: string
  color: string
  tags: string[]
  section: 'member'
}

/** Mascot is now merged into Streamer */
export type Mascot = Streamer

export type Person = Streamer | Member

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
  audioSrc?: string
  contactUrl?: string
}
