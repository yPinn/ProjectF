/* ═══════════════════════════════════════════
   法克娛樂 FUCK ENTERTAINMENT — main.js
   ═══════════════════════════════════════════

   【如何新增人員】
   每個區塊都是陣列（[]），只要複製一個 {} 區塊貼在後面就能新增。
   記得每個 {} 之間要有逗號（,）隔開。

   【顏色說明】
   accentColor 是這個人的主題色（邊框、handle、標籤顏色）
   accentRgb   是同一個顏色的 RGB 數值（給透明度用）
   例如 #ff8fd8 → 255,143,216
   可以去 https://www.color-hex.com/ 輸入顏色代碼查 RGB

   ═══════════════════════════════════════════ */

/* ══════════════════════════════════════
   遊戲 ICON 對應表
   ── 把 PNG 放到 images/games/ 資料夾 ──
   ── 依格式新增一行即可，例如：          ──
   ──   'PUBG': 'images/games/pubg.png'  ──
   ══════════════════════════════════════ */
const GAME_ICONS = {
  LOL: 'images/games/lol.png',
  APEX: 'images/games/apex.png',
  Valorant: 'images/games/valorant.png',
  TFT: 'images/games/tft.png',
  歐卡: 'images/games/ets2.png',
  R6: 'images/games/r6.png',
  CS2: 'images/games/CS2.png',
  雀魂: 'images/games/雀魂.png',
  Minecraft: 'images/games/Minecraft.png',
  三角洲: 'images/games/三角洲.png',
  歌手: 'images/games/singer.png',
  法拉利車主: 'images/games/ferrari.png',
  BMW車主: 'images/games/BMW.png',
  /* 新增遊戲 ICON：複製上面任一行，修改名稱和路徑即可 */
}

/* ══════════════════════════════════════
   最強實況主 ROSTER
   ── badge 可留空字串 "" 表示不顯示  ──
   ══════════════════════════════════════ */
