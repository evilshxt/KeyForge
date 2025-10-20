import React, { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { gsap } from 'gsap'
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
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'

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
    accuracy: 0,
    streak: 0
  })

  const controls = useAnimation()

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!useAuth().currentUser) return

      try {
        const userDocRef = doc(db, 'users', useAuth().currentUser!.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          setStats({
            totalTests: data.totalTests || 0,
            averageWPM: data.averageWPM || 0,
            bestWPM: data.bestWPM || 0,
            totalTime: data.totalTime || 0,
            accuracy: data.accuracy || 0,
            streak: data.streak || 0
          })
        }

        // Fetch recent scores for charts
        const scoresQuery = query(
          collection(db, 'scores'),
          where('userId', '==', useAuth().currentUser!.uid),
          orderBy('date', 'desc'),
          limit(7)
        )
        const scoresSnapshot = await getDocs(scoresQuery)
        const recentScores = scoresSnapshot.docs.map((doc: any) => doc.data())

        // Update chart data with real scores
        if (recentScores.length > 0) {
          weeklyData.datasets[0].data = recentScores.slice(0, 7).map((score: any) => score.wpm)
        }

        // Animate stats
        gsap.from('.stat-card', { opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease: 'back.out' })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    fetchUserStats()

    controls.start({ scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } })
  }, [controls, useAuth])

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'WPM',
        data: [45, 52, 48, 61, 55, 67, 58],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

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
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#fff' }
    },
    scales: {
      y: { grid: { color: 'rgba(71, 85, 105, 0.3)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { color: 'rgba(71, 85, 105, 0.3)' }, ticks: { color: '#94a3b8' } }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-8 p-8 bg-gradient-to-br from-slate-900/90 to-blue-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Enhanced animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative z-10">
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Your Typing Dashboard</h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(59 130 246)' }}
          >
            <motion.div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-white relative z-10">{stats.totalTests}</div>
            <div className="text-sm text-slate-400 relative z-10">Total Tests</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(34 197 94)' }}
          >
            <motion.div className="absolute inset-0 bg-green-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-white relative z-10">{stats.averageWPM}</div>
            <div className="text-sm text-slate-400 relative z-10">Avg WPM</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(251 191 36)' }}
          >
            <motion.div className="absolute inset-0 bg-yellow-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-white relative z-10">{stats.bestWPM}</div>
            <div className="text-sm text-slate-400 relative z-10">Best WPM</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(168 85 247)' }}
          >
            <motion.div className="absolute inset-0 bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-white relative z-10">{Math.floor(stats.totalTime / 60)}m</div>
            <div className="text-sm text-slate-400 relative z-10">Total Time</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(239 68 68)' }}
          >
            <motion.div className="absolute inset-0 bg-red-500/10 opacity-0 hover:opacity-100 transition-opacity" />
            <Target className="w-6 h-6 text-red-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-white relative z-10">{stats.accuracy}%</div>
            <div className="text-sm text-slate-400 relative z-10">Accuracy</div>
          </motion.div>

          <motion.div
            className="stat-card bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgb(14 165 233)' }}
          >
            <motion.div className="absolute inset-0 bg-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity" animate={controls} />
            <Flame className="w-6 h-6 text-cyan-400 mx-auto mb-2 relative z-10" />
            <div className="text-2xl font-bold text-cyan-400 relative z-10">{stats.streak}</div>
            <div className="text-sm text-slate-400 relative z-10">Day Streak</div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly WPM Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Weekly WPM Progress
            </h3>
            <Bar data={weeklyData} options={options} />
          </motion.div>

          {/* Accuracy Doughnut */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Accuracy Breakdown
            </h3>
            <div className="h-48">
              <Doughnut data={accuracyData} options={{ ...options, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Week-over-Week Progress
          </h3>
          <Bar data={progressData} options={options} />
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-yellow-400 font-semibold">Speed Demon</div>
              <div className="text-slate-300 text-sm">Best WPM: {stats.bestWPM}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-green-400 font-semibold">Accuracy Master</div>
              <div className="text-slate-300 text-sm">{stats.accuracy}% Accuracy</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
            <Flame className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-blue-400 font-semibold">Consistent Typist</div>
              <div className="text-slate-300 text-sm">{stats.streak} Day Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl"
        >
          <p className="text-center text-slate-200">
            🚀 {stats.bestWPM > 60 ? 'You\'re a typing legend!' : 'Keep practicing to reach your peak!'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AnalyticsPanel