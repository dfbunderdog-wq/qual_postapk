import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Converte una stringa base64 in PDF e gestisce il download/condivisione
 * sia su web che su mobile
 * @param {string} base64String - Stringa base64 del PDF
 * @param {string} filename - Nome del file da scaricare
 */
export const downloadPdf = async (base64String, filename) => {
  try {
    // Rimuovi eventuali spazi o newline dal base64
    const cleanBase64 = base64String.replace(/\s/g, '');
    
    // Controlla se siamo su piattaforma nativa (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Download PDF su piattaforma nativa');
      await downloadPdfNative(cleanBase64, filename);
    } else {
      console.log('🌐 Download PDF su web');
      downloadPdfWeb(cleanBase64, filename);
    }
    
    console.log("✅ PDF processato:", filename);
  } catch (error) {
    console.error("❌ Errore download PDF:", error);
    throw new Error("Errore durante il download del PDF");
  }
};

/**
 * Download PDF su web (browser)
 */
const downloadPdfWeb = (base64String, filename) => {
  // Decodifica base64 in byte array
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  // Crea Blob
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  
  // Crea URL temporaneo
  const url = URL.createObjectURL(blob);
  
  // Crea link e trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download PDF su piattaforma nativa (Android/iOS)
 */
const downloadPdfNative = async (base64String, filename) => {
  try {
    // Salva il file nel filesystem nativo
    const result = await Filesystem.writeFile({
      path: filename,
      data: base64String,
      directory: Directory.Cache, // Usa cache temporanea
      recursive: true
    });

    console.log('📄 File salvato:', result.uri);

    // Ottieni l'URI completo del file
    const fileUri = result.uri;

    // Condividi il PDF (questo aprirà il visualizzatore PDF o chiederà all'utente cosa fare)
    await Share.share({
      title: 'Etichette UDM',
      text: 'Etichette UDM generate',
      url: fileUri,
      dialogTitle: 'Apri o salva PDF'
    });

    console.log('✅ PDF condiviso con successo');
    
  } catch (error) {
    console.error('❌ Errore salvataggio/condivisione PDF nativo:', error);
    throw error;
  }
};

/**
 * Alternativa: salva direttamente nella cartella Download (solo Android)
 * Richiede permessi aggiuntivi
 */
export const savePdfToDownloads = async (base64String, filename) => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Questa funzione è disponibile solo su mobile');
  }

  try {
    // Su Android, salva nella cartella Download
    const result = await Filesystem.writeFile({
      path: filename,
      data: base64String,
      directory: Directory.Documents, // o Directory.ExternalStorage per Download
      recursive: true
    });

    console.log('✅ PDF salvato in:', result.uri);
    return result.uri;
    
  } catch (error) {
    console.error('❌ Errore salvataggio PDF:', error);
    throw error;
  }
};