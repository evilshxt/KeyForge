import React, { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Target, Award, Users, Zap, Star, Flame } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { doc, getDoc, collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
// Define interface for score data
interface ScoreData {
  id: string
  wpm: number
  accuracy: number
  date: any // Firestore Timestamp or Date
  userId: string
  mode?: string
  time?: number
  textLength?: number
  errors?: number
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const AnalyticsPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalTests: 0,
    averageWPM: 0,
    bestWPM: 0,
    totalTime: 0,
    accuracy: 0
    // streak will be loaded from localStorage
  })

  const [streak, setStreak] = useState(0)

  const [longestStreak, setLongestStreak] = useState(0)

  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'WPM',
        data: [0, 0, 0, 0, 0, 0, 0], // Start with zeros instead of fake data
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  })

  const [chartKey, setChartKey] = useState(0)

  const { currentUser } = useAuth()
  const controls = useAnimation()

  // Load streak data on mount
  useEffect(() => {
    // Streak data is now loaded from Firebase in fetchUserStats
  }, [])

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) return

      try {
        // Fetch user stats from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          setStats({
            totalTests: data.totalTests || 0,
            averageWPM: data.averageWPM || 0,
            bestWPM: data.bestWPM || 0,
            totalTime: data.totalTime || 0,
            accuracy: data.accuracy || 0
          })
          setStreak(data.streak || 0)
          setLongestStreak(data.longestStreak || data.streak || 0)
        }

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const scoresQuery = query(
          collection(db, 'scores'),
          where('userId', '==', currentUser.uid),
          where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
          orderBy('date', 'desc')
        )
        const scoresSnapshot = await getDocs(scoresQuery)
        const recentScores = scoresSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as ScoreData[]

        if (recentScores.length === 0) {
          // Set all zeros if no data
          setWeeklyData(prev => ({
            ...prev,
            datasets: [{
              ...prev.datasets[0],
              data: [0, 0, 0, 0, 0, 0, 0]
            }]
          }))
          return
        }

        // Group scores by day and calculate daily averages
        const dailyScores: { [key: string]: number[] } = {}
        recentScores.forEach((score: any) => {
          try {
            let date: Date | null = null
            if (score.date && typeof score.date.toDate === 'function') {
              date = score.date.toDate()
            } else if (score.date instanceof Date) {
              date = score.date
            }

            if (date) {
              const dateStr = date.toDateString()
              if (!dailyScores[dateStr]) dailyScores[dateStr] = []
              dailyScores[dateStr].push(score.wpm)
            }
          } catch (error) {
            console.warn('Error processing score date:', error, score)
          }
        })

        // Calculate average WPM for each of the last 7 days
        const weeklyDataArray: { wpm: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toDateString()
          const dayScores = dailyScores[dateStr] || []
          const avgWPM = dayScores.length > 0 ? dayScores.reduce((sum, wpm) => sum + wpm, 0) / dayScores.length : 0
          weeklyDataArray.push({ wpm: Math.round(avgWPM) })
        }

        // Update weekly chart data
        setWeeklyData(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: weeklyDataArray.map(d => d.wpm)
          }]
        }))

        // Force chart re-render
        setChartKey(prev => prev + 1)

        // Streak data is already loaded from Firebase above
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    fetchUserStats()
  }, [currentUser])

  const accuracyData = {
    labels: ['Accurate', 'Errors'],
    datasets: [
      {
        data: [stats.accuracy, 100 - stats.accuracy],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      }
    ]
  }

  const progressData = {
    labels: ['This Week', 'Last Week'],
    datasets: [
      {
        label: 'Average WPM',
        data: [stats.averageWPM, stats.averageWPM * 0.9],
        backgroundColor: ['rgba(168, 85, 247, 0.8)', 'rgba(168, 85, 247, 0.6)'],
        borderColor: ['rgba(168, 85, 247, 1)', 'rgba(168, 85, 247, 0.8)'],
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 12 },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(71, 85, 105, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        grid: { color: 'rgba(71, 85, 105, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-900/90 to-blue-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Enhanced animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative z-10">
        <motion.div
          className="flex items-center gap-2 lg:gap-3 mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Your Typing Dashboard</h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(59 130 246)' }}
          >
            <motion.div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white relative z-10">{stats.totalTests}</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Total Tests</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(34 197 94)' }}
          >
            <motion.div className="absolute inset-0 bg-green-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white relative z-10">{stats.averageWPM}</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Avg WPM</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(251 191 36)' }}
          >
            <motion.div className="absolute inset-0 bg-yellow-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white relative z-10">{stats.bestWPM}</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Best WPM</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(168 85 247)' }}
          >
            <motion.div className="absolute inset-0 bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white relative z-10">{Math.floor(stats.totalTime / 60)}m</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Total Time</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(239 68 68)' }}
          >
            <motion.div className="absolute inset-0 bg-red-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white relative z-10">{stats.accuracy}%</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Accuracy</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-3 lg:p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(14 165 233)' }}
          >
            <motion.div className="absolute inset-0 bg-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity" animate={controls} />
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-400 mx-auto mb-1 sm:mb-2 relative z-10" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400 relative z-10">{streak}</div>
            <div className="text-xs lg:text-sm text-slate-400 relative z-10">Day Streak</div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Weekly WPM Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-3 sm:p-4 lg:p-6"
          >
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Weekly WPM Progress
            </h3>
            <div className="h-40 sm:h-48 lg:h-64">
              <Bar key={chartKey} data={weeklyData} options={{ ...options, maintainAspectRatio: false }} />
            </div>
          </motion.div>

          {/* Accuracy Doughnut */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-3 sm:p-4 lg:p-6"
          >
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              Accuracy Breakdown
            </h3>
            <div className="h-40 sm:h-48 lg:h-64">
              <Doughnut data={accuracyData} options={{ ...options, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8"
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            Week-over-Week Progress
          </h3>
          <div className="h-40 sm:h-48 lg:h-64">
            <Bar data={progressData} options={{ ...options, maintainAspectRatio: false }} />
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
        >
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-2 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-yellow-400 font-semibold text-xs sm:text-sm lg:text-base">Speed Demon</div>
              <div className="text-slate-300 text-xs lg:text-sm truncate">Best WPM: {stats.bestWPM}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-2 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-green-400 font-semibold text-xs sm:text-sm lg:text-base">Accuracy Master</div>
              <div className="text-slate-300 text-xs lg:text-sm truncate">{stats.accuracy}% Accuracy</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-2 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-blue-400 font-semibold text-xs sm:text-sm lg:text-base">Consistent Typist</div>
              <div className="text-slate-300 text-xs lg:text-sm truncate">{streak} Day Streak (Best: {longestStreak})</div>
            </div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-3 sm:mt-4 lg:mt-6 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl"
        >
          <p className="text-center text-slate-200 text-xs sm:text-sm lg:text-base">
            🚀 {stats.bestWPM > 60 ? 'You\'re a typing legend!' : 'Keep practicing to reach your peak!'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AnalyticsPanel