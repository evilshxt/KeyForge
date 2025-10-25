// @ts-ignore
import React, { useState, useEffect, useCallback } from 'react'
// @ts-ignore
import { getTextForMode, getParagraphsByIndices } from '../utils/textSources'
// @ts-ignore
import { calculateWPM, calculateAccuracy } from '../utils/accuracy'
// @ts-ignore
import { validateWordsAfterTest } from '../utils/wordValidator'

interface TypingBoxProps {
  mode: 'normal' | 'freeform' | 'monkey'
  onComplete: (stats: { wpm: number, accuracy: number, timeLeft: number, rawWpm?: number }) => void
  onStatsUpdate?: (stats: { rawWpm: number, adjustedWpm: number, accuracy: number, timeLeft: number }) => void
  // For multiplayer mode
  paragraphIndices?: number[]
}

const TypingBox: React.FC<TypingBoxProps> = ({ mode, onComplete, onStatsUpdate, paragraphIndices }) => {
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [completedParagraphs, setCompletedParagraphs] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<{
    validWords: string[]
    invalidWords: string[]
    accuracy: number
  } | null>(null)
  const [modalDismissed, setModalDismissed] = useState(false)

  // Load text on mode change
  useEffect(() => {
    const loadText = async () => {
      try {
        console.log('🔄 Loading text for mode:', mode)

        let newText: string

        // For multiplayer normal mode, use provided paragraph indices
        if (mode === 'normal' && paragraphIndices && paragraphIndices.length > 0) {
          newText = getParagraphsByIndices(paragraphIndices)
          console.log('📝 Using multiplayer paragraph indices:', paragraphIndices)
        } else {
          newText = await getTextForMode(mode)
        }

        if (mode === 'normal') {
          const paraArray = newText.split('\n\n').filter(p => p.trim().length > 0)
          setParagraphs(paraArray)
          setText(paraArray[0] || '')
          console.log('📝 Loaded', paraArray.length, 'paragraphs for normal mode')
        } else {
          setParagraphs([newText])
          setText(newText)
        }

        setCurrentParagraphIndex(0)
        setUserInput('')
        setCurrentIndex(0)
        setErrors([])
        setHasCompleted(false)
        setCompletedParagraphs(0)
        setValidationResults(null)
        setModalDismissed(false) // Reset modal state
        setIsLoading(false)
        console.log('✅ Text loaded successfully')
      } catch (error) {
        console.error('❌ Error loading text:', error)
        setText('Error loading text. Please try again.')
        setIsLoading(false)
      }
    }

    loadText()
  }, [mode, paragraphIndices])

  // Timer effect with better error handling
  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0 && !hasCompleted) {
      console.log('⏱️ Timer active, time left:', timeLeft)
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log('⏰ Time\'s up! Completing test...')
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

  const handleFreeformCompletion = async () => {
    setIsValidating(true)
    console.log('🔍 Starting freeform validation...')

    try {
      const results = await validateWordsAfterTest(userInput)
      console.log('✅ Freeform validation complete:', results)
      console.log('🔓 Setting validation results - modal should now be visible')

      setValidationResults(results)
      setModalDismissed(false) // Ensure modal is visible

      // Calculate final stats with validated accuracy
      const rawWpm = calculateWPM(userInput, 60 - timeLeft)
      const adjustedWpm = Math.round(rawWpm * (results.accuracy / 100))

      console.log('📈 Freeform final stats:', { rawWpm, adjustedWpm, accuracy: results.accuracy, timeLeft })

      onComplete({
        wpm: adjustedWpm,
        accuracy: results.accuracy,
        timeLeft,
        rawWpm
      })

      setHasCompleted(true)
    } catch (error) {
      console.error('❌ Error during freeform validation:', error)
      // Fallback to basic calculation if validation fails
      const rawWpm = calculateWPM(userInput, 60 - timeLeft)
      const adjustedWpm = Math.round(rawWpm * 0.8) // Assume 80% accuracy as fallback

      onComplete({
        wpm: adjustedWpm,
        accuracy: 80,
        timeLeft,
        rawWpm
      })

      setHasCompleted(true)
    } finally {
      setIsValidating(false)
    }
  }

  const handleTestCompletion = () => {
    // Calculate values before try block to fix linter errors
    let rawWpm = 0
    let adjustedWpm = 0

    try {
      rawWpm = calculateWPM(userInput, 60 - timeLeft)

      let accuracy = 0
      if (mode === 'freeform') {
        const words = userInput.trim().split(/\s+/)
        const validWords = words.filter(word => word.length > 2).length
        accuracy = words.length > 0 ? Math.round((validWords / words.length) * 100) : 100
      } else {
        const correctChars = userInput.split('').filter((char, index) =>
          index < text.length && char === text[index]
        ).length
        accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100
      }

      adjustedWpm = Math.round(rawWpm * (accuracy / 100))

      console.log('📈 Final stats:', { rawWpm, adjustedWpm, accuracy, timeLeft })

      onComplete({
        wpm: adjustedWpm,
        accuracy,
        timeLeft,
        rawWpm
      })
    } catch (error) {
      console.error('❌ Error calculating test results:', error)
      onComplete({ wpm: adjustedWpm, accuracy: 0, timeLeft, rawWpm })
    }

    // Always mark as completed, regardless of success or failure
    setHasCompleted(true)
  }

  // Completion check effect
  useEffect(() => {
    if (!isActive || hasCompleted) return

    console.log('🔍 Checking completion - Input length:', userInput.length, 'Text length:', text.length)

    const shouldComplete = () => {
      if (mode === 'freeform') {
        // For freeform, only complete when time runs out or user has typed enough
        return timeLeft === 0 || userInput.trim().split(/\s+/).length >= 50
      }

      // For normal mode, complete when current paragraph is fully typed OR time runs out
      // For monkey mode, complete when all text is typed OR time runs out
      const textFullyTyped = userInput.length >= text.length
      const timeUp = timeLeft === 0

      console.log('📊 Completion check:', {
        textFullyTyped,
        timeUp,
        currentParagraph: currentParagraphIndex + 1,
        totalParagraphs: paragraphs.length,
        completedParagraphs
      })

      return textFullyTyped || timeUp
    }

    if (shouldComplete()) {
      console.log('🎯 Test should complete!')
      setIsActive(false)

      if (mode === 'freeform') {
        // For freeform, validate words after completion
        handleFreeformCompletion()
      } else {
        // For normal and monkey modes, complete immediately
        setHasCompleted(true)
        handleTestCompletion()
      }
    }
  }, [isActive, timeLeft, userInput, text, errors, onComplete, hasCompleted, mode, currentParagraphIndex, paragraphs, completedParagraphs])

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', {
      hasValidationResults: !!validationResults,
      modalDismissed,
      mode,
      showModal: validationResults && mode === 'freeform' && !modalDismissed
    })
    if (validationResults) {
      console.log('📊 Validation results:', validationResults)
    }
  }, [validationResults, modalDismissed, mode])

  const advanceToNextParagraph = useCallback(() => {
    if (mode !== 'normal' || currentParagraphIndex >= paragraphs.length - 1) return

    console.log('⏭️ Advancing to next paragraph:', currentParagraphIndex + 1)
    const nextIndex = currentParagraphIndex + 1
    setCurrentParagraphIndex(nextIndex)
    setText(paragraphs[nextIndex])
    setUserInput('')
    setCurrentIndex(0)
    setErrors([])
    setCompletedParagraphs(prev => prev + 1)
    console.log('✅ Advanced to paragraph', nextIndex + 1, 'of', paragraphs.length)
  }, [mode, currentParagraphIndex, paragraphs])

  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Prevent input if test is completed or loading
    if (hasCompleted || isLoading || isValidating) return

    // Start the test on first keystroke
    if (!isActive && value.length > 0) {
      console.log('🚀 Starting test...')
      setIsActive(true)
      setStartTime(Date.now())
    }

    setUserInput(value)
    setCurrentIndex(value.length)

    // Handle Enter key for paragraph advancement in normal mode
    if (mode === 'normal' && value.endsWith('\n') && currentParagraphIndex < paragraphs.length - 1) {
      console.log('🔄 Enter key detected, checking if should advance...')
      const currentTextComplete = value.trim().length >= text.length
      if (currentTextComplete) {
        e.preventDefault()
        advanceToNextParagraph()
        return
      }
    }

    // For freeform mode, no real-time validation - just track basic errors for display
    if (mode === 'freeform') {
      // Simple visual feedback - highlight long words that might be invalid
      const words = value.trim().split(/\s+/)
      const lastWord = words[words.length - 1]
      if (lastWord && lastWord.length > 2) {
        // Just set a simple error indicator for now
        setErrors(lastWord.length > 10 ? [value.length - 1] : [])
      } else {
        setErrors([])
      }
    } else {
      // Track errors for normal and monkey modes
      if (text) {
        try {
          const newErrors: number[] = []
          for (let i = 0; i < value.length && i < text.length; i++) {
            if (value[i] !== text[i]) {
              newErrors.push(i)
            }
          }
          setErrors(newErrors)
        } catch (error) {
          console.error('❌ Error tracking errors:', error)
          setErrors([])
        }
      }
    }
  }, [isActive, hasCompleted, isLoading, isValidating, mode, text, currentParagraphIndex, paragraphs, advanceToNextParagraph])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode === 'normal' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const currentTextComplete = userInput.trim().length >= text.length
      if (currentTextComplete && currentParagraphIndex < paragraphs.length - 1) {
        advanceToNextParagraph()
      }
    }
  }, [mode, userInput, text, currentParagraphIndex, paragraphs, advanceToNextParagraph])

  const getCurrentWPM = useCallback(() => {
    if (!startTime || !isActive) return 0

    try {
      const elapsedTime = (Date.now() - startTime) / 1000 / 60 // minutes
      if (elapsedTime <= 0) return 0

      const wordsTyped = userInput.trim().split(/\s+/).length
      return Math.round(wordsTyped / elapsedTime)
    } catch (error) {
      console.error('❌ Error calculating current WPM:', error)
      return 0
    }
  }, [startTime, isActive, userInput])

  const getCurrentAccuracy = useCallback(() => {
    if (userInput.length === 0) return 100

    try {
      if (mode === 'freeform') {
        // For freeform mode during typing, use simple heuristic
        const words = userInput.trim().split(/\s+/)
        if (words.length === 0) return 100

        const validWords = words.filter(word => word.length > 2).length
        return Math.round((validWords / words.length) * 100)
      } else {
        const correctChars = userInput.split('').filter((char, index) =>
          index < text.length && char === text[index]
        ).length
        return Math.round((correctChars / userInput.length) * 100)
      }
    } catch (error) {
      console.error('❌ Error calculating accuracy:', error)
      return 0
    }
  }, [userInput, text, mode])

  const updateLiveStats = useCallback(() => {
    if (!onStatsUpdate || !isActive || hasCompleted) return

    try {
      const rawWpm = getCurrentWPM()
      const accuracy = getCurrentAccuracy()
      const adjustedWpm = Math.round(rawWpm * (accuracy / 100))

      onStatsUpdate({
        rawWpm,
        adjustedWpm,
        accuracy,
        timeLeft
      })
    } catch (error) {
      console.error('❌ Error updating live stats:', error)
    }
  }, [onStatsUpdate, isActive, hasCompleted, timeLeft, getCurrentWPM, getCurrentAccuracy])

  // Update live stats periodically when active
  useEffect(() => {
    if (!isActive || hasCompleted || !onStatsUpdate) return

    const interval = setInterval(updateLiveStats, 100)
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

  const handleRestart = useCallback(async () => {
    console.log('🔄 Restarting test...')
    setUserInput('')
    setCurrentIndex(0)
    setTimeLeft(60)
    setIsActive(false)
    setErrors([])
    setStartTime(null)
    setHasCompleted(false)
    setCurrentParagraphIndex(0)
    setCompletedParagraphs(0)
    setValidationResults(null)
    setModalDismissed(false) // Reset modal state

    // Reload text
    try {
      const newText = await getTextForMode(mode)
      if (mode === 'normal') {
        const paraArray = newText.split('\n\n').filter(p => p.trim().length > 0)
        setParagraphs(paraArray)
        setText(paraArray[0] || '')
      } else {
        setParagraphs([newText])
        setText(newText)
      }
    } catch (error) {
      console.error('❌ Error reloading text:', error)
      setText('Error loading text. Please try again.')
    }
  }, [mode])

  if (isLoading) {
    return (
      <div className="max-w-3xl lg:max-w-4xl mx-auto p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center py-6 lg:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading typing test...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl lg:max-w-4xl mx-auto p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-3 sm:mb-4 text-center">
        <div className="mb-2 text-sm text-gray-500">
          {mode === 'normal' && paragraphs.length > 1 && (
            <span>Paragraph {currentParagraphIndex + 1} of {paragraphs.length} • Press Enter to continue</span>
          )}
        </div>
        <div className="text-xl sm:text-2xl font-mono mb-3 sm:mb-4 leading-relaxed">
          {renderText()}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 sm:p-3 text-base sm:text-lg border rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder={mode === 'freeform' ? "Start typing your own text..." : "Start typing..."}
          disabled={timeLeft === 0 || hasCompleted || isValidating}
          autoFocus
        />
      </div>

      {/* Validation Loading Modal */}
      {isValidating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Checking Results...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Validating your words against our dictionary</p>
          </div>
        </div>
      )}

      {/* Validation Results Modal */}
      {validationResults && mode === 'freeform' && !modalDismissed && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              📊 Word Validation Results
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userInput.trim().split(/\s+/).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Words</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.validWords.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Valid Words</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.invalidWords.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Invalid Words</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {validationResults.accuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Final Accuracy</div>
              </div>
            </div>

            {validationResults.invalidWords.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ❌ Invalid Words ({validationResults.invalidWords.length})
                  </h4>
                  <span className="text-sm text-gray-500">
                    Click and drag to scroll through all words
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="text-sm text-red-700 dark:text-red-300 font-medium break-all">
                    {validationResults.invalidWords.join(' • ')}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Dictionary contains 370,000+ words • These words weren't found in our comprehensive English dictionary
                </div>
              </div>
            )}

            {validationResults.invalidWords.length === 0 && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                    Perfect! All words are valid!
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Every word you typed exists in our comprehensive English dictionary
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('🔒 User manually closed validation modal')
                  setModalDismissed(true)
                  setValidationResults(null)
                }}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Close & Continue
              </button>
              <button
                onClick={() => {
                  // Copy invalid words to clipboard for analysis
                  if (validationResults.invalidWords.length > 0) {
                    navigator.clipboard.writeText(validationResults.invalidWords.join(', '))
                    console.log('📋 Invalid words copied to clipboard:', validationResults.invalidWords)
                  }
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                disabled={validationResults.invalidWords.length === 0}
              >
                Copy Invalid Words
              </button>
            </div>
          </div>
        </div>
      )}

      {isActive && !hasCompleted && !isValidating && (
        <div className="mb-3 sm:mb-4 flex justify-center gap-6 lg:gap-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{getCurrentWPM()}</div>
            <div className="text-xs sm:text-sm text-gray-600">Current WPM</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{getCurrentAccuracy()}%</div>
            <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{errors.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Errors</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-base sm:text-lg">Time: {timeLeft}s</div>
        <div className="text-base sm:text-lg">
          Progress: {mode === 'freeform' ? `${userInput.trim().split(/\s+/).filter(word => word.length > 0).length} words` :
            `${userInput.length}/${text.length}${mode === 'normal' && paragraphs.length > 1 ? ` • Para ${currentParagraphIndex + 1}/${paragraphs.length}` : ''}`}
        </div>
        <button
          onClick={handleRestart}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-base"
          disabled={isLoading}
        >
          Restart
        </button>
      </div>

      {hasCompleted && !isValidating && (
        <div className="mt-3 sm:mt-4 text-center text-green-600 font-semibold text-sm sm:text-base">
          Test completed! Results have been saved.
        </div>
      )}
    </div>
  )
}

export default TypingBox
