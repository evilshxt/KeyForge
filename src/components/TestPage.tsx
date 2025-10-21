import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypingBox from './TypingBox'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { motion } from 'framer-motion'
import { Trophy, Zap } from 'lucide-react'

const TestPage: React.FC = () => {
  const { mode } = useParams<{ mode: 'normal' | 'freeform' | 'monkey' }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [isTestActive, setIsTestActive] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleTestComplete = async (stats: { wpm: number, accuracy: number, timeLeft: number }) => {
    if (!currentUser || !mode) return

    try {
      const userId = currentUser.uid

      // Save score to scores collection
      await addDoc(collection(db, 'scores'), {
        userId,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        mode,
        time: 60 - stats.timeLeft,
        date: serverTimestamp()
      })

      // Update user stats
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const newTotalTests = (userData.totalTests || 0) + 1
        const newTotalTime = (userData.totalTime || 0) + (60 - stats.timeLeft)
        const newBestWPM = Math.max(stats.wpm, userData.bestWPM || 0)
        const newAverageWPM = ((userData.averageWPM || 0) * (newTotalTests - 1) + stats.wpm) / newTotalTests
        const newAverageAccuracy = ((userData.accuracy || 0) * (newTotalTests - 1) + stats.accuracy) / newTotalTests

        await updateDoc(userDocRef, {
          totalTests: newTotalTests,
          totalTime: newTotalTime,
          bestWPM: newBestWPM,
          averageWPM: newAverageWPM,
          accuracy: newAverageAccuracy,
          lastLoginAt: serverTimestamp()
        })
      }

    } catch (error) {
      console.error('Error saving test results:', error)
    }

    setIsTestActive(false)
    setIsCompleted(true)
  }

  if (!mode || !['normal', 'freeform', 'monkey'].includes(mode)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-4">Invalid Mode</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 flex justify-between items-center"
        >
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Zap className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-center flex-1">
            Typing Test - {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-700 transition-all"
          >
            Dashboard
          </button>
        </motion.header>

        <main className="container mx-auto px-4 py-8">
          {isTestActive && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <TypingBox mode={mode} onComplete={handleTestComplete} />
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2 }}
                className="mb-6"
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Test Completed!</h2>
              <p className="text-lg mb-6">Great job! Your results have been saved to your dashboard.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setIsTestActive(true)
                    setIsCompleted(false)
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  View Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  )
}

export default TestPage
