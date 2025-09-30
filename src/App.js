import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Package,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const WMSSystem = () => {
  const [currentPage, setCurrentPage] = useState("login");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [ricevimentoData, setRicevimentoData] = useState({
    partNumber: "",
    numeroPezzi: "",
    numeroColli: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [user, setUser] = useState(null);

  const DIRECTUS_URL = "https://udog-wms.it.com/directus";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const demoLogin = () => {
    setUser({
      id: "12345",
      first_name: "Mario",
      last_name: "Rossi",
      email: "mario.rossi@example.com",
      status: "active",
    });
    setCurrentPage("dashboard");
    setMessage({ type: "success", text: "Demo login effettuato!" });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
    setMessage({ type: "success", text: "Logout effettuato!" });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage({ type: "", text: "" });
  };

  // PAGINA RICEVIMENTO MATERIALE
  if (currentPage === "ricevimento" && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Banner Info Utente */}
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
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Header Ricevimento */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
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
                  <p className="text-gray-600">
                    Registra l'arrivo di nuova merce
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Form Ricevimento */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Dati di Ricevimento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Part Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Part Number
                </label>
                <input
                  type="text"
                  name="partNumber"
                  value={ricevimentoData.partNumber}
                  onChange={handleRicevimentoChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  placeholder="Inserisci Part Number"
                />
              </div>

              {/* Numero Pezzi */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Numero Pezzi per Collo
                </label>
                <input
                  type="number"
                  name="numeroPezzi"
                  value={ricevimentoData.numeroPezzi}
                  onChange={handleRicevimentoChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Numero Colli */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Numero Colli
                </label>
                <input
                  type="number"
                  name="numeroColli"
                  value={ricevimentoData.numeroColli}
                  onChange={handleRicevimentoChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Totale Calcolato */}
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
                  <h3 className="font-bold text-gray-900 mb-2">
                    Riepilogo Ricevimento:
                  </h3>
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
                      <span className="font-medium">
                        Totale pezzi ricevuti:
                      </span>{" "}
                      {calcolaTotale()}
                    </p>
                  </div>
                </div>
              )}

            {/* Pulsanti */}
            <div className="flex space-x-4">
              <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-bold text-lg">
                Conferma Ricevimento
              </button>
              <button
                onClick={() =>
                  setRicevimentoData({
                    partNumber: "",
                    numeroPezzi: "",
                    numeroColli: "",
                  })
                }
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-bold text-lg"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Statistiche Ricevimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-green-600">15</h4>
              <p className="text-gray-600 text-sm">Ricevimenti Oggi</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-blue-600">842</h4>
              <p className="text-gray-600 text-sm">Pezzi Ricevuti Oggi</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-purple-600">23</h4>
              <p className="text-gray-600 text-sm">Colli Processati</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGINA MAGAZZINO
  if (currentPage === "warehouse" && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Banner Info Utente */}
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
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                >
                  ←
                </button>
                <div className="bg-indigo-600 p-3 rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestione Magazzino
                  </h1>
                  <p className="text-gray-600">Seleziona operazione</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all">
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Ricevimento
                </h3>
                <p className="text-gray-600 mb-6">
                  Gestisci arrivo nuova merce
                </p>
                <button
                  onClick={() => setCurrentPage("ricevimento")}
                  className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-bold"
                >
                  Avvia Ricevimento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Gestione Stock
                </h3>
                <p className="text-gray-600 mb-6">Visualizza inventario</p>
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold">
                  Visualizza Stock
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-green-600">24</h4>
              <p className="text-gray-600 text-sm">Ricevimenti</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-blue-600">1,234</h4>
              <p className="text-gray-600 text-sm">Articoli</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-yellow-600">89%</h4>
              <p className="text-gray-600 text-sm">Riempimento</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-xl font-bold text-purple-600">12</h4>
              <p className="text-gray-600 text-sm">Zone</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (currentPage === "dashboard" && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Banner Info Utente */}
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
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-3 rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    WMS Dashboard
                  </h1>
                  <p className="text-gray-600">Warehouse Management System</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800 font-semibold">
                Sistema WMS Attivo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ricevimento Materiale</h3>
              <p className="text-gray-600 mb-4">
                Gestisci l'arrivo di nuova merce e registra i prodotti ricevuti
              </p>
              <button
                onClick={() => setCurrentPage("ricevimento")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Ricevimento Materiale
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Stock Materiale</h3>
              <p className="text-gray-600 mb-4">
                Visualizza inventario e controlla le scorte disponibili
              </p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Stock Materiale
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Uscita Materiale</h3>
              <p className="text-gray-600 mb-4">
                Gestisci le uscite di materiale e spedizioni
              </p>
              <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold">
                Uscita Materiale
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">1,234</h4>
              <p className="text-gray-600">Prodotti</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">56</h4>
              <p className="text-gray-600">Ordini Oggi</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">€12,450</h4>
              <p className="text-gray-600">Valore</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">98%</h4>
              <p className="text-gray-600">Efficienza</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WMS System</h1>
          <p className="text-gray-600">Warehouse Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-colors ${
                isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg ml-2 transition-colors ${
                !isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrazione
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={demoLogin}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-semibold"
            >
              🚀 Demo Login
            </button>
          </div>

          {message.text && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center ${
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
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nome"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cognome
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Cognome"
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
          >
            {loading ? "Caricamento..." : isLogin ? "Accedi" : "Registrati"}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={toggleForm}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              {isLogin
                ? "Non hai un account? Registrati"
                : "Hai già un account? Accedi"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-white/70 rounded-lg p-3">
            <span className="text-sm text-gray-600">
              Configurato per: {DIRECTUS_URL}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMSSystem;
