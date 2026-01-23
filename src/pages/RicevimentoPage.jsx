import React, { useState } from "react";
import {
  Package,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  Printer,
} from "lucide-react";
import { DIRECTUS_URL } from "../utils/constants";
import { downloadPdf } from "../utils/pdfUtils";

const RicevimentoPage = ({ user, onLogout, onNavigate }) => {
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
    // Validazione dati
    if (!ricevimentoData.partNumber) {
      setMessage({
        type: "error",
        text: "Inserire il Part Number",
      });
      return;
    }

    if (calcolaTotale() === 0) {
      setMessage({
        type: "error",
        text: "Il totale pezzi deve essere maggiore di zero",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setPdfList([]);

    const requestData = {
      metadata: {
        tag: "rice",
      },
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

    console.log("Invio dati:", JSON.stringify(requestData, null, 2));

    const token = localStorage.getItem("directus_token");
    console.log("Token presente:", token ? "Sì" : "No");

    if (!token) {
      setMessage({
        type: "error",
        text: "Token di autenticazione mancante. Effettua il login reale, non Demo Login.",
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

      console.log("Risposta dal backend:", result);
      if (result.data && result.data[0]) {
        console.log("Dati dalla procedure:", result.data[0]);
        if (result.data[0].result) {
          const procedureResult = JSON.parse(result.data[0].result);
          console.log("JSON dalla procedure:", procedureResult);

          // Salva il transaction_id se presente
          if (procedureResult.transaction_id) {
            setLastTransactionId(procedureResult.transaction_id);
            console.log("Transaction ID salvato:", procedureResult.transaction_id);
          }
        }
      }

      if (response.ok && result.success) {
        const procedureResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        setMessage({
          type: procedureResult?.verificaCompletata ? "success" : "warning",
          text:
            procedureResult?.message ||
            `Ricevimento confermato! Part Number: ${
              ricevimentoData.partNumber
            }, Totale: ${calcolaTotale()} pezzi`,
        });

        // Reset del form dopo successo
        setRicevimentoData({
          partNumber: "",
          numeroPezzi: "",
          numeroColli: "",
        });
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: "Sessione scaduta. Effettua nuovamente il login.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Errore durante la conferma del ricevimento",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore di connessione con il server",
      });
      console.error("Errore chiamata API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStampaUdm = async () => {
    if (!lastTransactionId) {
      setMessage({
        type: "error",
        text: "Nessun ricevimento da stampare. Conferma prima un ricevimento.",
      });
      return;
    }

    setLoadingPrint(true);
    setMessage({ type: "", text: "" });
    setPdfList([]);

    const requestData = {
      metadata: {
        tag: "stampa",
      },
      data: {
        jsonData: {
          transaction_id: lastTransactionId,
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      },
    };

    console.log("Richiesta stampa UDM:", JSON.stringify(requestData, null, 2));

    const token = localStorage.getItem("directus_token");

    if (!token) {
      setMessage({
        type: "error",
        text: "Token di autenticazione mancante. Effettua il login.",
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

      console.log("Risposta stampa UDM:", result);

      if (response.ok && result.success) {
        const printResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        if (printResult && printResult.pdfs && printResult.pdfs.length > 0) {
          setPdfList(printResult.pdfs);

          // Download automatico del PDF
          console.log(`📥 Scaricando PDF con ${printResult.udm_count} UDM...`);
          const pdf = printResult.pdfs[0];
          downloadPdf(pdf.pdf_base64, `Etichette_UDM_${printResult.udm_count}_pezzi.pdf`);

          setMessage({
            type: "success",
            text: `PDF con ${printResult.udm_count} etichette UDM scaricato!`,
          });
        } else {
          setMessage({
            type: "warning",
            text: "Nessun PDF generato",
          });
        }
      } else if (response.status === 404) {
        setMessage({
          type: "error",
          text: "Nessun UDM trovato per questa transazione",
        });
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: "Sessione scaduta. Effettua nuovamente il login.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Errore durante la generazione del PDF",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore di connessione con il server",
      });
      console.error("Errore chiamata stampa UDM:", error);
    } finally {
      setLoadingPrint(false);
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
              <div className="bg-green-600 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Ricevimento Materiale
                </h1>
                <p className="text-gray-600">Registra l'arrivo di nuova merce</p>
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

        {/* Form Ricevimento */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Dati di Ricevimento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Part Number *
              </label>
              <input
                type="text"
                name="partNumber"
                value={ricevimentoData.partNumber}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="Inserisci Part Number"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Numero Pezzi per Collo
              </label>
              <input
                type="number"
                name="numeroPezzi"
                value={ricevimentoData.numeroPezzi}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="0"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Numero Colli
              </label>
              <input
                type="number"
                name="numeroColli"
                value={ricevimentoData.numeroColli}
                onChange={handleRicevimentoChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="0"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Totale Pezzi
              </label>
              <div className="w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg text-lg font-bold text-green-800">
                {calcolaTotale()} pezzi
              </div>
            </div>
          </div>

          {/* Riepilogo */}
          {ricevimentoData.partNumber &&
            (ricevimentoData.numeroPezzi || ricevimentoData.numeroColli) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Riepilogo:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Part Number:</span>{" "}
                    {ricevimentoData.partNumber}
                  </p>
                  <p>
                    <span className="font-medium">Pezzi per collo:</span>{" "}
                    {ricevimentoData.numeroPezzi || 0}
                  </p>
                  <p>
                    <span className="font-medium">Numero colli:</span>{" "}
                    {ricevimentoData.numeroColli || 0}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    <span className="font-medium">Totale:</span> {calcolaTotale()}{" "}
                    pezzi
                  </p>
                </div>
              </div>
            )}

          {/* Pulsanti */}
          <div className="flex space-x-4">
            <button
              onClick={handleConfermaRicevimento}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Invio in corso..." : "Conferma Ricevimento"}
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
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-bold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sezione Stampa UDM */}
        {lastTransactionId && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
            <div className="flex items-center mb-4">
              <Printer className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Stampa Etichette UDM
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              Il ricevimento è stato confermato. Puoi ora generare le etichette UDM
              con QR code.
            </p>

            <button
              onClick={handleStampaUdm}
              disabled={loadingPrint}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loadingPrint ? (
                "Generazione PDF in corso..."
              ) : (
                <>
                  <Printer className="h-5 w-5 mr-2" />
                  Genera PDF Etichette UDM
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
