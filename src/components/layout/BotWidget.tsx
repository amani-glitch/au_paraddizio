"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Maximize2,
  CreditCard,
  Banknote,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useVoice } from "@/lib/use-voice";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface OrderData {
  items: { name: string; size: string; quantity: number; unitPrice: number; totalPrice: number }[];
  customerName: string;
  customerPhone: string;
  mode: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  address?: string;
  total: number;
}

const WELCOME = "Bonjour ! Je suis l'assistant Au Paradizzio. Tapez ou parlez pour commander !";

function MiniWaveform() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-0.5 rounded-full bg-current"
          style={{
            height: "10px",
            animation: `miniWaveform 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes miniWaveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default function BotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "w", role: "bot", content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderData | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendRef = useRef<((text: string) => Promise<void>) | null>(null);
  const voice = useVoice({
    lang: "fr-FR",
    onResult: (transcript) => {
      setInput(transcript);
      sendRef.current?.(transcript);
    },
  });

  const scroll = useCallback(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);
  useEffect(() => { scroll(); }, [messages, scroll]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const isInConversation = voice.autoListen;

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const currentMessages = [...messages, userMsg];
      const history = currentMessages.filter((m) => m.id !== "w").map((m) => ({
        role: m.role === "bot" ? "model" : "user", content: m.content,
      }));

      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();
      const botContent = data.response || "Desole, une erreur est survenue.";

      setMessages((p) => [...p, {
        id: `b-${Date.now()}`, role: "bot", content: botContent, timestamp: new Date(),
      }]);

      // If in conversation mode, use speakAndListen for the loop
      if (voice.autoListen && botContent) {
        voice.speakAndListen(botContent);
      } else if (voice.voiceEnabled && botContent) {
        voice.speak(botContent);
      }

      if (data.orderData) setPendingOrder(data.orderData);
    } catch {
      setMessages((p) => [...p, {
        id: `e-${Date.now()}`, role: "bot", content: "Desole, j'ai rencontre une erreur.", timestamp: new Date(),
      }]);
      if (voice.autoListen) {
        voice.speakAndListen("Desole, j'ai rencontre une erreur.");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, messages, voice]);

  useEffect(() => { sendRef.current = send; }, [send]);

  async function placeOrder(method: "card" | "cash") {
    if (!pendingOrder) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bot/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pendingOrder, paymentMethod: method }),
      });
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      if (data.checkoutUrl) setCheckoutUrl(data.checkoutUrl);

      const msg = method === "card"
        ? `Commande #${data.orderNumber} creee ! Cliquez pour payer.`
        : `Commande #${data.orderNumber} confirmee ! Paiement en especes.`;
      setMessages((p) => [...p, { id: `c-${Date.now()}`, role: "bot", content: msg, timestamp: new Date() }]);
      setPendingOrder(null);
      toast.success(`Commande #${data.orderNumber} creee !`);

      if (voice.autoListen) {
        voice.speakAndListen(msg);
      } else if (voice.voiceEnabled) {
        voice.speak(msg);
      }
    } catch {
      toast.error("Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  }

  const handleStartConversation = useCallback(() => {
    if (!open) setOpen(true);
    // Small delay to ensure the widget is open
    setTimeout(() => {
      voice.startConversation();
    }, 200);
  }, [open, voice]);

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Speech-to-speech mini button */}
          {voice.voiceSupported && (
            <button
              onClick={handleStartConversation}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-105"
              aria-label="Conversation vocale"
              title="Demarrer une conversation vocale"
            >
              <PhoneCall className="h-4 w-4" />
            </button>
          )}
          {/* Main chat button */}
          <button
            onClick={() => setOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all hover:scale-105"
            aria-label="Ouvrir l'assistant"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-wood">IA</span>
          </button>
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between border-b px-4 py-3 text-white",
            isInConversation ? "bg-green-600" : "bg-primary"
          )}>
            <div className="flex items-center gap-2">
              {isInConversation ? <PhoneCall className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              <div>
                <p className="text-sm font-bold">Assistant Paradizzio</p>
                <p className="text-[10px] opacity-80">
                  {isInConversation
                    ? voice.conversationMode === "listening" ? "A l'ecoute..."
                    : voice.conversationMode === "thinking" ? "Reflexion..."
                    : voice.conversationMode === "speaking" ? "Parle..."
                    : "Conversation vocale"
                  : voice.isListening ? "Je vous ecoute..." : voice.voiceEnabled ? "Mode vocal actif" : "Chat & vocal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {voice.voiceSupported && !isInConversation && (
                <button onClick={voice.toggleVoice} className={cn("rounded p-1.5", voice.voiceEnabled ? "bg-white/30" : "hover:bg-white/20")} title="Activer/Desactiver la voix">
                  {voice.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              )}
              {isInConversation && (
                <button onClick={voice.stopConversation} className="rounded bg-red-500 p-1.5 hover:bg-red-600" title="Raccrocher">
                  <PhoneOff className="h-4 w-4" />
                </button>
              )}
              <Link href="/bot" className="rounded p-1.5 hover:bg-white/20" title="Plein ecran">
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button onClick={() => { setOpen(false); voice.stopSpeaking(); voice.stopListening(); if (isInConversation) voice.stopConversation(); }} className="rounded p-1.5 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation mode overlay (compact) */}
          {isInConversation && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-wood/95 to-black/95 rounded-2xl">
              {/* State indicator */}
              <div className="flex flex-col items-center gap-4">
                {voice.conversationMode === "listening" && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-red-400/30" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30">
                        <Mic className="h-9 w-9" />
                      </div>
                    </div>
                    <p className="text-base font-bold text-white">Je vous ecoute...</p>
                    <p className="text-xs text-white/50">Parlez naturellement</p>
                  </>
                )}

                {voice.conversationMode === "thinking" && (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                      <Loader2 className="h-9 w-9 animate-spin" />
                    </div>
                    <p className="text-base font-bold text-white">Je reflechis...</p>
                    <p className="text-xs text-white/50">Un instant...</p>
                  </>
                )}

                {voice.conversationMode === "speaking" && (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
                      <MiniWaveform />
                    </div>
                    <p className="text-base font-bold text-white">Je reponds...</p>
                    <p className="text-xs text-white/50">Ecoutez ma reponse</p>
                  </>
                )}

                {voice.conversationMode === "idle" && (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Bot className="h-9 w-9" />
                    </div>
                    <p className="text-base font-bold text-white">Connexion...</p>
                  </>
                )}
              </div>

              {/* Recent messages preview */}
              {messages.length > 1 && (
                <div className="mt-6 w-full px-4">
                  <div className="rounded-xl bg-white/10 p-3 max-h-28 overflow-y-auto">
                    {messages.slice(-2).map((msg) => (
                      <div key={msg.id} className={cn("text-xs mb-1 last:mb-0", msg.role === "user" ? "text-primary-light text-right" : "text-white/70")}>
                        <span className="text-[9px] text-white/30 mr-1">
                          {msg.role === "user" ? "Vous:" : "Bot:"}
                        </span>
                        {msg.content.length > 80 ? msg.content.slice(0, 80) + "..." : msg.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* End call */}
              <div className="mt-6">
                <button
                  onClick={voice.stopConversation}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
                  title="Raccrocher"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
                <p className="mt-1 text-center text-[10px] text-white/40">Raccrocher</p>
              </div>
            </div>
          )}

          {/* Listening overlay (non-conversation, mini) */}
          {voice.isListening && !isInConversation && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl">
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                    <Mic className="h-8 w-8" />
                  </div>
                </div>
                <p className="text-sm font-bold text-white">Je vous ecoute...</p>
                <button onClick={voice.stopListening} className="rounded-lg bg-white/90 px-4 py-1.5 text-xs font-medium text-gray-700">Annuler</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px]", msg.role === "user" ? "bg-primary" : "bg-wood")}>
                  {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={cn("max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed", msg.role === "user" ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm")}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === "bot" && voice.voiceSupported && (
                    <button onClick={() => voice.speak(msg.content)} className="mt-1 text-[10px] text-gray-400 hover:text-primary flex items-center gap-0.5">
                      <Volume2 className="h-2.5 w-2.5" /> ecouter
                    </button>
                  )}
                </div>
              </div>
            ))}

            {pendingOrder && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-bold text-wood">Commande</p>
                {pendingOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                <div className="mt-1 border-t pt-1 flex justify-between text-xs font-bold text-primary">
                  <span>Total</span><span>{formatPrice(pendingOrder.total)}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => placeOrder("card")} disabled={loading} className="flex-1 flex items-center justify-center gap-1 rounded bg-primary px-2 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
                    <CreditCard className="h-3 w-3" /> Carte
                  </button>
                  <button onClick={() => placeOrder("cash")} disabled={loading} className="flex-1 flex items-center justify-center gap-1 rounded border border-secondary px-2 py-1.5 text-[11px] font-bold text-secondary disabled:opacity-50">
                    <Banknote className="h-3 w-3" /> Especes
                  </button>
                </div>
              </div>
            )}

            {checkoutUrl && (
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
                <CreditCard className="h-3 w-3" /> Payer <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {orderNumber && !checkoutUrl && (
              <Link href={`/suivi/${orderNumber}`} className="flex items-center justify-center gap-1 rounded-lg border border-secondary px-3 py-2 text-xs font-bold text-secondary">
                Suivre #{orderNumber} <ExternalLink className="h-3 w-3" />
              </Link>
            )}

            {loading && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wood text-white"><Bot className="h-3 w-3" /></div>
                <div className="rounded-xl rounded-bl-sm bg-gray-100 px-3 py-2"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input with mic and conversation button */}
          <div className="flex items-center gap-2 border-t bg-gray-50 px-3 py-2">
            {voice.voiceSupported && !isInConversation && (
              <>
                {/* Start conversation button */}
                <button
                  onClick={voice.startConversation}
                  disabled={loading}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                  title="Conversation vocale"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                </button>
                {/* Mic button */}
                <button
                  onClick={voice.toggleListening}
                  disabled={loading}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                    voice.isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  {voice.isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              </>
            )}
            {isInConversation && (
              <button
                onClick={voice.stopConversation}
                className="flex h-8 items-center gap-1 rounded-lg bg-red-500 px-2 text-[11px] font-bold text-white hover:bg-red-600 transition-all animate-pulse"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                Fin
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(input); } }}
              placeholder={isInConversation ? "Vocal en cours..." : "Message ou micro..."}
              disabled={loading || isInConversation}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim() || isInConversation}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
