import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Check, 
  ArrowRight,
  Zap,
  Building2,
  Users,
  Camera,
  FileText,
  Brain
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Per consulenti individuali',
    icon: Zap,
    features: [
      'Fino a 10 lavori attivi',
      '100 foto/mese',
      'Analisi AI inclusa',
      'Report DOCX',
      'Supporto email',
      'Storage 5GB'
    ],
    cta: 'Inizia Prova Gratuita',
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'Per studi di consulenza',
    icon: Building2,
    features: [
      'Lavori illimitati',
      'Foto illimitate',
      'Analisi AI prioritaria',
      'Report DOCX + PDF',
      'Supporto prioritario',
      'Team fino a 5 utenti',
      'Storage 50GB'
    ],
    cta: 'Inizia Prova Gratuita',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Per grandi aziende',
    icon: Users,
    features: [
      'Tutto di Professional',
      'Team illimitato',
      'API access',
      'White label',
      'Account manager',
      'Formazione inclusa',
      'Storage illimitato'
    ],
    cta: 'Contatta Vendite',
    popular: false
  }
];

const features = [
  {
    icon: Camera,
    title: 'Foto Illimitate',
    description: 'Scatta e carica tutte le foto che ti servono'
  },
  {
    icon: Brain,
    title: 'Analisi AI',
    description: 'Identificazione automatica dei rischi con IA'
  },
  {
    icon: FileText,
    title: 'Report Professional',
    description: 'Documenti conformi al D.Lgs. 81/08'
  },
  {
    icon: Shield,
    title: 'Sicurezza GDPR',
    description: 'I tuoi dati sono protetti e criptati'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
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
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Accedi
              </Link>
              <Link to="/register">
                <Button size="sm">Registrati</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Scegli il piano perfetto per te
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Inizia con 14 giorni di prova gratuita. Nessuna carta di credito richiesta.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Cancellabile in qualsiasi momento
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Supporto incluso
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-slate-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Più Popolare</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${plan.popular ? 'bg-primary' : 'bg-slate-100'}`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-slate-500">/mese</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    o €{(plan.price * 10)}/anno (2 mesi gratis)
                  </p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={`/checkout?plan=${plan.id}`}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Tutti i piani includono
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Domande Frequenti
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Posso cambiare piano in qualsiasi momento?',
                a: 'Sì, puoi effettuare l\'upgrade o il downgrade del tuo piano in qualsiasi momento. Le modifiche saranno effettive dal prossimo ciclo di fatturazione.'
              },
              {
                q: 'Cosa succede dopo la prova gratuita?',
                a: 'Dopo i 14 giorni di prova gratuita, dovrai scegliere un piano a pagamento per continuare ad utilizzare l\'applicazione.'
              },
              {
                q: 'Posso cancellare l\'abbonamento?',
                a: 'Sì, puoi cancellare l\'abbonamento in qualsiasi momento. Avrai accesso al servizio fino alla fine del periodo pagato.'
              },
              {
                q: 'I report sono conformi al D.Lgs. 81/08?',
                a: 'Sì, tutti i report generati includono i riferimenti normativi al Testo Unico sulla Sicurezza e sono validi per la documentazione aziendale.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-primary px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto a iniziare?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Prova SafeWork AI gratuitamente per 14 giorni
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Inizia Gratuitamente
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SafeWork AI</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2024 SafeWork AI. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
