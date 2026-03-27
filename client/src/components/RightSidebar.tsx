import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  sendMessage as sendChatMessage,
  getChatHistory,
  clearChatHistory,
} from '../lib/chatApi';

interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  createdAt: Date;
}

const SUGGESTIONS = [
  'Summarize my recent notes',
  'What did I save about React?',
  'Find action items from meetings',
  'Draft an email based on my docs',
];

const AssistantAvatar = () => (
  <div className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 mt-1 shadow-sm">
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  </div>
);

function RightSidebar() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    getChatHistory()
      .then(({ messages: history, conversationId: cid }) => {
        if (history && history.length > 0) {
          setMessages(
            history.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
              createdAt: new Date(m.createdAt),
            }))
          );
        }
        if (cid) setConversationId(cid);
      })
      .catch(() => {
        // silently ignore history load errors
      });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const savedInput = input;
    const userMessage: ChatMessage = {
      role: 'user',
      content: savedInput,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { reply, conversationId: cid } = await sendChatMessage(savedInput);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, createdAt: new Date() },
      ]);
      setConversationId(cid);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: message, createdAt: new Date() },
      ]);
      setInput(savedInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    setMessages([]);
  };

  return (
    <aside className="w-full flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-none lg:rounded-3xl shadow-2xl overflow-hidden relative">
      {/* ── Background Elements ─────────────────────────────── */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col p-6 pb-2 relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 shadow-md">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Neura AI
            </h2>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors duration-150 cursor-pointer"
            >
              Clear chat
            </button>
          )}
        </div>
        <p className="text-xs font-medium text-slate-400">
          Ask questions about your memories
        </p>
      </div>

      {/* ── Chat Messages Area ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 relative z-10 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {/* Welcome message */}
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-200 leading-relaxed">
              Hi! I'm your Neura assistant. I have access to all your saved
              text, links, and documents. What would you like to know?
            </p>
          </div>
        </div>

        {/* Suggestion chips — hidden once conversation starts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pl-10">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(suggestion)}
                className="text-xs font-medium text-sky-300 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-900/50 rounded-full px-3 py-1.5 transition-colors duration-150 cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] bg-gradient-to-br from-violet-500 to-sky-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          }

          if (msg.role === 'error') {
            return (
              <div key={i} className="flex items-start gap-3">
                <AssistantAvatar />
                <div className="max-w-[80%] bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          }

          // assistant
          return (
            <div key={i} className="flex items-start gap-3">
              <AssistantAvatar />
              <div className="max-w-[80%] bg-neutral-800 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div className="bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Chat Input ──────────────────────────────────────── */}
      <div className="p-4 bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800 relative z-10 shrink-0">
        <div className="relative flex items-end gap-2 bg-neutral-800/50 border border-neutral-700 focus-within:border-sky-500 rounded-2xl px-3 py-2.5 transition-colors duration-200 shadow-inner">
          {/* Attachment button (reserved) */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-neutral-700 transition shrink-0 cursor-pointer">
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
            placeholder="Message Neura AI..."
            className="flex-1 max-h-32 min-h-[24px] bg-transparent text-sm text-white placeholder:text-slate-500 outline-none resize-none pt-1"
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            title="Send"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg hover:shadow-sky-500/25 transition shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19V5M12 5l-6 6M12 5l6 6"
              />
            </svg>
          </button>
        </div>
        <div className="text-center mt-2 pb-1">
          <span className="text-[10px] text-slate-500">
            Neura AI can make mistakes. Verify important info.
          </span>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
