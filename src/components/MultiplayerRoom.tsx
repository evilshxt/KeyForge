import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ref, set, onValue, off, update, remove, child } from 'firebase/database'
import { rtdb } from '../firebase'
import { motion } from 'framer-motion'
import { Users, ArrowRight, Trophy, Zap, User, Hash, Crown, Play, CheckCircle, XCircle, Timer } from 'lucide-react'
import TypingBox from './TypingBox'

interface Player {
  uid: string
  name: string
  ready: boolean
  wpm?: number
  accuracy?: number
  completed: boolean
}

interface RoomData {
  roomId: string
  players: { [uid: string]: Player }
  status: 'waiting' | 'countdown' | 'active' | 'finished'
  countdown: number
  mode: 'normal' | 'freeform' | 'monkey'
  winner?: string
  createdAt: number
}

const MultiplayerRoom: React.FC = () => {
  const { currentUser } = useAuth()
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setPlayerName(currentUser.displayName || currentUser.email || 'Anonymous')
    }
    return () => {
      // Cleanup listeners on unmount
      if (roomData) {
        const roomRef = ref(rtdb, `rooms/${roomData.roomId}`)
        off(roomRef)
      }
    }
  }, [currentUser, roomData])

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async () => {
    if (!currentUser || !playerName) return

    try {
      const code = generateRoomCode()
      const roomRef = ref(rtdb, `rooms/${code}`)
      const roomData: RoomData = {
        roomId: code,
        players: {
          [currentUser.uid]: { uid: currentUser.uid, name: playerName, ready: false, completed: false }
        },
        status: 'waiting',
        countdown: 0,
        mode: 'normal',
        createdAt: Date.now()
      }
      await set(roomRef, roomData)
      setRoomData(roomData)
      setIsHost(true)
      setRoomCode(code)

      // Listen for changes
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setRoomData(data)
        }
      })
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room')
    }
  }

  const joinRoom = async () => {
    if (!currentUser || !playerName || !roomCode) return

    try {
      const roomRef = ref(rtdb, `rooms/${roomCode}`)
      const snapshot = await new Promise<any>((resolve) => {
        onValue(roomRef, (snapshot) => resolve(snapshot), { onlyOnce: true })
      })
      const data = snapshot.val()
      if (data) {
        const updatedPlayers = { ...data.players, [currentUser.uid]: { uid: currentUser.uid, name: playerName, ready: false, completed: false } }
        await update(roomRef, { players: updatedPlayers })
        setRoomData({ ...data, players: updatedPlayers })
        setIsHost(false)

        // Listen for changes
        onValue(roomRef, (snapshot) => {
          const updatedData = snapshot.val()
          if (updatedData) {
            setRoomData(updatedData)
          }
        })
      } else {
        alert('Room not found')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to join room')
    }
  }

  const toggleReady = async () => {
    if (!roomData || !currentUser) return

    try {
      const roomRef = ref(rtdb, `rooms/${roomData.roomId}`)
      await update(roomRef, {
        [`players/${currentUser.uid}/ready`]: !isReady
      })
      setIsReady(!isReady)
    } catch (error) {
      console.error('Error toggling ready:', error)
    }
  }

  const startGame = () => {
    if (!roomData || !isHost) return

    const roomRef = ref(rtdb, `rooms/${roomData.roomId}`)
    update(roomRef, { status: 'countdown', countdown: 5 }).catch(console.error)

    // Countdown logic (client-side for UI, but synced via DB)
    const countdownInterval = setInterval(() => {
      if (roomData.countdown > 0) {
        update(roomRef, { countdown: roomData.countdown - 1 }).catch(console.error)
      } else {
        clearInterval(countdownInterval)
        update(roomRef, { status: 'active', countdown: 0 }).catch(console.error)
      }
    }, 1000)
  }

  const handleTestComplete = async (stats: { wpm: number, accuracy: number, timeLeft: number }) => {
    if (!roomData || !currentUser) return

    try {
      const roomRef = ref(rtdb, `rooms/${roomData.roomId}`)
      await update(roomRef, {
        [`players/${currentUser.uid}/wpm`]: stats.wpm,
        [`players/${currentUser.uid}/accuracy`]: stats.accuracy,
        [`players/${currentUser.uid}/completed`]: true
      })

      // Check if all players completed
      const allCompleted = Object.values(roomData.players).every(p => p.completed)
      if (allCompleted) {
        // Determine winner
        const players = Object.values(roomData.players)
        const winner = players.reduce((prev, current) => (prev.wpm || 0) > (current.wpm || 0) ? prev : current)
        await update(roomRef, { status: 'finished', winner: winner.uid })
      }
    } catch (error) {
      console.error('Error updating test results:', error)
    }
  }

  const leaveRoom = async () => {
    if (!roomData || !currentUser) return

    try {
      const roomRef = ref(rtdb, `rooms/${roomData.roomId}`)
      await remove(child(roomRef, `players/${currentUser.uid}`))

      // If no players left, delete room
      const remainingPlayers = Object.keys(roomData.players).filter(uid => uid !== currentUser.uid)
      if (remainingPlayers.length === 0) {
        await remove(roomRef)
      }

      setRoomData(null)
      setRoomCode('')
      setIsHost(false)
      setIsReady(false)
      off(roomRef)
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  if (!currentUser) {
    return <div>Please log in to access multiplayer mode.</div>
  }

  if (!roomData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center"
      >
        <div className="flex flex-col lg:flex-row max-w-6xl w-full p-6 gap-8">
          {/* Left Side: Motivational Content */}
          <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                  Challenge Your Friends!
                </h2>
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-yellow-500/20 rounded-full blur-lg"></div>
              </div>
              <div className="space-y-4 text-lg text-slate-300 mb-6">
                <p className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Test your typing skills against friends in real-time battles!
                </p>
                <p className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  Create a room, share the code, and prove your speed!
                </p>
                <p className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  Epic typing showdowns with accuracy tracking!
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative w-full h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
                <div className="relative text-center z-10">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
                  </motion.div>
                  <p className="text-xl font-semibold text-slate-300 mb-2">Ready to type?</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-slate-700/50"
            >
              <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                Multiplayer Typing Room
              </h1>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="mb-6">
                <button
                  onClick={createRoom}
                  className="w-full p-3 mb-3 border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Crown className="w-4 h-4" />
                  Create Room
                </button>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full p-3 pl-10 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Room Code"
                      maxLength={6}
                    />
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    onClick={joinRoom}
                    className="p-3 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Join
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  const players = Object.values(roomData.players)
  const allReady = players.every(p => p.ready) && players.length >= 2
  const isGameActive = roomData.status === 'active'
  const isFinished = roomData.status === 'finished'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-8 p-4 bg-slate-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Room: {roomData.roomId}
            </h1>
          </div>
          <button
            onClick={leaveRoom}
            className="px-6 py-3 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Leave Room
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="bg-slate-800/50 p-6 rounded-xl backdrop-blur-sm border border-slate-700/50">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Players ({players.length}/4)
            </h2>
            <div className="space-y-3">
              {players.map(player => (
                <div key={player.uid} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.name} {player.uid === currentUser.uid ? '(You)' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.ready && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {isFinished && player.uid === roomData.winner && <Trophy className="w-4 h-4 text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {!isReady && (
                <button
                  onClick={toggleReady}
                  className="w-full p-3 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Ready
                </button>
              )}
              {isReady && (
                <button
                  onClick={toggleReady}
                  className="w-full p-3 border-2 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Not Ready
                </button>
              )}
              {isHost && allReady && (
                <button
                  onClick={startGame}
                  className="w-full p-3 border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Play className="w-4 h-4" />
                  Start Game
                </button>
              )}
            </div>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-2">
            {roomData.status === 'waiting' && (
              <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Timer className="w-6 h-6 text-blue-400 animate-spin" />
                  <h2 className="text-2xl font-semibold">Waiting for players...</h2>
                </div>
                <p className="text-slate-300">Share the room code: <strong className="text-blue-400 font-mono text-lg">{roomData.roomId}</strong></p>
              </div>
            )}

            {roomData.status === 'countdown' && (
              <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <h2 className="text-2xl mb-6 font-semibold">Get Ready!</h2>
                <div className="relative">
                  <div className="text-8xl font-bold text-yellow-400 animate-pulse">{roomData.countdown}</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl"></div>
                </div>
              </div>
            )}

            {isGameActive && (
              <TypingBox mode={roomData.mode} onComplete={handleTestComplete} />
            )}

            {isFinished && (
              <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="mb-6">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Game Finished!</h2>
                </div>
                {roomData.winner && (
                  <p className="text-xl mb-6">
                    Winner: <span className="text-yellow-400 font-semibold">{roomData.players[roomData.winner]?.name}</span> with {roomData.players[roomData.winner]?.wpm} WPM!
                  </p>
                )}
                <div className="space-y-3">
                  {players.map(player => (
                    <div key={player.uid} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="font-mono text-lg">{player.wpm} WPM, {player.accuracy}% Accuracy</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scoreboard */}
          <div className="bg-slate-800/50 p-6 rounded-xl backdrop-blur-sm border border-slate-700/50">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Scoreboard
            </h2>
            <div className="space-y-3">
              {players
                .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
                .map((player, index) => (
                  <div key={player.uid} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="font-mono text-lg">{player.wpm || 0} WPM</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MultiplayerRoom
