/**
 * Sound Effects - Effetti sonori per scanner QR
 * Usa Capacitor NativeAudio per suoni nativi ad alte prestazioni
 */

import { NativeAudio } from '@capacitor-community/native-audio';
import { Capacitor } from '@capacitor/core';

// Flag per verificare se i suoni sono stati precaricati
let soundsInitialized = false;

// Flag per verificare se l'AudioContext è stato "warmato"
let audioContextWarmed = false;

/**
 * Pre-warm dell'audio context per evitare blocchi browser
 * Chiamare al primo tap/interazione utente
 */
export const warmupAudio = async () => {
  if (audioContextWarmed) return;
  
  try {
    // Crea e avvia un AudioContext silenzioso per "svegliare" l'audio del browser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0; // Volume a zero (silenzioso)
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.001);
    
    audioContextWarmed = true;
    console.log("✅ Audio context warmed up");
  } catch (error) {
    console.error("Errore warmup audio:", error);
  }
};

/**
 * Inizializza e precarica i suoni
 * Chiamare questa funzione all'avvio dell'app (una sola volta)
 */
export const initSounds = async () => {
  if (soundsInitialized) {
    console.log("🔊 Suoni già inizializzati");
    return;
  }

  // Warmup audio context
  await warmupAudio();

  try {
    // Precarica suono scanner
    await NativeAudio.preload({
      assetId: 'scanner-beep',
      assetPath: 'scanner-beep.mp3',
      audioChannelNum: 1,
      isUrl: false
    });

    soundsInitialized = true;
    console.log("✅ Suoni precaricati con successo");
  } catch (error) {
    console.error("❌ Errore precaricamento suoni:", error);
  }
};

/**
 * Suono scanner - Beep quando QR code viene letto con successo
 * Con fallback immediato per garantire riproduzione al 100%
 */
export const playScannerBeep = async () => {
  try {
    // Inizializza se non già fatto
    if (!soundsInitialized) {
      await initSounds();
    }

    // Warmup se necessario
    if (!audioContextWarmed) {
      await warmupAudio();
    }

    // Tentativo di riproduzione con NativeAudio
    await NativeAudio.play({
      assetId: 'scanner-beep'
    });

    console.log("🔊 Suono scanner riprodotto (NativeAudio)");
  } catch (error) {
    console.warn("⚠️ NativeAudio fallito, uso fallback:", error.message);
    
    // Se NativeAudio fallisce, potrebbe essere un problema di stato
    // Reset flag per tentare reinizializzazione al prossimo giro
    if (error.message && error.message.includes('not found')) {
      soundsInitialized = false;
      console.log("🔄 Reset stato suoni per reinizializzazione");
    }
    
    // Fallback IMMEDIATO a suono sintetizzato (sempre funziona)
    playFallbackBeep();
  }
};

/**
 * Suono di errore/duplicato - Tono diverso
 */
export const playDuplicateBeep = async () => {
  try {
    // Per duplicati, usa lo stesso suono ma con volume più basso
    await NativeAudio.setVolume({
      assetId: 'scanner-beep',
      volume: 0.3
    });

    await NativeAudio.play({
      assetId: 'scanner-beep'
    });

    // Ripristina volume normale
    setTimeout(async () => {
      await NativeAudio.setVolume({
        assetId: 'scanner-beep',
        volume: 1.0
      });
    }, 200);

  } catch (error) {
    console.error("❌ Errore riproduzione suono errore:", error);
    playFallbackBeep();
  }
};

/**
 * Vibrazione (opzionale)
 */
export const vibrate = (duration = 50) => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch (error) {
    console.error("Errore vibrazione:", error);
  }
};

/**
 * Feedback completo - Suono + Vibrazione
 */
export const playScannerFeedback = async () => {
  // Warmup se necessario (importante al primo utilizzo)
  if (!audioContextWarmed) {
    await warmupAudio();
  }
  
  await playScannerBeep();
  vibrate(30);
};

/**
 * Feedback per duplicato - Suono attenuato + vibrazione lunga
 */
export const playDuplicateFeedback = async () => {
  await playDuplicateBeep();
  vibrate(100);
};

// AudioContext condiviso per fallback (evita problemi di creazione multipla)
let fallbackAudioContext = null;

/**
 * Fallback - Suono sintetizzato se NativeAudio non è disponibile
 * Usa AudioContext condiviso per evitare problemi
 */
const playFallbackBeep = () => {
  try {
    // Crea AudioContext solo una volta
    if (!fallbackAudioContext) {
      fallbackAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = fallbackAudioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Beep scanner realistico
    osc.frequency.value = 2200;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
    
    console.log("🔊 Fallback beep riprodotto");
  } catch (error) {
    console.error("❌ Errore critico fallback beep:", error);
  }
};

/**
 * Cleanup - Libera risorse audio (chiamare quando non servono più)
 */
export const cleanupSounds = async () => {
  try {
    await NativeAudio.unload({
      assetId: 'scanner-beep'
    });
    soundsInitialized = false;
    console.log("🗑️ Suoni rimossi");
  } catch (error) {
    console.error("Errore cleanup suoni:", error);
  }
};