const ROSTER = [
  {
    name: '一韓小串文',
    handle: 'lilhanwen3377',
    photo: 'images/founder.png',
    badge: '法克娛樂 會長',
    accentColor: '#a169f0',
    accentRgb: '161,105,240',
    bio: '法克娛樂的起點，也是整個生態圈的核心。從一個人開台到拉起一整批志同道合的人，他建立的不只是頻道，而是一種氛圍——沒有人設、沒有劇本，觀眾進來就是朋友。深夜開台、講到忘記時間，這種真實感是任何製作都複製不了的東西。',
    tags: ['LOL', 'APEX', 'Valorant', 'TFT'],
    twitch: 'https://www.twitch.tv/lilhanwen3377',
    audio: 'audio/lilhanwen3377.mp3',
  },
  {
    name: '麻辣布丁狗',
    handle: 'winsyi',
    photo: 'images/winsyi.png',
    badge: '法克娛樂 副會長',
    accentColor: '#F0DD48',
    accentRgb: '240,221,72',
    bio: 'Valorant 場上走位沉穩、判斷精準，是那種讓隊伍在亂局中保持節奏的人。歐卡司機的身份在直播裡展現出另一面——半夜跨越虛擬歐洲大陸，沉浸感十足。法克娛樂副會長，頭銜背後是真正靠實力和信任站到這個位置的人。',
    tags: ['Valorant', '歐卡'],
    twitch: 'https://www.twitch.tv/winsyi',
    audio: 'audio/winsyi.mp3',
  },
  {
    name: '黃金酷辣雞腿排',
    handle: 'yyo277',
    photo: 'images/yyo277.png',
    badge: '法克娛樂 最美公關',
    accentColor: '#CF7B5B',
    accentRgb: '207,123,91',
    bio: 'LOL、Valorant 全都玩，TFT 排陣有自己一套邏輯。法克娛樂的公關形象擔當，不只是外型，更是那種讓人在頻道裡感覺舒服、想留下來的氣質。他的存在讓整個頻道的氛圍更好看了一個等級。',
    tags: ['LOL', 'Valorant', 'TFT'],
    twitch: 'https://www.twitch.tv/yyo277',
    audio: 'audio/yyo277.mp3',
  },
  {
    name: '蓀蓀楠瓜',
    handle: 'sunsun_pumpkin',
    photo: 'images/sunsun_pumpkin.png',
    badge: '法克娛樂 仙女下凡',
    accentColor: '#e97e1b',
    accentRgb: '233,126,27',
    bio: '法克娛樂裡自帶一種獨特氣質的存在——舉止有素質、風格有辨識度，那種從容和優雅的感覺在直播圈裡完全少見。LOL、APEX、Valorant、CS2、三角洲、TFT、Minecraft、雀魂 全都是她的舞台，遊戲打起來有自己的節奏，看她打遊戲就像看一個很清楚自己在做什麼的人。開台的時候氣氛就是不一樣，說不上來，就是讓人想靜下來好好看。法克娛樂有她在，整個頻道的質感都往上走了一個層次。',
    tags: ['LOL', 'Valorant', 'CS2', 'APEX', '三角洲', 'TFT', 'Minecraft', '雀魂'],
    twitch: 'https://www.twitch.tv/sunsun_pumpkin',
    audio: 'audio/sunsun_pumpkin.mp3',
  },
  {
    name: '4泡芙拉',
    handle: 'puffsla',
    initials: '泡',
    photo: 'images/puffsla.png',
    badge: '法克娛樂 空氣檢測員',
    accentColor: '#ff8fd8',
    accentRgb: '255,143,216',
    bio: '本名歐仙堂，法克娛樂裡綽號最多、故事也最多的人。外號 Ｂ寶，喜歡在遊戲裡裝得很厲害、然後在最關鍵的時候送掉人頭。煙鬼身分讓他在緊張時刻的反應更加迷人——螢幕外一根菸，螢幕內一個操作，觀眾全場靜默。',
    tags: ['LOL', 'APEX', 'Valorant'],
    twitch: 'https://www.twitch.tv/puffsla',
    audio: 'audio/puffsla.mp3',
  },
  {
    name: '我愛鄭雅賢',
    handle: 'mx_715',
    initials: '雅',
    photo: 'images/mx_715.png',
    badge: '法克娛樂 經紀人',
    accentColor: '#bf5fff',
    accentRgb: '191,95,255',
    bio: '法克娛樂的招募經紀人，負責把對的人拉進這個圈子——目前團隊裡的陣容有一半都是他的功勞。眼光精準、聊起人來頭頭是道，選人標準外人看不懂，但結果都會說話。LOL 跟 APEX 是他的主場，實力在團隊裡絕對數一數二，是那種你以為他只是在管事、結果上了遊戲直接給你一個下馬威的存在。',
    tags: ['LOL', 'APEX', 'TFT'],
    twitch: 'https://www.twitch.tv/mx_715',
    audio: 'audio/mx_715.mp3',
  },
  {
    name: '大頭大頭大頭',
    handle: 'datou_cheng',
    initials: '頭',
    photo: 'images/datou_cheng.png',
    badge: '法克娛樂 老司機',
    accentColor: '#00f5ff',
    accentRgb: '0,245,255',
    bio: '頭很大，但裝的東西也很多。LOL 場上反應奇快、APEX 槍法時好時壞，Valorant 則是讓隊友又愛又恨的那種存在。開台風格不拘一格，笑點跟操作一樣難以預測。法克娛樂裡少數能靠一句話讓全場靜下來、又靠下一句話讓大家爆笑的人。',
    tags: ['LOL', 'APEX', 'Valorant', '歐卡', 'BMW車主'],
    twitch: 'https://www.twitch.tv/datou_cheng',
    audio: 'audio/datou_cheng.mp3',
  },
  {
    name: '酷酷的斜音梗',
    handle: 'coolhomophonic',
    initials: '堯',
    photo: 'images/coolhomophonic.png',
    badge: '法克娛樂 旗靈王',
    accentColor: '#c58f6f',
    accentRgb: '197,143,111',
    bio: 'TFT多季宗師，S13菁英玩家，喜歡唱歌但很常翻車。',
    tags: ['LOL', 'Valorant', 'TFT'],
    twitch: 'https://www.twitch.tv/coolhomophonic',
    audio: 'audio/coolhomophonic.mp3',
  },
  /* 新增最強實況主：複製上面這整塊（從 { 到 },），貼在這裡 */
]

