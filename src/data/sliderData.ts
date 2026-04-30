import type { StreamerSlideData } from '@/types'
import { twitchUrl } from '@/utils/url'
import streamersData from './streamers.json'

type TagEntry = string | { src: string; raw: true }

const TAG_ICONS: Record<string, TagEntry> = {
  'League of Legends': '/images/games/lol.png',
  'Apex Legends': '/images/games/apex.png',
  Valorant: '/images/games/valorant.png',
  'Teamfight Tactics': '/images/games/tft.png',
  'Counter-Strike 2': { src: '/images/games/cs2.png', raw: true },
  ETS2: { src: '/images/games/ets2.png', raw: true },
  BMW: '/images/games/bmw.png',
  'Delta Force': '/images/games/delta.png',
  Minecraft: '/images/games/minecraft.png',
  'Mahjong Soul': '/images/games/mahjong.png',
  Singing: '/images/games/singer.png',
  Ferrari: '/images/games/ferrari.png',
}

const BIO_MAX_CHARS = 200

export const sliderStreamers: StreamerSlideData[] = streamersData.map((s) => ({
  id: s.username,
  accentColor: s.color,
  navThumbnail: s.photo ?? '/images/logo.png',
  photo: s.photo ?? '/images/logo.png',
  handle: `@${s.username}`,
  name: s.username,
  category: s.title,
  bio: s.bio.length > BIO_MAX_CHARS ? s.bio.slice(0, BIO_MAX_CHARS) + '…' : s.bio,
  games: s.tags
    .filter((tag) => TAG_ICONS[tag])
    .slice(0, 4)
    .map((tag) => {
      const entry = TAG_ICONS[tag]
      return typeof entry === 'string'
        ? { name: tag, icon: entry }
        : { name: tag, icon: entry.src, raw: true }
    }),
  ctaLabel: 'Watch Live',
  onCtaClick: () => window.open(twitchUrl(s.username), '_blank'),
}))
