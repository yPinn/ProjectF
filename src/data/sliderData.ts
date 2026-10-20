import type { Streamer, StreamerSlideData } from '@/types'
import { twitchUrl } from '@/utils/url'
import peopleData from './people.json'
import links from './links.json'
import assetData from './assets.json'

const streamersData = peopleData as Streamer[]

type TagEntry = string | { src: string; raw: true }

const TAG_ICONS: Record<string, TagEntry> = {
  'League of Legends': assetData.games.lol,
  'Apex Legends': assetData.games.apex,
  Valorant: assetData.games.valorant,
  'Teamfight Tactics': assetData.games.tft,
  'Counter-Strike 2': { src: assetData.games.cs2, raw: true },
  ETS2: { src: assetData.games.ets2, raw: true },
  BMW: assetData.games.bmw,
  'Delta Force': assetData.games.delta,
  Minecraft: { src: assetData.games.minecraft, raw: true },
  'Mahjong Soul': assetData.games.mahjong,
  Singing: assetData.games.singing,
  PUBG: assetData.games.pubg,
  Ferrari: assetData.games.ferrari,
}

// Briefs read best at 120–180 characters; leave a little room for extended profiles.
const BIO_MAX_CHARS = 220

export const sliderStreamers: StreamerSlideData[] = streamersData.map((s) => {
  const asset = assetData.members[s.username as keyof typeof assetData.members]
  const photo = asset?.photo ?? assetData.logo
  const bio = Array.from(s.bio.trim())
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
    bio: bio.length > BIO_MAX_CHARS ? bio.slice(0, BIO_MAX_CHARS).join('') + '…' : bio.join(''),
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