/* ══════════════════════════════════════
   亂源 VIEWERS
   ══════════════════════════════════════ */
const VIEWERS = [
  {
    name: '泥先生',
    handle: 'kkai0000',
    initials: '泥',
    photo: 'images/kkai0000.png',
    accentColor: '#525757',
    accentRgb: '82,87,87',
    tags: ['LOL', 'APEX'],
    twitch: 'https://www.twitch.tv/kkai0000',
    audio: 'audio/kkai0000.mp3',
    bio: '大家都叫他泥哥，是法克娛樂裡那種不開台、但一出現就能帶動整個氣氛的人。LOL 跟 APEX 是他的主場，開黑時偶爾沉默、偶爾突然一句話讓大家笑翻。不太講廢話，但每次開口都算數——這大概就是泥哥在圈子裡被尊敬的原因。',
  },
  {
    name: '羅籟靶',
    handle: 'guanwei1mao666',
    initials: '羅',
    photo: 'images/guanwei1mao666.png',
    accentColor: '#eb34b4',
    accentRgb: '235,52,180',
    tags: ['LOL', 'APEX', 'Valorant', 'TFT', 'R6'],
    twitch: 'https://www.twitch.tv/guanwei1mao666',
    audio: 'audio/guanwei1mao666.mp3',
    bio: '法克娛樂裡公認遊戲最強的人，沒有之一。LOL、APEX、Valorant、TFT 全都玩、全都玩得讓隊友閉嘴。那種開黑時大家嘴砲連連、輪到他說話全場安靜聽的存在。贏了不多說，輸了也不解釋——因為她幾乎不輸。',
  },
  {
    name: 'の玥',
    handle: 'yueyue_qoq',
    initials: '玥',
    photo: 'images/yueyue_qoq.png',
    accentColor: '#7269f0',
    accentRgb: '114,105,240',
    tags: ['Valorant超凡', '歌手', '法拉利車主'],
    twitch: 'https://www.twitch.tv/yueyue_qoq',
    audio: 'audio/yueyue_qoq.mp3',
    bio: '平常以歌唱作為興趣，聲線乾淨、有辨識度，習慣用音樂表達情緒。遊戲方面在《特戰英豪》中段位達到「超凡」，反應與判斷都相當到位。至於生活品味就更不用說了——身為法拉利車主，日常就是引擎轟鳴與視線焦點的代名詞，踩下油門的那一刻，連空氣都得讓路，速度與排場直接拉滿。',
  },
  {
    name: '嚕嚕閔',
    handle: 'luming1228',
    initials: '嚕',
    photo: 'images/luming1228.png',
    badge: '法克娛樂 歌神',
    accentColor: '#e4c778',
    accentRgb: '228,199,120',
    tags: ['歌手', 'LOL', 'APEX', 'TFT'],
    twitch: 'https://www.twitch.tv/luming1228',
    audio: 'audio/luming1228.mp3',
    bio: '嚕嚕閔是法克娛樂的門面擔當，一開口就知道為什麼叫歌神。聲線辨識度極高，唱起來能讓聊天室從狂刷彈幕到集體靜音，那種安靜是最高規格的讚美。LOL、APEX、TFT 他也玩，實力不差，但每次開台只要他一開嗓，遊戲反而變成背景——觀眾要的就是這把聲音。法克娛樂歌神，當之無愧。',
  },
  {
    name: '愛傑克',
    handle: 'ijack932',
    initials: '傑',
    photo: 'images/ijack932.png',
    badge: '',
    accentColor: '#a8ec8d',
    accentRgb: '168,236,141',
    tags: ['忠實觀眾'],
    twitch: 'https://www.twitch.tv/ijack932',
    audio: 'audio/ijack932.mp3',
    bio: '',
  },
  {
    name: '白上吹雪毛毛軟軟的',
    handle: 'kuroneko7777',
    initials: '雪',
    photo: 'images/kuroneko7777.png',
    badge: '',
    accentColor: '#ffffff',
    accentRgb: '255, 255, 255',
    tags: ['APEX', 'CS2', 'R6'],
    twitch: 'https://www.twitch.tv/kuroneko7777',
    audio: 'audio/kuroneko7777.mp3',
    bio: '很可愛又愛撒嬌的吹雪寶貝',
  },
  /* 新增亂源：複製上面這整塊（從 { 到 },），貼在這裡 */
]

