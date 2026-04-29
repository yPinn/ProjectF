interface BasePerson {
  name: string
  username: string
  photo?: string
  color: string
  tags: string[]
  twitch: string
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
