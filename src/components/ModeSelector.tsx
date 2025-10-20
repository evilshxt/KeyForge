import React from 'react'

interface ModeSelectorProps {
  currentMode: 'normal' | 'freeform' | 'monkey'
  onModeChange: (mode: 'normal' | 'freeform' | 'monkey') => void
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Choose Your Challenge</h2>
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => onModeChange('normal')}
          className={`px-4 py-2 rounded-lg ${currentMode === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Normal Mode
        </button>
        <button
          onClick={() => onModeChange('freeform')}
          className={`px-4 py-2 rounded-lg ${currentMode === 'freeform' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Free-Form Mode
        </button>
        <button
          onClick={() => onModeChange('monkey')}
          className={`px-4 py-2 rounded-lg ${currentMode === 'monkey' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Monkey Mode
        </button>
      </div>
    </div>
  )
}

export default ModeSelector