/* ═══════════════════════════════════════════
   以下是程式邏輯，通常不需要修改
   ═══════════════════════════════════════════ */

/* ── 星空背景 ── */
function setupStarfield() {
  const canvas = document.getElementById('starfield')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const STAR_COLORS = [
    [200, 230, 255],
    [0, 245, 255],
    [191, 95, 255],
    [255, 45, 120],
    [255, 215, 0],
  ]

  const LAYERS = [
    { count: 120, sizeRange: [0.4, 1.0], speedY: 0.018, opacity: 0.35, twinkleRate: 0.003 },
    { count: 60, sizeRange: [0.8, 1.6], speedY: 0.042, opacity: 0.55, twinkleRate: 0.006 },
    { count: 20, sizeRange: [1.4, 2.2], speedY: 0.07, opacity: 0.7, twinkleRate: 0.008 },
  ]

  let W,
    H,
    stars = []

  function randomColor() {
    return STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
  }

  function makeStar(layerIdx, yOverride) {
    const L = LAYERS[layerIdx]
    const [r, g, b] = randomColor()
    return {
      x: Math.random() * W,
      y: yOverride !== undefined ? yOverride : Math.random() * H,
      size: L.sizeRange[0] + Math.random() * (L.sizeRange[1] - L.sizeRange[0]),
      speedY: L.speedY * (0.7 + Math.random() * 0.6),
      baseAlpha: L.opacity * (0.5 + Math.random() * 0.5),
      alpha: 0,
      r,
      g,
      b,
      layer: layerIdx,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpd: L.twinkleRate * (0.5 + Math.random()),
      tail: false,
    }
  }

  function init() {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
    stars = []
    LAYERS.forEach((_, li) => {
      for (let i = 0; i < LAYERS[li].count; i++) stars.push(makeStar(li))
    })
    canvas.classList.add('visible')
  }

  let scrollY = 0
  window.addEventListener(
    'scroll',
    () => {
      scrollY = window.scrollY
    },
    { passive: true },
  )

  function draw() {
    ctx.clearRect(0, 0, W, H)
    stars.forEach((s) => {
      s.twinkle += s.twinkleSpd
      const flicker = 0.75 + 0.25 * Math.sin(s.twinkle)
      s.alpha += (s.baseAlpha * flicker - s.alpha) * 0.06

      const parallaxFactor = [0.02, 0.06, 0.14][s.layer]
      const drawY = s.y - scrollY * parallaxFactor
      const drawX = s.x

      s.y += s.speedY
      if (s.y > H + 4) Object.assign(s, makeStar(s.layer, -4))

      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha))

      if (s.tail) {
        const grad = ctx.createLinearGradient(drawX, drawY - s.size * 7, drawX, drawY)
        grad.addColorStop(0, `rgba(${s.r},${s.g},${s.b},0)`)
        grad.addColorStop(1, `rgba(${s.r},${s.g},${s.b},${s.alpha})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = s.size * 0.65
        ctx.beginPath()
        ctx.moveTo(drawX, drawY - s.size * 7)
        ctx.lineTo(drawX, drawY)
        ctx.stroke()
      }

      const glowR = s.size * (s.layer === 2 ? 5 : 3)
      const glow = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowR)
      glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${s.alpha * 0.55})`)
      glow.addColorStop(0.4, `rgba(${s.r},${s.g},${s.b},${s.alpha * 0.12})`)
      glow.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(drawX, drawY, glowR, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},1)`
      ctx.beginPath()
      ctx.arc(drawX, drawY, s.size * 0.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
    requestAnimationFrame(draw)
  }

  init()
  requestAnimationFrame(draw)
  window.addEventListener('resize', init)
}

/* ── 自訂游標 ── */
function setupCursor() {
  const dot = document.createElement('div')
  const ring = document.createElement('div')
  dot.className = 'cursor-dot'
  ring.className = 'cursor-ring'
  ;[dot, ring].forEach((el) => {
    el.setAttribute('aria-hidden', 'true')
    el.setAttribute('tabindex', '-1')
    el.style.pointerEvents = 'none'
  })
  document.body.append(dot, ring)

  let mouseX = 0,
    mouseY = 0,
    ringX = 0,
    ringY = 0

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`
  })
  ;(function animateRing() {
    ringX += (mouseX - ringX) * 0.14
    ringY += (mouseY - ringY) * 0.14
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`
    requestAnimationFrame(animateRing)
  })()

  const hoverTargets = 'a, button, .streamer-card, .featured-tag, .tag-large, .modal-close'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover')
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover')
  })
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = ring.style.opacity = '0'
  })
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = ring.style.opacity = ''
  })
}

/* ── 卡片滑鼠追蹤光暈 ── */
function setupCardMouseTracking() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.streamer-card')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty(
      '--mouse-x',
      `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
    )
    card.style.setProperty(
      '--mouse-y',
      `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`,
    )
  })
}

