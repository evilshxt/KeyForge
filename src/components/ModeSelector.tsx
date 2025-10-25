import React from 'react'
import { motion } from 'framer-motion'
import { FileText, PenTool, Zap } from 'lucide-react'

interface ModeSelectorProps {
  currentMode: 'normal' | 'freeform' | 'monkey'
  onModeChange: (mode: 'normal' | 'freeform' | 'monkey') => void
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    {
      id: 'normal' as const,
      name: 'Normal Mode',
      icon: FileText,
      description: 'Type a random paragraph within 60 seconds',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:border-blue-500'
    },
    {
      id: 'freeform' as const,
      name: 'Free-Form Mode',
      icon: PenTool,
      description: 'Type anything you want; accuracy checked against dictionary',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600',
      hoverColor: 'hover:border-green-500'
    },
    {
      id: 'monkey' as const,
      name: 'Monkey Mode',
      icon: Zap,
      description: 'Type random words from comprehensive English dictionary',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:border-purple-500'
    }
  ]

  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        Choose Your Challenge
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-4xl lg:max-w-5xl mx-auto">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-3 sm:p-4 lg:p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              currentMode === mode.id
                ? `border-transparent bg-gradient-to-br ${mode.color} text-white shadow-lg`
                : `${mode.bgColor} border-slate-200 dark:border-slate-700 ${mode.hoverColor} hover:shadow-md`
            }`}
            onClick={() => onModeChange(mode.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 lg:space-y-4">
              <motion.div
                className={`p-1.5 sm:p-2 lg:p-3 rounded-full ${
                  currentMode === mode.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}
                animate={{ rotate: currentMode === mode.id ? [0, 5, -5, 0] : 0 }}
                transition={{ duration: 2, repeat: currentMode === mode.id ? Infinity : 0 }}
              >
                <mode.icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${currentMode === mode.id ? 'text-white' : mode.iconColor}`} />
              </motion.div>

              <div>
                <h3 className={`text-base sm:text-lg lg:text-xl font-semibold mb-1 lg:mb-2 ${
                  currentMode === mode.id ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {mode.name}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  currentMode === mode.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {mode.description}
                </p>
              </div>

              {currentMode === mode.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-blue-600 rounded-full"></div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ModeSelector
