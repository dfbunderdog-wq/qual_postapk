# Utils - Indice

Questa cartella contiene utility functions condivise nell'applicazione.

## File disponibili

### constants.js (~5 righe)
**Funzione**: Costanti globali dell'applicazione  
**Esporta**: DIRECTUS_URL  
**Uso**: Import in tutte le pagine per chiamate API  

### pdfUtils.js (~50 righe)
**Funzione**: Gestione download PDF da base64  
**Esporta**: downloadPdf(base64String, filename)  
**Uso**: Import in RicevimentoPage per scaricare etichette UDM  
**Processo**:
1. Pulisce base64 (rimuove spazi/newline)
2. Decodifica in byte array
3. Crea Blob PDF
4. Avvia download automatico
5. Cleanup risorse

## Quando aggiungere nuove utilities

**Crea un nuovo file in utils/ quando**:
- Una funzione è usata in 2+ pagine diverse
- Una logica è complessa e merita di essere isolata
- Vuoi testare separatamente una funzione

**Esempi di future utilities**:
- formatDate.js - formattazione date
- validation.js - validazioni form comuni
- apiClient.js - wrapper fetch con retry/interceptors
