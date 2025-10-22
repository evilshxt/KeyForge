interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string // YYYY-MM-DD format
}

export const getStreakData = (): StreakData => {
  const stored = localStorage.getItem('typingStreak')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing streak data:', error)
    }
  }

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: ''
  }
}

export const updateStreak = (): StreakData => {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const streakData = getStreakData()

  // If no previous activity, start streak
  if (!streakData.lastActivityDate) {
    const newData: StreakData = {
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today
    }
    localStorage.setItem('typingStreak', JSON.stringify(newData))
    return newData
  }

  const lastActivity = new Date(streakData.lastActivityDate)
  const todayDate = new Date(today)
  const daysDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  let newData: StreakData

  if (daysDiff === 0) {
    // Same day - no change needed
    newData = streakData
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    newData = {
      currentStreak: streakData.currentStreak + 1,
      longestStreak: Math.max(streakData.currentStreak + 1, streakData.longestStreak),
      lastActivityDate: today
    }
  } else {
    // Streak broken - start new streak
    newData = {
      currentStreak: 1,
      longestStreak: streakData.longestStreak,
      lastActivityDate: today
    }
  }

  localStorage.setItem('typingStreak', JSON.stringify(newData))
  return newData
}

export const markActivityToday = (): void => {
  updateStreak()
}

export const resetStreak = (): StreakData => {
  const newData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: ''
  }
  localStorage.setItem('typingStreak', JSON.stringify(newData))
  return newData
}
