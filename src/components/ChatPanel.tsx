'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string; content: string; createdAt: string
  sender: { id: string; username: string }
}

interface ChatPanelProps {
  orderId: string
  currentUserId: string
}

export function ChatPanel({ orderId, currentUserId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
  }

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMsg }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setNewMsg('')
      }
    } catch {} finally { setSending(false) }
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium">💬 聊天</div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-gray-400 text-sm text-center">暂无消息</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender.id === currentUserId ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400 mb-1">{m.sender.username} · {new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] ${m.sender.id === currentUserId ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..." className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSend} disabled={sending || !newMsg.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">发送</button>
      </div>
    </div>
  )
}
