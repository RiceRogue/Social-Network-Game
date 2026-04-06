'use strict'

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const MatchmakingQueue = require('./matchmaking')

const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  },
})

// In-memory player registry
const players = new Map()

const queue = new MatchmakingQueue(io)

io.on('connection', (socket) => {
  console.log(`[Server] Socket connected: ${socket.id}`)

  // ── Player joins hub ──────────────────────────────────────────────────────
  socket.on('player:join', (data) => {
    const player = {
      id: socket.id,
      username: data.username ?? 'Anonymous',
      headId: data.headId ?? 'belle',
      reputation: data.reputation ?? 0,
      position: [0, 0, 0],
      direction: 0,
    }
    socket.data = { ...player }
    players.set(socket.id, player)

    // Send existing players to newcomer
    socket.emit('player:list', Array.from(players.values()))

    // Broadcast newcomer to all others
    socket.broadcast.emit('player:joined', player)

    console.log(`[Server] ${player.username} joined. Total: ${players.size}`)
  })

  // ── Movement ──────────────────────────────────────────────────────────────
  socket.on('player:move', (data) => {
    const player = players.get(socket.id)
    if (!player) return
    player.position = data.position ?? player.position
    player.direction = data.direction ?? 0
    socket.broadcast.emit('player:moved', {
      id: socket.id,
      position: player.position,
      direction: player.direction,
    })
  })

  // ── Chat ──────────────────────────────────────────────────────────────────
  socket.on('chat:message', (data) => {
    const player = players.get(socket.id)
    if (!player) return
    const text = String(data.text ?? '').trim().slice(0, 200)
    if (!text) return

    const msg = {
      type: 'chat',
      username: player.username,
      headId: player.headId,
      text,
      ts: Date.now(),
    }
    // Broadcast to all including sender (server-authoritative)
    io.emit('chat:message', msg)
    console.log(`[Chat] ${player.username}: ${text}`)
  })

  // ── Matchmaking ───────────────────────────────────────────────────────────
  socket.on('match:join-queue', () => {
    queue.addPlayer(socket)
    console.log(`[Queue] ${socket.data?.username ?? socket.id} joined queue. Size: ${queue.queue.length}`)
  })

  socket.on('match:leave-queue', () => {
    queue.removePlayer(socket.id)
  })

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    players.delete(socket.id)
    queue.removePlayer(socket.id)
    io.emit('player:left', socket.id)
    console.log(`[Server] ${socket.data?.username ?? socket.id} disconnected. Total: ${players.size}`)
  })
})

server.listen(PORT, () => {
  console.log(`[Social Network Server] Listening on http://localhost:${PORT}`)
  console.log(`[Social Network Server] Ready for connections`)
})
