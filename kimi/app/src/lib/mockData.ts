import type { 
  User, 
  Azienda, 
  Lavoro, 
  Immagine, 
  AnalisiAI, 
  DashboardStats 
} from '@/types';

// Aziende
export const mockAziende: Azienda[] = [
  {
    id: 'azienda-1',
    nome: 'SafeConsulting Srl',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'azienda-2',
    nome: 'Sicurezza & Lavoro Spa',
    created_at: '2024-02-20T14:30:00Z'
  }
];

// Utenti
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@safework.it',
    nome_completo: 'Mario Rossi',
    azienda_id: 'azienda-1',
    ruolo: 'admin',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'consulente@safework.it',
    nome_completo: 'Laura Bianchi',
    azienda_id: 'azienda-1',
    ruolo: 'consulente',
    created_at: '2024-01-20T09:00:00Z'
  },
  {
    id: 'user-3',
    email: 'viewer@safework.it',
    nome_completo: 'Giuseppe Verdi',
    azienda_id: 'azienda-1',
    ruolo: 'visualizzatore',
    created_at: '2024-02-01T11:00:00Z'
  }
];

// Lavori
export const mockLavori: Lavoro[] = [
  {
    id: 'lavoro-1',
    nome_azienda_cliente: 'Edilizia Moderna Spa',
    nome_progetto: 'Valutazione Rischi Cantiere Milano',
    descrizione: 'Ispezione completa del cantiere di Milano per valutazione rischi sicurezza',
    data_creazione: '2024-12-01T08:00:00Z',
    data_modifica: '2024-12-15T16:30:00Z',
    stato: 'in_corso',
    created_by: 'user-2',
    azienda_consulenza: 'azienda-1',
    immagini_count: 12
  },
  {
    id: 'lavoro-2',
    nome_azienda_cliente: 'Metalmeccanica Torino',
    nome_progetto: 'Audit Sicurezza Reparto Produzione',
    descrizione: 'Audit periodico reparto produzione e magazzino',
    data_creazione: '2024-11-20T09:00:00Z',
    data_modifica: '2024-12-10T14:00:00Z',
    stato: 'completato',
    created_by: 'user-2',
    azienda_consulenza: 'azienda-1',
    immagini_count: 8
  },
  {
    id: 'lavoro-3',
    nome_azienda_cliente: 'Logistica Express',
    nome_progetto: 'Verifica DPI e Segnaletica',
    descrizione: 'Verifica conformità DPI e segnaletica di sicurezza',
    data_creazione: '2024-10-05T10:00:00Z',
    data_modifica: '2024-10-20T12:00:00Z',
    stato: 'archiviato',
    created_by: 'user-1',
    azienda_consulenza: 'azienda-1',
    immagini_count: 15
  },
  {
    id: 'lavoro-4',
    nome_azienda_cliente: 'Chimica Italia',
    nome_progetto: 'Valutazione Rischi Agenti Chimici',
    descrizione: 'Valutazione rischi da esposizione ad agenti chimici',
    data_creazione: '2024-12-20T08:30:00Z',
    data_modifica: '2024-12-20T08:30:00Z',
    stato: 'in_corso',
    created_by: 'user-2',
    azienda_consulenza: 'azienda-1',
    immagini_count: 3
  },
  {
    id: 'lavoro-5',
    nome_azienda_cliente: 'Food Processing Srl',
    nome_progetto: 'Ispezione Igiene e Sicurezza',
    descrizione: 'Ispezione completa impianti di produzione alimentare',
    data_creazione: '2024-11-10T07:00:00Z',
    data_modifica: '2024-12-05T15:00:00Z',
    stato: 'completato',
    created_by: 'user-2',
    azienda_consulenza: 'azienda-1',
    immagini_count: 22
  }
];

// Analisi AI
const mockAnalisi1: AnalisiAI = {
  id: 'analisi-1',
  immagine_id: 'img-1',
  pericoli_identificati: ['Caduta dall\'alto', 'Mancanza DPI', 'Accesso non autorizzato'],
  livello_rischio: 'alto',
  descrizione_dettagliata: 'Operatore sta lavorando su scala mobile senza utilizzare imbracatura di sicurezza. La scala non è ancorata e presenta rischio di ribaltamento. Inoltre, è visibile un passaggio sottostante non transennato.',
  riferimenti_normativi: [
    {
      articolo: 'Art. 81',
      decreto: 'D.Lgs. 81/08',
      descrizione: 'Obbligo di utilizzo DPI per lavori in quota'
    },
    {
      articolo: 'Art. 118',
      decreto: 'D.Lgs. 81/08',
      descrizione: 'Dispositivi di protezione individuale anticaduta'
    }
  ],
  raccomandazioni: [
    'Fornire imbracatura con cordino a operatore',
    'Transennare area sottostante',
    'Verificare stabilità scala mobile',
    'Formare personale su procedure lavori in quota'
  ],
  created_at: '2024-12-01T10:30:00Z'
};

