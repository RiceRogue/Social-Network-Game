import { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSocket } from '../hooks/useSocket'

export default function ChatBox() {
  const messages = useGameStore((s) => s.messages)
  const inQueue = useGameStore((s) => s.inQueue)
  const { sendChat, joinQueue, leaveQueue } = useSocket()
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  const HEAD_COLORS = {
    belle: '#FF6B9D', chris: '#6B8EFF', cookie: '#FFB347',
    max: '#7CFC00', nova: '#DA70D6', reed: '#40E0D0',
    sage: '#98FB98', zara: '#FF7F50',
  }

  return (
    <div className="absolute bottom-4 left-4 w-80 z-20">
      {/* Toggle */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {open ? '▼ Chat' : '▲ Chat'}
        </button>
        <button
          onClick={inQueue ? leaveQueue : joinQueue}
          className={`text-xs px-3 py-1 rounded-full border transition-all
            ${inQueue
              ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
              : 'border-cyan-600 text-cyan-400 hover:bg-cyan-500/10'}`}
        >
          {inQueue ? '⏳ In Queue' : '⚔ Line War'}
        </button>
      </div>

      {open && (
        <div className="bg-black/70 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="chat-box h-40 overflow-y-auto p-3 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">No messages yet...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-1.5">
                {msg.type === 'system' ? (
                  <p className="text-slate-500 text-xs italic w-full">{msg.text}</p>
                ) : (
                  <>
                    <span
                      className="text-xs font-bold shrink-0 mt-0.5"
                      style={{ color: HEAD_COLORS[msg.headId] ?? '#00FFFF' }}
                    >
                      {msg.username}:
                    </span>
                    <span className="text-white text-xs break-all">{msg.text}</span>
                  </>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700/50 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Say something..."
              maxLength={200}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-600
                         focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="px-3 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
