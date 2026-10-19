import type { ImgHTMLAttributes } from 'react'
import type { StreamerSlideData } from '@/types'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt'> {
  slide: StreamerSlideData
  thumbnail?: boolean
}

export default function Portrait({ slide, thumbnail = false, ...props }: Props) {
  return (
    <img
      {...props}
      src={thumbnail ? slide.navThumbnail : slide.photo}
      srcSet={
        !thumbnail &&
        slide.preview &&
        slide.previewWidth &&
        slide.photoWidth &&
        slide.previewWidth !== slide.photoWidth
          ? `${slide.preview} ${slide.previewWidth}w, ${slide.photo} ${slide.photoWidth}w`
          : undefined
      }
      alt={thumbnail ? '' : slide.missingPhoto ? `${slide.name}，形象照準備中` : slide.name}
      decoding="async"
      draggable={false}
      onError={(event) => {
        const img = event.currentTarget
        if (img.dataset.fallback) return
        img.dataset.fallback = 'true'
        img.removeAttribute('srcset')
        img.src = '/images/optimized/logo.webp'
      }}
    />
  )
}
