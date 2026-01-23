import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { DIRECTUS_URL } from "../utils/constants";

const LoginPage = ({ onLogin }) => {
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          onLogin(userData.data);
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
    const demoUser = {
      id: "12345",
      first_name: "Mario",
      last_name: "Rossi",
      email: "mario.rossi@example.com",
      status: "active",
    };
    onLogin(demoUser);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage({ type: "", text: "" });
  };

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
                : "Hai già un account? Accedi"}
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

export default LoginPage;
