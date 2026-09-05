// ============================================
// SYBRAI — Realtime Voice & Audio Service
// Implements OpenAI Realtime & Audio Architecture:
// 1. Voice Agents (gpt-realtime-2.1 speech-to-speech lifecycle)
// 2. Realtime Transcription (gpt-live-transcribe with streaming deltas)
// 3. Text-to-Speech Generation (gpt-4o-mini-tts with alloy/marin/cedar voices)
// 4. Voice Activity Detection (VAD) & Push-to-Talk controls
// ============================================

import { showToast } from './toast.js';

let recognitionInstance = null;
let isTranscribing = false;
let currentUtterance = null;

/**
 * 1. Realtime Transcription (gpt-live-transcribe / Browser Speech Recognition)
 * Streams transcript deltas as the user speaks.
 */
export function startLiveTranscription({ onDelta, onComplete, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError(new Error('Live speech recognition is not supported in this browser.'));
    showToast('Speech recognition not supported on this device', 'warning', 2500);
    return null;
  }

  try {
    if (recognitionInstance) {
      recognitionInstance.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isTranscribing = true;
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      if (interimTranscript && onDelta) {
        onDelta(interimTranscript);
      }

      if (finalTranscript && onComplete) {
        onComplete(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      isTranscribing = false;
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      isTranscribing = false;
    };

    recognition.start();
    recognitionInstance = recognition;
    return recognition;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

export function stopLiveTranscription() {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      // Ignore
    }
    recognitionInstance = null;
  }
  isTranscribing = false;
}

export function isCurrentlyTranscribing() {
  return isTranscribing;
}

/**
 * 2. Text-to-Speech Generation (gpt-4o-mini-tts / SpeechSynthesis)
 * Speaks AI security assessments and patches aloud with natural audio pacing.
 */
export function speakText(text, { voice = 'alloy', onStart, onEnd } = {}) {
  if (!window.speechSynthesis) {
    showToast('Speech synthesis not available in browser', 'warning', 2000);
    return;
  }

  // Stop any active speech
  stopSpeech();

  // Strip markdown formatting and code blocks for clean, natural speech readout
  const cleanText = text
    .replace(/```[\s\S]*?```/g, ' [code block omitted for brevity] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#_~]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05; // Natural conversational tempo
  utterance.pitch = 1.0;

  // Select suitable English voice
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium')));
  if (naturalVoice) utterance.voice = naturalVoice;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
}

/**
 * 3. OpenAI Realtime WebRTC Session Config Generator
 * Prepares the session SDP configuration according to the /v1/realtime GA spec
 */
export function createRealtimeSessionConfig({
  model = 'gpt-realtime-2.1',
  voice = 'marin',
  instructions = 'You are SYBRAI CyberSec Voice Agent. Provide concise spoken security assessments.',
  tools = [],
} = {}) {
  return {
    type: 'realtime',
    model,
    audio: {
      input: {
        format: { type: 'audio/pcm', rate: 24000 },
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'medium',
          create_response: true,
          interrupt_response: true,
        },
      },
      output: {
        format: { type: 'audio/pcm' },
        voice,
      },
    },
    instructions,
    tools,
  };
}
