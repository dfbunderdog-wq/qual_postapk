import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

const QrScannerWeb = ({ onScanSuccess, onClose, scanMode = "single" }) => {
  const scannerRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Configurazione scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: { ideal: "environment" } // Camera posteriore
      }
    };

    // Inizializza scanner
    const scanner = new Html5QrcodeScanner("qr-reader", config, false);
    scannerRef.current = scanner;

    // Callback successo
    const handleSuccess = (decodedText) => {
      console.log("✅ QR scansionato:", decodedText);
      
      if (scanMode === "single") {
        // Modalità singola: chiudi subito
        onScanSuccess(decodedText);
        scanner.clear().catch(error => {
          console.error("Errore cleanup scanner:", error);
        });
        onClose();
      } else {
        // Modalità multipla: aggiungi alla lista (ignora duplicati)
        setScannedCodes(prev => {
          if (prev.includes(decodedText)) {
            console.log("⚠️ QR duplicato ignorato:", decodedText);
            return prev;
          }
          return [...prev, decodedText];
        });
      }
    };

    // Callback errore (non mostrare errori continui)
    const handleError = (error) => {
      if (!error.includes("NotFoundException")) {
        console.warn("Scanner error:", error);
      }
    };

    // Avvia scanner
    scanner.render(handleSuccess, handleError);

    // Cleanup al unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Errore cleanup scanner al unmount:", error);
        });
      }
    };
  }, [scanMode]);

  // Handler per stop scansione (solo modalità multipla)
  const handleStopScan = () => {
    setIsScanning(false);
    
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Errore cleanup scanner:", error);
      });
    }
    
    // Passa tutti i codici scansionati al parent
    onScanSuccess(scannedCodes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        {/* Bottone Chiudi */}
        <button
          onClick={() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
            onClose();
          }}
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

        {/* Lista codici scansionati (solo modalità multipla) */}
        {scanMode === "multiple" && scannedCodes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
            <h3 className="font-bold text-green-900 mb-2">
              Codici scansionati ({scannedCodes.length}):
            </h3>
            <ul className="space-y-1">
              {scannedCodes.map((code, index) => (
                <li key={index} className="text-sm text-green-700 flex items-center">
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
