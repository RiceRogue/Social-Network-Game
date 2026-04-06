import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '../store/gameStore'

// Detect if running on GitHub Pages (no backend available)
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'
const IS_STATIC = import.meta.env.VITE_STATIC_MODE === 'true'

export function useSocket() {
  const socketRef = useRef(null)
  const {
    profile,
    addMessage,
    updateOtherPlayer,
    removeOtherPlayer,
    setInQueue,
    setMatchFound,
  } = useGameStore()

  useEffect(() => {
    if (!profile || IS_STATIC) return

    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
      socket.emit('player:join', {
        username: profile.username,
        headId: profile.headId,
        reputation: profile.reputation ?? 0,
      })
    })

    socket.on('connect_error', () => {
      console.warn('[Socket] Could not reach server — running in offline mode.')
      addMessage({ type: 'system', text: 'Offline mode — multiplayer unavailable.' })
      socket.disconnect()
    })

    socket.on('player:list', (players) => {
      const others = {}
      players.forEach((p) => {
        if (p.id !== socket.id) others[p.id] = p
      })
      useGameStore.getState().setOtherPlayers(others)
    })

    socket.on('player:joined', (player) => {
      if (player.id !== socket.id) {
        updateOtherPlayer(player.id, player)
        addMessage({ type: 'system', text: `${player.username} joined the network.` })
      }
    })

    socket.on('player:moved', (data) => {
      updateOtherPlayer(data.id, data)
    })

    socket.on('player:left', (id) => {
      const players = useGameStore.getState().otherPlayers
      const name = players[id]?.username ?? 'Someone'
      removeOtherPlayer(id)
      addMessage({ type: 'system', text: `${name} left the network.` })
    })

    socket.on('chat:message', (msg) => {
      addMessage(msg)
    })

    socket.on('match:found', (data) => {
      setMatchFound(true)
      setInQueue(false)
      addMessage({ type: 'system', text: `Match found! Team: ${data.team.map(p => p.username).join(', ')}` })
    })

    socket.on('queue:status', ({ count, needed }) => {
      addMessage({ type: 'system', text: `Queue: ${count}/${needed} players...` })
    })

    return () => {
      socket.disconnect()
    }
  }, [profile?.username])

  function sendMove(position, direction) {
    socketRef.current?.emit('player:move', { position, direction })
  }

  function sendChat(text) {
    if (!text.trim()) return
    if (!IS_STATIC) {
      socketRef.current?.emit('chat:message', { text })
    }
    // Always echo locally so chat feels responsive
    addMessage({
      type: 'chat',
      username: profile?.username ?? 'You',
      text,
      headId: profile?.headId,
      self: true,
    })
  }

  function joinQueue() {
    if (IS_STATIC) {
      addMessage({ type: 'system', text: 'Matchmaking requires the live server.' })
      return
    }
    socketRef.current?.emit('match:join-queue')
    setInQueue(true)
    addMessage({ type: 'system', text: 'Joined the Line War queue...' })
  }

  function leaveQueue() {
    socketRef.current?.emit('match:leave-queue')
    setInQueue(false)
  }

  return { sendMove, sendChat, joinQueue, leaveQueue }
}
