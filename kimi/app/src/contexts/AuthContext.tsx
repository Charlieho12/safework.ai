import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import { 
  mockUsers, 
  getCurrentUser, 
  setCurrentUser,
  simulateNetworkDelay 
} from '@/lib/mockData';

export interface PaymentInfo {
  plan: string;
  price: number;
  date: string;
  status: 'active' | 'cancelled' | 'trial';
  trialEndDate?: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, nome_completo: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  payment: PaymentInfo | null;
  hasActiveSubscription: () => boolean;
  getTrialDaysLeft: () => number;
  setPayment: (payment: PaymentInfo) => void;
  updatePaymentStatus: (paymentData: Partial<PaymentInfo>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PAYMENT_KEY = 'safework_payment';

// Data di inizio trial (14 giorni dalla registrazione)
const TRIAL_DAYS = 14;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [payment, setPaymentState] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se c'è un utente loggato
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Carica info pagamento
    const paymentData = localStorage.getItem(PAYMENT_KEY);
    if (paymentData) {
      setPaymentState(JSON.parse(paymentData));
    }
    
    setIsLoading(false);
  }, []);

  const setPayment = (paymentData: PaymentInfo) => {
    setPaymentState(paymentData);
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(paymentData));
  };

  const updatePaymentStatus = async (paymentData: Partial<PaymentInfo>) => {
    const currentPayment = payment || {
      plan: 'trial',
      price: 0,
      date: new Date().toISOString(),
      status: 'trial',
      userId: user?.id || ''
    };
    
    const updatedPayment: PaymentInfo = {
      ...currentPayment,
      ...paymentData,
      date: new Date().toISOString(),
    };
    
    setPayment(updatedPayment);
    
    // In production, sync with backend
    // await fetch('/api/update-payment-status', { ... });
  };

  const hasActiveSubscription = (): boolean => {
    if (!user) return false;
    
    // Se ha un pagamento attivo
    if (payment && payment.status === 'active') {
      return true;
    }
    
    // Se è in trial period
    if (payment && payment.status === 'trial' && payment.trialEndDate) {
      const trialEnd = new Date(payment.trialEndDate);
      return trialEnd > new Date();
    }
    
    // Se l'utente è nuovo, crea automaticamente un trial
    if (!payment && user) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
      
      const newPayment: PaymentInfo = {
        plan: 'trial',
        price: 0,
        date: new Date().toISOString(),
        status: 'trial',
        trialEndDate: trialEnd.toISOString(),
        userId: user.id
      };
      setPayment(newPayment);
      return true;
    }
    
    return false;
  };

  const getTrialDaysLeft = (): number => {
    if (!payment || payment.status !== 'trial' || !payment.trialEndDate) {
      return 0;
    }
    
    const trialEnd = new Date(payment.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const login = async (email: string, password: string) => {
    try {
      await simulateNetworkDelay(800);
      
      // Simulazione login - in produzione verificherebbe password hash
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        return { success: false, error: 'Email o password non validi' };
      }
      
      // Simulazione verifica password (in produzione: bcrypt.compare)
      if (password.length < 6) {
        return { success: false, error: 'Email o password non validi' };
      }
      
      setUser(foundUser);
      setCurrentUser(foundUser);
      
      // Carica pagamento esistente o crea trial
      const existingPayment = localStorage.getItem(PAYMENT_KEY);
      if (!existingPayment) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
        
        const newPayment: PaymentInfo = {
          plan: 'trial',
          price: 0,
          date: new Date().toISOString(),
          status: 'trial',
          trialEndDate: trialEnd.toISOString(),
          userId: foundUser.id
        };
        setPayment(newPayment);
      } else {
        setPaymentState(JSON.parse(existingPayment));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Errore durante il login' };
    }
  };

  const register = async (email: string, _password: string, _nome_completo: string) => {
    try {
      await simulateNetworkDelay(1000);
      
      // Verifica se email esiste già
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Email già registrata' };
      }
      
      // In un'app reale, creerebbe il nuovo utente nel database
      // Per ora simuliamo il successo
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Errore durante la registrazione' };
    }
  };

  const logout = () => {
    setUser(null);
    setPaymentState(null);
    setCurrentUser(null);
    localStorage.removeItem(PAYMENT_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      payment,
      hasActiveSubscription,
      getTrialDaysLeft,
      setPayment,
      updatePaymentStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
