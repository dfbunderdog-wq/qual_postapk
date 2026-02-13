import React from "react";
import { Package, User, Mail, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

const Dashboard = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                <span className="text-gray-500">{t('common:user.id')}:</span>
                <span className="text-gray-600">{user.id}</span>
              </div>
            </div>
            
            {/* Language Selector + Status */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Titolo Dashboard */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('dashboard:title')}
                </h1>
                <p className="text-gray-600">{t('dashboard:subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              {t('common:actions.logout')}
            </button>
          </div>
        </div>

        {/* Banner Sistema Attivo */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-green-800 font-semibold">
              {t('dashboard:systemActive')}
            </span>
          </div>
        </div>

        {/* Card Navigazione */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Ricevimento */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('dashboard:ricevimento.title')}</h3>
            <p className="text-gray-600 mb-4">{t('dashboard:ricevimento.description')}</p>
            <button
              onClick={() => onNavigate("ricevimento")}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              {t('dashboard:ricevimento.button')}
            </button>
          </div>

          {/* Card Stock */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('dashboard:stock.title')}</h3>
            <p className="text-gray-600 mb-4">{t('dashboard:stock.description')}</p>
            <button
              onClick={() => onNavigate("stock")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              {t('dashboard:stock.button')}
            </button>
          </div>

          {/* Card Uscita */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('dashboard:uscita.title')}</h3>
            <p className="text-gray-600 mb-4">{t('dashboard:uscita.description')}</p>
            <button
              onClick={() => onNavigate("uscita")}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              {t('dashboard:uscita.button')}
            </button>
          </div>
        </div>

        {/* Statistiche Mock */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <h4 className="text-2xl font-bold text-gray-900">1,234</h4>
            <p className="text-gray-600">{t('dashboard:stats.products')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <h4 className="text-2xl font-bold text-gray-900">56</h4>
            <p className="text-gray-600">{t('dashboard:stats.orders')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <h4 className="text-2xl font-bold text-gray-900">€12,450</h4>
            <p className="text-gray-600">{t('dashboard:stats.value')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <h4 className="text-2xl font-bold text-gray-900">98%</h4>
            <p className="text-gray-600">{t('dashboard:stats.efficiency')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
