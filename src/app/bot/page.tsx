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
  { label: "Voir le menu", message: "Montrez-moi le menu des pizzas" },
  { label: "Commander une pizza", message: "Je voudrais commander une pizza" },
  { label: "Nos best-sellers", message: "Quelles sont vos meilleures pizzas ?" },
  { label: "Horaires", message: "Quels sont vos horaires d'ouverture ?" },
  { label: "Livraison", message: "Est-ce que vous livrez dans ma zone ?" },
];

function WaveformAnimation() {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-white"
          style={{
            height: "16px",
            animation: `waveform 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function PulsingMic() {
  return (
    <div className="relative">
      <div className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />
      <div className="absolute inset-0 animate-pulse rounded-full bg-red-400/20" style={{ animationDelay: "0.5s" }} />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30">
        <Mic className="h-12 w-12" />
      </div>
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
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-wood/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-white",
              isInConversation ? "bg-green-500" : "bg-primary"
            )}>
              {isInConversation ? <PhoneCall className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-wood">
                Assistant Paradizzio
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                {isInConversation
                  ? `Conversation vocale - ${
                      voice.conversationMode === "listening" ? "A l'ecoute..." :
                      voice.conversationMode === "thinking" ? "Reflexion..." :
                      voice.conversationMode === "speaking" ? "Parle..." :
                      "En cours"
                    }`
                  : voice.voiceEnabled ? "Mode vocal actif" : "Chat & vocal disponibles"
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
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  voice.voiceEnabled
                    ? "bg-primary text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors animate-pulse"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                Raccrocher
              </button>
            )}
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Menu
            </Link>
            {!isInConversation && (
              <a
                href="tel:+33490000000"
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary-light"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Appeler
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Conversation mode overlay */}
      {isInConversation && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-wood/95 to-black/95 backdrop-blur-sm">
          {/* Status indicator */}
          <div className="mb-8 text-center">
            <p className="text-white/60 text-sm font-medium tracking-wider uppercase">
              Conversation vocale
            </p>
          </div>

          {/* Main visual state */}
          <div className="flex flex-col items-center gap-6">
            {voice.conversationMode === "listening" && (
              <>
                <PulsingMic />
                <p className="text-xl font-bold text-white">Je vous ecoute...</p>
                <p className="text-sm text-white/60">Parlez naturellement, je vous comprends</p>
              </>
            )}

            {voice.conversationMode === "thinking" && (
              <>
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-xl shadow-amber-500/30">
                  <Loader2 className="h-12 w-12 animate-spin" />
                </div>
                <p className="text-xl font-bold text-white">Je reflechis...</p>
                <p className="text-sm text-white/60">Un instant, je prepare ma reponse</p>
              </>
            )}

            {voice.conversationMode === "speaking" && (
              <>
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30">
                  <WaveformAnimation />
                </div>
                <p className="text-xl font-bold text-white">Je vous reponds...</p>
                <p className="text-sm text-white/60">Ecoutez ma reponse</p>
              </>
            )}

            {voice.conversationMode === "idle" && isInConversation && (
              <>
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-white shadow-xl">
                  <Bot className="h-12 w-12" />
                </div>
                <p className="text-xl font-bold text-white">Connexion...</p>
              </>
            )}
          </div>

          {/* Last messages preview */}
          {messages.length > 1 && (
            <div className="mt-10 w-full max-w-md px-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 max-h-40 overflow-y-auto">
                {messages.slice(-3).map((msg) => (
                  <div key={msg.id} className={cn("text-sm mb-2 last:mb-0", msg.role === "user" ? "text-primary-light text-right" : "text-white/80")}>
                    <span className="text-[10px] text-white/40 mr-1">
                      {msg.role === "user" ? "Vous:" : "Bot:"}
                    </span>
                    {msg.content.length > 100 ? msg.content.slice(0, 100) + "..." : msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End call button */}
          <div className="mt-10">
            <button
              onClick={voice.stopConversation}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
              title="Terminer la conversation"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
            <p className="mt-2 text-center text-xs text-white/50">Raccrocher</p>
          </div>
        </div>
      )}

      {/* Listening overlay (non-conversation mode) */}
      {voice.isListening && !isInConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white">
                <Mic className="h-10 w-10" />
              </div>
            </div>
            <p className="text-lg font-bold text-wood">Je vous ecoute...</p>
            <p className="text-sm text-gray-500">Parlez maintenant, je prendrai votre commande</p>
            <button
              onClick={voice.stopListening}
              className="mt-2 rounded-xl bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Speaking indicator (non-conversation mode) */}
      {voice.isSpeaking && !isInConversation && (
        <div className="fixed top-20 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-wood px-4 py-2 text-white shadow-lg">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-medium">En train de parler...</span>
            <button onClick={voice.stopSpeaking} className="ml-1 rounded-full bg-white/20 p-1 hover:bg-white/30">
              <VolumeX className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="mx-auto max-w-3xl px-4 pb-40">
        <div className="space-y-4 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white", msg.role === "user" ? "bg-primary" : "bg-wood")}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-primary text-white rounded-br-md" : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md")}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={cn("mt-1 flex items-center gap-2 text-[10px]", msg.role === "user" ? "text-white/60" : "text-gray-400")}>
                  {formatTime(msg.timestamp)}
                  {/* Speak button for bot messages */}
                  {msg.role === "bot" && voice.voiceSupported && (
                    <button
                      onClick={() => voice.speak(msg.content)}
                      className="hover:text-primary transition-colors"
                      title="Ecouter ce message"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pending order card */}
          {pendingOrder && (
            <div className="mx-auto max-w-md">
              <div className="rounded-xl border-2 border-primary/20 bg-white p-4 shadow-lg">
                <h3 className="mb-3 font-heading text-lg font-bold text-wood">Recapitulatif</h3>
                <div className="space-y-2 border-b border-gray-100 pb-3">
                  {pendingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}{item.size ? ` (${item.size})` : ""}</span>
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-sm font-bold text-primary">
                  <span>Total</span><span>{formatPrice(pendingOrder.total)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handlePlaceOrder("card")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                    <CreditCard className="h-4 w-4" /> Carte
                  </button>
                  <button onClick={() => handlePlaceOrder("cash")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-secondary bg-white px-4 py-2.5 text-sm font-bold text-secondary hover:bg-secondary/5 disabled:opacity-60">
                    <Banknote className="h-4 w-4" /> Especes
                  </button>
                </div>
              </div>
            </div>
          )}

          {checkoutUrl && (
            <div className="mx-auto max-w-md">
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-dark">
                <CreditCard className="h-5 w-5" /> Payer maintenant <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {orderNumber && !checkoutUrl && (
            <div className="mx-auto max-w-md">
              <Link href={`/suivi/${orderNumber}`} className="flex items-center justify-center gap-2 rounded-xl border-2 border-secondary bg-white px-6 py-3 text-sm font-bold text-secondary shadow hover:bg-secondary/5">
                Suivre ma commande #{orderNumber} <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-wood text-white"><Bot className="h-4 w-4" /></div>
              <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />En train de repondre...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && !isLoading && (
        <div className="fixed bottom-24 left-0 right-0 z-20">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACTIONS.map((action) => (
                <button key={action.label} onClick={() => sendMessage(action.message)} className="rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-medium text-primary shadow-sm hover:bg-primary/5 transition-colors">
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar with microphone and conversation button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          {/* Mic button */}
          {voice.voiceSupported && !isInConversation && (
            <button
              onClick={voice.toggleListening}
              disabled={isLoading}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                voice.isListening
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
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
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
              title="Demarrer une conversation vocale"
            >
              <PhoneCall className="h-5 w-5" />
            </button>
          )}

          {isInConversation && (
            <button
              onClick={voice.stopConversation}
              className="flex h-12 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white hover:bg-red-600 transition-all animate-pulse"
            >
              <PhoneOff className="h-5 w-5" />
              Raccrocher
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isInConversation ? "Conversation vocale en cours..." : voice.voiceEnabled ? "Tapez ou utilisez le micro..." : "Tapez votre message..."}
            disabled={isLoading || isInConversation}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim() || isInConversation}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm hover:bg-primary-dark disabled:opacity-40 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-2 text-center text-[10px] text-gray-400">
          {isInConversation
            ? "Conversation vocale active -- Cliquez sur Raccrocher pour terminer"
            : "Assistant IA vocal -- Au Paradizzio Pizzeria"
          }
        </div>
      </div>
    </div>
  );
}
