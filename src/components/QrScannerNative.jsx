import React, { useState, useEffect } from "react";
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { X } from "lucide-react";

const QrScannerNative = ({ onScanSuccess, onClose, scanMode = "single" }) => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Richiedi permessi e prepara scanner
    checkPermissionsAndStart();

    // Cleanup al unmount
    return () => {
      stopScanning();
    };
  }, []);

  const checkPermissionsAndStart = async () => {
    try {
      // Controlla permessi
      const { camera } = await BarcodeScanner.checkPermissions();
      
      if (camera === 'granted' || camera === 'limited') {
        setHasPermission(true);
        await startScanning();
      } else {
        // Richiedi permessi
        const { camera: requestResult } = await BarcodeScanner.requestPermissions();
        
        if (requestResult === 'granted' || requestResult === 'limited') {
          setHasPermission(true);
          await startScanning();
        } else {
          alert("Permessi camera negati. Abilitali dalle impostazioni dell'app.");
          onClose();
        }
      }
    } catch (error) {
      console.error("Errore permessi camera:", error);
      alert("Errore nell'accesso alla camera");
      onClose();
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      if (scanMode === "single") {
        // Modalità singola
        const { barcodes } = await BarcodeScanner.scan();
        
        if (barcodes && barcodes.length > 0) {
          const scannedValue = barcodes[0].rawValue;
          console.log("✅ QR scansionato:", scannedValue);
          onScanSuccess(scannedValue);
          await stopScanning();
          onClose();
        }
      } else {
        // Modalità multipla con listener
        await scanContinuously();
      }
    } catch (error) {
      console.error("Errore avvio scanner:", error);
      await stopScanning();
      onClose();
    }
  };

  const scanContinuously = async () => {
    const codes = [];
    
    // Aggiungi listener per scansioni continue
    await BarcodeScanner.addListener('barcodeScanned', (event) => {
      if (event.barcode && event.barcode.rawValue) {
        const scannedValue = event.barcode.rawValue;
        
        // Ignora duplicati
        if (!codes.includes(scannedValue)) {
          codes.push(scannedValue);
          setScannedCodes([...codes]);
          console.log("✅ QR scansionato:", scannedValue);
        } else {
          console.log("⚠️ QR duplicato ignorato:", scannedValue);
        }
      }
    });

    // Avvia scansione
    await BarcodeScanner.scan();
  };

  const stopScanning = async () => {
    try {
      await BarcodeScanner.stopScan();
      await BarcodeScanner.removeAllListeners();
      setIsScanning(false);
    } catch (error) {
      console.error("Errore stop scanner:", error);
    }
  };

  const handleStopScan = async () => {
    await stopScanning();
    onScanSuccess(scannedCodes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent z-50">
      {/* Overlay UI sopra lo scanner nativo */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              {scanMode === "single" ? "Scansiona QR Code" : "Scansione Multipla"}
            </h2>
            <button
              onClick={async () => {
                await stopScanning();
                onClose();
              }}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Istruzioni */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <p className="text-sm text-blue-800">
              📷 Inquadra il QR code con la camera
            </p>
            {scanMode === "multiple" && (
              <p className="text-sm text-blue-800">
                🔄 Continua a scansionare, premi Stop quando finito
              </p>
            )}
          </div>

          {/* Lista codici scansionati (solo modalità multipla) */}
          {scanMode === "multiple" && scannedCodes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
              <h3 className="font-bold text-green-900 text-sm mb-2">
                Codici scansionati ({scannedCodes.length}):
              </h3>
              <ul className="space-y-1">
                {scannedCodes.map((code, index) => (
                  <li key={index} className="text-xs text-green-700 flex items-center">
                    <span className="mr-2">•</span>
                    <span className="font-mono">{code}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
        </div>
      </div>

      {/* Istruzioni visive al centro (opzionale) */}
      {scanMode === "single" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white bg-opacity-90 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-gray-900">
              Inquadra il QR Code
            </p>
            <p className="text-sm text-gray-600">
              Scansione automatica
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScannerNative;
