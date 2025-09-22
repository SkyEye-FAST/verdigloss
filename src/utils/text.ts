export const getSegmentedText = (text: string): string[] => {
  const input = text || ''

  if (typeof (Intl as any).Segmenter !== 'function') {
    return Array.from(input)
  }
  const Segmenter: any = (Intl as any).Segmenter
  const segmenter = new Segmenter()
  return [...segmenter.segment(input)].map((seg: any) => seg.segment)
}
