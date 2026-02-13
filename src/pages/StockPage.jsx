import React, { useState } from "react";
import {
  Package,
  ArrowLeft,
  LogOut,
  AlertCircle,
  CheckCircle,
  Camera,
  Edit2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DIRECTUS_URL } from "../utils/constants";
import QrScannerWeb from "../components/QrScannerWeb";

const StockPage = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['stock', 'common']);
  
  const [udmValue, setUdmValue] = useState("");
  const [mappaValue, setMappaValue] = useState("");
  const [udmEditMode, setUdmEditMode] = useState(false);
  const [mappaEditMode, setMappaEditMode] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Gestione nome utente
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };
  
  const displayName = getDisplayName();

  const handleScanUdm = () => {
    setScannerTarget("udm");
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  const handleScanMappa = () => {
    setScannerTarget("mappa");
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  const handleScanSuccess = (scannedData) => {
    if (scannerTarget === "udm") {
      if (Array.isArray(scannedData)) {
        const udmList = scannedData.join("\n");
        setUdmValue(udmList);
        setMessage({
          type: "success",
          text: t('stock:scanner.udm.success', { count: scannedData.length }),
        });
      }
    } else if (scannerTarget === "mappa") {
      setMappaValue(scannedData);
      setMessage({
        type: "success",
        text: t('stock:scanner.mappa.success', { code: scannedData }),
      });
    }
  };

  const handleScannerClose = () => {
    setScannerActive(false);
    setScannerTarget(null);
  };

  const handleEditUdm = () => {
    setUdmEditMode(!udmEditMode);
    if (udmEditMode) {
      setMessage({
        type: "success",
        text: t('stock:messages.udmSaved'),
      });
    }
  };

  const handleEditMappa = () => {
    setMappaEditMode(!mappaEditMode);
    if (mappaEditMode) {
      setMessage({
        type: "success",
        text: t('stock:messages.mappaSaved'),
      });
    }
  };

  const handleReset = () => {
    setUdmValue("");
    setMappaValue("");
    setUdmEditMode(false);
    setMappaEditMode(false);
    setMessage({ type: "", text: "" });
  };

  const handleConfermaStock = async () => {
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

    setLoading(true);
    setMessage({ type: "", text: "" });

    const udmArray = udmValue.split("\n").filter(u => u.trim());

    const requestData = {
      metadata: { tag: "stock" },
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

    const token = localStorage.getItem("directus_token");

    if (!token) {
      setMessage({
        type: "error",
        text: t('common:messages.tokenMissing'),
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${DIRECTUS_URL}/stored-procedures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const procedureResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        if (procedureResult) {
          if (procedureResult.status === "success") {
            setMessage({
              type: "success",
              text: t('stock:messages.success', { message: procedureResult.message }),
            });
            
            setTimeout(() => {
              handleReset();
            }, 2000);
          } else {
            let errorText = procedureResult.message;
            
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
        setMessage({
          type: "error",
          text: t('common:messages.sessionExpired'),
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || t('stock:messages.error'),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t('common:messages.connectionError'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        
        {/* Header - Identico a RicevimentoPage */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => onNavigate("dashboard")}
                className="bg-gray-100 hover:bg-gray-200 active:scale-95 p-2.5 rounded-xl transition-all flex-shrink-0 shadow-sm"
                title="Torna alla dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 sm:p-3 rounded-xl shadow-md flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-gray-900 text-sm sm:text-lg md:text-xl truncate">
                  {t('stock:title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {displayName}
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-95 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-white font-bold text-sm sm:text-base flex-shrink-0"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Messaggi */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start shadow-md ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border-2 border-red-200"
                : "bg-green-50 text-green-700 border-2 border-green-200"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm sm:text-base">{message.text}</span>
          </div>
        )}

        {/* Form Stock */}
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-7 mb-6">
          <div className="space-y-5">
            
            {/* Campo UDM (multiplo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('stock:fields.udm.label')}
              </label>
              
              <textarea
                value={udmValue}
                onChange={(e) => setUdmValue(e.target.value)}
                readOnly={!udmEditMode}
                rows={udmValue ? Math.min(udmValue.split("\n").length, 6) : 3}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base font-mono resize-none transition-all ${
                  udmEditMode
                    ? "border-blue-500 bg-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-300 bg-gray-50"
                }`}
                placeholder={t('stock:fields.udm.placeholder')}
                disabled={loading}
              />

              {/* Info + Bottoni sotto textarea */}
              <div className="mt-2 space-y-2">
                {udmValue && !udmEditMode && (
                  <p className="text-xs text-gray-600">
                    {t('stock:fields.udm.count', { 
                      count: udmValue.split("\n").filter(u => u.trim()).length 
                    })}
                  </p>
                )}
                {udmEditMode && (
                  <p className="text-xs text-blue-600">
                    {t('stock:fields.udm.editMode')}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleScanUdm}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{t('stock:buttons.scanUdm')}</span>
                  </button>

                  <button
                    onClick={handleEditUdm}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                      udmEditMode
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>{udmEditMode ? t('stock:buttons.save') : t('stock:buttons.edit')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Campo Mappa (singolo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('stock:fields.mappa.label')}
              </label>
              
              <input
                type="text"
                value={mappaValue}
                onChange={(e) => setMappaValue(e.target.value)}
                readOnly={!mappaEditMode}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all ${
                  mappaEditMode
                    ? "border-blue-500 bg-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-300 bg-gray-50"
                }`}
                placeholder={t('stock:fields.mappa.placeholder')}
                disabled={loading}
              />

              <div className="mt-2 space-y-2">
                {mappaEditMode && (
                  <p className="text-xs text-blue-600">
                    {t('stock:fields.mappa.editMode')}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleScanMappa}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{t('stock:buttons.scanMappa')}</span>
                  </button>

                  <button
                    onClick={handleEditMappa}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                      mappaEditMode
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>{mappaEditMode ? t('stock:buttons.save') : t('stock:buttons.edit')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Riepilogo */}
            {udmValue && mappaValue && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3">
                      {t('stock:summary.title')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-1">
                          {t('stock:summary.udmScanned')}
                        </span>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 max-h-32 overflow-y-auto">
                          {udmValue.split("\n").map((udm, idx) => (
                            udm.trim() && (
                              <div key={idx} className="text-sm font-mono text-gray-700 flex items-center gap-2">
                                <span className="text-blue-600">•</span>
                                {udm}
                              </div>
                            )
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {t('stock:summary.total', { 
                            count: udmValue.split("\n").filter(u => u.trim()).length 
                          })}
                        </p>
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">{t('stock:summary.mappa')}</span>{" "}
                        <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200">
                          {mappaValue}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pulsanti azione */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReset}
                disabled={loading}
                className="sm:w-auto bg-gray-600 hover:bg-gray-700 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {t('common:actions.reset')}
              </button>
              <button
                onClick={handleConfermaStock}
                disabled={loading || !udmValue || !mappaValue}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
