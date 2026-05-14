"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Plane,
  Hotel,
  Map,
  TrendingDown,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  { icon: Plane, text: "¿Cuándo comprar vuelos baratos?" },
  { icon: Hotel, text: "Recomiéndame un destino económico" },
  { icon: TrendingDown, text: "¿Cómo predice los precios la IA?" },
  { icon: Map, text: "Necesito consejos de viaje a Europa" },
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! Soy **SkyBot** 🤖✈️, tu asistente de viajes con inteligencia artificial.\n\nPuedo ayudarte a:\n• Encontrar los mejores vuelos y hoteles\n• Explicarte cuándo es mejor comprar\n• Recomendar destinos según tu presupuesto\n• Responder cualquier duda de viaje\n\n¿En qué puedo ayudarte hoy?",
  timestamp: new Date(),
};

function formatMessage(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/•/g, "•");
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasNewMessage(false);
    }
  }, [messages, isOpen]);

  // Show notification dot after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasNewMessage(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: { page: "flight-search" },
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Lo siento, hubo un error al conectar. Por favor intenta nuevamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        id="chatbot-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #3d7eff 0%, #7c3aed 100%)",
          boxShadow: "0 0 30px rgba(61, 126, 255, 0.4)",
        }}
      >
        <MessageCircle size={24} className="text-white" />
        {hasNewMessage && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
          >
            1
          </motion.span>
        )}
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-400" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] glass-bright rounded-2xl border border-blue-500/20 shadow-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(61, 126, 255, 0.1)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b border-blue-500/10"
              style={{ background: "linear-gradient(90deg, rgba(61,126,255,0.1), rgba(124,58,237,0.1))" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white text-sm">SkyBot</p>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <Sparkles size={9} className="text-purple-400" />
                      <span className="text-xs text-purple-400">IA</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-400">En línea · Responde al instante</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600"
                          : "bg-gradient-to-br from-slate-600 to-slate-700"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Bot size={14} />
                      ) : (
                        <User size={14} />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "glass border border-blue-500/10 text-slate-200 rounded-tl-sm"
                          : "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        className="[&_strong]:text-white [&_strong]:font-semibold"
                      />
                      <p className={`text-xs mt-1 ${msg.role === "assistant" ? "text-slate-500" : "text-blue-200"}`}>
                        {msg.timestamp.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="glass border border-blue-500/10 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick suggestions (only at start) */}
              {messages.length === 1 && !isTyping && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
                    <button
                      key={text}
                      onClick={() => sendMessage(text)}
                      className="flex items-start gap-2 p-2.5 rounded-xl glass border border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group"
                    >
                      <Icon size={14} className="text-blue-400 mt-0.5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-xs text-slate-300 leading-tight">{text}</span>
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-blue-500/10">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  className="input-field text-sm py-2.5 flex-1"
                  disabled={isTyping}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #3d7eff, #7c3aed)" }}
                >
                  <Send size={16} className="text-white" />
                </motion.button>
              </div>
              <p className="text-xs text-slate-600 text-center mt-2">
                Powered by OpenAI GPT-4o mini · SkyAI 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
