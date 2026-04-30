import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import styles from './About.module.css'

const STATS = [
  { value: 8, label: '核心成員' },
  { value: 2026, label: '創立年份' },
  { value: 24, label: '小時不斷電' },
  { value: '∞', label: '廢話無上限' },
]

const CHIPS = ['Taiwan Based', 'Twitch', 'No Script', 'Real People', 'Since 2026']

function StatCard({ value, label }: { value: number | string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5 })
  const [count, setCount] = useState(0)
  const animated = useRef(false)

  useEffect(() => {
    if (!inView || animated.current || typeof value !== 'number') return
    animated.current = true
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const ease = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3)
      setCount(Math.round(ease * value))
      if (ease < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return (
    <div ref={ref} className={`${styles.stat} ${inView ? styles.statVisible : ''}`}>
      <div className={styles.statNumber}>{typeof value === 'number' ? count : value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function About() {
  const { ref: eyebrowRef, inView: eyebrowIn } = useInView()
  const { ref: titleRef, inView: titleIn } = useInView<HTMLHeadingElement>({ threshold: 0.3 })
  const { ref: manifestoRef, inView: manifestoIn } = useInView()
  const { ref: tagsRef, inView: tagsIn } = useInView()

  return (
    <section className={styles.section} id="aboutSection">
      <div className={styles.inner}>
        <div ref={eyebrowRef} className={`${styles.eyebrow} ${eyebrowIn ? styles.visible : ''}`}>
          ABOUT ／ 關於我們
        </div>

        <h2 ref={titleRef} className={`${styles.title} ${titleIn ? styles.titleVisible : ''}`}>
          <span className={styles.titleLine}>不只是直播</span>
          <span className={`${styles.titleLine} ${styles.titleAccent}`}>是一種生活方式</span>
        </h2>

        <div className={styles.body}>
          <div
            ref={manifestoRef}
            className={`${styles.manifesto} ${manifestoIn ? styles.visible : ''}`}
          >
            <p>法克娛樂不是公司，是一群人決定認真對待這件事之後的結果。</p>
            <p>
              我們從深夜的開台、亂打的遊戲、說到忘記時間的廢話裡長出來——沒有劇本，沒有人設，只有一個共識：就是要真實。
            </p>
            <p>
              觀眾進來不是來看表演的，是來找一個不用裝的地方。這裡的每一個人都是這樣，打得好的時候嗨，打爛的時候也不遮，然後隔天繼續。
            </p>
            <p>法克娛樂存在的理由很簡單——因為有些人就是要這樣。</p>
          </div>

          <div className={styles.stats}>
            {STATS.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>

        <div ref={tagsRef} className={`${styles.chips} ${tagsIn ? styles.visible : ''}`}>
          {CHIPS.map((c) => (
            <span key={c} className={styles.chip}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.deco} aria-hidden>
        <div className={`${styles.ring} ${styles.ring1}`} />
        <div className={`${styles.ring} ${styles.ring2}`} />
        <div className={styles.slash} />
      </div>
    </section>
  )
}
