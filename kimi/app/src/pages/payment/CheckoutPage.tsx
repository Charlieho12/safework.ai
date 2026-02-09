import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Check, 
  Shield, 
  CreditCard,
  Loader2,
  Zap,
  Building2,
  Users,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { PLANS, createCheckoutSession } from '@/lib/stripe';
import type { PlanId } from '@/lib/stripe';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, updatePaymentStatus } = useAuth();
  
  const planId = (searchParams.get('plan') as PlanId) || 'professional';
  const plan = PLANS[planId] || PLANS.professional;
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  // Use mock payment by default, can be overridden with env variable
  const [useMockPayment, setUseMockPayment] = useState(
    import.meta.env.VITE_USE_MOCK_PAYMENT !== 'false'
  );

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const healthUrl = `${apiUrl}/health`;
        
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        setBackendAvailable(response.ok);
      } catch {
        setBackendAvailable(false);
      }
    };
    checkBackend();
  }, []);

  // Se non autenticato, redirect a login
  useEffect(() => {
    if (!isAuthenticated && !paymentSuccess) {
      navigate('/login?redirect=/checkout&plan=' + planId);
    }
  }, [isAuthenticated, navigate, planId, paymentSuccess]);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Real Stripe integration
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating checkout session for:', planId, user.email);
      const checkoutUrl = await createCheckoutSession(planId, user.id, user.email);
      
      console.log('Redirecting to Stripe:', checkoutUrl);
      
      // Redirect to Stripe Checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      
      // Check if it's a connection error (backend not running)
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('connection') ||
          errorMessage.includes('NetworkError')) {
        setError('Server di pagamento non disponibile. Assicurati che il backend sia in esecuzione:\n\ncd server && npm install && npm start\n\nOppure usa la Modalità Demo.');
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleMockPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      await updatePaymentStatus({
        plan: planId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      setPaymentSuccess(true);
      
      // Redirect alla dashboard dopo 2 secondi
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsLoading(false);
    }
  };

  if (paymentSuccess) {
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
              <p className="font-semibold text-slate-900">{plan.name}</p>
              <p className="text-sm text-slate-500 mt-2">Prezzo</p>
              <p className="font-semibold text-slate-900">€{plan.price}/mese</p>
            </div>
            <p className="text-sm text-slate-500">
              Reindirizzamento alla dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">SafeWork AI</span>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Riepilogo Ordine */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Completa il tuo ordine
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Piano {plan.name}</span>
                  <Badge variant="secondary">Mensile</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-slate-500">/mese</span>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    Cosa include:
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotale</span>
                    <span className="font-medium">€{plan.price}.00</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-600">IVA (22%)</span>
                    <span className="font-medium">€{(plan.price * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-slate-200">
                    <span>Totale</span>
                    <span>€{(plan.price * 1.22).toFixed(2)}/mese</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Attivazione immediata
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Cancellabile in qualsiasi momento
              </div>
            </div>
          </div>

          {/* Form Pagamento */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dati di Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Message */}
                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Info Utente */}
                {user && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500 mb-1">Account</p>
                    <p className="font-medium">{user.nome_completo}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                )}

                {/* Metodi di pagamento */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Metodo di pagamento</p>
                  
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        <CreditCard className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Carta di Credito</p>
                        <p className="text-sm text-slate-500">Visa, Mastercard, Amex</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Development Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                  <span className="text-sm text-slate-600">Modalità Demo</span>
                  <button
                    onClick={() => setUseMockPayment(!useMockPayment)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useMockPayment ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useMockPayment ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Alert */}
                {useMockPayment ? (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-700 text-sm">
                      <strong>Modalità Demo:</strong> Clicca "Paga Ora" per simulare il pagamento. 
                      Nessuna carta di credito richiesta.
                    </AlertDescription>
                  </Alert>
                ) : backendAvailable === false ? (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700 text-sm">
                      <strong>⚠️ Server non disponibile:</strong> Il backend Stripe non è in esecuzione. 
                      Avvia il server con: <code>cd server && npm start</code> oppure usa la Modalità Demo.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-amber-700 text-sm">
                      <strong>Modalità Stripe:</strong> Sarai reindirizzato al checkout sicuro di Stripe.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Bottone Pagamento */}
                <Button 
                  onClick={useMockPayment ? handleMockPayment : handleStripeCheckout}
                  disabled={isLoading || (!useMockPayment && backendAvailable === false)}
                  className="w-full h-12 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Elaborazione...
                    </>
                  ) : (
                    <>Paga Ora €{(plan.price * 1.22).toFixed(2)}</>
                  )}
                </Button>

                {/* Stripe Link for real payment */}
                {!useMockPayment && (
                  <p className="text-xs text-slate-500 text-center">
                    Sarai reindirizzato a{' '}
                    <ExternalLink className="w-3 h-3 inline" />
                    {' '}Stripe per completare il pagamento in modo sicuro.
                  </p>
                )}

                <p className="text-xs text-slate-500 text-center">
                  Pagamento sicuro con crittografia SSL. 
                  I tuoi dati sono protetti.
                </p>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs text-slate-500">Pagamento Sicuro</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs text-slate-500">Fatturazione</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs text-slate-500">+500 Aziende</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
