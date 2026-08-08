/**
 * Sahayak AI Authentic Indian Accent Voice Service
 * 
 * 1. Backend gTTS MP3 Audio Stream (/api/v1/speech/tts with tld='co.in') for authentic Indian English and Indian languages (Hindi, Marathi, Tamil, Telugu, Kannada).
 * 2. Web Speech Synthesis API fallback prioritizing Indian locale voices (en-IN, hi-IN, mr-IN, ta-IN, te-IN, kn-IN).
 */

let currentAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }

    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().then(() => silentAudio.pause()).catch(() => {});
    } catch (e) {}

    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
}

export function speakText(text: string, language: string = 'en'): Promise<void> {
  return new Promise((resolve) => {
    stopSpeech();

    if (!text || !text.trim()) {
      resolve();
      return;
    }

    const cleanText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const langCodeMap: Record<string, string> = {
      English: 'en',
      Hindi: 'hi',
      Marathi: 'mr',
      Tamil: 'ta',
      Telugu: 'te',
      Kannada: 'kn',
      en: 'en',
      hi: 'hi',
      mr: 'mr',
      ta: 'ta',
      te: 'te',
      kn: 'kn',
    };

    const isoLang = langCodeMap[language] || langCodeMap[language.toLowerCase()] || 'en';

    // Fetch authentic Indian accent MP3 audio stream from Backend gTTS
    fetch('/api/v1/speech/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 250), language: isoLang }),
    })
      .then((res) => {
        if (res.ok) return res.blob();
        throw new Error('Backend gTTS service unavailable');
      })
      .then((blob) => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudio = audio;
        audio.onended = () => resolve();
        audio.onerror = () => fallbackWebSpeech(cleanText, isoLang, resolve);
        audio.play().catch(() => {
          fallbackWebSpeech(cleanText, isoLang, resolve);
        });
      })
      .catch(() => {
        fallbackWebSpeech(cleanText, isoLang, resolve);
      });
  });
}

function fallbackWebSpeech(cleanText: string, isoLang: string, resolve: () => void): void {
  if (!('speechSynthesis' in window)) {
    resolve();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const bcp47Map: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
    };
    const targetBcp47 = bcp47Map[isoLang] || 'en-IN';

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetBcp47;
    utterance.rate = 0.90; // Natural Indian speech cadence
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prioritize authentic Indian voices (Google India, Microsoft Heera/Neerja/Kalpana)
    const indianVoice = voices.find((v) =>
      v.lang.toLowerCase().includes('in') ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('hi-in') ||
      v.name.toLowerCase().includes('en-in') ||
      v.lang.toLowerCase().startsWith(isoLang.toLowerCase())
    );

    if (indianVoice) utterance.voice = indianVoice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    resolve();
  }
}
