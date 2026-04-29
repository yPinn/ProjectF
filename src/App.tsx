import { useState } from 'react'
import Cursor from '@/components/Cursor/Cursor'
import Starfield from '@/components/Starfield/Starfield'
import Splash from '@/sections/Splash/Splash'
import About from '@/sections/About/About'
import StreamerCard from '@/components/StreamerCard/StreamerCard'
import MemberCard from '@/components/MemberCard/MemberCard'
import Modal from '@/components/Modal/Modal'
import { useInView } from '@/hooks/useInView'
import { useSnapScroll } from '@/hooks/useSnapScroll'
import type { Streamer, Mascot } from '@/types'

import streamersData from '@/data/streamers.json'
import mascotsData from '@/data/mascots.json'
import membersData from '@/data/members.json'

const streamers = streamersData as Streamer[]
const mascots = mascotsData as Mascot[]
const members = membersData as import('./types').Member[]
const roster = [...streamers, ...mascots]

const isMouseDevice = window.matchMedia('(pointer: fine)').matches

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
  const [active, setActive] = useState<Streamer | Mascot | null>(null)
  useSnapScroll(active !== null)

  return (
    <>
      {isMouseDevice && <Cursor />}
      <Starfield />
      <Splash />
      <About />

      <main id="mainContent" style={{ position: 'relative', zIndex: 'var(--z-content)' }}>
        {/* Streamers + Mascots */}
        <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 60px' }}>
          <SectionLabel>
            <strong>最強實況主</strong>
            {'　'}ROSTER
          </SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {roster.map((p, i) => (
              <StreamerCard key={p.username} person={p} index={i} onClick={setActive} />
            ))}
          </div>
        </section>

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
            {members.map((m, i) => (
              <MemberCard key={m.username} member={m} index={i} />
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

      <Modal person={active} onClose={() => setActive(null)} />
    </>
  )
}