const mockAnalisi2: AnalisiAI = {
  id: 'analisi-2',
  immagine_id: 'img-2',
  pericoli_identificati: ['Rischio elettrico', 'Quadro elettrico aperto', 'Accesso non autorizzato'],
  livello_rischio: 'critico',
  descrizione_dettagliata: 'Quadro elettrico aperto in area accessibile al personale. Assenza di segnaletica di pericolo e protezioni adeguate. Presenza di cavi esposti.',
  riferimenti_normativi: [
    {
      articolo: 'Art. 80',
      decreto: 'D.Lgs. 81/08',
      descrizione: 'Impianti elettrici - obblighi del datore di lavoro'
    }
  ],
  raccomandazioni: [
    'Chiudere e bloccare quadro elettrico',
    'Installare segnaletica di pericolo',
    'Effettuare verifica impianto da personale qualificato',
    'Limitare accesso alla zona'
  ],
  created_at: '2024-12-01T11:00:00Z'
};

const mockAnalisi3: AnalisiAI = {
  id: 'analisi-3',
  immagine_id: 'img-3',
  pericoli_identificati: ['Materiale infiammabile', 'Stoccaggio non conforme'],
  livello_rischio: 'medio',
  descrizione_dettagliata: 'Stoccaggio di materiali infiammabili in prossimità di fonti di calore. I contenitori non sono etichettati correttamente.',
  riferimenti_normativi: [
    {
      articolo: 'Art. 120',
      decreto: 'D.Lgs. 81/08',
      descrizione: 'Stoccaggio sostanze pericolose'
    }
  ],
  raccomandazioni: [
    'Allontanare materiali infiammabili da fonti calore',
    'Etichettare correttamente tutti i contenitori',
    'Verificare presenza estintori nelle vicinanze'
  ],
  created_at: '2024-12-01T14:00:00Z'
};

// Immagini
export const mockImmagini: Immagine[] = [
  {
    id: 'img-1',
    lavoro_id: 'lavoro-1',
    url_immagine: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
    descrizione_utente: 'Operatore su scala senza imbracatura',
    metodo_input: 'testo',
    timestamp: '2024-12-01T10:15:00Z',
    geolocalizzazione: { lat: 45.4642, lng: 9.1900 },
    ordine: 1,
    analisi_ai: mockAnalisi1,
    created_at: '2024-12-01T10:30:00Z'
  },
  {
    id: 'img-2',
    lavoro_id: 'lavoro-1',
    url_immagine: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
    descrizione_utente: 'Quadro elettrico aperto',
    metodo_input: 'voice',
    timestamp: '2024-12-01T10:45:00Z',
    geolocalizzazione: { lat: 45.4642, lng: 9.1900 },
    ordine: 2,
    analisi_ai: mockAnalisi2,
    created_at: '2024-12-01T11:00:00Z'
  },
  {
    id: 'img-3',
    lavoro_id: 'lavoro-1',
    url_immagine: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&h=600&fit=crop',
    descrizione_utente: 'Area stoccaggio materiali',
    metodo_input: 'testo',
    timestamp: '2024-12-01T13:30:00Z',
    geolocalizzazione: { lat: 45.4642, lng: 9.1900 },
    ordine: 3,
    analisi_ai: mockAnalisi3,
    created_at: '2024-12-01T14:00:00Z'
  },
  {
    id: 'img-4',
    lavoro_id: 'lavoro-1',
    url_immagine: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    descrizione_utente: 'Cantiere vista generale',
    metodo_input: 'testo',
    timestamp: '2024-12-02T09:00:00Z',
    geolocalizzazione: { lat: 45.4642, lng: 9.1900 },
    ordine: 4,
    created_at: '2024-12-02T09:15:00Z'
  },
  {
    id: 'img-5',
    lavoro_id: 'lavoro-1',
    url_immagine: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    descrizione_utente: 'Ponteggio non conforme',
    metodo_input: 'voice',
    timestamp: '2024-12-03T11:30:00Z',
    geolocalizzazione: { lat: 45.4642, lng: 9.1900 },
    ordine: 5,
    created_at: '2024-12-03T11:45:00Z'
  }
];

// Statistiche dashboard
export const mockDashboardStats: DashboardStats = {
  totali_lavori: 5,
  lavori_in_corso: 2,
  lavori_completati: 2,
  totali_immagini: 60,
  pericoli_identificati: 45,
  distribuzione_rischio: {
    basso: 15,
    medio: 18,
    alto: 9,
    critico: 3
  }
};

// Simulazione delay rete
export const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Storage locale per persistenza dati
const STORAGE_KEYS = {
  USERS: 'safework_users',
  LAVORI: 'safework_lavori',
  IMMAGINI: 'safework_immagini',
  CURRENT_USER: 'safework_current_user'
};

// Inizializza storage se vuoto
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LAVORI)) {
    localStorage.setItem(STORAGE_KEYS.LAVORI, JSON.stringify(mockLavori));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IMMAGINI)) {
    localStorage.setItem(STORAGE_KEYS.IMMAGINI, JSON.stringify(mockImmagini));
  }
};

// Get/Set storage
export const getStorageUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : mockUsers;
};

export const getStorageLavori = (): Lavoro[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LAVORI);
  return data ? JSON.parse(data) : mockLavori;
};

export const getStorageImmagini = (): Immagine[] => {
  const data = localStorage.getItem(STORAGE_KEYS.IMMAGINI);
  return data ? JSON.parse(data) : mockImmagini;
};

export const setStorageLavori = (lavori: Lavoro[]) => {
  localStorage.setItem(STORAGE_KEYS.LAVORI, JSON.stringify(lavori));
};

export const setStorageImmagini = (immagini: Immagine[]) => {
  localStorage.setItem(STORAGE_KEYS.IMMAGINI, JSON.stringify(immagini));
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};
