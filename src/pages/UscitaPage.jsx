import React, { useState, useEffect } from "react";
import {
  Package,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Camera,
} from "lucide-react";
import { DIRECTUS_URL } from "../utils/constants";
import QrScannerWeb from "../components/QrScannerWeb";

const UscitaPage = ({ user, onLogout, onNavigate }) => {
  const [udmList, setUdmList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedUdm, setSelectedUdm] = useState([]); // Array di ID selezionati
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  
  // State per scanner
  const [scannerActive, setScannerActive] = useState(false);

  // Carica UDM all'avvio
  useEffect(() => {
    handleCaricaUdm();
  }, []);

  // Filtra lista quando cambia searchTerm
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredList(udmList);
    } else {
      // Splitta per ";" e rimuovi spazi vuoti
      const searchTerms = searchTerm
        .split(";")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      if (searchTerms.length === 0) {
        setFilteredList(udmList);
      } else {
        // Filtra UDM che matchano QUALSIASI dei termini cercati
        const filtered = udmList.filter((udm) =>
          searchTerms.some((term) =>
            udm.cod_udm.toLowerCase().includes(term.toLowerCase())
          )
        );
        setFilteredList(filtered);
      }
    }
    // Reset selezione quando cambia la ricerca
    setSelectedUdm([]);
  }, [searchTerm, udmList]);

  const handleCaricaUdm = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const requestData = {
      metadata: {
        tag: "uscita",
      },
      data: {
        procedureName: "get_all_udm",
        jsonData: {
          limit: 1000,
          offset: 0,
        },
      },
    };

    const token = localStorage.getItem("directus_token");

    if (!token) {
      setMessage({
        type: "error",
        text: "Token di autenticazione mancante. Effettua il login.",
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

        if (procedureResult && procedureResult.udm_list) {
          setUdmList(procedureResult.udm_list);
          setFilteredList(procedureResult.udm_list);
          setSelectedUdm([]); // Reset selezione quando si ricaricano i dati
          setMessage({
            type: "success",
            text: `Caricati ${procedureResult.udm_count} UDM`,
          });
        } else {
          setMessage({
            type: "warning",
            text: "Nessun UDM trovato",
          });
        }
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: "Sessione scaduta. Effettua nuovamente il login.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Errore durante il caricamento degli UDM",
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("it-IT");
  };

  // Gestione selezione singola
  const handleSelectUdm = (idudm) => {
    setSelectedUdm((prev) => {
      if (prev.includes(idudm)) {
        // Se già selezionato, rimuovi
        return prev.filter((id) => id !== idudm);
      } else {
        // Altrimenti aggiungi
        return [...prev, idudm];
      }
    });
  };

  // Gestione selezione tutti
  const handleSelectAll = () => {
    if (selectedUdm.length === filteredList.length) {
      // Se tutti selezionati, deseleziona tutti
      setSelectedUdm([]);
    } else {
      // Altrimenti seleziona tutti quelli visibili
      setSelectedUdm(filteredList.map((udm) => udm.idudm));
    }
  };

  // Verifica se tutti sono selezionati
  const isAllSelected = filteredList.length > 0 && selectedUdm.length === filteredList.length;
  
  // Verifica se alcuni sono selezionati (per stato indeterminato)
  const isSomeSelected = selectedUdm.length > 0 && selectedUdm.length < filteredList.length;

  // Handler per aprire scanner multiplo
  const handleOpenScanner = () => {
    console.log("📷 Apertura scanner multiplo per filtro UDM");
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  // Handler per ricevere i dati dallo scanner
  const handleScanSuccess = (scannedData) => {
    if (Array.isArray(scannedData) && scannedData.length > 0) {
      // Concatena i codici con ";"
      const concatenatedCodes = scannedData.join(";");
      setSearchTerm(concatenatedCodes);
      
      setMessage({
        type: "success",
        text: `${scannedData.length} codici UDM scansionati e aggiunti al filtro!`,
      });
      console.log("✅ UDM scansionati per filtro:", scannedData);
    }
  };

  // Handler per chiusura scanner
  const handleScannerClose = () => {
    setScannerActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <div className="bg-red-600 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Uscita Materiale
                </h1>
                <p className="text-gray-600">Visualizza tutti gli UDM in magazzino</p>
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
                : message.type === "warning"
                ? "bg-yellow-50 text-yellow-700"
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

        {/* Toolbar: Scanner, Ricerca e Ricarica */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 items-center">
            {/* Bottone Scanner */}
            <button
              onClick={handleOpenScanner}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              title="Scansiona multipli QR Code UDM"
            >
              <Camera className="h-5 w-5" />
              <span className="hidden sm:inline">Scansiona UDM</span>
            </button>

            {/* Campo ricerca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Cerca per Codice UDM (usa ; per cercare più UDM)..."
              />
              {/* Badge numero termini di ricerca */}
              {searchTerm && searchTerm.includes(";") && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {searchTerm.split(";").filter((t) => t.trim()).length} UDM cercati
                  </span>
                </div>
              )}
            </div>

            {/* Bottone Ricarica */}
            <button
              onClick={handleCaricaUdm}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{loading ? "Caricamento..." : "Ricarica"}</span>
            </button>
          </div>

          {/* Contatore risultati */}
          <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
            <div className="space-y-1">
              {filteredList.length > 0 ? (
                <span>
                  Visualizzati <strong>{filteredList.length}</strong> di{" "}
                  <strong>{udmList.length}</strong> UDM totali
                </span>
              ) : (
                <span>Nessun risultato</span>
              )}
              
              {/* Suggerimento ricerca multipla */}
              {searchTerm && searchTerm.includes(";") && (
                <div className="text-xs text-blue-600">
                  💡 Ricerca multipla attiva: {searchTerm.split(";").filter((t) => t.trim()).length} codici UDM
                </div>
              )}
            </div>
            
            {/* Indicatore selezione */}
            {selectedUdm.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600">
                  {selectedUdm.length} UDM selezionati
                </span>
                <button
                  onClick={() => setSelectedUdm([])}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Deseleziona tutti
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabella UDM */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                      title={isAllSelected ? "Deseleziona tutti" : "Seleziona tutti"}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Codice UDM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Data Inserimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID Transazione
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Id Shipment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredList.length > 0 ? (
                  filteredList.map((udm) => (
                    <tr
                      key={udm.idudm}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedUdm.includes(udm.idudm) ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUdm.includes(udm.idudm)}
                          onChange={() => handleSelectUdm(udm.idudm)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {udm.idudm}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {udm.cod_udm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            udm.stato === "CREATO"
                              ? "bg-green-100 text-green-800"
                              : udm.stato === "IN_TRANSITO"
                              ? "bg-blue-100 text-blue-800"
                              : udm.stato === "STOCCATO"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {udm.stato || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(udm.data_ins)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {udm.idtrn ? udm.idtrn.substring(0, 8) + "..." : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {udm.iduser ? udm.iduser.substring(0, 8) + "..." : "N/A"}
                      </td>
	              <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {udm.idship ? udm.idship.substring(0, 8) + "..." : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {loading
                        ? "Caricamento in corso..."
                        : searchTerm
                        ? "Nessun risultato trovato per la ricerca"
                        : "Nessun UDM trovato. Carica i dati."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Totale UDM: <strong>{udmList.length}</strong>
          </p>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerActive && (
        <QrScannerWeb
          onScanSuccess={handleScanSuccess}
          onClose={handleScannerClose}
          scanMode="multiple"
        />
      )}
    </div>
  );
};

export default UscitaPage;

