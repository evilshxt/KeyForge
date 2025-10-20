export const calculateWPM = (typedText: string, timeElapsed: number): number => {
  const words = typedText.trim().split(/\s+/).length
  const minutes = timeElapsed / 60
  return Math.round(words / minutes) || 0
}

export const calculateAccuracy = (typedText: string, originalText: string, errorIndices: number[]): number => {
  if (typedText.length === 0) return 0
  const correctChars = typedText.length - errorIndices.length
  return Math.round((correctChars / typedText.length) * 100)
}