/* ── 粒子特效 ── */
function spawnParticles() {
  const container = document.getElementById('particles')
  if (!container) return
  const colors = ['#00f5ff', '#bf5fff', '#ff2d78', '#ffd700', '#39ff14']
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div')
    const size = Math.random() * 3 + 1
    const color = colors[Math.floor(Math.random() * colors.length)]
    p.className = 'particle'
    p.style.cssText = `
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 20}%;
      width:${size}px; height:${size}px;
      background:${color};
      box-shadow:0 0 ${size * 3}px ${color};
      animation-duration:${Math.random() * 8 + 6}s;
      animation-delay:${Math.random() * 6}s;
      --drift:${(Math.random() - 0.5) * 120}px;
    `
    container.appendChild(p)
  }
}

/* ── 取得遊戲 icon HTML ── */
function getGameIcon(tag) {
  for (const [key, src] of Object.entries(GAME_ICONS)) {
    if (
      tag.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(tag.toLowerCase())
    ) {
      return `<img class="game-icon" src="${src}" alt="${key}" onerror="this.style.display='none'">`
    }
  }
  return ''
}

/* ── 卡片 HTML ── */
function makeCardHTML(person) {
  const photoHTML = person.photo
    ? `<img class="featured-photo" src="${person.photo}" alt="${person.name}" onerror="this.style.display='none'">`
    : `<div class="featured-photo-placeholder"><div class="ph-icon">${person.initials || person.name[0]}</div></div>`

  const badgeHTML = person.badge
    ? `<div class="featured-badge" style="border-color:rgba(${person.accentRgb},0.35);color:${person.accentColor};background:rgba(${person.accentRgb},0.07)">★ ${person.badge}</div>`
    : ''

  return `
    <div class="featured-info">
      ${badgeHTML}
      <div class="featured-name">${person.name}</div>
      <div class="featured-handle" style="color:${person.accentColor}">twitch.tv/${person.handle}</div>
      <p class="featured-bio">${person.bio}</p>
      <div class="featured-tags">
        ${person.tags.map((t) => `<span class="featured-tag" style="border-color:rgba(${person.accentRgb},0.28);color:${person.accentColor};opacity:0.85">${getGameIcon(t)}${t}</span>`).join('')}
      </div>
    </div>
    <div class="featured-photo-wrap">${photoHTML}</div>
  `
}

