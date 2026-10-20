import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './App.css'
import Cursor from '@/components/Cursor/Cursor'
import Starfield from '@/components/Starfield/Starfield'
import Splash from '@/sections/Splash/Splash'
import About from '@/sections/About/About'
import Roster from '@/sections/Roster/Roster'
import { useTwitchProfiles } from '@/hooks/useTwitchProfiles'
import { sliderStreamers } from '@/data/sliderData'

const StreamerSlider = lazy(() => import('@/components/StreamerSlider/StreamerSlider'))
const isMouseDevice =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches

class DetailBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <div className="detailFallback" role="alert">
        <p>介紹暫時無法載入，請重新整理後再試。</p>
        <button type="button" onClick={() => window.location.reload()}>
          重新整理
        </button>
      </div>
    ) : (
      this.props.children
    )
  }
}

export default function App() {
  const [profilesEnabled, setProfilesEnabled] = useState(false)
  const twitchProfiles = useTwitchProfiles(profilesEnabled)
  const [detailsOpen, setDetailsOpen] = useState(() => window.location.hash === '#streamerSlider')
  const [detailIndex, setDetailIndex] = useState(0)
  const [navigationRequest, setNavigationRequest] = useState(0)
  const detailRef = useRef<HTMLElement>(null)
  const approach = useCallback(() => setProfilesEnabled(true), [])
  const slides = useMemo(
    () =>
      sliderStreamers.map((slide) => {
        const profile = twitchProfiles[slide.id]
        return profile ? { ...slide, name: profile.displayName } : slide
      }),
    [twitchProfiles],
  )

  const openDetails = (index: number) => {
    setDetailIndex(index)
    setDetailsOpen(true)
    setNavigationRequest((value) => value + 1)
  }

  useEffect(() => {
    if (!detailsOpen) return
    detailRef.current?.focus({ preventScroll: true })
    detailRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }, [navigationRequest, detailsOpen])

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#streamerSlider') {
        setDetailsOpen(true)
        setNavigationRequest((value) => value + 1)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {isMouseDevice && <Cursor />}
      <Starfield />
      <Splash />
      <About />
      <Roster slides={slides} onOpen={openDetails} onApproach={approach} />
      {detailsOpen && (
        <section
          id="streamerSlider"
          ref={detailRef}
          tabIndex={-1}
          aria-label="實況主詳細介紹"
          className="detailSection"
        >
          <DetailBoundary>
            <Suspense
              fallback={
                <div className="detailFallback" role="status">
                  <p>正在載入人物介紹…</p>
                </div>
              }
            >
              <StreamerSlider slides={slides} current={detailIndex} onSelect={setDetailIndex} />
            </Suspense>
          </DetailBoundary>
        </section>
      )}
    </>
  )
}
