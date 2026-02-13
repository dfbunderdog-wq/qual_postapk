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
import { useTranslation } from "react-i18next";
import { DIRECTUS_URL } from "../utils/constants";
import QrScannerWeb from "../components/QrScannerWeb";
import LanguageSelector from "../components/LanguageSelector";

const StockPage = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['stock', 'common']);
  
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
          text: t('stock:scanner.udm.success', { count: scannedData.length }),
        });
        console.log("✅ UDM scansionati:", scannedData);
      }
    } else if (scannerTarget === "mappa") {
      // Mappa: singolo - scannedData è una stringa
      setMappaValue(scannedData);
      setMessage({
        type: "success",
        text: t('stock:scanner.mappa.success', { code: scannedData }),
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
        text: t('stock:messages.udmSaved'),
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
        text: t('stock:messages.mappaSaved'),
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

  // Handler per conferma stock
  const handleConfermaStock = async () => {
    console.log("🔵 Inizio handleConfermaStock");
    
    // Validazione input
    if (!udmValue || udmValue.trim() === "") {
      setMessage({
        type: "error",
        text: t('stock:messages.udmRequired'),
      });
      return;
    }

    if (!mappaValue || mappaValue.trim() === "") {
      setMessage({
        type: "error",
        text: t('stock:messages.mappaRequired'),
      });
      return;
    }

    console.log("🟢 Validazione OK");

    setLoading(true);
    setMessage({ type: "", text: "" });

    // Separa gli UDM (divisi da \n)
    const udmArray = udmValue.split("\n").filter(u => u.trim());

    console.log("📦 Conferma Stock:");
    console.log("UDM:", udmArray);
    console.log("Mappa:", mappaValue);

    const requestData = {
      metadata: {
        tag: "stock",
      },
      data: {
        procedureName: "update_udm_location",
        jsonData: {
          udm: udmArray,
          cod_loc: mappaValue,
          timestamp: new Date().toISOString(),
          userId: user?.id || "demo-user",
        },
      },
    };

    console.log("🟡 Request Data:", JSON.stringify(requestData, null, 2));

    const token = localStorage.getItem("directus_token");
    console.log("🔑 Token presente:", token ? "SI" : "NO");

    if (!token) {
      console.log("❌ Token mancante!");
      setMessage({
        type: "error",
        text: t('common:messages.tokenMissing'),
      });
      setLoading(false);
      return;
    }

    console.log("🚀 Invio richiesta API...");

    try {
      const response = await fetch(`${DIRECTUS_URL}/stored-procedures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("📨 Risposta ricevuta, status:", response.status);

      const result = await response.json();

      console.log("📋 Risposta dal backend:", result);

      if (response.ok && result.success) {
        const procedureResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        console.log("✅ Procedure result:", procedureResult);

        if (procedureResult) {
          if (procedureResult.status === "success") {
            // Tutti gli UDM aggiornati con successo
            setMessage({
              type: "success",
              text: t('stock:messages.success', { message: procedureResult.message }),
            });
            
            // Reset form dopo successo
            setTimeout(() => {
              handleReset();
            }, 2000);
          } else {
            // Errore o UDM non trovati
            let errorText = procedureResult.message;
            
            // Se ci sono UDM non trovati, mostrali
            if (procedureResult.udm_not_found_list && procedureResult.udm_not_found_list.length > 0) {
              const notFoundList = procedureResult.udm_not_found_list.join(", ");
              errorText += `\nUDM non trovati: ${notFoundList}`;
            }
            
            setMessage({
              type: "error",
              text: errorText,
            });
          }
        }
      } else if (response.status === 401) {
        console.log("🔐 Sessione scaduta");
        setMessage({
          type: "error",
          text: t('common:messages.sessionExpired'),
        });
      } else {
        console.log("❌ Errore response:", result);
        setMessage({
          type: "error",
          text: result.error || t('stock:messages.error'),
        });
      }
    } catch (error) {
      console.error("💥 Errore chiamata API:", error);
      setMessage({
        type: "error",
        text: t('common:messages.connectionError'),
      });
    } finally {
      console.log("🏁 Fine handleConfermaStock");
      setLoading(false);
    }
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
                <span className="text-gray-500">{t('common:user.id')}:</span>
                <span className="text-gray-600">{user.id}</span>
              </div>
            </div>
            
            {/* Language Selector + Status */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.status}
              </span>
            </div>
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
                  {t('stock:title')}
                </h1>
                <p className="text-gray-600">
                  {t('stock:subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              {t('common:actions.logout')}
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
            {t('stock:title')}
          </h2>

          <div className="space-y-6">
            {/* Campo UDM (multiplo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('stock:fields.udm.label')}
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
                placeholder={t('stock:fields.udm.placeholder')}
                disabled={loading}
              />

              {/* Bottoni sotto il campo */}
              <div className="flex gap-2 mt-2">
                {/* Bottone Scanner */}
                <button
                  onClick={handleScanUdm}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">{t('stock:buttons.scanUdm')}</span>
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
                >
                  <Edit className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {udmEditMode ? t('stock:buttons.save') : t('stock:buttons.edit')}
                  </span>
                </button>
              </div>

              {udmEditMode && (
                <p className="text-xs text-blue-600 mt-1">
                  {t('stock:fields.udm.editMode')}
                </p>
              )}
              {udmValue && !udmEditMode && (
                <p className="text-xs text-gray-600 mt-1">
                  {t('stock:fields.udm.count', { 
                    count: udmValue.split("\n").filter(u => u.trim()).length 
                  })}
                </p>
              )}
            </div>

            {/* Campo Mappa (singolo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('stock:fields.mappa.label')}
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
                placeholder={t('stock:fields.mappa.placeholder')}
                disabled={loading}
              />

              {/* Bottoni sotto il campo */}
              <div className="flex gap-2 mt-2">
                {/* Bottone Scanner */}
                <button
                  onClick={handleScanMappa}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">{t('stock:buttons.scanMappa')}</span>
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
                >
                  <Edit className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {mappaEditMode ? t('stock:buttons.save') : t('stock:buttons.edit')}
                  </span>
                </button>
              </div>

              {mappaEditMode && (
                <p className="text-xs text-blue-600 mt-1">
                  {t('stock:fields.mappa.editMode')}
                </p>
              )}
            </div>

            {/* Riepilogo (se entrambi i campi sono compilati) */}
            {udmValue && mappaValue && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">{t('stock:summary.title')}</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div>
                    <span className="font-medium">{t('stock:summary.udmScanned')}</span>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-xs max-h-32 overflow-y-auto">
                      {udmValue.split("\n").map((udm, idx) => (
                        udm.trim() && <div key={idx}>• {udm}</div>
                      ))}
                    </div>
                    <p className="text-xs mt-1">
                      {t('stock:summary.total', { 
                        count: udmValue.split("\n").filter(u => u.trim()).length 
                      })}
                    </p>
                  </div>
                  <p>
                    <span className="font-medium">{t('stock:summary.mappa')}</span> {mappaValue}
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
                {t('common:actions.reset')}
              </button>
              <button
                onClick={handleConfermaStock}
                disabled={loading || !udmValue || !mappaValue}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('stock:buttons.confirming') : t('stock:buttons.confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerActive && (
        <QrScannerWeb
          onScanSuccess={handleScanSuccess}
          onClose={handleScannerClose}
          scanMode={scannerTarget === "udm" ? "multiple" : "single"}
        />
      )}
    </div>
  );
};

export default StockPage;
