import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypingBox from './TypingBox'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, ArrowLeft, RotateCcw, BarChart3, Target, Gauge } from 'lucide-react'
import { useToast } from './Toast'
import { markActivityToday } from '../utils/streak'

// Speedometer Component
const Speedometer: React.FC<{ wpm: number, maxWpm?: number }> = ({ wpm, maxWpm = 150 }) => {
  const percentage = Math.min((wpm / maxWpm) * 100, 100)
  const angle = (percentage / 100) * 180 - 90 // -90 to 90 degrees

  // Color zones
  const getColor = () => {
    if (wpm < 30) return '#ef4444' // red
    if (wpm < 50) return '#f59e0b' // orange
    if (wpm < 70) return '#eab308' // yellow
    if (wpm < 90) return '#84cc16' // lime
    return '#22c55e' // green
  }

  return (
    <div className="relative w-48 h-24">
      {/* Background arc */}
      <svg className="w-full h-full" viewBox="0 0 200 100">
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Colored zones */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * percentage) / 100}
          className="transition-all duration-300"
        />
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f59e0b" />
            <stop offset="66%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Needle */}
        <motion.line
          x1="100"
          y1="90"
          x2="100"
          y2="30"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          style={{ transformOrigin: '100px 90px' }}
        />
        
        {/* Center dot */}
        <circle cx="100" cy="90" r="6" fill={getColor()} />
      </svg>

      {/* WPM Display */}
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        <div className="text-center">
          <motion.div
            key={wpm}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold"
            style={{ color: getColor() }}
          >
            {wpm}
          </motion.div>
          <div className="text-xs text-gray-400 -mt-1">WPM</div>
        </div>
      </div>
    </div>
  )
}

