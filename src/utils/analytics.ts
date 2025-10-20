// Basic analytics - can be expanded with charts later
export const saveScore = (score: { wpm: number, accuracy: number, mode: string }) => {
  const scores = JSON.parse(localStorage.getItem('keyforge:scores') || '[]')
  scores.push({ ...score, timestamp: Date.now() })
  localStorage.setItem('keyforge:scores', JSON.stringify(scores))
}

export const getScores = () => {
  return JSON.parse(localStorage.getItem('keyforge:scores') || '[]')
}
