import colorTranslations from '@/components/Extra/ColorTable/colorTranslations'
import dyeIcons from '@/components/Extra/ColorTable/dyeIcons'
import dyeIconsNew from '@/components/Extra/ColorTable/dyeIconsNew'
import type { LanguageCode } from '@/data/languages'

const colors = {
  black: ['#1D1D21', '#000000'], blue: ['#3C44AA', '#0000FF'], brown: ['#835432', '#8B4513'], cyan: ['#169C9C', '#00FFFF'], gray: ['#474F52', '#808080'], green: ['#5E7C16', '#00FF00'], light_blue: ['#3AB3DA', '#9AC0CD'], light_gray: ['#9D9D97', '#D3D3D3'], lime: ['#80C71F', '#BFFF00'], magenta: ['#C74EBD', '#FF00FF'], orange: ['#F9801D', '#FF681F'], pink: ['#F38BAA', '#FF69B4'], purple: ['#8932B8', '#A020F0'], red: ['#B02E26', '#FF0000'], white: ['#F9FFFE', '#FFFFFF'], yellow: ['#FED83D', '#FFFF00'],
} as const
export type ColorKey = keyof typeof colors

export function splitTrailingAnnotation(value: string) {
  const match = value.match(/^(.*?)(?:\s+\(([^()]*)\))$/)
  return match ? { label: match[1]!, annotation: `(${match[2]})` } : { label: value, annotation: '' }
}

export const colorDataset = {
  updatedAt: '2025-07-23',
  colors: (Object.keys(colors) as ColorKey[]).map((key) => {
    const translations = colorTranslations[key] as Record<LanguageCode, string>
    return { key, hex: colors[key][0], textHex: colors[key][1], icon: dyeIcons[key], iconNew: dyeIconsNew[key], translations, korean: splitTrailingAnnotation(translations.ko_kr), chuNom: splitTrailingAnnotation(translations.vi_vn) }
  }),
} as const