/* ── Modal HTML ── */
function makeModalHTML(person) {
  const avatarContent = person.photo
    ? `<img src="${person.photo}" alt="${person.name}" style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:50%;" onerror="this.style.display='none'">`
    : `<span class="modal-avatar-text" style="color:${person.accentColor}">${person.initials || person.name[0]}</span>`

  return `
    <div class="modal-header">
      <div class="modal-avatar" style="background:rgba(${person.accentRgb},0.12);border:2px solid ${person.accentColor};box-shadow:0 0 0 3px rgba(${person.accentRgb},0.15),0 0 24px rgba(${person.accentRgb},0.12);overflow:hidden;">
        ${avatarContent}
      </div>
      <div>
        <div class="modal-name" style="color:${person.accentColor}">${person.name}</div>
        <div class="modal-handle">@${person.handle}</div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">關於</div>
      <p class="modal-bio">${person.bio}</p>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">遊戲</div>
      <div class="tag-list">
        ${person.tags.map((t) => `<span class="tag-large" style="border-color:rgba(${person.accentRgb},0.35);color:${person.accentColor};background:rgba(${person.accentRgb},0.07)">${getGameIcon(t)}${t}</span>`).join('')}
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">Twitch</div>
      <button class="twitch-btn" onclick="window.open('${person.twitch}','_blank')">
        <svg class="twitch-icon" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
        前往 Twitch 頻道　twitch.tv/${person.handle}
      </button>
    </div>
  `
}

/* ── 專屬語音播放器 ── */
let _currentAudio = null

function playPersonAudio(person) {
  // 停掉前一個
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
    _currentAudio = null
  }
  if (!person.audio) return
  const audio = new Audio(person.audio)
  audio.volume = 0.85
  _currentAudio = audio
  // 瀏覽器自動播放政策：靜默失敗不報錯
  audio.play().catch(() => {})
}

function stopPersonAudio() {
  if (_currentAudio) {
    // 淡出 0.3s 再停
    const a = _currentAudio
    const fade = setInterval(() => {
      if (a.volume > 0.05) {
        a.volume = Math.max(0, a.volume - 0.08)
      } else {
        a.pause()
        a.currentTime = 0
        clearInterval(fade)
      }
    }, 20)
    _currentAudio = null
  }
}

/* ── 開啟 / 關閉 Modal ── */
function openModal(person) {
  const overlay = document.getElementById('modalOverlay')
  const bar = document.getElementById('modalAccentBar')
  const body = document.getElementById('modalBody')
  bar.style.background = `linear-gradient(90deg, ${person.accentColor}, transparent)`
  body.innerHTML = makeModalHTML(person)
  overlay.classList.add('active')
  document.body.style.overflow = 'hidden'
  bar.classList.remove('bar-animate')
  void bar.offsetWidth
  bar.classList.add('bar-animate')
  playPersonAudio(person)
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active')
  document.body.style.overflow = ''
  stopPersonAudio()
}

