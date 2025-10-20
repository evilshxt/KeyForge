import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Zap, Mail, Lock, ShieldCheck, Rocket, Users, Trophy, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const { login, signup } = useAuth()

  const features = [
    { icon: Trophy, text: 'Compete globally', color: 'text-yellow-400' },
    { icon: Users, text: 'Join thousands of typists', color: 'text-blue-400' },
    { icon: Rocket, text: 'Improve your speed', color: 'text-purple-400' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignup && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      if (isSignup) {
        await signup(formData.email, formData.password)
      } else {
        await login(formData.email, formData.password)
      }
    } catch (err) {
      setError(isSignup ? 'Failed to create account' : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(useAuth().auth, provider)
    } catch (err) {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="w-full max-w-6xl flex gap-8 items-center relative z-10">
        {/* Left side - Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col flex-1 text-white space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              className="inline-flex items-center gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-12 h-12 text-blue-400" strokeWidth={2.5} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                KeyForge
              </h1>
            </motion.div>
            <p className="text-xl text-slate-300">
              Master the art of speed typing
            </p>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {features.map((feature, idx) =>
                idx === activeFeature ? (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <div className="p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <span className="text-lg text-slate-200">{feature.text}</span>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-8 pt-8">
            <div>
              <div className="text-3xl font-bold text-blue-400">50K+</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">1M+</div>
              <div className="text-sm text-slate-400">Tests Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">4.9★</div>
              <div className="text-sm text-slate-400">User Rating</div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-[480px]"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="w-16 h-16 text-blue-400" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              KeyForge
            </h1>
            <p className="text-slate-400">Ultimate Typing Challenge</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-50" />
            
            <div className="relative z-10">
              {/* Toggle */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50">
                  <button
                    onClick={() => setIsSignup(false)}
                    className="relative px-6 py-2.5 rounded-lg font-medium transition-all"
                  >
                    {!isSignup && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={`relative z-10 ${!isSignup ? 'text-white' : 'text-slate-400'}`}>
                      Sign In
                    </span>
                  </button>
                  <button
                    onClick={() => setIsSignup(true)}
                    className="relative px-6 py-2.5 rounded-lg font-medium transition-all"
                  >
                    {isSignup && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={`relative z-10 ${isSignup ? 'text-white' : 'text-slate-400'}`}>
                      Sign Up
                    </span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign In */}
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 py-3.5 px-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500/50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-slate-200 font-medium">Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-900 text-slate-500 font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-500 transition-all focus:bg-slate-800/50 focus:text-white"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-16 py-3.5 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-500 transition-all focus:bg-slate-800/50 focus:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </motion.div>

                {isSignup && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative group"
                  >
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-16 py-3.5 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-500 transition-all focus:bg-slate-800/50 focus:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-500 disabled:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{isSignup ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm"
              >
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Secure & encrypted</span>
              </motion.div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-slate-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login