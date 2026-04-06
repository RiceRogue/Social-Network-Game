'use strict'

/**
 * Bot AI Archetypes for The Line minigame.
 *
 * Bot-A (Ego Vanguard): Aggressively nudges, high ego inflation bias.
 * Bot-B (Support Catalyst): Prioritizes Transferring Momentum to furthest-forward player.
 */

let _botIdCounter = 0

function makeBotId() {
  return `bot_${++_botIdCounter}_${Date.now()}`
}

const BOT_NAMES_EGO = [
  'EgoBot-X', 'NudgeForce', 'Vanguard-1', 'PressureBot', 'InflatR',
]
const BOT_NAMES_SUPPORT = [
  'AnchorBot', 'CatalystUnit', 'SupportDrone', 'MomentumPass', 'BacklineBot',
]

/**
 * @param {'ego'|'support'} archetype
 * @returns {object} bot player object
 */
function createBot(archetype) {
  const id = makeBotId()
  const isEgo = archetype === 'ego'
  const names = isEgo ? BOT_NAMES_EGO : BOT_NAMES_SUPPORT
  const username = names[Math.floor(Math.random() * names.length)] + `#${Math.floor(Math.random() * 99)}`

  return {
    id,
    username,
    isBot: true,
    archetype,
    headId: isEgo ? 'zara' : 'sage',
    reputation: isEgo ? Math.floor(Math.random() * 500 + 200) : Math.floor(Math.random() * 300 + 100),
    position: [
      (Math.random() - 0.5) * 8,
      0,
      (Math.random() - 0.5) * 4,
    ],
    // Bot state for The Line game
    linePosition: isEgo ? Math.random() * 0.4 + 0.3 : Math.random() * 0.3,
    egoInflation: isEgo ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
    nudgePower: isEgo ? 0.6 + Math.random() * 0.4 : 0.1 + Math.random() * 0.2,
    momentumTransfer: isEgo ? 0.1 : 0.6 + Math.random() * 0.4,
  }
}

/**
 * Bot tick — called each game loop iteration.
 * Returns actions the bot wants to take this tick.
 *
 * @param {object} bot
 * @param {object[]} teammates - other players on the same team
 * @param {object[]} opponents - opposing team players
 * @returns {object} actions
 */
function tickBot(bot, teammates, opponents) {
  if (bot.archetype === 'ego') {
    return tickEgoVanguard(bot, teammates, opponents)
  } else {
    return tickSupportCatalyst(bot, teammates, opponents)
  }
}

function tickEgoVanguard(bot, teammates, opponents) {
  // Ego Vanguard: push forward aggressively, nudge opponents
  const nearestOpponent = opponents.reduce((closest, opp) => {
    if (!closest) return opp
    const distA = Math.abs(opp.linePosition - bot.linePosition)
    const distB = Math.abs(closest.linePosition - bot.linePosition)
    return distA < distB ? opp : closest
  }, null)

  return {
    move: 'advance',
    nudgeTarget: nearestOpponent?.id ?? null,
    nudgePower: bot.nudgePower,
    egoInflation: bot.egoInflation,
    transferMomentum: null,
  }
}

function tickSupportCatalyst(bot, teammates, opponents) {
  // Support Catalyst: find the furthest-forward teammate and transfer momentum
  const furthestMate = teammates.reduce((best, mate) => {
    if (!best) return mate
    return mate.linePosition > best.linePosition ? mate : best
  }, null)

  return {
    move: 'hold',
    nudgeTarget: null,
    nudgePower: bot.nudgePower,
    egoInflation: bot.egoInflation,
    transferMomentum: furthestMate?.id ?? null,
    transferAmount: bot.momentumTransfer,
  }
}

module.exports = { createBot, tickBot }
