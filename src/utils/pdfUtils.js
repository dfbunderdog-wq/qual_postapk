/**
 * Converte una stringa base64 in PDF e avvia il download automatico
 * @param {string} base64String - Stringa base64 del PDF
 * @param {string} filename - Nome del file da scaricare
 */
export const downloadPdf = (base64String, filename) => {
  try {
    // Rimuovi eventuali spazi o newline dal base64
    const cleanBase64 = base64String.replace(/\s/g, '');
    
    // Decodifica base64 in byte array
    const byteCharacters = atob(cleanBase64);
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
    
    console.log("✅ PDF scaricato:", filename);
  } catch (error) {
    console.error("❌ Errore download PDF:", error);
    throw new Error("Errore durante il download del PDF");
  }
};
