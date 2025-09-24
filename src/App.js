// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
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

const WMSAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const DIRECTUS_URL = "https://udog-wms.it.com/directus";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("🔐 Tentativo login con:", { email: formData.email });
      console.log("🌐 URL endpoint:", `${DIRECTUS_URL}/auth/login`);
      console.log("🔒 Protocol check:", window.location.protocol);

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

      console.log("📡 Response status:", response.status);
      console.log("🔒 Response headers:", response.headers);

      const data = await response.json();
      console.log("📦 Response data:", data);

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
          setIsAuthenticated(true);
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
      console.error("❌ Login Error Details:", error);
      let errorMessage = "Errore di connessione. ";

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage += "Problema HTTPS/CORS. Avvia con: HTTPS=true npm start";
      } else if (error.message.includes("Mixed Content")) {
        errorMessage +=
          "Server HTTPS richiede app HTTPS. Usa: HTTPS=true npm start";
      } else if (error.name === "TypeError") {
        errorMessage += "Verifica configurazione CORS su Directus.";
      } else {
        errorMessage += "Verifica che Directus sia raggiungibile.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("📝 Tentativo registrazione con:", {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

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

      console.log("📡 Registration Response status:", response.status);

      const data = await response.json();
      console.log("📦 Registration Response data:", data);

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Registrazione completata! Ora puoi effettuare il login.",
        });
        setIsLogin(true);
        setFormData({
          ...formData,
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
      console.error("❌ Registration Error Details:", error);
      setMessage({
        type: "error",
        text: "Errore di connessione. Verifica che Directus sia raggiungibile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("directus_token");
    localStorage.removeItem("directus_refresh_token");
    setIsAuthenticated(false);
    setUser(null);
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    });
    setMessage({ type: "success", text: "Logout effettuato con successo!" });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage({ type: "", text: "" });
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    });
  };

  const demoLogin = () => {
    setUser({
      id: "12345",
      first_name: "Mario",
      last_name: "Rossi",
      email: "mario.rossi@example.com",
      status: "active",
    });
    setIsAuthenticated(true);
    setMessage({ type: "success", text: "Demo login effettuato!" });
  };

  // Dashboard dopo il login
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
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
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <span className="text-green-800 font-semibold">
                  Sistema WMS Attivo
                </span>
                <p className="text-green-600 text-sm">
                  Connesso a Directus ({DIRECTUS_URL})
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Informazioni Utente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">
                  Nome Completo
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Email</p>
                <p className="text-lg font-bold text-green-900">{user.email}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">ID Utente</p>
                <p className="text-lg font-bold text-purple-900">{user.id}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Moduli WMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Gestione Magazzino
              </h3>
              <p className="text-gray-600 mb-4">
                Visualizza e gestisci l'inventario, scorte e ubicazioni del
                magazzino.
              </p>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                Accedi al Magazzino
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Gestione Ordini
              </h3>
              <p className="text-gray-600 mb-4">
                Gestisci ordini in entrata, uscita e tracking delle spedizioni.
              </p>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                Visualizza Ordini
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Reports & Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Genera report dettagliati e visualizza statistiche di
                performance.
              </p>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Visualizza Reports
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">1,234</h4>
              <p className="text-gray-600">Prodotti Totali</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">56</h4>
              <p className="text-gray-600">Ordini Oggi</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">€12,450</h4>
              <p className="text-gray-600">Valore Inventario</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <h4 className="text-2xl font-bold text-gray-900">98.5%</h4>
              <p className="text-gray-600">Efficienza</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form di autenticazione
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WMS System</h1>
          <p className="text-gray-600">Warehouse Management System</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-colors ${
                isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg ml-2 transition-colors ${
                !isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrazione
            </button>
          </div>

          {/* Demo Button */}
          <div className="mb-4">
            <button
              onClick={demoLogin}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-sm"
            >
              🚀 Demo Login (senza Directus)
            </button>
          </div>

          {/* Messaggi di errore/successo */}
          {message.text && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div>
            {/* Campi Nome e Cognome per la registrazione */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nome"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cognome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Cognome"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
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

            {/* Submit Button */}
            <button
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {loading ? "Caricamento..." : isLogin ? "Accedi" : "Registrati"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={toggleForm}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {isLogin
                ? "Non hai un account? Registrati qui"
                : "Hai già un account? Accedi qui"}
            </button>
          </div>
        </div>

        {/* Info sulla connessione */}
        <div className="mt-6 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                Configurato per:{" "}
                {isLogin ? DIRECTUS_URL : `${DIRECTUS_URL}/users`}
              </span>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-medium">
              🔧 Server HTTPS rilevato - Verifica configurazione SSL/CORS
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Avvia con: HTTPS=true npm start per compatibilità HTTPS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMSAuth;
