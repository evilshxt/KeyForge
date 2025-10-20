import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import ModeSelector from './components/ModeSelector'
import TypingBox from './components/TypingBox'
import StatsDisplay from './components/StatsDisplay'
import AnalyticsPanel from './components/AnalyticsPanel'
import ThemeToggle from './components/ThemeToggle'

function AppContent() {
  const [currentMode, setCurrentMode] = useState<'normal' | 'freeform' | 'monkey'>('normal')
  const [isTestActive, setIsTestActive] = useState(false)
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0, timeLeft: 60 })

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">KeyForge - Ultimate Typing Challenge</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {useAuth().currentUser?.email}</span>
          <button onClick={useAuth().logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Logout
          </button>
              <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4">
        {!isTestActive ? (
          <div className="text-center">
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
            <button
              onClick={() => setIsTestActive(true)}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Test
            </button>
          </div>
        ) : (
          <TypingBox mode={currentMode} onComplete={(newStats) => {
            setStats(newStats)
            setIsTestActive(false)
          }} />
        )}

        <StatsDisplay stats={stats} />
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
