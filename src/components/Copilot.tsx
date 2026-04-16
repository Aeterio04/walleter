import { useState, useRef, useEffect } from 'react'
import { sendCopilotMessage } from '../lib/api'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  actions?: { label: string; type: string; data?: any }[]
}

export default function Copilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'WALLETER CO-PILOT INITIALIZED. I can help you track expenses, manage budgets, and analyze spending patterns. I do not provide investment advice.',
      timestamp: new Date(),
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      // Call the real API
      const response = await sendCopilotMessage(userInput)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response.message,
        timestamp: new Date(),
        actions: response.response.actions || []
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠ ERROR: ${error instanceof Error ? error.message : 'Failed to process request'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAction = (action: { label: string; type: string; data?: any }) => {
    if (action.type === 'navigate' && action.data) {
      navigate(action.data)
      setIsOpen(false)
    } else if (action.type === 'help') {
      setInput('help')
      handleSend()
    } else {
      // Show confirmation
      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `ACTION QUEUED: ${action.label}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, confirmMsg])
    }
  }

  const messageCount = messages.filter(m => m.role !== 'system').length

  return (
    <>
      {/* Vertical Pill Trigger — hugs right edge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`copilot-trigger ${isOpen ? 'active' : ''}`}
        title="Open Co-Pilot"
      >
        {isOpen ? '✕' : '⚡ CO-PILOT'}
      </button>

      {/* Co-pilot Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-[199] w-[440px] h-[85vh] max-h-[700px] bg-background border-l border-t border-muted/30 flex flex-col copilot-panel">
          {/* Header */}
          <div className="border-b border-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg text-primary uppercase tracking-tight">CO-PILOT</h3>
                {messageCount > 0 && (
                  <span className="text-[9px] text-muted bg-surface px-2 py-0.5 border border-muted/30 mono-number">
                    {messageCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary animate-blink"></div>
                <span className="text-[9px] text-muted uppercase tracking-[0.15em]">ACTIVE</span>
              </div>
            </div>
            <p className="text-[9px] text-muted/60 uppercase tracking-[0.15em]">
              SYS.AI // EXPENSE MANAGEMENT ASSISTANT
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.role === 'user' ? 'ml-8' : 'mr-4'}`}>
                {/* Message Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] uppercase tracking-[0.15em] ${
                    msg.role === 'assistant' ? 'text-primary' : 'text-muted'
                  }`}>
                    {msg.role === 'user' ? 'YOU' : msg.role === 'system' ? 'SYS' : 'CO-PILOT'}
                  </span>
                  <span className="text-[8px] text-muted/40 mono-number">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Content — with left accent border */}
                <div className={`p-3 border border-muted/20 ${
                  msg.role === 'user' 
                    ? 'copilot-msg-user bg-surface/50' 
                    : msg.role === 'system'
                    ? 'copilot-msg-system'
                    : 'copilot-msg-assistant bg-surface/30'
                }`}>
                  <p className="text-sm text-text/90 font-sans leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-muted/20 flex flex-wrap gap-2">
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action)}
                          className="text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border border-primary/40 text-primary hover:bg-primary hover:text-background transition-none font-bold"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] text-primary uppercase tracking-[0.15em]">CO-PILOT</span>
                </div>
                <div className="p-3 border border-muted/20 copilot-msg-assistant bg-surface/30">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary animate-blink"></div>
                    <div className="w-1.5 h-1.5 bg-primary animate-blink" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary animate-blink" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — terminal prompt style */}
          <div className="border-t border-muted/30 p-4">
            <div className="flex gap-2 items-center">
              <span className="text-primary text-sm font-bold select-none">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="TYPE COMMAND..."
                className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-text placeholder:text-muted/40 focus:outline-none font-sans uppercase tracking-[0.05em]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-primary text-background px-4 py-2 hover:bg-text hover:text-background transition-none font-bold text-xs uppercase tracking-[0.1em] disabled:opacity-20 disabled:cursor-not-allowed"
              >
                SEND
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-[8px] text-muted/40 uppercase tracking-[0.12em]">
                ENTER TO SEND • NO INVESTMENT ADVICE PROVIDED
              </p>
              <p className="text-[8px] text-muted/30 uppercase tracking-[0.1em] mono-number">
                {messages.length} MSG
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
