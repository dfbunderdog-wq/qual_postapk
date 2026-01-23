# Pages - Indice

Questa cartella contiene le pagine principali dell'applicazione WMS.

## File disponibili

### LoginPage.jsx (~250 righe)
**Funzione**: Gestisce login, registrazione e demo login  
**State**: formData, isLogin, showPassword, loading, message  
**Props**: onLogin(userData)  
**API**: POST /auth/login, POST /users  

### Dashboard.jsx (~200 righe)
**Funzione**: Dashboard principale con navigazione e statistiche  
**State**: Nessuno (solo navigazione)  
**Props**: user, onLogout, onNavigate  
**Navigazione**: Ricevimento, Stock, Uscita  

### RicevimentoPage.jsx (~350 righe)
**Funzione**: Form ricevimento materiale + stampa PDF UDM  
**State**: ricevimentoData, lastTransactionId, pdfList, loading, loadingPrint, message  
**Props**: user, onLogout, onNavigate  
**API**: POST /stored-procedures (tag: "rice"), POST /stampa-udm-labels  

### StockPage.jsx (~300 righe)
**Funzione**: Form verifica stock materiale  
**State**: stockData, loading, message  
**Props**: user, onLogout, onNavigate  
**API**: POST /stored-procedures (tag: "stock")  

## Convenzioni
- Ogni pagina è self-contained
- Gestisce il proprio state locale
- Riceve props per navigazione (onNavigate) e user management (user, onLogout)
- Importa utils da ../utils/ e componenti da ../components/
