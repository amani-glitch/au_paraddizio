"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Send,
  Bot,
  User,
  ShoppingCart,
  CreditCard,
  Banknote,
  ExternalLink,
  Loader2,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useVoice } from "@/lib/use-voice";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  orderData?: OrderData | null;
}

interface OrderData {
  items: { name: string; size: string; quantity: number; unitPrice: number; totalPrice: number }[];
  customerName: string;
  customerPhone: string;
  mode: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  address?: string;
  total: number;
}

const WELCOME_MESSAGE = `Bonjour et bienvenue chez Au Paradizzio ! Je suis votre assistant de commande.

Je peux vous aider a :
- Consulter notre menu et nos prix
- Passer une commande
- Vous recommander nos meilleures pizzas
- Repondre a vos questions sur nos services

Que souhaitez-vous aujourd'hui ? Vous pouvez me parler en activant le micro !`;

const QUICK_ACTIONS = [
  { label: "Voir le menu", message: "Montrez-moi le menu des pizzas", icon: "pizza" },
  { label: "Commander une pizza", message: "Je voudrais commander une pizza", icon: "order" },
  { label: "Nos best-sellers", message: "Quelles sont vos meilleures pizzas ?", icon: "star" },
  { label: "Horaires", message: "Quels sont vos horaires d'ouverture ?", icon: "clock" },
  { label: "Livraison", message: "Est-ce que vous livrez dans ma zone ?", icon: "delivery" },
];

