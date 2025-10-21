// @ts-ignore
import React, { useState, useEffect } from 'react'
// @ts-ignore
import { getTextForMode } from '../utils/textSources'
// @ts-ignore
import { calculateWPM, calculateAccuracy } from '../utils/accuracy'
// @ts-ignore
import { isValidWord } from '../utils/wordValidator'

interface TypingBoxProps {
  mode: 'normal' | 'freeform' | 'monkey'
  onComplete: (stats: { wpm: number, accuracy: number, timeLeft: number }) => void
}

const TypingBox: React.FC<TypingBoxProps> = ({ mode, onComplete }) => {
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    setText(getTextForMode(mode))
  }, [mode])

  useEffect(() => {
    let interval: number | null = null
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 || userInput.length === text.length) {
      setIsActive(false)
      if (interval) clearInterval(interval)
      const wpm = calculateWPM(userInput, 60 - timeLeft)
      const accuracy = calculateAccuracy(userInput, errors)
      onComplete({ wpm, accuracy, timeLeft: timeLeft })
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, userInput, text, errors, onComplete])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isActive) {
      setIsActive(true)
      setStartTime(Date.now())
    }

    setUserInput(value)
    setCurrentIndex(value.length)

    // Track errors for normal and monkey modes
    if (mode !== 'freeform') {
      const newErrors: number[] = []
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== text[i]) {
          newErrors.push(i)
        }
      }
      setErrors(newErrors)
    } else {
      // For free-form, validate words as they are typed
      const words = value.trim().split(/\s+/)
      const lastWord = words[words.length - 1]
      if (lastWord && lastWord.length > 2) { // Only check words longer than 2 chars
        const isValid = await isValidWord(lastWord)
        const newErrors = isValid ? [] : [value.length - 1] // Mark as error if invalid
        setErrors(newErrors)
      } else {
        setErrors([])
      }
    }
  }

  const getCurrentWPM = () => {
    if (!startTime || !isActive) return 0
    const elapsedTime = (Date.now() - startTime) / 1000 / 60 // minutes
    const wordsTyped = userInput.trim().split(/\s+/).length
    return Math.round(wordsTyped / elapsedTime)
  }

  const getCurrentAccuracy = () => {
    if (userInput.length === 0) return 100
    const correctChars = userInput.split('').filter((char, index) => char === text[index]).length
    return Math.round((correctChars / userInput.length) * 100)
  }

  const renderText = () => {
    if (mode === 'freeform') {
      return <span className="text-gray-500">Type anything! We'll check your words against our dictionary.</span>
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
          disabled={timeLeft === 0}
        />
      </div>

      {mode === 'normal' && isActive && (
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
        <div className="text-lg">Progress: {userInput.length}/{mode === 'freeform' ? '∞' : text.length}</div>
        <button
          onClick={() => {
            setUserInput('')
            setCurrentIndex(0)
            setTimeLeft(60)
            setIsActive(false)
            setErrors([])
            setStartTime(null)
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Restart
        </button>
      </div>
    </div>
  )
}

export default TypingBox
