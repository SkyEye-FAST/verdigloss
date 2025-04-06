export const getSegmentedText = (text: string): string[] => {
  const segmenter = new Intl.Segmenter()
  return [...segmenter.segment(text)].map((seg) => seg.segment)
}
