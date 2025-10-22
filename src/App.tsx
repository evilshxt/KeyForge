import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import ModeSelector from './components/ModeSelector'
import TestPage from './components/TestPage'
import AnalyticsPanel from './components/AnalyticsPanel'
import Leaderboard from './components/Leaderboard'
import MultiplayerRoom from './components/MultiplayerRoom'
import { ToastProvider } from './components/Toast'
import { Zap, LogOut, Users } from 'lucide-react'

function AppContent() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [currentMode, setCurrentMode] = useState<'normal' | 'freeform' | 'monkey'>('normal')

  const handleStartTest = (mode: 'normal' | 'freeform' | 'monkey') => {
    navigate(`/test/${mode}`)
  }

  return (
    <Routes>
      <Route path="/test/:mode" element={<TestPage />} />
      <Route path="/multiplayer" element={<MultiplayerRoom />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <header className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">KeyForge - Ultimate Typing Challenge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/multiplayer')}
                className="px-4 py-2 bg-transparent border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Multiplayer
              </button>
              <span>Welcome, {currentUser?.email}</span>
              <button onClick={logout} className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="container mx-auto px-4">
            <div className="text-center">
              <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
              <button
                onClick={() => handleStartTest(currentMode)}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto transform hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Start Test
              </button>
            </div>

            <AnalyticsPanel />
            <Leaderboard />
          </main>
        </div>
      } />
    </Routes>
  )
}

function App() {
  const { currentUser } = useAuth()

  return (
    <ToastProvider>
      {currentUser ? <AppContent /> : <Login />}
    </ToastProvider>
  )
}

export default App
