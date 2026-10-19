import type { Streamer, StreamerSlideData } from '@/types'
import { twitchUrl } from '@/utils/url'
import peopleData from './people.json'
import links from './links.json'
import assetData from './assets.json'

const streamersData = peopleData as Streamer[]

type TagEntry = string | { src: string; raw: true }

const TAG_ICONS: Record<string, TagEntry> = {
  'League of Legends': '/images/optimized/game-lol.webp',
  'Apex Legends': '/images/optimized/game-apex.webp',
  Valorant: '/images/optimized/game-valorant.webp',
  'Teamfight Tactics': '/images/optimized/game-tft.webp',
  'Counter-Strike 2': { src: '/images/optimized/game-cs2.webp', raw: true },
  ETS2: { src: '/images/optimized/game-ets2.webp', raw: true },
  BMW: '/images/optimized/game-bmw.webp',
  'Delta Force': '/images/optimized/game-delta.webp',
  Minecraft: { src: '/images/optimized/game-minecraft.webp', raw: true },
  'Mahjong Soul': '/images/optimized/game-mahjong.webp',
  Singing: '/images/optimized/game-singing.webp',
  PUBG: '/images/optimized/game-pubg.webp',
  Ferrari: '/images/optimized/game-ferrari.webp',
}

const BIO_MAX_CHARS = 200

export const sliderStreamers: StreamerSlideData[] = streamersData.map((s) => {
  const asset = assetData[s.username as keyof typeof assetData]
  const photo = asset?.photo ?? '/images/optimized/logo.webp'
  return {
    id: s.username,
    accentColor: s.color,
    navThumbnail: asset?.thumbnail ?? photo,
    photo,
    preview: asset?.preview,
    photoWidth: asset?.width,
    photoHeight: asset?.height,
    previewWidth: asset?.previewWidth,
    missingPhoto: asset?.missingPhoto,
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
    audioSrc: asset?.audio ?? undefined,
    contactUrl: links.discord[s.username as keyof typeof links.discord] || undefined,
    ctaLabel: 'Watch Live',
    onCtaClick: () => window.open(twitchUrl(s.username), '_blank', 'noopener,noreferrer'),
  }
})
