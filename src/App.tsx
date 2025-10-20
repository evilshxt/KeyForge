import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import ModeSelector from './components/ModeSelector'
import TypingBox from './components/TypingBox'
import AnalyticsPanel from './components/AnalyticsPanel'
import { Zap, LogOut } from 'lucide-react'
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

function AppContent() {
  const [currentMode, setCurrentMode] = useState<'normal' | 'freeform' | 'monkey'>('normal')
  const [isTestActive, setIsTestActive] = useState(false)

  const handleTestComplete = async (stats: { wpm: number, accuracy: number, timeLeft: number }) => {
    if (!useAuth().currentUser) return

    try {
      const userId = useAuth().currentUser!.uid

      // Save score to scores collection
      await addDoc(collection(db, 'scores'), {
        userId,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        mode: currentMode,
        time: 60 - stats.timeLeft,
        date: serverTimestamp()
      })

      // Update user stats (simplified for now)
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
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">KeyForge - Ultimate Typing Challenge</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span>Welcome, {useAuth().currentUser?.email}</span>
          <button onClick={useAuth().logout} className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {!isTestActive ? (
          <div className="text-center">
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
            <button
              onClick={() => setIsTestActive(true)}
              className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto transform hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Start Test
            </button>
          </div>
        ) : (
          <TypingBox mode={currentMode} onComplete={handleTestComplete} />
        )}

        <AnalyticsPanel />
      </main>
    </div>
  )
}

function App() {
  const { currentUser } = useAuth()

  return currentUser ? <AppContent /> : <Login />
}

export default App
