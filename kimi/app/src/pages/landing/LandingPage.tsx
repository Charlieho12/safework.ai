import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Camera, 
  Brain, 
  FileText, 
  Check, 
  ArrowRight,
  Menu,
  X,
  Building2,
  Users,
  Zap,
  Lock,
  AlertTriangle
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Documenta con Foto',
    description: 'Scatta foto direttamente dal cantiere e documenta ogni pericolo in tempo reale.'
  },
  {
    icon: Brain,
    title: 'Analisi AI',
    description: 'L\'intelligenza artificiale analizza le immagini e identifica automaticamente i rischi.'
  },
  {
    icon: FileText,
    title: 'Report Automatici',
    description: 'Genera report professionali conformi al D.Lgs. 81/08 in pochi click.'
  },
  {
    icon: Shield,
    title: 'Normative Italiane',
    description: 'Riferimenti normativi automatici al Testo Unico sulla Sicurezza.'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '29',
    period: '/mese',
    description: 'Per consulenti individuali',
    features: [
      'Fino a 10 lavori attivi',
      '100 foto/mese',
      'Analisi AI inclusa',
      'Report DOCX',
      'Supporto email'
    ],
    cta: 'Inizia Gratis',
    popular: false
  },
  {
    name: 'Professional',
    price: '79',
    period: '/mese',
    description: 'Per studi di consulenza',
    features: [
      'Lavori illimitati',
      'Foto illimitate',
      'Analisi AI prioritaria',
      'Report DOCX + PDF',
      'Supporto prioritario',
      'Team fino a 5 utenti'
    ],
    cta: 'Inizia Prova Gratuita',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '199',
    period: '/mese',
    description: 'Per grandi aziende',
    features: [
      'Tutto di Professional',
      'Team illimitato',
      'API access',
      'White label',
      'Account manager dedicato',
      'Formazione inclusa'
    ],
    cta: 'Contattaci',
    popular: false
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-slate-900">SafeWork AI</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-slate-900">
                Funzionalità
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-slate-900">
                Prezzi
              </button>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Accedi
              </Link>
              <Link to="/register">
                <Button>Registrati</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-600">
                Funzionalità
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-slate-600">
                Prezzi
              </button>
              <Link to="/login" className="block py-2 text-slate-600">
                Accedi
              </Link>
              <Link to="/register">
                <Button className="w-full">Registrati</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="text-sm">
                🚀 Nuovo: Analisi AI delle foto
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Sicurezza sul Lavoro con{' '}
                <span className="text-primary">Intelligenza Artificiale</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-lg">
                Documenta, analizza e genera report conformi al D.Lgs. 81/08 in pochi minuti. 
                Risparmia tempo e riduci i rischi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Inizia Gratuitamente
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <button onClick={() => scrollToSection('pricing')}>
                  <Button size="lg" variant="outline">
                    Vedi i Prezzi
                  </Button>
                </button>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Prova gratuita 14 giorni</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Nessuna carta richiesta</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop"
                  alt="SafeWork AI Dashboard"
                  className="rounded-xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rischio Alto</p>
                      <p className="text-xs text-slate-500">Identificato da AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="text-slate-600 mt-1">Aziende</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">50K+</p>
              <p className="text-slate-600 mt-1">Foto Analizzate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">10K+</p>
              <p className="text-slate-600 mt-1">Report Generati</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">99%</p>
              <p className="text-slate-600 mt-1">Clienti Soddisfatti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tutto ciò che ti serve per la sicurezza
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Una piattaforma completa per consulenti, RSPP e aziende di sicurezza sul lavoro.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Come funziona
            </h2>
            <p className="text-xl text-slate-600">
              In 3 semplici passaggi
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Scatta le Foto</h3>
              <p className="text-slate-600">Documenta i pericoli sul cantiere con la fotocamera del tuo dispositivo.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Analisi AI</h3>
              <p className="text-slate-600">L'AI analizza le immagini e identifica i rischi con riferimenti normativi.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Genera Report</h3>
              <p className="text-slate-600">Scarica il report professionale in formato DOCX pronto per il cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Scegli il tuo piano
            </h2>
            <p className="text-xl text-slate-600">
              Inizia gratuitamente, passa a un piano a pagamento quando vuoi.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Più Popolare</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
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
                  <Link to="/register">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Cosa dicono i nostri clienti
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "SafeWork AI ha rivoluzionato il nostro modo di lavorare. I report che prima richiedevano ore ora si generano in minuti."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">Marco Rossi</p>
                    <p className="text-sm text-slate-500">RSPP, Milano</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "L'analisi AI è incredibile. Identifica pericoli che nemmeno noi avevamo notato. I clienti sono impressionati dai report."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">Laura Bianchi</p>
                    <p className="text-sm text-slate-500">SafeConsulting Srl</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "Il risparmio di tempo è enorme. Posso fare più sopralluoghi al giorno e i report sono sempre professionali."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">Giuseppe Verdi</p>
                    <p className="text-sm text-slate-500">Consulente, Roma</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Pronto a semplificare la tua attività?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Inizia la prova gratuita di 14 giorni. Nessuna carta di credito richiesta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Inizia Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">SafeWork AI</span>
              </div>
              <p className="text-slate-400 text-sm">
                La piattaforma intelligente per la sicurezza sul lavoro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><button onClick={() => scrollToSection('features')}>Funzionalità</button></li>
                <li><button onClick={() => scrollToSection('pricing')}>Prezzi</button></li>
                <li><Link to="/login">Accedi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Azienda</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="#">Chi siamo</Link></li>
                <li><Link to="#">Contatti</Link></li>
                <li><Link to="#">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="#">Privacy Policy</Link></li>
                <li><Link to="#">Termini di Servizio</Link></li>
                <li><Link to="#">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 SafeWork AI. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
