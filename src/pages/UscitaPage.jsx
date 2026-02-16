import React, { useState, useEffect } from "react";
import {
  Package,
  ArrowLeft,
  LogOut,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Camera,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DIRECTUS_URL } from "../utils/constants";
import QrScannerWeb from "../components/QrScannerWeb";

const UscitaPage = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['uscita', 'common']);
  
  const [udmList, setUdmList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedUdm, setSelectedUdm] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statoFilter, setStatoFilter] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);

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

  useEffect(() => {
    handleCaricaUdm();
  }, []);

  useEffect(() => {
    let filtered = udmList;
    
    if (searchTerm !== "") {
      const searchTerms = searchTerm
        .split(";")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      if (searchTerms.length > 0) {
        filtered = filtered.filter((udm) =>
          searchTerms.some((term) =>
            udm.cod_udm.toLowerCase().includes(term.toLowerCase())
          )
        );
      }
    }
    
    if (statoFilter !== null) {
      filtered = filtered.filter((udm) => udm.stato === statoFilter);
    }
    
    setFilteredList(filtered);
    setSelectedUdm([]);
  }, [searchTerm, statoFilter, udmList]);

  const handleCaricaUdm = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const requestData = {
      metadata: { tag: "uscita" },
      data: {
        procedureName: "get_all_udm",
        jsonData: { limit: 1000, offset: 0 },
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

        if (procedureResult && procedureResult.udm_list) {
          setUdmList(procedureResult.udm_list);
          setFilteredList(procedureResult.udm_list);
          setSelectedUdm([]);
          setMessage({
            type: "success",
            text: t('uscita:messages.loaded', { count: procedureResult.udm_count }),
          });
        } else {
          setMessage({
            type: "warning",
            text: t('uscita:messages.noUdmFound'),
          });
        }
      } else if (response.status === 401) {
        setMessage({
          type: "error",
          text: t('common:messages.sessionExpired'),
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || t('uscita:messages.loadError', { 
            defaultValue: "Errore durante il caricamento degli UDM" 
          }),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t('common:messages.connectionError'),
      });
      console.error("Errore chiamata API:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStati = () => {
    const statiSet = new Set();
    udmList.forEach(udm => {
      if (udm.stato) {
        statiSet.add(udm.stato);
      }
    });
    return Array.from(statiSet).sort();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("it-IT", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectUdm = (idudm) => {
    setSelectedUdm((prev) => {
      if (prev.includes(idudm)) {
        return prev.filter((id) => id !== idudm);
      } else {
        return [...prev, idudm];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUdm.length === filteredList.length) {
      setSelectedUdm([]);
    } else {
      setSelectedUdm(filteredList.map((udm) => udm.idudm));
    }
  };
  
  const handleCreaSpedizione = async () => {
    if (selectedUdm.length === 0) {
      setMessage({
        type: "error",
        text: t('uscita:warnings.selectAtLeastOne'),
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const requestData = {
      metadata: { tag: "uscita" },
      data: {
        procedureName: "create_shipment",
        jsonData: {
          udm_ids: selectedUdm,
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

      if (response.ok && result.success) {
        const procedureResult = result.data[0]?.result
          ? JSON.parse(result.data[0].result)
          : null;

        if (procedureResult) {
          if (procedureResult.status === "success") {
            setMessage({
              type: "success",
              text: t('uscita:messages.shipmentCreated', { message: procedureResult.message }),
            });

            setSelectedUdm([]);
            setTimeout(() => {
              handleCaricaUdm();
            }, 1500);
          } else {
            let errorText = procedureResult.message;

            if (procedureResult.udm_not_found_list && procedureResult.udm_not_found_list.length > 0) {
              const notFoundList = procedureResult.udm_not_found_list.join(", ");
              errorText += `\nUDM non trovati (ID): ${notFoundList}`;
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
          text: result.error || t('uscita:messages.shipmentError'),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t('common:messages.connectionError'),
      });
      console.error("Errore chiamata API:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = filteredList.length > 0 && selectedUdm.length === filteredList.length;
  const isSomeSelected = selectedUdm.length > 0 && selectedUdm.length < filteredList.length;

  const handleOpenScanner = () => {
    setScannerActive(true);
    setMessage({ type: "", text: "" });
  };

  const handleScanSuccess = (scannedData) => {
    if (Array.isArray(scannedData) && scannedData.length > 0) {
      const concatenatedCodes = scannedData.join(";");
      setSearchTerm(concatenatedCodes);
      
      setMessage({
        type: "success",
        text: t('uscita:scanner.scannedSuccess', { count: scannedData.length }),
      });
    }
  };

  const handleScannerClose = () => {
    setScannerActive(false);
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sorted = [...filteredList].sort((a, b) => {
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      
      if (key === 'idudm' || key === 'idship') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredList(sorted);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '⇅';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Badge colore per stato
  const getStatoBadgeClass = (stato) => {
    if (stato === "CREATO") return "bg-green-100 text-green-800 border-green-200";
    if (stato === "IN_TRANSITO") return "bg-blue-100 text-blue-800 border-blue-200";
    if (stato === "STOCCATO") return "bg-purple-100 text-purple-800 border-purple-200";
    if (stato === "SPEDITO") return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header - Identico alle altre pagine */}
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
              
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-2.5 sm:p-3 rounded-xl shadow-md flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-gray-900 text-sm sm:text-lg md:text-xl truncate">
                  {t('uscita:title')}
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
                : message.type === "warning"
                ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-200"
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

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6">
          {/* Riga 1: Ricerca + Azioni */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleOpenScanner}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Camera className="h-5 w-5" />
              <span>{t('uscita:buttons.scan')}</span>
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder={t('uscita:search.placeholder')}
              />
            </div>

            <button
              onClick={handleCaricaUdm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? t('uscita:buttons.reloading') : t('uscita:buttons.reload')}</span>
            </button>
          
            <button
              onClick={handleCreaSpedizione}
              disabled={
                loading || 
                selectedUdm.length === 0 || 
                filteredList.some(udm => 
                  selectedUdm.includes(udm.idudm) && 
                  udm.idship != null
                )
              }
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Package className="h-5 w-5" />
              <span>
                {t('uscita:buttons.createShipment')} {selectedUdm.length > 0 && `(${selectedUdm.length})`}
              </span>
            </button>
          </div>
          
          {/* Riga 2: Filtri Stato */}
          {udmList.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap pb-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{t('uscita:filters.filterByStatus')}</span>
              
              <button
                onClick={() => setStatoFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statoFilter === null
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t('uscita:filters.all')} ({udmList.length})
              </button>
              
              {getAvailableStati().map((stato) => {
                const count = udmList.filter(udm => udm.stato === stato).length;
                const isActive = statoFilter === stato;
                
                let colorClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
                if (isActive) {
                  if (stato === "CREATO") colorClass = "bg-green-600 text-white";
                  else if (stato === "IN_TRANSITO") colorClass = "bg-blue-600 text-white";
                  else if (stato === "STOCCATO") colorClass = "bg-purple-600 text-white";
                  else if (stato === "SPEDITO") colorClass = "bg-orange-600 text-white";
                  else colorClass = "bg-gray-700 text-white";
                } else {
                  if (stato === "CREATO") colorClass = "bg-green-100 text-green-700 hover:bg-green-200";
                  else if (stato === "IN_TRANSITO") colorClass = "bg-blue-100 text-blue-700 hover:bg-blue-200";
                  else if (stato === "STOCCATO") colorClass = "bg-purple-100 text-purple-700 hover:bg-purple-200";
                  else if (stato === "SPEDITO") colorClass = "bg-orange-100 text-orange-700 hover:bg-orange-200";
                }
                
                return (
                  <button
                    key={stato}
                    onClick={() => setStatoFilter(stato)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClass}`}
                  >
                    {stato} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Riga 3: Contatori */}
          <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
            <div>
              {filteredList.length > 0 ? (
                <span dangerouslySetInnerHTML={{
                  __html: t('uscita:results.showing', { 
                    filtered: filteredList.length,
                    total: udmList.length
                  })
                }} />
              ) : (
                <span>{t('uscita:results.noResults')}</span>
              )}
            </div>
            
            {selectedUdm.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600">
                  {t('uscita:results.selected', { count: selectedUdm.length })}
                </span>
                <button
                  onClick={() => setSelectedUdm([])}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {t('uscita:buttons.deselectAll')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: Tabella (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
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
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('idudm')}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    {t('uscita:table.id')} {getSortIcon('idudm')}
                  </th>
                  <th 
                    onClick={() => handleSort('cod_udm')}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    {t('uscita:table.code')} {getSortIcon('cod_udm')}
                  </th>
                  <th 
                    onClick={() => handleSort('stato')}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    {t('uscita:table.status')} {getSortIcon('stato')}
                  </th>
                  <th 
                    onClick={() => handleSort('data_ins')}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    {t('uscita:table.insertDate')} {getSortIcon('data_ins')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('uscita:table.transactionId')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('uscita:table.shipmentId')}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatoBadgeClass(udm.stato)}`}>
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
                        {udm.idship || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {loading ? t('common:actions.loading') : t('uscita:table.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE: Card Layout (hidden on desktop) */}
        <div className="md:hidden space-y-3">
          {filteredList.length > 0 ? (
            filteredList.map((udm) => (
              <div
                key={udm.idudm}
                className={`bg-white rounded-xl p-4 shadow-md transition-all ${
                  selectedUdm.includes(udm.idudm) ? "ring-2 ring-red-500 bg-red-50" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedUdm.includes(udm.idudm)}
                      onChange={() => handleSelectUdm(udm.idudm)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-gray-900 truncate">
                        {udm.cod_udm}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {udm.idudm}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${getStatoBadgeClass(udm.stato)}`}>
                    {udm.stato || "N/A"}
                  </span>
                </div>
                
                <div className="space-y-1.5 text-xs text-gray-600 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium">Data:</span>
                    <span>{formatDate(udm.data_ins)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Trans ID:</span>
                    <span className="font-mono">{udm.idtrn ? udm.idtrn.substring(0, 8) + "..." : "N/A"}</span>
                  </div>
                  {udm.idship && (
                    <div className="flex justify-between">
                      <span className="font-medium">Ship ID:</span>
                      <span className="font-mono">{udm.idship}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              {loading ? t('common:actions.loading') : t('uscita:table.noData')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p dangerouslySetInnerHTML={{
            __html: t('uscita:results.total', { count: udmList.length })
          }} />
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