/* ── 建立卡片 ── */
function createCard(person) {
  const div = document.createElement('div')
  div.className = 'streamer-card reveal'
  div.style.setProperty('--accent-color', person.accentColor)
  div.style.setProperty('--accent-rgb', person.accentRgb)
  div.innerHTML = makeCardHTML(person)
  div.addEventListener('click', () => openModal(person))

  div.addEventListener('pointerdown', (e) => {
    const ripple = document.createElement('span')
    const rect = div.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.5
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      background:rgba(${person.accentRgb},0.15);
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      pointer-events:none; transform:scale(0);
      animation:rippleOut 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
      z-index:3;
    `
    div.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  })

  return div
}

/* ── Scroll Reveal ── */
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const delay = entry.target.classList.contains('streamer-card')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
          : 0
        setTimeout(() => entry.target.classList.add('visible'), delay)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
}

/* ── Splash 視差 ── */
function setupSplashParallax() {
  const content = document.querySelector('.splash-content')
  const glowTop = document.querySelector('.splash-glow-top')
  const grid = document.querySelector('.splash-bg-grid')
  if (!content) return

  let ticking = false
  window.addEventListener('scroll', () => {
    if (ticking) return
    requestAnimationFrame(() => {
      const y = window.scrollY
      content.style.transform = `translateY(${y * 0.35}px)`
      content.style.opacity = Math.max(0, 1 - y / 400)
      if (glowTop) glowTop.style.transform = `translateX(-50%) translateY(${y * 0.15}px)`
      if (grid) grid.style.transform = `translateY(${y * 0.08}px)`
      ticking = false
    })
    ticking = true
  })
}

/* ── Glitch data-text ── */
function setupGlitch() {
  const titleZh = document.querySelector('.splash-title-zh')
  if (titleZh) titleZh.setAttribute('data-text', titleZh.textContent)
}

/* ── 關於頁面標題動畫 ── */
function setupAboutAnimations() {
  const title = document.querySelector('.about-title')
  if (!title) return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('title-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.3 },
  )
  observer.observe(title)

  /* 數字滾動動畫 */
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target.querySelector('.stat-number')
        if (!el || el.dataset.animated) return
        el.dataset.animated = '1'
        const target = parseInt(el.dataset.target)
        if (isNaN(target)) return
        const duration = 1200
        const start = performance.now()
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          el.textContent = Math.round(ease * target).toLocaleString()
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        statObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.5 },
  )
  document.querySelectorAll('.about-stat').forEach((el) => statObserver.observe(el))
}

/* ── Snap Scroll（往下才 snap，往上自由滾動） ── */
function setupSnapScroll() {
  const sections = [
    document.getElementById('splash'),
    document.getElementById('aboutSection'),
    document.getElementById('mainContent'),
  ].filter(Boolean)

  if (sections.length < 2) return

  let isScrolling = false
  let accDelta = 0
  const THRESHOLD = 80
  const COOLDOWN = 900

  function detectCurrentIdx() {
    const mid = window.scrollY + window.innerHeight * 0.3
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= mid) return i
    }
    return 0
  }

  function goTo(idx) {
    if (idx < 0 || idx >= sections.length) return
    if (isScrolling) return
    isScrolling = true
    sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      isScrolling = false
      accDelta = 0
    }, COOLDOWN)
  }

  window.addEventListener(
    'wheel',
    (e) => {
      if (document.getElementById('modalOverlay')?.classList.contains('active')) return

      accDelta += e.deltaY

      if (Math.abs(accDelta) >= THRESHOLD) {
        const dir = accDelta > 0 ? 1 : -1
        accDelta = 0

        /* 往上：完全不攔截，讓瀏覽器自然滾動 */
        if (dir < 0) return

        /* 往下：還有下一個 section 才 snap */
        const cur = detectCurrentIdx()
        if (cur >= sections.length - 1) return
        goTo(cur + 1)
      }
    },
    { passive: true },
  )

  /* 鍵盤支援 */
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('modalOverlay')?.classList.contains('active')) return
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      const cur = detectCurrentIdx()
      if (cur >= sections.length - 1) return
      e.preventDefault()
      goTo(cur + 1)
    }
    /* ArrowUp / PageUp 不攔截，自然滾動 */
  })
}

;(function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `@keyframes rippleOut { to { transform:scale(1); opacity:0; } }`
  document.head.appendChild(style)
})()

/* ── 初始化 ── */
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(pointer: fine)').matches) setupCursor()

  setupStarfield()
  spawnParticles()
  setupGlitch()

  const foundersGrid = document.getElementById('foundersGrid')
  const viewersGrid = document.getElementById('viewersGrid')
  ROSTER.forEach((p) => foundersGrid.appendChild(createCard(p)))
  VIEWERS.forEach((p) => viewersGrid.appendChild(createCard(p)))

  setupScrollReveal()
  setupCardMouseTracking()
  setupSplashParallax()
  setupAboutAnimations()
  setupSnapScroll()

  const overlay = document.getElementById('modalOverlay')
  document.getElementById('modalClose').addEventListener('click', closeModal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })
})
