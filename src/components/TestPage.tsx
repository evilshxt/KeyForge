import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypingBox from './TypingBox'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, ArrowLeft, RotateCcw, BarChart3, Target, Gauge } from 'lucide-react'
import { useToast } from './Toast'

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
    <div className="relative w-32 h-16 sm:w-40 sm:h-20 lg:w-48 lg:h-24">
      {/* Background arc */}
      <svg className="w-full h-full" viewBox="0 0 200 100">
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Colored zones */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
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
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          style={{ transformOrigin: '100px 90px' }}
        />

        {/* Center dot */}
        <circle cx="100" cy="90" r="4" fill={getColor()} />
      </svg>

      {/* WPM Display */}
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        <div className="text-center">
          <motion.div
            key={wpm}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl sm:text-2xl lg:text-3xl font-bold"
            style={{ color: getColor() }}
          >
            {wpm}
          </motion.div>
          <div className="text-xs lg:text-sm text-gray-400 -mt-1">WPM</div>
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
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 lg:mb-8"
    >
      <div className="flex items-center justify-between gap-6 lg:gap-8">
        {/* Speedometer */}
        <div className="flex-shrink-0">
          <Speedometer wpm={adjustedWpm} />
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 lg:gap-6">
          {/* Raw WPM */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
              <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
              <span className="text-xs lg:text-sm text-gray-400">Raw WPM</span>
            </div>
            <motion.div
              key={rawWpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-blue-400"
            >
              {rawWpm}
            </motion.div>
          </motion.div>

          {/* Adjusted WPM */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
              <span className="text-xs lg:text-sm text-gray-400">Adjusted WPM</span>
            </div>
            <motion.div
              key={adjustedWpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-green-400"
            >
              {adjustedWpm}
            </motion.div>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
              <Target className="w-3 h-3 lg:w-4 lg:h-4 text-purple-400" />
              <span className="text-xs lg:text-sm text-gray-400">Accuracy</span>
            </div>
            <motion.div
              key={accuracy}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-purple-400"
            >
              {accuracy}%
            </motion.div>
          </motion.div>

          {/* Time Left */}
          <motion.div
            className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
              <Gauge className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
              <span className="text-xs lg:text-sm text-gray-400">Time Left</span>
            </div>
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-orange-400"
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
      console.error('❌ Test completion failed: No user or mode')
      showToast('Authentication required to save test results', 'error')
      return
    }

    console.log('🎯 Test completed with stats:', stats)
    console.log('👤 Current user:', currentUser.uid)
    console.log('🎮 Test mode:', mode)

    try {
      const userId = currentUser.uid
      const adjustedWpm = stats.wpm

      console.log('💾 Saving score to Firestore...')
      // Save score to scores collection
      const scoreDocRef = await addDoc(collection(db, 'scores'), {
        userId,
        wpm: adjustedWpm,
        rawWpm: stats.rawWpm || stats.wpm,
        accuracy: stats.accuracy,
        mode,
        time: 60 - stats.timeLeft,
        date: serverTimestamp()
      })
      console.log('✅ Score saved successfully with ID:', scoreDocRef.id)

      // Update user stats
      console.log('📊 Updating user stats...')
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log('📋 Current user data:', userData)

        const newTotalTests = (userData.totalTests || 0) + 1
        const newTotalTime = (userData.totalTime || 0) + (60 - stats.timeLeft)
        const newBestWPM = Math.max(adjustedWpm, userData.bestWPM || 0)
        const newAverageWPM = ((userData.averageWPM || 0) * (newTotalTests - 1) + adjustedWpm) / newTotalTests
        const newAverageAccuracy = ((userData.accuracy || 0) * (newTotalTests - 1) + stats.accuracy) / newTotalTests

        console.log('🆕 Calculated new stats:', {
          newTotalTests,
          newTotalTime,
          newBestWPM,
          newAverageWPM,
          newAverageAccuracy
        })

        // Update streak (check if user has activity today)
        const today = new Date().toISOString().split('T')[0]
        const lastActivity = userData.lastActivityDate
        let newStreak = userData.streak || 0
        let newLongestStreak = userData.longestStreak || 0

        if (!lastActivity) {
          newStreak = 1
          newLongestStreak = 1
          console.log('🌟 First activity - starting new streak')
        } else {
          const lastDate = new Date(lastActivity)
          const todayDate = new Date(today)
          const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysDiff === 1) {
            newStreak = (userData.streak || 0) + 1
            newLongestStreak = Math.max(newStreak, userData.longestStreak || 0)
            console.log('🔥 Consecutive day - streak increased to:', newStreak)
          } else if (daysDiff > 1) {
            newStreak = 1
            newLongestStreak = userData.longestStreak || 0
            console.log('💔 Streak broken - starting new streak')
          } else {
            console.log('📅 Same day - no streak change needed')
          }
        }

        const updateData = {
          totalTests: newTotalTests,
          totalTime: newTotalTime,
          bestWPM: newBestWPM,
          averageWPM: newAverageWPM,
          accuracy: newAverageAccuracy,
          lastLoginAt: serverTimestamp(),
          lastActivityDate: today,
          streak: newStreak,
          longestStreak: newLongestStreak
        }

        console.log('📝 Updating user document with:', updateData)
        await updateDoc(userDocRef, updateData)
        console.log('✅ User stats updated successfully')

        // Verify the update
        const updatedDoc = await getDoc(userDocRef)
        console.log('🔍 Verification - updated user data:', updatedDoc.data())

      } else {
        console.error('❌ User document does not exist!')
        showToast('User profile not found. Please try logging in again.', 'error')
        return
      }

      console.log('🎉 All data saved successfully!')
      showToast(`Test completed! Adjusted WPM: ${adjustedWpm}, Accuracy: ${stats.accuracy}%`, 'success')

    } catch (error) {
      console.error('❌ Error saving test results:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      showToast('Failed to save test results. Please try again.', 'error')
    }

    setIsTestActive(false)
    setIsCompleted(true)
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
          className="p-4 lg:p-6 flex justify-between items-center"
        >
          <motion.div 
            className="flex items-center gap-2 lg:gap-3"
            animate={{ rotate: [0, 5, -5, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center flex-1 tracking-tight">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </h1>
          
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 lg:px-5 lg:py-2.5 bg-transparent border-2 border-slate-600 rounded-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all flex items-center gap-1.5 lg:gap-2 group text-sm lg:text-base"
          >
            <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>
        </motion.header>

        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            {isTestActive && (
              <motion.div
                key="test-active"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-5xl lg:max-w-6xl mx-auto"
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
                className="max-w-xl lg:max-w-2xl mx-auto"
              >
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mb-4 lg:mb-6"
                  >
                    <div className="inline-block p-4 lg:p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full">
                      <Trophy className="w-12 h-12 lg:w-20 lg:h-20 text-yellow-400" />
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 lg:mb-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    Test Completed!
                  </motion.h2>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg text-gray-300 mb-6 lg:mb-8"
                  >
                    Excellent work! Your results have been saved.
                  </motion.p>

                  {/* Final Stats Display */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 lg:mb-8"
                  >
                    <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30">
                      <div className="text-xs sm:text-sm text-gray-400 mb-1">Adjusted WPM</div>
                      <div className="text-2xl sm:text-3xl font-bold text-green-400">{liveStats.adjustedWpm}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30">
                      <div className="text-xs sm:text-sm text-gray-400 mb-1">Raw WPM</div>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-400">{liveStats.rawWpm}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4 border border-slate-600/30">
                      <div className="text-xs sm:text-sm text-gray-400 mb-1">Accuracy</div>
                      <div className="text-2xl sm:text-3xl font-bold text-purple-400">{liveStats.accuracy}%</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3 sm:gap-4 justify-center"
                  >
                    <button
                      onClick={handleRetry}
                      className="px-6 py-2 sm:px-8 sm:py-3 bg-transparent border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all flex items-center gap-2 group text-sm sm:text-base"
                    >
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-2 sm:px-8 sm:py-3 bg-transparent border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-all flex items-center gap-2 group text-sm sm:text-base"
                    >
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
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