import { useMemo } from 'react'
import './App.css'
import Cursor from '@/components/Cursor/Cursor'
import Starfield from '@/components/Starfield/Starfield'
import Splash from '@/sections/Splash/Splash'
import About from '@/sections/About/About'
import MemberCard from '@/components/MemberCard/MemberCard'
import { useInView } from '@/hooks/useInView'
import { useStreamStatus } from '@/hooks/useStreamStatus'
import { useTwitchProfiles } from '@/hooks/useTwitchProfiles'

import StreamerSlider from '@/components/StreamerSlider/StreamerSlider'
import { sliderStreamers } from '@/data/sliderData'
import membersData from '@/data/members.json'

const members = membersData as import('./types').Member[]

// Evaluated once at module load — safe for this client-only SPA
const isMouseDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        marginBottom: 36,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <span
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--color-border))',
          display: 'block',
        }}
      />
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--color-muted)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </h2>
      <span
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(270deg, transparent, var(--color-border))',
          display: 'block',
        }}
      />
    </div>
  )
}

export default function App() {
  const streamStatuses = useStreamStatus()
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

  const enrichedMembers = useMemo(
    () =>
      members.map((m) => ({
        ...m,
        name: twitchProfiles[m.username]?.displayName ?? m.username,
      })),
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
      />

      <main id="mainContent" style={{ position: 'relative', zIndex: 'var(--z-content)' }}>
        {/* Members */}
        <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 60px' }}>
          <SectionLabel>
            <strong>亂源</strong>
            {'　'}MEMBER
          </SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {enrichedMembers.map((m, i) => (
              <MemberCard
                key={m.username}
                member={m}
                index={i}
                status={streamStatuses[m.username]}
              />
            ))}
          </div>
        </section>

        <footer
          style={{
            position: 'relative',
            zIndex: 'var(--z-content)',
            textAlign: 'center',
            padding: 28,
            borderTop: '1px solid var(--color-border)',
            fontSize: 11,
            color: 'var(--color-muted)',
            letterSpacing: '0.18em',
            marginTop: 20,
            overflow: 'hidden',
          }}
        >
          © 2026 法克娛樂 FUCK ENTERTAINMENT &nbsp;／&nbsp; ALL RIGHTS RESERVED
        </footer>
      </main>
    </>
  )
}
