export const getSegmentedText = (text: string): string[] => {
  const input = text || ''

  if (typeof Intl.Segmenter !== 'function') {
    return Array.from(input)
  }
  const segmenter = new Intl.Segmenter()
  return [...segmenter.segment(input)].map((segment) => segment.segment)
}
