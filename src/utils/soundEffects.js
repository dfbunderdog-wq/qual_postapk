/**
 * Sound Effects - Effetti sonori per scanner QR
 * Usa Capacitor NativeAudio per suoni nativi ad alte prestazioni
 */

import { NativeAudio } from '@capacitor-community/native-audio';
import { Capacitor } from '@capacitor/core';

// Flag per verificare se i suoni sono stati precaricati
let soundsInitialized = false;

/**
 * Inizializza e precarica i suoni
 * Chiamare questa funzione all'avvio dell'app (una sola volta)
 */
export const initSounds = async () => {
  if (soundsInitialized) {
    console.log("🔊 Suoni già inizializzati");
    return;
  }

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
 */
export const playScannerBeep = async () => {
  try {
    // Inizializza se non già fatto
    if (!soundsInitialized) {
      await initSounds();
    }

    // Riproduci suono
    await NativeAudio.play({
      assetId: 'scanner-beep'
    });

    console.log("🔊 Suono scanner riprodotto");
  } catch (error) {
    console.error("❌ Errore riproduzione suono:", error);
    
    // Fallback: suono sintetizzato se NativeAudio fallisce
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

/**
 * Fallback - Suono sintetizzato se NativeAudio non è disponibile
 */
const playFallbackBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = 2200;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.05);
    
    console.log("🔊 Fallback beep riprodotto");
  } catch (error) {
    console.error("Errore fallback beep:", error);
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
