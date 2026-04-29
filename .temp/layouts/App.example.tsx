/**
 * 使用範例：App.tsx
 * 展示如何傳入資料給 HeroSliderLayout
 */

import React from 'react'
import { HeroSliderLayout } from './HeroSliderLayout'
import type { SlideData } from './types'

// ── 資產 base URL（方便統一替換） ──────────────────────
const CDN = 'https://www.yudiz.com/codepen/valorant-characters'

// ── Slide 資料 ─────────────────────────────────────────
const slides: SlideData[] = [
  {
    id: 'omen',
    theme: 'purple',
    backgroundImage: `${CDN}/omen.jpg`,
    verticalLabel: 'Bind Personalizada',
    sideLogoUrl: `${CDN}/gl-logo-first.svg`,
    navIconUrl: `${CDN}/right-icon-1.svg`,
    characterImage: `${CDN}/banner-main-1.svg`,
    characterName: 'Omen',
    role: 'Controller',
    infoIcon: `${CDN}/subtract.svg`,
    infoType: 'Controller',
    description:
      'A phantom of a memory, Omen hunts in the shadows. He renders enemies blind, teleports across the field, then lets paranoia take hold as his foe scrambles to find him.',
    abilities: [
      { key: 'Q', icon: `${CDN}/q-first-icon.svg` },
      { key: 'E', icon: `${CDN}/e-first-icon.svg` },
      { key: 'C', icon: `${CDN}/c-first-icon.svg` },
      { key: 'X', icon: `${CDN}/x-first-icon.svg` },
    ],
    ctaLabel: 'View Contract',
    onCtaClick: () => console.log('Omen contract clicked'),
  },
  {
    id: 'phoenix',
    theme: 'orange',
    backgroundImage: `${CDN}/phoenix.jpg`,
    verticalLabel: 'Bind Personalizada',
    sideLogoUrl: `${CDN}/gl-logo-second.svg`,
    navIconUrl: `${CDN}/right-icon-3.svg`,
    characterImage: `${CDN}/banner-main-2.svg`,
    characterName: 'Phoenix',
    role: 'Duelist',
    infoIcon: `${CDN}/subtract-second.svg`,
    infoType: 'Duelist',
    description:
      "Hailing from the UK, Phoenix's star power shines through in his fighting style. Confident and self-assured, he pushes the limits of his pyrokinetic abilities.",
    abilities: [
      { key: 'Q', icon: `${CDN}/q-second-icon.svg` },
      { key: 'E', icon: `${CDN}/e-second-icon.svg` },
      { key: 'C', icon: `${CDN}/c-second-icon.svg` },
      { key: 'X', icon: `${CDN}/x-second-icon.svg` },
    ],
    ctaLabel: 'View Contract',
    onCtaClick: () => console.log('Phoenix contract clicked'),
  },
  {
    id: 'viper',
    theme: 'green',
    backgroundImage: `${CDN}/viper.jpg`,
    verticalLabel: 'Bind Personalizada',
    sideLogoUrl: `${CDN}/gl-logo-third.svg`,
    navIconUrl: `${CDN}/right-icon-4.svg`,
    characterImage: `${CDN}/banner-main-3.svg`,
    characterName: 'Viper',
    role: 'Controller',
    infoIcon: `${CDN}/subtract-third.svg`,
    infoType: 'Controller',
    description:
      "The American chemist deploys an array of poisonous chemical devices to control the battlefield and choke the enemy's vision. If the toxins don't kill her prey, the paranoia will.",
    abilities: [
      { key: 'Q', icon: `${CDN}/q-third-icon.svg` },
      { key: 'E', icon: `${CDN}/e-third-icon.svg` },
      { key: 'C', icon: `${CDN}/c-third-icon.svg` },
      { key: 'X', icon: `${CDN}/x-third-icon.svg` },
    ],
    ctaLabel: 'View Contract',
    onCtaClick: () => console.log('Viper contract clicked'),
  },
]

// ── App ────────────────────────────────────────────────
export default function App() {
  return (
    <HeroSliderLayout
      slides={slides}
      // logoUrl="./your-logo.svg"          // 替換 logo
      // navItems={[...]}                   // 替換導覽項目
      // autoPlayMs={5000}                  // 開啟自動播放
      // showHint={false}                   // 隱藏鍵盤提示
    />
  )
}
