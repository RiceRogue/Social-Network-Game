import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '../store/gameStore'

let socketInstance = null

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
    if (!profile) return

    const socket = io('http://localhost:3001', { autoConnect: true })
    socketRef.current = socket
    socketInstance = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
      socket.emit('player:join', {
        username: profile.username,
        headId: profile.headId,
        reputation: profile.reputation ?? 0,
      })
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
        addMessage({ type: 'system', text: `${player.username} joined the hub.` })
      }
    })

    socket.on('player:moved', (data) => {
      updateOtherPlayer(data.id, data)
    })

    socket.on('player:left', (id) => {
      const players = useGameStore.getState().otherPlayers
      const name = players[id]?.username ?? 'Someone'
      removeOtherPlayer(id)
      addMessage({ type: 'system', text: `${name} left the hub.` })
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
      socketInstance = null
    }
  }, [profile?.username])

  function sendMove(position, direction) {
    socketRef.current?.emit('player:move', { position, direction })
  }

  function sendChat(text) {
    if (!text.trim()) return
    socketRef.current?.emit('chat:message', { text })
    addMessage({
      type: 'chat',
      username: profile?.username ?? 'You',
      text,
      headId: profile?.headId,
      self: true,
    })
  }

  function joinQueue() {
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
