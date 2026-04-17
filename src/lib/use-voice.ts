"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type ConversationMode = "idle" | "listening" | "thinking" | "speaking";

interface UseVoiceOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  autoSpeak?: boolean;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { lang = "fr-FR", onResult, autoSpeak = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [conversationMode, setConversationMode] = useState<ConversationMode>("idle");
  const [autoListen, setAutoListen] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const autoListenRef = useRef(false);
  const conversationActiveRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    autoListenRef.current = autoListen;
  }, [autoListen]);

  // Check browser support
  useEffect(() => {
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSpeechSynthesis = !!window.speechSynthesis;
    setVoiceSupported(hasSpeechRecognition && hasSpeechSynthesis);
    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!voiceSupported) return;

    // Stop any ongoing speech
    synthRef.current?.cancel();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Abort any existing recognition before starting a new one
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      if (conversationActiveRef.current) {
        setConversationMode("listening");
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      if (transcript && onResult) {
        if (conversationActiveRef.current) {
          setConversationMode("thinking");
        }
        onResult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
      setIsListening(false);
      // If in conversation mode and error is "no-speech", restart listening
      if (conversationActiveRef.current && event.error === "no-speech") {
        setTimeout(() => {
          if (conversationActiveRef.current) {
            startListening();
          }
        }, 300);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  }, [voiceSupported, lang, onResult]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !voiceEnabled) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try to find a French voice
      const voices = synthRef.current.getVoices();
      const frenchVoice = voices.find(
        (v) => v.lang.startsWith("fr") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("fr"));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [lang, voiceEnabled]
  );

  /**
   * Speak text, then automatically start listening when speech ends.
   * This is the core of the speech-to-speech loop.
   */
  const speakAndListen = useCallback(
    (text: string) => {
      if (!synthRef.current) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try to find a French voice
      const voices = synthRef.current.getVoices();
      const frenchVoice = voices.find(
        (v) => v.lang.startsWith("fr") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("fr"));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (conversationActiveRef.current) {
          setConversationMode("speaking");
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-listen after speaking if conversation is active
        if (conversationActiveRef.current) {
          setTimeout(() => {
            if (conversationActiveRef.current) {
              startListening();
            }
          }, 400); // Small delay for natural feel
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        // Even on error, try to continue the conversation loop
        if (conversationActiveRef.current) {
          setTimeout(() => {
            if (conversationActiveRef.current) {
              startListening();
            }
          }, 400);
        }
      };

      synthRef.current.speak(utterance);
    },
    [lang, startListening]
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    const newVal = !voiceEnabled;
    setVoiceEnabled(newVal);
    if (!newVal) {
      stopSpeaking();
      stopListening();
      // Also stop conversation mode if voice is turned off
      conversationActiveRef.current = false;
      setAutoListen(false);
      setConversationMode("idle");
    }
  }, [voiceEnabled, stopSpeaking, stopListening]);

  /**
   * Start a continuous speech-to-speech conversation loop.
   * Enables voice, starts listening, and sets up auto-listen after bot speaks.
   */
  const startConversation = useCallback(() => {
    setVoiceEnabled(true);
    setAutoListen(true);
    conversationActiveRef.current = true;
    setConversationMode("listening");
    // Small delay to ensure state is set before starting
    setTimeout(() => {
      startListening();
    }, 100);
  }, [startListening]);

  /**
   * Stop the speech-to-speech conversation loop.
   */
  const stopConversation = useCallback(() => {
    conversationActiveRef.current = false;
    setAutoListen(false);
    setConversationMode("idle");
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  // Cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
      conversationActiveRef.current = false;
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceEnabled,
    voiceSupported,
    conversationMode,
    autoListen,
    startListening,
    stopListening,
    toggleListening,
    speak,
    speakAndListen,
    stopSpeaking,
    toggleVoice,
    setVoiceEnabled,
    startConversation,
    stopConversation,
  };
}
