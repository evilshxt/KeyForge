// @ts-ignore
import React, { useState, useEffect, useCallback } from 'react'
// @ts-ignore
import { getTextForMode } from '../utils/textSources'
// @ts-ignore
import { calculateWPM, calculateAccuracy } from '../utils/accuracy'
// @ts-ignore
import { isValidWord } from '../utils/wordValidator'

interface TypingBoxProps {
  mode: 'normal' | 'freeform' | 'monkey'
  onComplete: (stats: { wpm: number, accuracy: number, timeLeft: number, rawWpm?: number }) => void
  onStatsUpdate?: (stats: { rawWpm: number, adjustedWpm: number, accuracy: number, timeLeft: number }) => void
}

const TypingBox: React.FC<TypingBoxProps> = ({ mode, onComplete, onStatsUpdate }) => {
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load text on mode change
  useEffect(() => {
    const loadText = () => {
      try {
        const newText = getTextForMode(mode)
        setText(newText)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading text:', error)
        setText('Error loading text. Please try again.')
        setIsLoading(false)
      }
    }

    loadText()
  }, [mode])

  // Timer effect with better error handling
  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0 && !hasCompleted) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - complete the test
            setIsActive(false)
            setHasCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, hasCompleted])

  // Completion check effect
  useEffect(() => {
    if (!isActive || timeLeft > 0) return

    const shouldComplete = () => {
      if (mode === 'freeform') {
        // For freeform, only complete when time runs out
        return timeLeft === 0
      }

      // For normal and monkey modes, complete when text is fully typed correctly OR time runs out
      // Check if user has reached the character count of the text (they've typed all characters)
      return userInput.length >= text.length || timeLeft === 0
    }

    if (shouldComplete()) {
      setIsActive(false)
      setHasCompleted(true)

      // Calculate values before try block to fix linter errors
      let rawWpm = 0
      let adjustedWpm = 0

      try {
        rawWpm = calculateWPM(userInput, 60 - timeLeft)

        let accuracy = 0
        if (mode === 'freeform') {
          // For freeform mode, calculate accuracy based on word length
          const words = userInput.trim().split(/\s+/)
          const validWords = words.filter(word => word.length > 2).length
          accuracy = words.length > 0 ? Math.round((validWords / words.length) * 100) : 100
        } else {
          // For normal and monkey modes, use character-based accuracy
          const correctChars = userInput.split('').filter((char, index) =>
            index < text.length && char === text[index]
          ).length
          accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100
        }

        adjustedWpm = Math.round(rawWpm * (accuracy / 100)) // Adjust WPM based on accuracy

        onComplete({
          wpm: adjustedWpm, // Pass adjusted WPM instead of raw WPM
          accuracy,
          timeLeft,
          rawWpm // Also pass raw WPM for reference
        })
      } catch (error) {
        console.error('Error calculating test results:', error)
        // Provide default values if calculation fails
        onComplete({ wpm: adjustedWpm, accuracy: 0, timeLeft, rawWpm })
      }
    }
  }, [isActive, timeLeft, userInput, text, errors, onComplete, hasCompleted, mode])

  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Prevent input if test is completed or loading
    if (hasCompleted || isLoading) return

    // Start the test on first keystroke
    if (!isActive && value.length > 0) {
      setIsActive(true)
      setStartTime(Date.now())
    }

    setUserInput(value)
    setCurrentIndex(value.length)

    // Track errors for normal and monkey modes
    if (mode !== 'freeform' && text) {
      try {
        const newErrors: number[] = []
        for (let i = 0; i < value.length && i < text.length; i++) {
          if (value[i] !== text[i]) {
            newErrors.push(i)
          }
        }
        setErrors(newErrors)
      } catch (error) {
        console.error('Error tracking errors:', error)
        setErrors([])
      }
    } else if (mode === 'freeform') {
      // For free-form, validate words as they are typed
      try {
        const words = value.trim().split(/\s+/)
        const lastWord = words[words.length - 1]

        if (lastWord && lastWord.length > 2) {
          const isValid = await isValidWord(lastWord)
          const newErrors = isValid ? [] : [value.length - 1]
          setErrors(newErrors)
        } else {
          setErrors([])
        }
      } catch (error) {
        console.error('Error validating word:', error)
        setErrors([])
      }
    }
  }, [isActive, hasCompleted, isLoading, mode, text])

  const getCurrentWPM = useCallback(() => {
    if (!startTime || !isActive) return 0

    try {
      const elapsedTime = (Date.now() - startTime) / 1000 / 60 // minutes
      if (elapsedTime <= 0) return 0

      const wordsTyped = userInput.trim().split(/\s+/).length
      return Math.round(wordsTyped / elapsedTime)
    } catch (error) {
      console.error('Error calculating current WPM:', error)
      return 0
    }
  }, [startTime, isActive, userInput])

  const getCurrentAccuracy = useCallback(() => {
    if (userInput.length === 0) return 100

    try {
      if (mode === 'freeform') {
        // For freeform mode, calculate accuracy based on word length (simple heuristic)
        // Words longer than 2 characters are considered valid (they're likely real words)
        const words = userInput.trim().split(/\s+/)
        if (words.length === 0) return 100

        const validWords = words.filter(word => word.length > 2).length
        return Math.round((validWords / words.length) * 100)
      } else {
        // For normal and monkey modes, use character-based accuracy
        const correctChars = userInput.split('').filter((char, index) =>
          index < text.length && char === text[index]
        ).length
        return Math.round((correctChars / userInput.length) * 100)
      }
    } catch (error) {
      console.error('Error calculating accuracy:', error)
      return 0
    }
  }, [userInput, text, mode])

  const updateLiveStats = useCallback(() => {
    if (!onStatsUpdate || !isActive || hasCompleted) return

    try {
      const rawWpm = getCurrentWPM()
      const accuracy = getCurrentAccuracy()
      const adjustedWpm = Math.round(rawWpm * (accuracy / 100)) // Adjust WPM based on accuracy

      onStatsUpdate({
        rawWpm,
        adjustedWpm,
        accuracy,
        timeLeft
      })
    } catch (error) {
      console.error('Error updating live stats:', error)
    }
  }, [onStatsUpdate, isActive, hasCompleted, timeLeft, getCurrentWPM, getCurrentAccuracy])

  // Update live stats periodically when active
  useEffect(() => {
    if (!isActive || hasCompleted || !onStatsUpdate) return

    const interval = setInterval(updateLiveStats, 100) // Update every 100ms for smooth animation
    return () => clearInterval(interval)
  }, [isActive, hasCompleted, onStatsUpdate, updateLiveStats])

  const renderText = () => {
    if (isLoading) {
      return <span className="text-gray-500">Loading text...</span>
    }

    if (mode === 'freeform') {
      return <span className="text-gray-500">Type anything! We'll check your words against our dictionary.</span>
    }

    if (!text) {
      return <span className="text-red-500">Error: No text available</span>
    }

    return text.split('').map((char, index) => {
      let className = 'text-gray-500'
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-500' : 'text-red-500 bg-red-200'
      } else if (index === currentIndex) {
        className = 'bg-blue-200'
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  const handleRestart = useCallback(() => {
    setUserInput('')
    setCurrentIndex(0)
    setTimeLeft(60)
    setIsActive(false)
    setErrors([])
    setStartTime(null)
    setHasCompleted(false)
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading typing test...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4 text-center">
        <div className="text-2xl font-mono mb-4 leading-relaxed">
          {renderText()}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-3 text-lg border rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder={mode === 'freeform' ? "Start typing your own text..." : "Start typing..."}
          disabled={timeLeft === 0 || hasCompleted || (mode !== 'freeform' && userInput.length >= text.length)}
          autoFocus
        />
      </div>

      {isActive && !hasCompleted && (
        <div className="mb-4 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getCurrentWPM()}</div>
            <div className="text-sm text-gray-600">Current WPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getCurrentAccuracy()}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{errors.length}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-lg">Time: {timeLeft}s</div>
        <div className="text-lg">
          Progress: {mode === 'freeform' ? `${userInput.trim().split(/\s+/).filter(word => word.length > 0).length} words` : (userInput.length >= text.length ? `${text.length}/${text.length} ✓` : `${userInput.length}/${text.length}`)}
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          disabled={isLoading}
        >
          Restart
        </button>
      </div>

      {hasCompleted && (
        <div className="mt-4 text-center text-green-600 font-semibold">
          Test completed! Results have been saved.
        </div>
      )}
    </div>
  )
}

export default TypingBox
