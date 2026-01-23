import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RicevimentoPage from "./pages/RicevimentoPage";
import StockPage from "./pages/StockPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
    localStorage.removeItem("directus_token");
    localStorage.removeItem("directus_refresh_token");
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Routing
  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentPage === "dashboard" && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPage === "ricevimento" && user) {
    return (
      <RicevimentoPage
        user={user}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPage === "stock" && user) {
    return (
      <StockPage
        user={user}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
    );
  }

  // Fallback
  return <LoginPage onLogin={handleLogin} />;
};

export default App;
