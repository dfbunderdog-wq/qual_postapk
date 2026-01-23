import React, { useState } from "react";
import {
  Package,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { DIRECTUS_URL } from "../utils/constants";

const StockPage = ({ user, onLogout, onNavigate }) => {
  const [stockData, setStockData] = useState({
    partNumber: "",
    numeroPezzi: "",
    numeroColli: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleStockChange = (e) => {
    setStockData({
      ...stockData,
      [e.target.name]: e.target.value,
    });
  };

  const calcolaTotaleStock = () => {
    const pezzi = parseFloat(stockData.numeroPezzi) || 0;
    const colli = parseFloat(stockData.numeroColli) || 0;
    return pezzi * colli;
  };

  const handleConfermaStock = async () => {
    // Validazione dati
    if (!stockData.partNumber) {
      setMessage({
        type: "error",
        text: "Inserire il Part Number",
      });
      return;
    }

    if (calcolaTotaleStock() === 0) {
      setMessage({
        type: "error",
        text: "Il totale pezzi deve essere maggiore di zero",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const requestData = {
      metadata: {
        tag: "stock",
      },
      data: {
        procedureName: "stock_materiale",
        jsonData: {
          partNumber: stockData.partNumber,
          totalePezzi: calcolaTotaleStock(),
          numeroPezzi: parseFloat(stockData.numeroPezzi) || 0,
          numeroColli: parseFloat(stockData.numeroColli) || 0,
          timestamp: new Date().toISOString(),
          userId: user.id,
        },
      },
    };

    console.log("Invio dati Stock:", JSON.stringify(requestData, null, 2));

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

      console.log("Risposta dal backend Stock:", result);
      if (result.data && result.data[0]) {
        console.log("Dati dalla procedure Stock:", result.data[0]);
        if (result.data[0].result) {
          console.log(
            "JSON dalla procedure Stock:",
            JSON.parse(result.data[0].result)
          );
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
            `Stock verificato! Part Number: ${
              stockData.partNumber
            }, Totale: ${calcolaTotaleStock()} pezzi`,
        });

        // Reset del form dopo successo
        setStockData({
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
          text: result.error || "Errore durante la verifica dello stock",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore di connessione con il server",
      });
      console.error("Errore chiamata API Stock:", error);
    } finally {
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
            Dati di Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Part Number *
              </label>
              <input
                type="text"
                name="partNumber"
                value={stockData.partNumber}
                onChange={handleStockChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
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
                value={stockData.numeroPezzi}
                onChange={handleStockChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
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
                value={stockData.numeroColli}
                onChange={handleStockChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="0"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Totale Pezzi
              </label>
              <div className="w-full px-4 py-3 border-2 border-blue-300 bg-blue-50 rounded-lg text-lg font-bold text-blue-800">
                {calcolaTotaleStock()} pezzi
              </div>
            </div>
          </div>

          {/* Riepilogo */}
          {stockData.partNumber &&
            (stockData.numeroPezzi || stockData.numeroColli) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Riepilogo:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Part Number:</span>{" "}
                    {stockData.partNumber}
                  </p>
                  <p>
                    <span className="font-medium">Pezzi per collo:</span>{" "}
                    {stockData.numeroPezzi || 0}
                  </p>
                  <p>
                    <span className="font-medium">Numero colli:</span>{" "}
                    {stockData.numeroColli || 0}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    <span className="font-medium">Totale:</span>{" "}
                    {calcolaTotaleStock()} pezzi
                  </p>
                </div>
              </div>
            )}

          {/* Pulsanti */}
          <div className="flex space-x-4">
            <button
              onClick={handleConfermaStock}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Invio in corso..." : "Conferma Stock"}
            </button>
            <button
              onClick={() =>
                setStockData({
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
      </div>
    </div>
  );
};

export default StockPage;
