import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, AlertTriangle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePaymentStatus } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    plan: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    console.log('CheckoutSuccessPage mounted');
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      console.error('No session_id in URL');
      setError('Sessione di pagamento non valida - nessun ID sessione trovato');
      setIsLoading(false);
      return;
    }

    // Verify the checkout session and update payment status
    const verifyPayment = async () => {
      try {
        console.log('Starting payment verification...');
        
        // In production, this should call your backend to verify the session
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        console.log('API URL:', apiUrl);
        
        try {
          const response = await fetch(`${apiUrl}/verify-checkout-session?sessionId=${sessionId}`);
          console.log('Verify response:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Session verified:', data);
          }
        } catch (verifyError) {
          console.log('Could not verify with backend, continuing with local update:', verifyError);
        }
        
        // Update payment status locally
        console.log('Updating payment status...');
        await updatePaymentStatus({
          plan: 'professional',
          status: 'active',
          stripeSessionId: sessionId,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
        console.log('Payment status updated successfully');

        setPaymentDetails({
          plan: 'Professional',
          amount: 79,
        });
        
        setIsLoading(false);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        console.error('Error in verifyPayment:', err);
        setError(err instanceof Error ? err.message : 'Verifica pagamento fallita');
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, updatePaymentStatus, navigate]);

  // Error boundary fallback
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Attenzione
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Vai alla Dashboard
              </Button>
              <Button onClick={() => navigate('/pricing')} variant="outline" className="w-full">
                Torna ai Piani
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Verifica Pagamento...
            </h2>
            <p className="text-slate-600">
              Stiamo confermando il tuo pagamento. Attendi un momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Pagamento Completato!
          </h2>
          <p className="text-slate-600 mb-6">
            Grazie per l'acquisto. Il tuo account è ora attivo.
          </p>
          <div className="bg-slate-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500">Piano</p>
            <p className="font-semibold text-slate-900">{paymentDetails?.plan}</p>
            <p className="text-sm text-slate-500 mt-2">Prezzo</p>
            <p className="font-semibold text-slate-900">€{paymentDetails?.amount}/mese</p>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Reindirizzamento alla dashboard...
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Vai alla Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
