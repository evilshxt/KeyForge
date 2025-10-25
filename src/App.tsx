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
import { Zap, LogOut, Users, Menu, X } from 'lucide-react'

function AppContent() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [currentMode, setCurrentMode] = useState<'normal' | 'freeform' | 'monkey'>('normal')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleStartTest = (mode: 'normal' | 'freeform' | 'monkey') => {
    navigate(`/test/${mode}`)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <Routes>
      <Route path="/test/:mode" element={<TestPage />} />
      <Route path="/multiplayer" element={<MultiplayerRoom />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors overflow-x-hidden">
          {/* Responsive Navbar */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center gap-2 lg:gap-3">
                  <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    <span className="hidden sm:inline">KeyForge</span>
                    <span className="sm:hidden">KeyForge</span>
                    <span className="hidden md:inline text-gray-500"> - Ultimate Typing Challenge</span>
                  </h1>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                  <button
                    onClick={() => navigate('/multiplayer')}
                    className="px-3 py-1.5 lg:px-4 lg:py-2 bg-transparent border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all flex items-center gap-1.5 lg:gap-2 text-sm lg:text-base"
                  >
                    <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                    Multiplayer
                  </button>
                  <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {currentUser?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 lg:px-4 lg:py-2 bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 lg:gap-2 text-sm lg:text-base"
                  >
                    <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                    Logout
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
                <div className="px-4 py-3 lg:py-4 space-y-2 lg:space-y-3">
                  <button
                    onClick={() => {
                      navigate('/multiplayer')
                      closeMobileMenu()
                    }}
                    className="w-full text-left px-3 py-2 lg:px-4 lg:py-3 bg-transparent border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 text-sm lg:text-base"
                  >
                    <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                    Multiplayer
                  </button>
                  <div className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    Welcome, {currentUser?.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full text-left px-3 py-2 lg:px-4 lg:py-3 bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-sm lg:text-base"
                  >
                    <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="max-w-6xl lg:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
              <button
                onClick={() => handleStartTest(currentMode)}
                className="mt-3 sm:mt-4 lg:mt-6 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 lg:gap-3 mx-auto transform hover:scale-105 text-sm sm:text-base lg:text-lg"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
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
