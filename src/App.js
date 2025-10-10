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

  // NUOVA FUNZIONE PER CONFERMA RICEVIMENTO
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

    // Costruzione del JSON a due livelli
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

    // DEBUG: Logga i dati che stai inviando
    console.log("Invio dati:", JSON.stringify(requestData, null, 2));

    // Verifica il token
    const token = localStorage.getItem("directus_token");
    console.log("Token presente:", token ? "Sì" : "No");
    console.log("Token value:", token);

    // Se non c'è token, avvisa l'utente
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

      // DEBUG: Mostra in console cosa ritorna il backend
      console.log("Risposta dal backend:", result);
      if (result.data && result.data[0]) {
        console.log("Dati dalla procedure:", result.data[0]);
        if (result.data[0].result) {
          console.log(
            "JSON dalla procedure:",
            JSON.parse(result.data[0].result)
          );
        }
      }

      if (response.ok && result.success) {
        // Parsing del JSON restituito dalla procedure
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
        // Token scaduto - prova a fare refresh
        setMessage({
          type: "error",
          text: "Sessione scaduta. Effettua nuovamente il login.",
        });
        // Opzionale: redirect automatico al login
        // setCurrentPage("login");
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

  const handleRegister = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${DIRECTUS_URL}/users`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          status: "active",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Registrazione completata! Ora puoi effettuare il login.",
        });
        setIsLogin(true);
        setFormData({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.errors?.[0]?.message || "Errore durante la registrazione",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore di connessione. Verifica configurazione Directus.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("directus_token", data.data.access_token);
        localStorage.setItem("directus_refresh_token", data.data.refresh_token);

        const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
          mode: "cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${data.data.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.data);
          setCurrentPage("dashboard");
          setMessage({
            type: "success",
            text: "Login effettuato con successo!",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: data.errors?.[0]?.message || "Credenziali non valide",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore di connessione. Avvia con HTTPS=true npm start per server HTTPS.",
      });
    } finally {
      setLoading(false);
    }
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

  // PAGINA RICEVIMENTO
  if (currentPage === "ricevimento" && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage("dashboard")}
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
                      <span className="font-medium">Totale:</span>{" "}
                      {calcolaTotale()} pezzi
                    </p>
                  </div>
                </div>
              )}

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
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (currentPage === "dashboard" && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <p className="text-gray-600 mb-4">Gestisci arrivo nuova merce</p>
              <button
                onClick={() => setCurrentPage("ricevimento")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Ricevimento Materiale
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Stock Materiale</h3>
              <p className="text-gray-600 mb-4">Visualizza inventario</p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Stock Materiale
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Uscita Materiale</h3>
              <p className="text-gray-600 mb-4">Gestisci uscite materiale</p>
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
              <p className="text-gray-600">Ordini</p>
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
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg ${
                isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg ml-2 ${
                !isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrazione
            </button>
          </div>

          <button
            onClick={demoLogin}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-semibold mb-4"
          >
            🚀 Demo Login
          </button>

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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg pr-10"
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
            onClick={isLogin ? handleLogin : handleRegister}
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
                : "Hai account? Accedi"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-white/70 rounded-lg p-3">
            <span className="text-sm text-gray-600">
              Endpoint:{" "}
              {isLogin ? `${DIRECTUS_URL}/auth/login` : `${DIRECTUS_URL}/users`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMSSystem;
