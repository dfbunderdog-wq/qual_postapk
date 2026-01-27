import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

const QrScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);

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
      onScanSuccess(decodedText);
      
      // Cleanup scanner dopo scansione
      scanner.clear().catch(error => {
        console.error("Errore cleanup scanner:", error);
      });
    };

    // Callback errore (opzionale, non mostrare errori continui)
    const handleError = (error) => {
      // Non loggare errori continui di scansione
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
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        {/* Bottone Chiudi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Scansiona QR Code
        </h2>

        {/* Istruzioni */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            📷 Posiziona il QR code nel riquadro
          </p>
          <p className="text-sm text-blue-800">
            💡 Puoi anche caricare un'immagine
          </p>
        </div>

        {/* Scanner Container */}
        <div id="qr-reader" className="w-full"></div>

        {/* Nota */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Lo scanner si chiuderà automaticamente dopo la lettura
        </p>
      </div>
    </div>
  );
};

export default QrScanner;