// Live Stats Component
const LiveStats: React.FC<{
  rawWpm: number
  adjustedWpm: number
  accuracy: number
  timeLeft: number
}> = ({ rawWpm, adjustedWpm, accuracy, timeLeft }) => {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center justify-between gap-8">
        {/* Speedometer */}
        <div className="flex-shrink-0">
          <Speedometer wpm={adjustedWpm} />
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Raw WPM */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Raw WPM</span>
            </div>
            <motion.div
              key={rawWpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-blue-400"
            >
              {rawWpm}
            </motion.div>
          </motion.div>

          {/* Adjusted WPM */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Adjusted WPM</span>
            </div>
            <motion.div
              key={adjustedWpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-green-400"
            >
              {adjustedWpm}
            </motion.div>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Accuracy</span>
            </div>
            <motion.div
              key={accuracy}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-purple-400"
            >
              {accuracy}%
            </motion.div>
          </motion.div>

          {/* Time Left */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Time Left</span>
            </div>
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-orange-400"
            >
              {timeLeft}s
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

const TestPage: React.FC = () => {
  const { mode } = useParams<{ mode: 'normal' | 'freeform' | 'monkey' }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [isTestActive, setIsTestActive] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Live stats state
  const [liveStats, setLiveStats] = useState({
    rawWpm: 0,
    adjustedWpm: 0,
    accuracy: 100,
    timeLeft: 60
  })

  const handleTestComplete = async (stats: { 
    wpm: number, 
    accuracy: number, 
    timeLeft: number,
    rawWpm?: number,
    errors?: number 
  }) => {
    if (!currentUser || !mode) {
      showToast('Authentication required to save test results', 'error')
      return
    }

    try {
      const userId = currentUser.uid
      
      // Use adjusted WPM for storage (the wpm passed should be adjusted)
      const adjustedWpm = stats.wpm

      // Save score to scores collection
      await addDoc(collection(db, 'scores'), {
        userId,
        wpm: adjustedWpm, // Store adjusted WPM
        rawWpm: stats.rawWpm || stats.wpm,
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
        const newBestWPM = Math.max(adjustedWpm, userData.bestWPM || 0)
        const newAverageWPM = ((userData.averageWPM || 0) * (newTotalTests - 1) + adjustedWpm) / newTotalTests
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

      // Update leaderboards collection with adjusted WPM
      await updateLeaderboard(userId, currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous', adjustedWpm)

      // Update daily streak
      markActivityToday()

      showToast(`Test completed! Adjusted WPM: ${adjustedWpm}, Accuracy: ${stats.accuracy}%`, 'success')

    } catch (error) {
      console.error('Error saving test results:', error)
      showToast('Failed to save test results. Please try again.', 'error')
    }

    setIsTestActive(false)
    setIsCompleted(true)
  }

  const updateLeaderboard = async (userId: string, displayName: string, newWPM: number) => {
    try {
      const leaderboardRef = doc(db, 'leaderboards', 'global')
      const leaderboardDoc = await getDoc(leaderboardRef)

      let topUsers: Array<{userId: string, displayName: string, bestWPM: number, totalTests: number}> = []

      if (leaderboardDoc.exists()) {
        topUsers = leaderboardDoc.data().topUsers || []
      }

      // Update or add the user
      const existingIndex = topUsers.findIndex(user => user.userId === userId)

      if (existingIndex >= 0) {
        // Update existing user if new score is better
        if (newWPM > topUsers[existingIndex].bestWPM) {
          topUsers[existingIndex].bestWPM = newWPM
        }
        topUsers[existingIndex].totalTests += 1
      } else {
        // Add new user if there's space or if their score is good enough
        if (topUsers.length < 100) {
          topUsers.push({
            userId,
            displayName,
            bestWPM: newWPM,
            totalTests: 1
          })
        } else {
          // Check if this score qualifies for the leaderboard
          const minScore = Math.min(...topUsers.map(user => user.bestWPM))
          if (newWPM > minScore) {
            // Replace the lowest score
            const lowestIndex = topUsers.findIndex(user => user.bestWPM === minScore)
            topUsers[lowestIndex] = {
              userId,
              displayName,
              bestWPM: newWPM,
              totalTests: 1
            }
          }
        }
      }

      // Sort by bestWPM descending and limit to top 100
      topUsers.sort((a, b) => b.bestWPM - a.bestWPM)
      topUsers = topUsers.slice(0, 100)

      // Update the leaderboard document
      await setDoc(leaderboardRef, {
        topUsers,
        lastUpdated: serverTimestamp()
      })

    } catch (error) {
      console.error('Error updating leaderboard:', error)
    }
  }

  const handleRetry = () => {
    setIsTestActive(true)
    setIsCompleted(false)
    setLiveStats({
      rawWpm: 0,
      adjustedWpm: 0,
      accuracy: 100,
      timeLeft: 60
    })
  }

  if (!mode || !['normal', 'freeform', 'monkey'].includes(mode)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-4 text-white">Invalid Mode</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all"
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
          <motion.div 
            className="flex items-center gap-3"
            animate={{ rotate: [0, 5, -5, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="w-8 h-8 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-center flex-1 tracking-tight">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </h1>
          
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-transparent border-2 border-slate-600 rounded-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>
        </motion.header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {isTestActive && (
              <motion.div
                key="test-active"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-6xl mx-auto"
              >
                {/* Live Stats */}
                <LiveStats
                  rawWpm={liveStats.rawWpm}
                  adjustedWpm={liveStats.adjustedWpm}
                  accuracy={liveStats.accuracy}
                  timeLeft={liveStats.timeLeft}
                />

                {/* Typing Box */}
                <TypingBox 
                  mode={mode} 
                  onComplete={handleTestComplete}
                  onStatsUpdate={setLiveStats}
                />
              </motion.div>
            )}

            {isCompleted && (
              <motion.div
                key="test-completed"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-12 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mb-6"
                  >
                    <div className="inline-block p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full">
                      <Trophy className="w-20 h-20 text-yellow-400" />
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    Test Completed!
                  </motion.h2>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-300 mb-8"
                  >
                    Excellent work! Your results have been saved.
                  </motion.p>

                  {/* Final Stats Display */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                  >
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <div className="text-sm text-gray-400 mb-1">Adjusted WPM</div>
                      <div className="text-3xl font-bold text-green-400">{liveStats.adjustedWpm}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <div className="text-sm text-gray-400 mb-1">Raw WPM</div>
                      <div className="text-3xl font-bold text-blue-400">{liveStats.rawWpm}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                      <div className="text-3xl font-bold text-purple-400">{liveStats.accuracy}%</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4 justify-center"
                  >
                    <button
                      onClick={handleRetry}
                      className="px-8 py-3 bg-transparent border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all flex items-center gap-2 group"
                    >
                      <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-8 py-3 bg-transparent border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-all flex items-center gap-2 group"
                    >
                      <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      View Dashboard
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  )
}

export default TestPage