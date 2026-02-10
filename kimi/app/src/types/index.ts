// Tipi principali per il Sistema di Gestione Sicurezza sul Lavoro

export type UserRole = 'admin' | 'consulente' | 'visualizzatore';

export type StatoLavoro = 'in_corso' | 'completato' | 'archiviato';

export type MetodoInput = 'testo' | 'voice';

export type LivelloRischio = 'basso' | 'medio' | 'alto' | 'critico';

export type FormatoReport = 'docx' | 'pdf';

// Utente
export interface User {
  id: string;
  email: string;
  nome_completo: string;
  azienda_id: string;
  ruolo: UserRole;
  created_at: string;
}

// Azienda
export interface Azienda {
  id: string;
  nome: string;
  logo?: string;
  created_at: string;
}

// Lavoro/Progetto
export interface Lavoro {
  id: string;
  nome_azienda_cliente: string;
  nome_progetto: string;
  descrizione: string;
  data_creazione: string;
  data_modifica: string;
  stato: StatoLavoro;
  created_by: string;
  azienda_consulenza: string;
  immagini_count?: number;
}

// Geolocalizzazione
export interface Geolocalizzazione {
  lat: number;
  lng: number;
}

// Riferimento Normativo
export interface RiferimentoNormativo {
  articolo: string;
  decreto: string;
  descrizione: string;
}

// Analisi AI
export interface AnalisiAI {
  id: string;
  immagine_id: string;
  pericoli_identificati: string[];
  livello_rischio: LivelloRischio;
  descrizione_dettagliata: string;
  riferimenti_normativi: RiferimentoNormativo[];
  raccomandazioni: string[];
  created_at: string;
}

// Immagine
export interface Immagine {
  id: string;
  lavoro_id: string;
  url_immagine: string;
  descrizione_utente: string;
  metodo_input: MetodoInput;
  timestamp: string;
  geolocalizzazione?: Geolocalizzazione;
  ordine: number;
  analisi_ai?: AnalisiAI;
  created_at: string;
}

// Report
export interface Report {
  id: string;
  lavoro_id: string;
  formato: FormatoReport;
  url_file?: string;
  generato_da: string;
  created_at: string;
}

// Dati per creazione lavoro
export interface CreateLavoroDTO {
  nome_azienda_cliente: string;
  nome_progetto: string;
  descrizione: string;
}

// Dati per aggiornamento lavoro
export interface UpdateLavoroDTO {
  nome_azienda_cliente?: string;
  nome_progetto?: string;
  descrizione?: string;
  stato?: StatoLavoro;
  immagini_count?: number;
}

// Dati per creazione immagine
export interface CreateImmagineDTO {
  lavoro_id: string;
  url_immagine: string;
  descrizione_utente: string;
  metodo_input: MetodoInput;
  geolocalizzazione?: Geolocalizzazione;
}

// Payload webhook AI
export interface WebhookAIPayload {
  immagine_id: string;
  lavoro_id: string;
  url_immagine: string;
  descrizione_utente: string;
  timestamp: string;
}

// Risposta webhook AI
export interface WebhookAIResponse {
  immagine_id: string;
  analisi: {
    pericoli_identificati: string[];
    livello_rischio: LivelloRischio;
    descrizione_dettagliata: string;
    riferimenti_normativi: RiferimentoNormativo[];
    raccomandazioni: string[];
  };
}

// Filtri per lista lavori
export interface LavoriFilters {
  stato?: StatoLavoro;
  search?: string;
  data_da?: string;
  data_a?: string;
}

// Statistiche dashboard
export interface DashboardStats {
  totali_lavori: number;
  lavori_in_corso: number;
  lavori_completati: number;
  totali_immagini: number;
  pericoli_identificati: number;
  distribuzione_rischio: {
    basso: number;
    medio: number;
    alto: number;
    critico: number;
  };
}
