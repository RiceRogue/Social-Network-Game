'use strict'

const { createBot } = require('./botAI')

const TEAM_SIZE = 4       // 4v4
const QUEUE_TIMEOUT = 15000  // 15 seconds before bot backfill

class MatchmakingQueue {
  constructor(io) {
    this.io = io
    this.queue = []
    this.fillTimer = null
    this.matchCount = 0
  }

  addPlayer(socket) {
    if (this.queue.find((p) => p.id === socket.id)) return
    this.queue.push({
      id: socket.id,
      username: socket.data.username,
      headId: socket.data.headId,
      reputation: socket.data.reputation ?? 0,
      isBot: false,
    })
    this._broadcast()

    // Start fill timer if not already running
    if (!this.fillTimer) {
      this.fillTimer = setTimeout(() => this._botBackfill(), QUEUE_TIMEOUT)
    }

    // Check if we have enough for a match
    if (this.queue.length >= TEAM_SIZE * 2) {
      this._formMatch()
    }
  }

  removePlayer(socketId) {
    this.queue = this.queue.filter((p) => p.id !== socketId)
    if (this.queue.length === 0 && this.fillTimer) {
      clearTimeout(this.fillTimer)
      this.fillTimer = null
    }
    this._broadcast()
  }

  _broadcast() {
    const needed = TEAM_SIZE * 2
    this.queue
      .filter((p) => !p.isBot)
      .forEach((p) => {
        this.io.to(p.id).emit('queue:status', {
          count: this.queue.length,
          needed,
        })
      })
  }

  _botBackfill() {
    this.fillTimer = null
    const needed = TEAM_SIZE * 2
    const deficit = needed - this.queue.length

    console.log(`[Matchmaking] Backfilling ${deficit} bots...`)

    for (let i = 0; i < deficit; i++) {
      const archetype = i % 3 === 0 ? 'support' : 'ego'
      this.queue.push(createBot(archetype))
    }

    this._formMatch()
  }

  _formMatch() {
    if (this.queue.length < TEAM_SIZE * 2) return

    clearTimeout(this.fillTimer)
    this.fillTimer = null

    const players = this.queue.splice(0, TEAM_SIZE * 2)
    const teamA = players.slice(0, TEAM_SIZE)
    const teamB = players.slice(TEAM_SIZE)

    this.matchCount++
    const matchId = `match_${this.matchCount}`

    console.log(`[Matchmaking] Match formed: ${matchId}`)
    console.log(`  Team A: ${teamA.map((p) => p.username).join(', ')}`)
    console.log(`  Team B: ${teamB.map((p) => p.username).join(', ')}`)

    // Notify real players on each team
    ;[teamA, teamB].forEach((team, idx) => {
      team
        .filter((p) => !p.isBot)
        .forEach((p) => {
          this.io.to(p.id).emit('match:found', {
            matchId,
            team,
            opponent: idx === 0 ? teamB : teamA,
          })
        })
    })
  }
}

module.exports = MatchmakingQueue
