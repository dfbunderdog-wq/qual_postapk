import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { playScannerFeedback, warmupAudio } from "../utils/soundEffects";

const QrScannerWeb = ({ onScanSuccess, onClose, scanMode = "single" }) => {
  const html5QrCodeRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref per tracciare i codici scansionati (evita problema di closure)
  const scannedCodesRef = useRef([]);
  
  // Debounce per evitare letture ripetute dello stesso codice
  const lastScannedCode = useRef(null);
  const lastScannedTime = useRef(0);
  
  // Flag per bloccare letture multiple in modalità single
  const isProcessing = useRef(false);
  
  // Cooldown tra scansioni in modalità multipla (ms)
  const COOLDOWN_MS = 500; // 500ms = mezzo secondo tra una scansione e l'altra

  useEffect(() => {
    // Warmup audio immediatamente all'apertura dello scanner
    warmupAudio();
    
    startScanner();

    // Cleanup al unmount
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      // Inizializza Html5Qrcode
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Configurazione camera
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Callback successo scansione
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        const now = Date.now();
        
        console.log("📷 QR rilevato:", decodedText);

        if (scanMode === "single") {
          // Modalità singola (Mappa)
          
          // Se sta già processando, BLOCCA tutto
          if (isProcessing.current) {
            console.log("🚫 Già in elaborazione, ignorato");
            return;
          }
          
          // Imposta flag immediatamente
          isProcessing.current = true;
          
          console.log("✅ QR Mappa accettato:", decodedText);
          playScannerFeedback();
          onScanSuccess(decodedText);
          stopScanner();
          onClose();
          
        } else {
          // Modalità multipla (UDM)
          
          // Controlla se è già nella lista usando il Ref (aggiornato in tempo reale)
          if (scannedCodesRef.current.includes(decodedText)) {
            console.log("⚠️ QR duplicato (già nella lista) - ignorato");
            // I duplicati non consumano cooldown né aggiornano timestamp
            return; // NESSUN SUONO, non aggiungere
          }
          
          // Cooldown: blocca SOLO se è lo STESSO codice letto di recente
          // Questo evita riletture multiple dello stesso QR, ma permette QR diversi subito dopo
          if (decodedText === lastScannedCode.current && now - lastScannedTime.current < COOLDOWN_MS) {
            console.log(`⏭️ Stesso codice "${decodedText}" ignorato (cooldown ${COOLDOWN_MS}ms)`);
            return;
          }
          
          // Codice NUOVO (diverso e non in lista)!
          console.log("✅ QR nuovo, aggiunto:", decodedText);
          lastScannedCode.current = decodedText;
          lastScannedTime.current = now; // Aggiorna timestamp
          
          // Aggiungi al ref (sincrono)
          scannedCodesRef.current = [...scannedCodesRef.current, decodedText];
          
          // Aggiungi allo state (per UI)
          setScannedCodes(scannedCodesRef.current);
          
          // Suono DOPO aver aggiunto
          playScannerFeedback();
        }
      };

      // Avvia scanner con camera posteriore
      await html5QrCode.start(
        { facingMode: "environment" }, // Forza camera posteriore
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignora errori continui di "not found"
          if (!errorMessage.includes("NotFoundException")) {
            console.warn("Scanner error:", errorMessage);
          }
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Errore avvio scanner:", err);
      setError("Impossibile accedere alla camera. Controlla i permessi.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Errore stop scanner:", err);
      }
    }
  };

  const handleStopScan = async () => {
    await stopScanner();
    // Passa tutti i codici scansionati al parent
    onScanSuccess(scannedCodes);
    onClose();
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        {/* Bottone Chiudi */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {scanMode === "single" ? "Scansiona QR Code" : "Scansione Multipla"}
        </h2>

        {/* Istruzioni */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            📷 Posiziona il QR code nel riquadro
          </p>
          {scanMode === "multiple" && (
            <p className="text-sm text-blue-800">
              🔄 Continua a scansionare fino a premere "Stop"
            </p>
          )}
        </div>

        {/* Errore */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Lista codici scansionati (solo modalità multipla) */}
        {scanMode === "multiple" && scannedCodes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
            <h3 className="font-bold text-green-900 mb-2">
              Codici scansionati ({scannedCodes.length}):
            </h3>
            <ul className="space-y-1">
              {scannedCodes.map((code, index) => (
                <li
                  key={index}
                  className="text-sm text-green-700 flex items-center"
                >
                  <span className="mr-2">•</span>
                  <span className="font-mono">{code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Scanner Container */}
        <div id="qr-reader" className="w-full mb-4"></div>

        {/* Bottone Stop (solo modalità multipla) */}
        {scanMode === "multiple" && (
          <button
            onClick={handleStopScan}
            disabled={scannedCodes.length === 0}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Stop e Conferma ({scannedCodes.length} codici)
          </button>
        )}

        {/* Nota */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {scanMode === "single"
            ? "Lo scanner si chiuderà automaticamente dopo la lettura"
            : "Premi 'Stop e Conferma' quando hai finito"}
        </p>
      </div>
    </div>
  );
};

export default QrScannerWeb;
