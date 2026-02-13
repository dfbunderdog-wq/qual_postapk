import React, { useState } from "react";
import {
  Package,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  Printer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DIRECTUS_URL } from "../utils/constants";
import { downloadPdf } from "../utils/pdfUtils";

const RicevimentoPage = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['ricevimento', 'common']);
  
  const [ricevimentoData, setRicevimentoData] = useState({
    partNumber: "",
    numeroPezzi: "",
    numeroColli: "",
  });
  const [lastTransactionId, setLastTransactionId] = useState(null);
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);
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

  const handleRicevimentoChange = (e) => {
    setRicevimentoData({
      ...ricevimentoData,
      [e.target.name]: e.target.value,
    });
  };

  const calcolaTotale = () => {
    const pezzi = parseFloat(ricevimentoData.numeroPezzi) || 0;
    const colli = parseFloat(ricevimentoData.numeroColli) || 0;
    return pezzi * colli;
  };

  const handleConfermaRicevimento = async () => {
    if (!ricevimentoData.partNumber) {
      setMessage({
        type: "error",
        text: t('ricevimento:messages.partNumberRequired'),
      });
      return;
    }

    if (calcolaTotale() === 0) {
      setMessage({
        type: "error",
        text: t('ricevimento:messages.totalMustBeGreaterThanZero'),
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setPdfList([]);

    const requestData = {
      metadata: { tag: "rice" },
      data: {
        procedureName: "ricevimento_materiale",
        jsonData: {
          partNumber: ricevimentoData.partNumber,
          totalePezzi: calcolaTotale(),
          numeroPezzi: parseFloat(ricevimentoData.numeroPezzi) || 0,
          numeroColli: parseFloat(ricevimentoData.numeroColli) || 0,
          timestamp: new Date().toISOString(),
          userId: user.id,
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

      if (result.data && result.data[0]) {
        if (result.data[0].result) {
          const procedureResult = JSON.parse(result.data[0].result);
          if (procedureResult.idtrn) {
            setLastTransactionId(procedureResult.idtrn);
          }
        }
      }

      if (response.ok && result.success) {
        const procedureResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        setMessage({
          type: procedureResult?.verificaCompletata ? "success" : "warning",
          text: procedureResult?.message || 
            t('ricevimento:messages.success', { 
              message: `Part Number: ${ricevimentoData.partNumber}, Totale: ${calcolaTotale()} pezzi`
            }),
        });

        setRicevimentoData({
          partNumber: "",
          numeroPezzi: "",
          numeroColli: "",
        });
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: t('common:messages.sessionExpired'),
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || t('ricevimento:messages.error'),
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

  const handleStampaUdm = async () => {
    if (!lastTransactionId) {
      setMessage({
        type: "error",
        text: t('ricevimento:print.noReceipt', { 
          defaultValue: "Nessun ricevimento da stampare. Conferma prima un ricevimento." 
        }),
      });
      return;
    }

    setLoadingPrint(true);
    setMessage({ type: "", text: "" });
    setPdfList([]);

    const requestData = {
      metadata: { tag: "stampa" },
      data: {
        jsonData: {
          idtrn: lastTransactionId,
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      },
    };

    const token = localStorage.getItem("directus_token");

    if (!token) {
      setMessage({
        type: "error",
        text: t('common:messages.tokenMissing'),
      });
      setLoadingPrint(false);
      return;
    }

    try {
      const response = await fetch(`${DIRECTUS_URL}/stampa-udm-labels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const printResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        if (printResult && printResult.pdfs && printResult.pdfs.length > 0) {
          setPdfList(printResult.pdfs);
          const pdf = printResult.pdfs[0];
          await downloadPdf(pdf.pdf_base64, `Etichette_UDM_${printResult.udm_count}_pezzi.pdf`);

          setMessage({
            type: "success",
            text: t('ricevimento:print.success', { count: printResult.udm_count }),
          });
        } else {
          setMessage({
            type: "warning",
            text: t('ricevimento:print.noLabels'),
          });
        }
      } else if (response.status === 404) {
        setMessage({
          type: "error",
          text: t('ricevimento:print.noUdm'),
        });
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: t('common:messages.sessionExpired'),
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || t('ricevimento:print.error'),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t('common:messages.connectionError'),
      });
    } finally {
      setLoadingPrint(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        
        {/* Header semplificato - Solo riga superiore */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-2">
            {/* Back button + Avatar + Title/User */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => onNavigate("dashboard")}
                className="bg-gray-100 hover:bg-gray-200 active:scale-95 p-2.5 rounded-xl transition-all flex-shrink-0 shadow-sm"
                title="Torna alla dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-2.5 sm:p-3 rounded-xl shadow-md flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-gray-900 text-sm sm:text-lg md:text-xl truncate">
                  {t('ricevimento:title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {displayName}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-95 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-white font-bold text-sm sm:text-base flex-shrink-0"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Messaggi di feedback */}
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

        {/* Form Ricevimento */}
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-7 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            {/* Part Number */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('ricevimento:form.partNumber.label')}
              </label>
              <input
                type="text"
                name="partNumber"
                value={ricevimentoData.partNumber}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all"
                placeholder={t('ricevimento:form.partNumber.placeholder')}
                disabled={loading}
              />
            </div>

            {/* Numero Pezzi */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('ricevimento:form.numeroPezzi.label')}
              </label>
              <input
                type="number"
                name="numeroPezzi"
                value={ricevimentoData.numeroPezzi}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all"
                placeholder={t('ricevimento:form.numeroPezzi.placeholder')}
                min="0"
                disabled={loading}
              />
            </div>

            {/* Numero Colli */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('ricevimento:form.numeroColli.label')}
              </label>
              <input
                type="number"
                name="numeroColli"
                value={ricevimentoData.numeroColli}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all"
                placeholder={t('ricevimento:form.numeroColli.placeholder')}
                min="0"
                disabled={loading}
              />
            </div>

            {/* Totale Pezzi - Stessa altezza degli altri */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('ricevimento:form.totalePezzi.label')}
              </label>
              <div className="w-full px-4 py-3 sm:py-4 border-2 border-green-400 bg-gradient-to-r from-green-50 to-green-100 rounded-xl text-base font-bold text-green-800 shadow-sm">
                {t('ricevimento:form.totalePezzi.value', { count: calcolaTotale() })}
              </div>
            </div>
          </div>

          {/* Riepilogo compatto */}
          {ricevimentoData.partNumber &&
            (ricevimentoData.numeroPezzi || ricevimentoData.numeroColli) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-6 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {t('ricevimento:summary.title')}
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1.5">
                      <p>
                        <span className="font-semibold">{t('ricevimento:summary.partNumber')}</span>{" "}
                        <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200">
                          {ricevimentoData.partNumber}
                        </span>
                      </p>
                      <div className="flex gap-4 text-xs sm:text-sm">
                        <span>
                          <span className="font-semibold">{t('ricevimento:summary.piecesPerPackage')}</span>{" "}
                          {ricevimentoData.numeroPezzi || 0}
                        </span>
                        <span>
                          <span className="font-semibold">{t('ricevimento:summary.packages')}</span>{" "}
                          {ricevimentoData.numeroColli || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Pulsanti */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfermaRicevimento}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? t('ricevimento:buttons.confirming') : t('ricevimento:buttons.confirm')}
            </button>
            <button
              onClick={() =>
                setRicevimentoData({
                  partNumber: "",
                  numeroPezzi: "",
                  numeroColli: "",
                })
              }
              disabled={loading}
              className="sm:w-auto bg-gray-600 hover:bg-gray-700 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {t('ricevimento:buttons.reset')}
            </button>
          </div>
        </div>

        {/* Sezione Stampa UDM */}
        {lastTransactionId && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-5 sm:p-7 border-2 border-purple-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-xl shadow-md">
                <Printer className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t('ricevimento:print.title')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('ricevimento:print.description')}
                </p>
              </div>
            </div>

            <button
              onClick={handleStampaUdm}
              disabled={loadingPrint}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loadingPrint ? (
                t('ricevimento:print.generating')
              ) : (
                <>
                  <Printer className="h-5 w-5" />
                  {t('ricevimento:print.button')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RicevimentoPage;
