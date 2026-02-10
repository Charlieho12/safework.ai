import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { 
  Lavoro, 
  Immagine, 
  CreateLavoroDTO, 
  UpdateLavoroDTO,
  CreateImmagineDTO,
  AnalisiAI,
  DashboardStats
} from '@/types';
import { analyzeImageWithAI } from '@/lib/openai';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  
  // Loading states
  isLoading: boolean;
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
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [immagini, setImmagini] = useState<Immagine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Load data from backend on mount
  useEffect(() => {
    const user = localStorage.getItem('safework_current_user');
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUserId(parsed.id);
      fetchLavori(parsed.id);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchLavori = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/lavori?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLavori(data);
        
        // Fetch immagini for all lavori
        const immaginiResponse = await fetch(`${API_URL}/immagini`);
        if (immaginiResponse.ok) {
          const immaginiData = await immaginiResponse.json();
          setImmagini(immaginiData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(() => {
    if (currentUserId) {
      fetchLavori(currentUserId);
    }
  }, [currentUserId]);

  // Lavori
  const getLavoro = useCallback((id: string) => {
    return lavori.find(l => l.id === id);
  }, [lavori]);

  const createLavoro = async (data: CreateLavoroDTO, userId: string, aziendaId: string): Promise<Lavoro> => {
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
    
    try {
      const response = await fetch(`${API_URL}/lavori`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLavoro),
      });
      
      if (response.ok) {
        const saved = await response.json();
        setLavori(prev => [...prev, saved]);
        return saved;
      }
    } catch (error) {
      console.error('Error creating lavoro:', error);
    }
    
    // Fallback: add to local state
    setLavori(prev => [...prev, newLavoro]);
    return newLavoro;
  };

  const updateLavoro = async (id: string, data: UpdateLavoroDTO): Promise<Lavoro> => {
    const lavoroIndex = lavori.findIndex(l => l.id === id);
    if (lavoroIndex === -1) {
      throw new Error('Lavoro non trovato');
    }
    
    const updatedLavoro = {
      ...lavori[lavoroIndex],
      ...data,
      data_modifica: new Date().toISOString()
    };
    
    try {
      const response = await fetch(`${API_URL}/lavori/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLavoro),
      });
      
      if (response.ok) {
        const saved = await response.json();
        setLavori(prev => prev.map(l => l.id === id ? saved : l));
        return saved;
      }
    } catch (error) {
      console.error('Error updating lavoro:', error);
    }
    
    // Fallback: update local state
    setLavori(prev => prev.map(l => l.id === id ? updatedLavoro : l));
    return updatedLavoro;
  };

  const deleteLavoro = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/lavori/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting lavoro:', error);
    }
    
    setLavori(prev => prev.filter(l => l.id !== id));
    setImmagini(prev => prev.filter(i => i.lavoro_id !== id));
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
    
    console.log('Creating immagine for lavoro:', data.lavoro_id);
    console.log('Image size:', base64Image.length, 'characters');
    
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
    
    try {
      console.log('Sending to backend:', API_URL + '/immagini');
      const response = await fetch(`${API_URL}/immagini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImmagine),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const saved = await response.json();
        console.log('Saved to backend:', saved.id);
        setImmagini(prev => [...prev, saved]);
        
        // Update lavoro immagini_count
        const lavoro = lavori.find(l => l.id === data.lavoro_id);
        if (lavoro) {
          await updateLavoro(data.lavoro_id, {
            immagini_count: (lavoro.immagini_count || 0) + 1
          });
        }
        
        // Trigger AI analysis
        requestAIAnalysis(saved.id, base64Image);
        
        return saved;
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Error creating immagine:', error);
      // Fallback: add to local state only
      setImmagini(prev => [...prev, newImmagine]);
      
      // Trigger AI analysis
      requestAIAnalysis(newImmagine.id, base64Image);
      
      return newImmagine;
    }
  };

  const deleteImmagine = async (id: string): Promise<void> => {
    const immagine = immagini.find(i => i.id === id);
    if (!immagine) return;
    
    try {
      await fetch(`${API_URL}/immagini/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting immagine:', error);
    }
    
    setImmagini(prev => prev.filter(i => i.id !== id));
    
    // Aggiorna conteggio nel lavoro
    const lavoro = lavori.find(l => l.id === immagine.lavoro_id);
    if (lavoro) {
      await updateLavoro(immagine.lavoro_id, {
        immagini_count: Math.max(0, (lavoro.immagini_count || 0) - 1)
      });
    }
  };

  const updateImmagine = async (immagine: Immagine) => {
    try {
      const response = await fetch(`${API_URL}/immagini/${immagine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(immagine),
      });
      
      if (response.ok) {
        const saved = await response.json();
        setImmagini(prev => prev.map(i => i.id === immagine.id ? saved : i));
        return;
      }
    } catch (error) {
      console.error('Error updating immagine:', error);
    }
    
    // Fallback: update local state
    setImmagini(prev => prev.map(i => i.id === immagine.id ? immagine : i));
  };

  // Analisi AI con OpenAI
  const requestAIAnalysis = async (immagineId: string, imageBase64?: string): Promise<AnalisiAI | null> => {
    try {
      console.log('Starting AI analysis for image:', immagineId);
      
      const immagine = immagini.find(i => i.id === immagineId);
      if (!immagine) {
        console.error('Image not found:', immagineId);
        return null;
      }
      
      // Usa l'immagine passata o quella salvata
      const imageData = imageBase64 || immagine.url_immagine;
      
      console.log('Calling OpenAI for analysis...');
      // Chiama OpenAI per l'analisi
      const analisiAI = await analyzeImageWithAI(imageData, immagine.descrizione_utente);
      
      console.log('AI analysis completed:', analisiAI);
      
      // Aggiungi l'ID immagine
      analisiAI.immagine_id = immagineId;
      
      // Salva l'analisi nel backend
      try {
        await fetch(`${API_URL}/analisi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analisiAI),
        });
      } catch (e) {
        console.log('Backend analisi save failed, continuing with local update');
      }
      
      // Aggiorna immagine con analisi
      const updatedImmagine = { ...immagine, analisi_ai: analisiAI };
      await updateImmagine(updatedImmagine);
      
      return analisiAI;
    } catch (error) {
      console.error('Errore analisi AI:', error);
      return null;
    }
  };

  // Statistiche
  const getDashboardStats = async (): Promise<DashboardStats> => {
    const stats: DashboardStats = {
      totali_lavori: lavori.length,
      lavori_in_corso: lavori.filter(l => l.stato === 'in_corso').length,
      lavori_completati: lavori.filter(l => l.stato === 'completato').length,
      totali_immagini: immagini.length,
      pericoli_identificati: immagini.filter(i => i.analisi_ai).length,
      distribuzione_rischio: {
        basso: immagini.filter(i => i.analisi_ai?.livello_rischio === 'basso').length,
        medio: immagini.filter(i => i.analisi_ai?.livello_rischio === 'medio').length,
        alto: immagini.filter(i => i.analisi_ai?.livello_rischio === 'alto').length,
        critico: immagini.filter(i => i.analisi_ai?.livello_rischio === 'critico').length,
      }
    };
    
    return stats;
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
      updateImmagine,
      isLoading
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
