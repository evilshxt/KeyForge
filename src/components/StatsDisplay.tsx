import React from 'react'

interface StatsDisplayProps {
  stats: { wpm: number, accuracy: number, timeLeft: number }
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Your Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.wpm}</div>
          <div>WPM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</div>
          <div>Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{60 - stats.timeLeft}s</div>
          <div>Time</div>
        </div>
      </div>
    </div>
  )
}

export default StatsDisplay