const QUICK_ACTION_ICONS: Record<string, string> = {
  pizza: "\uD83C\uDF55",
  order: "\uD83D\uDED2",
  star: "\u2B50",
  clock: "\uD83D\uDD52",
  delivery: "\uD83D\uDE97",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B3A2A] to-[#8B5A3A] text-white shadow-md">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white px-5 py-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" style={{ animationDelay: "0ms" }} />
          <span className="typing-dot" style={{ animationDelay: "150ms" }} />
          <span className="typing-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function WaveformAnimation() {
  return (
    <div className="flex items-center gap-1.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-white"
          style={{
            height: "20px",
            animation: `waveform 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function ConversationOverlay({
  conversationMode,
  messages,
  stopConversation,
}: {
  conversationMode: string;
  messages: Message[];
  stopConversation: () => void;
}) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0f0a] via-[#2a1a12] to-[#0a0505]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #C41E24 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F5A623 0%, transparent 50%)" }} />

      {/* Status label */}
      <div className="relative mb-10 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-white/40">
          Au Paradizzio
        </p>
        <p className="mt-1 text-sm text-white/30">Conversation vocale</p>
      </div>

      {/* Main animated orb */}
      <div className="relative flex flex-col items-center gap-8">
        {conversationMode === "listening" && (
          <>
            {/* Ripple rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full border border-[#C41E24]/20 animate-[ripple_2s_ease-out_infinite]" />
              <div className="absolute h-40 w-40 rounded-full border border-[#C41E24]/30 animate-[ripple_2s_ease-out_infinite_0.4s]" />
              <div className="absolute h-32 w-32 rounded-full border border-[#C41E24]/40 animate-[ripple_2s_ease-out_infinite_0.8s]" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#C41E24] to-[#e63946] text-white shadow-2xl shadow-[#C41E24]/40">
                <Mic className="h-12 w-12" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white">Je vous ecoute...</p>
              <p className="mt-1 text-sm text-white/40">Parlez naturellement</p>
            </div>
          </>
        )}

        {conversationMode === "thinking" && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full bg-[#F5A623]/10 animate-pulse" />
              <div className="absolute h-32 w-32 rounded-full bg-[#F5A623]/5 animate-[pulse_1.5s_ease-in-out_infinite_0.3s]" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623] to-[#e09520] text-white shadow-2xl shadow-[#F5A623]/40">
                <div className="flex items-center gap-1.5">
                  <span className="thinking-dot" style={{ animationDelay: "0ms" }} />
                  <span className="thinking-dot" style={{ animationDelay: "200ms" }} />
                  <span className="thinking-dot" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white">Je reflechis...</p>
              <p className="mt-1 text-sm text-white/40">Un instant</p>
            </div>
          </>
        )}

        {conversationMode === "speaking" && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full bg-[#2D5F2D]/20 animate-[speakPulse_1s_ease-in-out_infinite]" />
              <div className="absolute h-32 w-32 rounded-full bg-[#2D5F2D]/10 animate-[speakPulse_1s_ease-in-out_infinite_0.2s]" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#2D5F2D] to-[#3d7a3d] text-white shadow-2xl shadow-[#2D5F2D]/40">
                <WaveformAnimation />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white">Je vous reponds...</p>
              <p className="mt-1 text-sm text-white/40">Ecoutez ma reponse</p>
            </div>
          </>
        )}

        {conversationMode === "idle" && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="absolute h-32 w-32 rounded-full bg-white/5 animate-pulse" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#C41E24] to-[#6B3A2A] text-white shadow-2xl">
                <Bot className="h-12 w-12" />
              </div>
            </div>
            <p className="text-xl font-semibold text-white">Connexion...</p>
          </>
        )}
      </div>

      {/* Last caller message */}
      {lastUserMsg && (
        <div className="mt-10 w-full max-w-sm px-6">
          <div className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-2">Vous avez dit</p>
            <p className="text-sm text-white/80 leading-relaxed">
              {lastUserMsg.content.length > 120 ? lastUserMsg.content.slice(0, 120) + "..." : lastUserMsg.content}
            </p>
          </div>
        </div>
      )}

      {/* Hang up button */}
      <div className="mt-12">
        <button
          onClick={stopConversation}
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-red-500/40 active:scale-95"
          title="Terminer la conversation"
        >
          <PhoneOff className="h-7 w-7 transition-transform group-hover:rotate-[135deg]" />
        </button>
        <p className="mt-3 text-center text-xs font-medium text-white/40">Raccrocher</p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes speakPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        .thinking-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          animation: thinkBounce 1.4s ease-in-out infinite;
        }
        @keyframes thinkBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", content: WELCOME_MESSAGE, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderData | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice hook
  const sendRef = useRef<((text: string) => Promise<void>) | null>(null);
  const voice = useVoice({
    lang: "fr-FR",
    onResult: (transcript) => {
      setInput(transcript);
      // Auto-send after voice recognition
      sendRef.current?.(transcript);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const currentMessages = [...messages, userMessage];
      const history = currentMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "bot" ? "model" : "user",
          content: m.content,
        }));

      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) throw new Error("Erreur du serveur");

      const data = await res.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: data.response,
        timestamp: new Date(),
        orderData: data.orderData,
      };

      setMessages((prev) => [...prev, botMessage]);

      // If in conversation mode, use speakAndListen to continue the loop
      if (voice.autoListen && data.response) {
        voice.speakAndListen(data.response);
      } else if (voice.voiceEnabled && data.response) {
        voice.speak(data.response);
      }

      if (data.orderData) {
        setPendingOrder(data.orderData);
      }
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "bot",
        content: "Desole, j'ai rencontre une erreur. Pouvez-vous reessayer ?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // If in conversation mode, speak the error and continue listening
      if (voice.autoListen) {
        voice.speakAndListen("Desole, j'ai rencontre une erreur. Pouvez-vous reessayer ?");
      }
    } finally {
      setIsLoading(false);
      if (!voice.autoListen) {
        inputRef.current?.focus();
      }
    }
  }, [isLoading, messages, voice]);

  // Keep sendRef in sync
  useEffect(() => { sendRef.current = sendMessage; }, [sendMessage]);

  async function handlePlaceOrder(paymentMethod: "card" | "cash") {
    if (!pendingOrder) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/bot/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pendingOrder, paymentMethod }),
      });
      if (!res.ok) throw new Error("Erreur lors de la commande");
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      if (data.checkoutUrl) setCheckoutUrl(data.checkoutUrl);

      const msg = paymentMethod === "card"
        ? `Votre commande #${data.orderNumber} a ete creee ! Cliquez sur le bouton ci-dessous pour payer.`
        : `Votre commande #${data.orderNumber} est confirmee ! Paiement en especes a la reception.`;

      setMessages((prev) => [...prev, {
        id: `confirm-${Date.now()}`, role: "bot", content: msg, timestamp: new Date(),
      }]);
      setPendingOrder(null);
      toast.success(`Commande #${data.orderNumber} creee !`);

      if (voice.autoListen) {
        voice.speakAndListen(msg);
      } else if (voice.voiceEnabled) {
        voice.speak(msg);
      }
    } catch {
      toast.error("Erreur lors de la creation de la commande");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  const isInConversation = voice.autoListen;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F0]">
      {/* Global animations */}
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .typing-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typingBounce 1.4s ease-in-out infinite;
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 30, 36, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(196, 30, 36, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-appear {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#C41E24] via-[#d42a30] to-[#C41E24] shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-colors duration-300",
              isInConversation
                ? "bg-white/20 backdrop-blur-sm"
                : "bg-white/20 backdrop-blur-sm"
            )}>
              {isInConversation ? <PhoneCall className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Au Paradizzio
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                {isInConversation
                  ? `${
                      voice.conversationMode === "listening" ? "A l'ecoute..." :
                      voice.conversationMode === "thinking" ? "Reflexion..." :
                      voice.conversationMode === "speaking" ? "Parle..." :
                      "En cours"
                    }`
                  : "Assistant en ligne"
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            {voice.voiceSupported && !isInConversation && (
              <button
                onClick={voice.toggleVoice}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  voice.voiceEnabled
                    ? "bg-white text-[#C41E24] shadow-sm"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
                title={voice.voiceEnabled ? "Desactiver la voix" : "Activer la voix"}
              >
                {voice.voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {voice.voiceEnabled ? "Vocal ON" : "Vocal"}
              </button>
            )}
            {isInConversation && (
              <button
                onClick={voice.stopConversation}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-all duration-200"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                Raccrocher
              </button>
            )}
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-all duration-200"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Conversation mode overlay */}
      {isInConversation && (
        <ConversationOverlay
          conversationMode={voice.conversationMode}
          messages={messages}
          stopConversation={voice.stopConversation}
        />
      )}

      {/* Listening overlay (non-conversation mode) */}
      {voice.isListening && !isInConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-white p-10 shadow-2xl" style={{ animation: "fadeInUp 0.25s ease-out" }}>
            <div className="relative">
              <div className="absolute inset-[-12px] rounded-full bg-[#C41E24]/10 animate-ping" />
              <div className="absolute inset-[-6px] rounded-full bg-[#C41E24]/5 animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#C41E24] to-[#e63946] text-white shadow-xl shadow-[#C41E24]/20">
                <Mic className="h-10 w-10" />
              </div>
            </div>
            <p className="text-lg font-bold text-[#6B3A2A]">Je vous ecoute...</p>
            <p className="text-sm text-gray-400">Parlez maintenant</p>
            <button
              onClick={voice.stopListening}
              className="mt-1 rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Speaking indicator (non-conversation mode) */}
      {voice.isSpeaking && !isInConversation && (
        <div className="fixed top-[72px] left-1/2 z-40 -translate-x-1/2" style={{ animation: "fadeInUp 0.2s ease-out" }}>
          <div className="flex items-center gap-2 rounded-full bg-[#6B3A2A] px-5 py-2.5 text-white shadow-lg">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-medium">En train de parler...</span>
            <button onClick={voice.stopSpeaking} className="ml-1 rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors">
              <VolumeX className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-44">
        <div className="space-y-5 py-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3 msg-appear", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              {msg.role === "bot" && (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B3A2A] to-[#8B5A3A] text-white shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#C41E24] to-[#a8181e] text-white rounded-br-sm shadow-md shadow-[#C41E24]/10"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={cn("mt-2 flex items-center gap-2 text-[10px]", msg.role === "user" ? "text-white/50 justify-end" : "text-gray-400")}>
                  {formatTime(msg.timestamp)}
                  {/* Speak button for bot messages */}
                  {msg.role === "bot" && voice.voiceSupported && (
                    <button
                      onClick={() => voice.speak(msg.content)}
                      className="inline-flex items-center gap-1 hover:text-[#C41E24] transition-colors"
                      title="Ecouter ce message"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C41E24] to-[#a8181e] text-white shadow-md">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Pending order card */}
          {pendingOrder && (
            <div className="mx-auto max-w-md msg-appear">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
                {/* Gradient border top */}
                <div className="h-1 bg-gradient-to-r from-[#C41E24] via-[#F5A623] to-[#2D5F2D]" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="h-5 w-5 text-[#C41E24]" />
                    <h3 className="font-bold text-lg text-[#6B3A2A]">Recapitulatif</h3>
                  </div>
                  <div className="space-y-2.5 border-b border-gray-100 pb-4">
                    {pendingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}x {item.name}{item.size ? ` (${item.size})` : ""}</span>
                        <span className="font-semibold text-[#6B3A2A]">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Total</span>
                    <span className="text-xl font-bold text-[#C41E24]">{formatPrice(pendingOrder.total)}</span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => handlePlaceOrder("card")}
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C41E24] to-[#d42a30] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#C41E24]/20 hover:shadow-lg hover:shadow-[#C41E24]/30 transition-all duration-200 disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" /> Payer par carte
                    </button>
                    <button
                      onClick={() => handlePlaceOrder("cash")}
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#2D5F2D] bg-white px-4 py-3 text-sm font-bold text-[#2D5F2D] hover:bg-[#2D5F2D]/5 transition-all duration-200 disabled:opacity-50"
                    >
                      <Banknote className="h-4 w-4" /> Especes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {checkoutUrl && (
            <div className="mx-auto max-w-md msg-appear">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C41E24] to-[#d42a30] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#C41E24]/20 hover:shadow-xl hover:shadow-[#C41E24]/30 transition-all duration-200"
              >
                <CreditCard className="h-5 w-5" /> Payer maintenant <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}

          {orderNumber && !checkoutUrl && (
            <div className="mx-auto max-w-md msg-appear">
              <Link
                href={`/suivi/${orderNumber}`}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2D5F2D] bg-white px-6 py-4 text-sm font-bold text-[#2D5F2D] shadow-md hover:bg-[#2D5F2D]/5 transition-all duration-200"
              >
                Suivre ma commande #{orderNumber} <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          )}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && !isLoading && (
        <div className="fixed bottom-28 left-0 right-0 z-20" style={{ animation: "fadeInUp 0.4s ease-out 0.2s both" }}>
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.message)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-medium text-[#6B3A2A] shadow-sm border border-[#6B3A2A]/10 hover:border-[#C41E24]/30 hover:shadow-md hover:text-[#C41E24] transition-all duration-200"
                >
                  <span>{QUICK_ACTION_ICONS[action.icon] || ""}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-lg border-t border-gray-200/60">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          {/* Mic button */}
          {voice.voiceSupported && !isInConversation && (
            <button
              onClick={voice.toggleListening}
              disabled={isLoading}
              className={cn(
                "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200",
                voice.isListening
                  ? "bg-[#C41E24] text-white shadow-lg"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              )}
              style={voice.isListening ? { animation: "micPulse 1.5s ease-in-out infinite" } : undefined}
              title={voice.isListening ? "Arreter l'ecoute" : "Parler"}
            >
              {voice.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}

          {/* Start conversation button */}
          {voice.voiceSupported && !isInConversation && (
            <button
              onClick={voice.startConversation}
              disabled={isLoading}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F2D] text-white hover:bg-[#3d7a3d] transition-all duration-200 shadow-sm hover:shadow-md"
              title="Demarrer une conversation vocale"
            >
              <PhoneCall className="h-5 w-5" />
            </button>
          )}

          {isInConversation && (
            <button
              onClick={voice.stopConversation}
              className="flex h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-bold text-white hover:bg-red-600 transition-all duration-200"
              style={{ animation: "micPulse 2s ease-in-out infinite" }}
            >
              <PhoneOff className="h-4 w-4" />
              Raccrocher
            </button>
          )}

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isInConversation ? "Conversation vocale en cours..." : "Tapez votre message..."}
            disabled={isLoading || isInConversation}
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:border-[#C41E24]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41E24]/10 disabled:opacity-50 transition-all duration-200"
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim() || isInConversation}
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200",
              input.trim() && !isLoading && !isInConversation
                ? "bg-gradient-to-br from-[#C41E24] to-[#a8181e] text-white shadow-md shadow-[#C41E24]/20 hover:shadow-lg"
                : "bg-gray-100 text-gray-300"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 text-center">
          <p className="text-[10px] text-gray-400">
            {isInConversation
              ? "Conversation vocale active -- Cliquez sur Raccrocher pour terminer"
              : "Powered by AI -- Au Paradizzio Pizzeria"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
