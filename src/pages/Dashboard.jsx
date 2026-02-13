import React, { useEffect } from "react";
import { Package, LogOut, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

const Dashboard = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['dashboard', 'common']);

  // Debug: mostra cosa c'è nell'oggetto user
  useEffect(() => {
    console.log("📋 User object completo:", user);
    console.log("📋 first_name:", user?.first_name);
    console.log("📋 last_name:", user?.last_name);
    console.log("📋 email:", user?.email);
  }, [user]);

  // Gestione robusta dei dati utente con fallback
  const getDisplayName = () => {
    // Caso 1: Ha first_name e last_name
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // Caso 2: Ha solo first_name
    if (user?.first_name) {
      return user.first_name;
    }
    
    // Caso 3: Ha solo email - usa la parte prima della @
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    // Caso 4: Fallback generico
    return 'User';
  };
  
  const displayName = getDisplayName();
  const displayEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        
        {/* Header professionale - Layout migliorato */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6">
          {/* Riga 1: User info + Logout */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            {/* User Avatar + Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl shadow-md flex-shrink-0">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                  {displayName}
                </h2>
                {displayEmail && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
            
            {/* Logout Button - Sempre visibile e grande */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-white font-bold text-sm sm:text-base ml-3 flex-shrink-0"
              title={t('common:actions.logout')}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline sm:inline">Logout</span>
            </button>
          </div>
          
          {/* Riga 2: Language + Status */}
          <div className="flex items-center justify-between gap-3">
            <LanguageSelector />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status:</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                {user?.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottoni Navigazione - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Bottone Ricevimento */}
          <button
            onClick={() => onNavigate("ricevimento")}
            className="bg-white hover:shadow-2xl transition-all duration-200 rounded-xl p-5 sm:p-6 text-left group border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-200 p-4 rounded-xl flex-shrink-0 shadow-md">
                <Package className="h-7 w-7 sm:h-8 sm:w-8 text-green-700 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors">
                  {t('dashboard:ricevimento.title')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {t('dashboard:ricevimento.description')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Bottone Stock */}
          <button
            onClick={() => onNavigate("stock")}
            className="bg-white hover:shadow-2xl transition-all duration-200 rounded-xl p-5 sm:p-6 text-left group border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200 p-4 rounded-xl flex-shrink-0 shadow-md">
                <Package className="h-7 w-7 sm:h-8 sm:w-8 text-blue-700 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                  {t('dashboard:stock.title')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {t('dashboard:stock.description')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Bottone Uscita */}
          <button
            onClick={() => onNavigate("uscita")}
            className="bg-white hover:shadow-2xl transition-all duration-200 rounded-xl p-5 sm:p-6 text-left group border-2 border-transparent hover:border-red-200"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-600 group-hover:to-red-700 transition-all duration-200 p-4 rounded-xl flex-shrink-0 shadow-md">
                <Package className="h-7 w-7 sm:h-8 sm:w-8 text-red-700 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 group-hover:text-red-700 transition-colors">
                  {t('dashboard:uscita.title')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {t('dashboard:uscita.description')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            WMS System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
