"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseBrowserClient, type ChatMessage } from "@/lib/supabase";

const USERNAME_COLORS = [
  "#00E5FF", "#FF2D55", "#FFD600", "#00E676", "#FF6D00",
  "#AA00FF", "#00B0FF", "#FF4081", "#76FF03", "#FFAB40",
];

function colorFromUsername(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USERNAME_COLORS[Math.abs(hash) % USERNAME_COLORS.length];
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function generateGuestName(): string {
  return `Listener${Math.floor(1000 + Math.random() * 9000)}`;
}

const RATE_LIMIT_MS = 3000;
const MAX_MESSAGES = 100;

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [lastSent, setLastSent] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseBrowserClient();

  // Load username from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("nr1_chat_username");
    if (stored) {
      setUsername(stored);
    } else {
      const generated = generateGuestName();
      localStorage.setItem("nr1_chat_username", generated);
      setUsername(generated);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Load recent messages + subscribe to realtime
  useEffect(() => {
    db
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(MAX_MESSAGES)
      .then(({ data }: { data: ChatMessage[] | null }) => {
        if (data) setMessages(data);
      });

    const channel = db
      .channel("chat_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload: { new: ChatMessage }) => {
          setMessages((prev) => {
            const updated = [...prev, payload.new];
            return updated.slice(-MAX_MESSAGES);
          });
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !username) return;

    const now = Date.now();
    if (now - lastSent < RATE_LIMIT_MS) {
      const secs = Math.ceil((RATE_LIMIT_MS - (now - lastSent)) / 1000);
      setError(`Wait ${secs}s before sending again`);
      setTimeout(() => setError(null), 2000);
      return;
    }

    setSending(true);
    setError(null);

    const { error: insertError } = await db.from("chat_messages").insert({
      username,
      message: trimmed,
      color: colorFromUsername(username),
    });

    setSending(false);
    if (insertError) {
      setError("Failed to send — try again");
    } else {
      setInput("");
      setLastSent(Date.now());
    }
  }, [input, username, lastSent, supabase]);

  const saveName = () => {
    const trimmed = nameInput.trim().slice(0, 20);
    if (!trimmed) return;
    localStorage.setItem("nr1_chat_username", trimmed);
    setUsername(trimmed);
    setEditingName(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-nr1-grey/40 overflow-hidden flex flex-col h-72 sm:h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-nr1-cyan animate-pulse" />
          <p className="font-mono text-xs text-nr1-cyan uppercase tracking-widest">Live Chat</p>
        </div>
        {!editingName ? (
          <button
            onClick={() => { setNameInput(username); setEditingName(true); }}
            className="font-mono text-xs text-nr1-muted hover:text-nr1-cyan transition-colors"
            title="Change your name"
          >
            {username} <span className="text-white/30">✎</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              className="bg-nr1-black border border-nr1-cyan/40 rounded px-2 py-0.5 font-mono text-xs text-white w-28 focus:outline-none focus:border-nr1-cyan"
              autoFocus
              maxLength={20}
            />
            <button
              onClick={saveName}
              className="font-mono text-xs text-nr1-cyan hover:underline"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0"
      >
        {messages.length === 0 && (
          <p className="font-mono text-xs text-nr1-muted text-center pt-10">
            No messages yet — be the first!
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-baseline">
            <span className="font-mono text-[10px] text-nr1-muted shrink-0 w-9">
              {formatTime(msg.created_at)}
            </span>
            <span
              className="font-mono text-xs font-bold shrink-0"
              style={{ color: msg.color }}
            >
              {msg.username}:
            </span>
            <span className="font-mono text-xs text-white/80 break-all leading-relaxed">
              {msg.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-3 py-2.5 shrink-0">
        {error && (
          <p className="font-mono text-xs text-nr1-crimson mb-1.5">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Say something..."
            className="flex-1 bg-nr1-black border border-white/10 rounded px-3 py-1.5 font-mono text-xs text-white placeholder-nr1-muted focus:outline-none focus:border-nr1-cyan/60 transition-colors"
            maxLength={200}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="px-3 py-1.5 bg-nr1-cyan/20 border border-nr1-cyan/40 rounded font-mono text-xs text-nr1-cyan hover:bg-nr1-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
        <p className="font-mono text-[10px] text-nr1-muted mt-1 text-right">
          {input.length}/200
        </p>
      </div>
    </div>
  );
}
