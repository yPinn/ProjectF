export type SlideTheme = 'purple' | 'orange' | 'green'

export interface SlideAbility {
  /** 技能圖示 URL */
  icon: string
  /** 技能按鍵標籤，例如 "Q" */
  key: string
}

export interface SlideData {
  /** 唯一識別，用於 React key */
  id: string
  /** 全螢幕背景圖 URL */
  backgroundImage: string
  /** 左側垂直小標，例如 "BIND PERSONALIZADA" */
  verticalLabel: string
  /** 左側小 logo URL */
  sideLogoUrl: string
  /** 右側導覽點圖示 URL */
  navIconUrl: string
  /** 角色主圖 URL（建議 SVG / PNG 去背） */
  characterImage: string
  /** 角色名，顯示為大標題 */
  characterName: string
  /** 角色職位標籤，例如 "Controller" */
  role: string
  /** info box 左側圖示 URL */
  infoIcon: string
  /** info box 角色類型標題 */
  infoType: string
  /** info box 角色描述 */
  description: string
  /** 四個技能 */
  abilities: [SlideAbility, SlideAbility, SlideAbility, SlideAbility]
  /** CTA 按鈕文字 */
  ctaLabel: string
  /** CTA 按鈕點擊事件（可選） */
  onCtaClick?: () => void
  /** 配色主題，控制 header / 文字 / border 顏色 */
  theme: SlideTheme
  /** 自訂 CTA 按鈕背景圖（可選，預設依 theme 自動選） */
  ctaButtonImage?: string
}
