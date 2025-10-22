import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface LeaderboardEntry {
  userId: string
  displayName: string
  bestWPM: number
  totalTests: number
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top 10 users by bestWPM from users collection (no Cloud Functions needed)
        const q = query(
          collection(db, 'users'),
          orderBy('bestWPM', 'desc'),
          limit(10)
        )
        const querySnapshot = await getDocs(q)
        const topUsers: LeaderboardEntry[] = querySnapshot.docs.map((doc) => ({
          userId: doc.id,
          displayName: doc.data().displayName || doc.data().email?.split('@')[0] || 'Anonymous',
          bestWPM: doc.data().bestWPM || 0,
          totalTests: doc.data().totalTests || 0
        })).filter(user => user.bestWPM > 0) // Only show users with scores

        setLeaderboard(topUsers)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()

    // Set up real-time listener for leaderboard updates
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('bestWPM', 'desc'), limit(10)),
      (snapshot) => {
        const updatedUsers: LeaderboardEntry[] = snapshot.docs.map((doc) => ({
          userId: doc.id,
          displayName: doc.data().displayName || doc.data().email?.split('@')[0] || 'Anonymous',
          bestWPM: doc.data().bestWPM || 0,
          totalTests: doc.data().totalTests || 0
        })).filter(user => user.bestWPM > 0)
        setLeaderboard(updatedUsers)
      },
      (error) => {
        console.error('Error listening to leaderboard updates:', error)
      }
    )

    return () => unsubscribe()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 2:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
      case 3:
        return 'from-amber-500/20 to-yellow-500/20 border-amber-500/30'
      default:
        return 'from-slate-800/40 to-slate-700/40 border-slate-600/30'
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl"
      >
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-8 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl"
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
          <TrendingUp className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Global Leaderboard</h2>
        </motion.div>

        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 bg-gradient-to-r ${getRankColor(rank)} border rounded-xl hover:scale-105 transition-transform`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{entry.displayName}</div>
                    <div className="text-slate-300 text-sm">{entry.totalTests} tests completed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{entry.bestWPM}</div>
                  <div className="text-slate-400 text-sm">WPM</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No scores yet. Be the first to set a record!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Leaderboard
