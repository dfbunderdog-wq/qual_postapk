import React, { useState } from "react";
import {
  Package,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  Camera,
  Edit,
} from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { DIRECTUS_URL } from "../utils/constants";
import QrScannerWeb from "../components/QrScannerWeb";
import QrScannerNative from "../components/QrScannerNative";

const StockPage = ({ user, onLogout, onNavigate }) => {
  // State per i campi
  const [udmValue, setUdmValue] = useState("");
  const [mappaValue, setMappaValue] = useState("");
  
  // State per modalità edit
  const [udmEditMode, setUdmEditMode] = useState(false);
  const [mappaEditMode, setMappaEditMode] = useState(false);
  
  // State per scanner
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null); // 'udm' o 'mappa'
  
  // State per UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Determina quale componente scanner usare
  const ScannerComponent = Capacitor.isNativePlatform() 
    ? QrScannerNative 
    : QrScannerWeb;

  // Handler per aprire scanner UDM (multiplo)
  const handleScanUdm = () => {
    console.log("📷 Apertura scanner UDM (multiplo)");
    setScannerTarget("udm");
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  // Handler per aprire scanner Mappa (singolo)
  const handleScanMappa = () => {
    console.log("📷 Apertura scanner Mappa (singolo)");
    setScannerTarget("mappa");
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  // Handler per ricevere i dati dallo scanner
  const handleScanSuccess = (scannedData) => {
    if (scannerTarget === "udm") {
      // UDM: multiplo - scannedData è un array
      if (Array.isArray(scannedData)) {
        const udmList = scannedData.join("\n");
        setUdmValue(udmList);
        setMessage({
          type: "success",
          text: `${scannedData.length} codici UDM scansionati con successo!`,
        });
        console.log("✅ UDM scansionati:", scannedData);
      }
    } else if (scannerTarget === "mappa") {
      // Mappa: singolo - scannedData è una stringa
      setMappaValue(scannedData);
      setMessage({
        type: "success",
        text: `Codice Mappa scansionato: ${scannedData}`,
      });
      console.log("✅ Mappa scansionata:", scannedData);
    }
  };

  // Handler per chiusura scanner
  const handleScannerClose = () => {
    setScannerActive(false);
    setScannerTarget(null);
  };

  // Handler per edit manuale UDM
  const handleEditUdm = () => {
    setUdmEditMode(!udmEditMode);
    if (udmEditMode) {
      console.log("💾 Salvataggio UDM:", udmValue);
      setMessage({
        type: "success",
        text: "Valore UDM salvato",
      });
    }
  };

  // Handler per edit manuale Mappa
  const handleEditMappa = () => {
    setMappaEditMode(!mappaEditMode);
    if (mappaEditMode) {
      console.log("💾 Salvataggio Mappa:", mappaValue);
      setMessage({
        type: "success",
        text: "Valore Mappa salvato",
      });
    }
  };

  // Handler per reset form
  const handleReset = () => {
    setUdmValue("");
    setMappaValue("");
    setUdmEditMode(false);
    setMappaEditMode(false);
    setMessage({ type: "", text: "" });
  };

  // Handler per conferma stock (placeholder)
  const handleConfermaStock = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Separa gli UDM (divisi da \n)
    const udmArray = udmValue.split("\n").filter(u => u.trim());

    console.log("📦 Conferma Stock:");
    console.log("UDM:", udmArray);
    console.log("Mappa:", mappaValue);

    // TODO: Chiamata API al backend
    // const requestData = {
    //   metadata: { tag: "stock" },
    //   data: {
    //     procedureName: "stock_materiale",
    //     jsonData: {
    //       udm: udmArray,
    //       mappa: mappaValue,
    //       timestamp: new Date().toISOString(),
    //       userId: user.id,
    //     },
    //   },
    // };

    // Simulazione chiamata API
    setTimeout(() => {
      setMessage({
        type: "success",
        text: `Stock confermato! ${udmArray.length} UDM associati alla mappa ${mappaValue}`,
      });
      setLoading(false);
      
      // Reset dopo conferma
      setTimeout(() => {
        handleReset();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con informazioni utente */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-600">{user.id}</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {user.status}
            </span>
          </div>
        </div>

        {/* Header pagina */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate("dashboard")}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
              >
                ←
              </button>
              <div className="bg-blue-600 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Stock Materiale
                </h1>
                <p className="text-gray-600">
                  Verifica e gestisci lo stock in magazzino
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messaggi di feedback */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-5 w-5 mr-3" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-3" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Stock */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Scansione Stock
          </h2>

          <div className="space-y-6">
            {/* Campo UDM (multiplo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                UDM (Unità Di Movimentazione) - Multiplo
              </label>
              
              {/* Campo textarea */}
              <textarea
                value={udmValue}
                onChange={(e) => setUdmValue(e.target.value)}
                readOnly={!udmEditMode}
                rows={udmValue ? udmValue.split("\n").length : 3}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono resize-none ${
                  udmEditMode
                    ? "border-blue-500 bg-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-300 bg-gray-50 cursor-not-allowed"
                }`}
                placeholder="Scansiona UDM"
                disabled={loading}
              />

              {/* Bottoni sotto il campo */}
              <div className="flex gap-2 mt-2">
                {/* Bottone Scanner */}
                <button
                  onClick={handleScanUdm}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Scansiona multipli QR Code UDM"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">Scansiona UDM</span>
                </button>

                {/* Bottone Edit */}
                <button
                  onClick={handleEditUdm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    udmEditMode
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                  title={udmEditMode ? "Salva UDM" : "Modifica UDM"}
                >
                  <Edit className="h-5 w-5" />
                  <span className="text-sm font-medium">{udmEditMode ? "Salva" : "Modifica"}</span>
                </button>
              </div>

              {udmEditMode && (
                <p className="text-xs text-blue-600 mt-1">
                  Modalità modifica attiva - Inserisci un UDM per riga
                </p>
              )}
              {udmValue && !udmEditMode && (
                <p className="text-xs text-gray-600 mt-1">
                  {udmValue.split("\n").filter(u => u.trim()).length} UDM inseriti
                </p>
              )}
            </div>

            {/* Campo Mappa (singolo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mappa (Posizione in magazzino) - Singolo
              </label>
              
              {/* Campo input */}
              <input
                type="text"
                value={mappaValue}
                onChange={(e) => setMappaValue(e.target.value)}
                readOnly={!mappaEditMode}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                  mappaEditMode
                    ? "border-blue-500 bg-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-300 bg-gray-50 cursor-not-allowed"
                }`}
                placeholder="Scansiona o inserisci Mappa"
                disabled={loading}
              />

              {/* Bottoni sotto il campo */}
              <div className="flex gap-2 mt-2">
                {/* Bottone Scanner */}
                <button
                  onClick={handleScanMappa}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Scansiona QR Code Mappa"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">Scansiona Mappa</span>
                </button>

                {/* Bottone Edit */}
                <button
                  onClick={handleEditMappa}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    mappaEditMode
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                  title={mappaEditMode ? "Salva Mappa" : "Modifica Mappa"}
                >
                  <Edit className="h-5 w-5" />
                  <span className="text-sm font-medium">{mappaEditMode ? "Salva" : "Modifica"}</span>
                </button>
              </div>

              {mappaEditMode && (
                <p className="text-xs text-blue-600 mt-1">
                  Modalità modifica attiva - Inserisci manualmente il valore
                </p>
              )}
            </div>

            {/* Riepilogo (se entrambi i campi sono compilati) */}
            {udmValue && mappaValue && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Riepilogo:</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div>
                    <span className="font-medium">UDM scansionati:</span>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-xs max-h-32 overflow-y-auto">
                      {udmValue.split("\n").map((udm, idx) => (
                        udm.trim() && <div key={idx}>• {udm}</div>
                      ))}
                    </div>
                    <p className="text-xs mt-1">
                      Totale: {udmValue.split("\n").filter(u => u.trim()).length} UDM
                    </p>
                  </div>
                  <p>
                    <span className="font-medium">Mappa:</span> {mappaValue}
                  </p>
                </div>
              </div>
            )}

            {/* Pulsanti azione */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-bold disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleConfermaStock}
                disabled={loading || !udmValue || !mappaValue}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Invio in corso..." : "Conferma Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal/Overlay */}
      {scannerActive && (
        <ScannerComponent
          onScanSuccess={handleScanSuccess}
          onClose={handleScannerClose}
          scanMode={scannerTarget === "udm" ? "multiple" : "single"}
        />
      )}
    </div>
  );
};

export default StockPage;
