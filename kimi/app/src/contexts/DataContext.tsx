import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  Lavoro, 
  Immagine, 
  CreateLavoroDTO, 
  UpdateLavoroDTO,
  CreateImmagineDTO,
  AnalisiAI,
  DashboardStats
} from '@/types';
import { 
  getStorageLavori, 
  getStorageImmagini, 
  setStorageLavori, 
  setStorageImmagini,
  simulateNetworkDelay 
} from '@/lib/mockData';
import { analyzeImageWithAI } from '@/lib/openai';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  // Lavori
  lavori: Lavoro[];
  getLavoro: (id: string) => Lavoro | undefined;
  createLavoro: (data: CreateLavoroDTO, userId: string, aziendaId: string) => Promise<Lavoro>;
  updateLavoro: (id: string, data: UpdateLavoroDTO) => Promise<Lavoro>;
  deleteLavoro: (id: string) => Promise<void>;
  
  // Immagini
  immagini: Immagine[];
  getImmaginiByLavoro: (lavoroId: string) => Immagine[];
  getImmagine: (id: string) => Immagine | undefined;
  createImmagine: (data: CreateImmagineDTO, file: File) => Promise<Immagine>;
  deleteImmagine: (id: string) => Promise<void>;
  
  // Analisi AI
  requestAIAnalysis: (immagineId: string) => Promise<AnalisiAI | null>;
  
  // Statistiche
  getDashboardStats: () => Promise<DashboardStats>;
  
  // Refresh
  refreshData: () => void;
  
  // Update immagine
  updateImmagine: (immagine: Immagine) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Converte File in base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [lavori, setLavori] = useState<Lavoro[]>(getStorageLavori());
  const [immagini, setImmagini] = useState<Immagine[]>(getStorageImmagini());

  const refreshData = useCallback(() => {
    setLavori(getStorageLavori());
    setImmagini(getStorageImmagini());
  }, []);

  // Lavori
  const getLavoro = useCallback((id: string) => {
    return lavori.find(l => l.id === id);
  }, [lavori]);

  const createLavoro = async (data: CreateLavoroDTO, userId: string, aziendaId: string): Promise<Lavoro> => {
    await simulateNetworkDelay(600);
    
    const newLavoro: Lavoro = {
      id: uuidv4(),
      ...data,
      data_creazione: new Date().toISOString(),
      data_modifica: new Date().toISOString(),
      stato: 'in_corso',
      created_by: userId,
      azienda_consulenza: aziendaId,
      immagini_count: 0
    };
    
    const updatedLavori = [...lavori, newLavoro];
    setLavori(updatedLavori);
    setStorageLavori(updatedLavori);
    
    return newLavoro;
  };

  const updateLavoro = async (id: string, data: UpdateLavoroDTO): Promise<Lavoro> => {
    await simulateNetworkDelay(500);
    
    const lavoroIndex = lavori.findIndex(l => l.id === id);
    if (lavoroIndex === -1) {
      throw new Error('Lavoro non trovato');
    }
    
    const updatedLavoro = {
      ...lavori[lavoroIndex],
      ...data,
      data_modifica: new Date().toISOString()
    };
    
    const updatedLavori = [...lavori];
    updatedLavori[lavoroIndex] = updatedLavoro;
    setLavori(updatedLavori);
    setStorageLavori(updatedLavori);
    
    return updatedLavoro;
  };

  const deleteLavoro = async (id: string): Promise<void> => {
    await simulateNetworkDelay(500);
    
    const updatedLavori = lavori.filter(l => l.id !== id);
    setLavori(updatedLavori);
    setStorageLavori(updatedLavori);
    
    // Elimina anche le immagini associate
    const updatedImmagini = immagini.filter(i => i.lavoro_id !== id);
    setImmagini(updatedImmagini);
    setStorageImmagini(updatedImmagini);
  };

  // Immagini
  const getImmaginiByLavoro = useCallback((lavoroId: string) => {
    return immagini
      .filter(i => i.lavoro_id === lavoroId)
      .sort((a, b) => a.ordine - b.ordine);
  }, [immagini]);

  const getImmagine = useCallback((id: string) => {
    return immagini.find(i => i.id === id);
  }, [immagini]);

  const createImmagine = async (data: CreateImmagineDTO, file: File): Promise<Immagine> => {
    // Converti file in base64 per storage
    const base64Image = await fileToBase64(file);
    
    const immaginiLavoro = getImmaginiByLavoro(data.lavoro_id);
    const newOrdine = immaginiLavoro.length + 1;
    
    const newImmagine: Immagine = {
      id: uuidv4(),
      ...data,
      url_immagine: base64Image,
      ordine: newOrdine,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const updatedImmagini = [...immagini, newImmagine];
    setImmagini(updatedImmagini);
    setStorageImmagini(updatedImmagini);
    
    // Aggiorna conteggio immagini nel lavoro
    const lavoro = lavori.find(l => l.id === data.lavoro_id);
    if (lavoro) {
      const updatedLavoro = {
        ...lavoro,
        immagini_count: (lavoro.immagini_count || 0) + 1,
        data_modifica: new Date().toISOString()
      };
      const updatedLavori = lavori.map(l => l.id === data.lavoro_id ? updatedLavoro : l);
      setLavori(updatedLavori);
      setStorageLavori(updatedLavori);
    }
    
    // Richiedi analisi AI in background
    setTimeout(() => {
      requestAIAnalysis(newImmagine.id, base64Image);
    }, 100);
    
    return newImmagine;
  };

  const deleteImmagine = async (id: string): Promise<void> => {
    await simulateNetworkDelay(400);
    
    const immagine = immagini.find(i => i.id === id);
    if (!immagine) return;
    
    const updatedImmagini = immagini.filter(i => i.id !== id);
    setImmagini(updatedImmagini);
    setStorageImmagini(updatedImmagini);
    
    // Aggiorna conteggio nel lavoro
    const lavoro = lavori.find(l => l.id === immagine.lavoro_id);
    if (lavoro) {
      const updatedLavoro = {
        ...lavoro,
        immagini_count: Math.max(0, (lavoro.immagini_count || 0) - 1),
        data_modifica: new Date().toISOString()
      };
      const updatedLavori = lavori.map(l => l.id === immagine.lavoro_id ? updatedLavoro : l);
      setLavori(updatedLavori);
      setStorageLavori(updatedLavori);
    }
  };

  // Update immagine
  const updateImmagine = (immagine: Immagine) => {
    const updatedImmagini = immagini.map(i => 
      i.id === immagine.id ? immagine : i
    );
    setImmagini(updatedImmagini);
    setStorageImmagini(updatedImmagini);
  };

  // Analisi AI con OpenAI
  const requestAIAnalysis = async (immagineId: string, imageBase64?: string): Promise<AnalisiAI | null> => {
    try {
      const immagine = immagini.find(i => i.id === immagineId);
      if (!immagine) return null;
      
      // Usa l'immagine passata o quella salvata
      const imageData = imageBase64 || immagine.url_immagine;
      
      // Chiama OpenAI per l'analisi
      const analisiAI = await analyzeImageWithAI(imageData, immagine.descrizione_utente);
      
      // Aggiungi l'ID immagine
      analisiAI.immagine_id = immagineId;
      
      // Aggiorna immagine con analisi
      const updatedImmagini = immagini.map(i => 
        i.id === immagineId ? { ...i, analisi_ai: analisiAI } : i
      );
      setImmagini(updatedImmagini);
      setStorageImmagini(updatedImmagini);
      
      return analisiAI;
    } catch (error) {
      console.error('Errore analisi AI:', error);
      return null;
    }
  };

  // Statistiche
  const getDashboardStats = async (): Promise<DashboardStats> => {
    await simulateNetworkDelay(500);
    
    // Calcola statistiche reali dai dati
    const totaliLavori = lavori.length;
    const lavoriInCorso = lavori.filter(l => l.stato === 'in_corso').length;
    const lavoriCompletati = lavori.filter(l => l.stato === 'completato').length;
    const totaliImmagini = immagini.length;
    
    const pericoliIdentificati = immagini.reduce((acc, img) => {
      return acc + (img.analisi_ai?.pericoli_identificati.length || 0);
    }, 0);
    
    const distribuzioneRischio = {
      basso: immagini.filter(i => i.analisi_ai?.livello_rischio === 'basso').length,
      medio: immagini.filter(i => i.analisi_ai?.livello_rischio === 'medio').length,
      alto: immagini.filter(i => i.analisi_ai?.livello_rischio === 'alto').length,
      critico: immagini.filter(i => i.analisi_ai?.livello_rischio === 'critico').length
    };
    
    return {
      totali_lavori: totaliLavori,
      lavori_in_corso: lavoriInCorso,
      lavori_completati: lavoriCompletati,
      totali_immagini: totaliImmagini,
      pericoli_identificati: pericoliIdentificati,
      distribuzione_rischio: distribuzioneRischio
    };
  };

  return (
    <DataContext.Provider value={{
      lavori,
      getLavoro,
      createLavoro,
      updateLavoro,
      deleteLavoro,
      immagini,
      getImmaginiByLavoro,
      getImmagine,
      createImmagine,
      deleteImmagine,
      requestAIAnalysis,
      getDashboardStats,
      refreshData,
      updateImmagine
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
