// Legge URL da variabile ambiente
export const DIRECTUS_URL = process.env.REACT_APP_DIRECTUS_URL;

// Fallback se manca (solo per sicurezza)
if (!DIRECTUS_URL) {
  console.error("⚠️ REACT_APP_DIRECTUS_URL non configurato in .env");
  throw new Error("Missing DIRECTUS_URL configuration");
}
