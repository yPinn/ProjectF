import { useMemo } from 'react'
import './App.css'
import Cursor from '@/components/Cursor/Cursor'
import Starfield from '@/components/Starfield/Starfield'
import Splash from '@/sections/Splash/Splash'
import About from '@/sections/About/About'
import { useTwitchProfiles } from '@/hooks/useTwitchProfiles'

import StreamerSlider from '@/components/StreamerSlider/StreamerSlider'
import { sliderStreamers } from '@/data/sliderData'

const NAV_ITEMS = [
  { label: 'Info', href: '#', active: true },
  { label: 'Clip', href: '#' },
  { label: 'Contact', href: '#', target: '_blank', key: 'contact' },
]

// Evaluated once at module load — safe for this client-only SPA
const isMouseDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

export default function App() {
  const twitchProfiles = useTwitchProfiles()

  const enrichedSlides = useMemo(
    () =>
      sliderStreamers.map((slide) => {
        const profile = twitchProfiles[slide.id]
        if (!profile) return slide
        return {
          ...slide,
          name: profile.displayName,
          navThumbnail: profile.profileImageUrl,
        }
      }),
    [twitchProfiles],
  )

  return (
    <>
      {isMouseDevice && <Cursor />}
      <Starfield />
      <Splash />
      <About />

      <StreamerSlider
        slides={enrichedSlides}
        logoUrl="/images/logo.png"
        verticalText="Fuck Entertainment"
        navItems={NAV_ITEMS}
      />

    </>
  )
}
