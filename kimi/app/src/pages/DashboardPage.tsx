import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Camera, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Zap,
  Crown,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import type { DashboardStats, Lavoro } from '@/types';

// Simple Pie Chart Component
function RiskPieChart({ data }: { data: { basso: number; medio: number; alto: number; critico: number } }) {
  const total = data.basso + data.medio + data.alto + data.critico;
  if (total === 0) return <div className="text-center text-slate-400 py-8">Nessun dato</div>;
  
  const items = [
    { label: 'Basso', value: data.basso, color: '#22c55e' },
    { label: 'Medio', value: data.medio, color: '#eab308' },
    { label: 'Alto', value: data.alto, color: '#f97316' },
    { label: 'Critico', value: data.critico, color: '#ef4444' },
  ].filter(i => i.value > 0);
  
  let cumulativePercent = 0;
  
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {items.map((item, index) => {
          const percent = item.value / total;
          const startAngle = cumulativePercent * 360;
          const endAngle = (cumulativePercent + percent) * 360;
          cumulativePercent += percent;
          
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = percent > 0.5 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{item.label}:</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple Bar Chart Component
function ProgressBarChart({ 
  data, 
  max 
}: { 
  data: { label: string; value: number; color: string }[]; 
  max: number;
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                backgroundColor: item.color 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, payment, getTrialDaysLeft } = useAuth();
  const { lavori, immagini, getDashboardStats } = useData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLavori, setRecentLavori] = useState<Lavoro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      
      // Prendi i 5 lavori più recenti
      const sorted = [...lavori].sort((a, b) => 
        new Date(b.data_modifica).getTime() - new Date(a.data_modifica).getTime()
      ).slice(0, 5);
      setRecentLavori(sorted);
      
      setIsLoading(false);
    };
    
    loadData();
  }, [getDashboardStats, lavori]);
  
  // Calculate analytics
  const analytics = useMemo(() => {
    // Group images by work
    const imagesByWork = immagini.reduce((acc, img) => {
      acc[img.lavoro_id] = (acc[img.lavoro_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Works with most images
    const topWorks = lavori
      .map(l => ({ ...l, imgCount: imagesByWork[l.id] || 0 }))
      .sort((a, b) => b.imgCount - a.imgCount)
      .slice(0, 5);
    
    // Collect all hazards
    const hazardCounts: Record<string, number> = {};
    immagini.forEach(img => {
      if (img.analisi_ai?.pericoli_identificati) {
        img.analisi_ai.pericoli_identificati.forEach(hazard => {
          hazardCounts[hazard] = (hazardCounts[hazard] || 0) + 1;
        });
      }
    });
    
    const topHazards = Object.entries(hazardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Completion rate
    const completionRate = lavori.length > 0 
      ? Math.round((stats?.lavori_completati || 0) / lavori.length * 100)
      : 0;
    
    return { topWorks, topHazards, completionRate };
  }, [immagini, lavori, stats]);

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'in_corso':
        return <Badge variant="default" className="bg-blue-500">In Corso</Badge>;
      case 'completato':
        return <Badge variant="default" className="bg-green-500">Completato</Badge>;
      case 'archiviato':
        return <Badge variant="secondary">Archiviato</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const trialDays = getTrialDaysLeft();
  const isTrial = payment?.status === 'trial';

  return (
    <div className="space-y-8">
      {/* Trial Alert */}
      {isTrial && trialDays > 0 && (
        <Alert className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <Zap className="w-5 h-5 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Prova gratuita attiva</strong> — Hai ancora {trialDays} giorni per testare tutte le funzionalità.
            </span>
            <Link to="/pricing">
              <Button size="sm" className="ml-4">
                <Crown className="w-4 h-4 mr-1" />
                Passa a Pro
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Ciao, {user?.nome_completo?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-1">
            Benvenuto nella tua dashboard di SafeWork AI
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/camera">
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Nuova Foto
            </Button>
          </Link>
          <Link to="/lavori/nuovo">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuovo Lavoro
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Totale Lavori
            </CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.totali_lavori || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.lavori_in_corso || 0} in corso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Immagini
            </CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.totali_immagini || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Documentate con AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pericoli Identificati
            </CardTitle>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.pericoli_identificati || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Da analisi AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Report Generati
            </CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.lavori_completati || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lavori completati
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-500" />
            <CardTitle>Distribuzione Livelli di Rischio</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskPieChart data={stats?.distribuzione_rischio || { basso: 0, medio: 0, alto: 0, critico: 0 }} />
          </CardContent>
        </Card>

        {/* Completion Rate & Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" />
            <CardTitle>Tasso di Completamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Lavori completati</span>
                <span className="font-semibold">{analytics.completionRate}%</span>
              </div>
              <Progress value={analytics.completionRate} className="h-3" />
            </div>
            
            <ProgressBarChart 
              data={[
                { label: 'In Corso', value: stats?.lavori_in_corso || 0, color: '#3b82f6' },
                { label: 'Completati', value: stats?.lavori_completati || 0, color: '#22c55e' },
              ]}
              max={Math.max(stats?.totali_lavori || 1, 1)}
            />
          </CardContent>
        </Card>

        {/* Top Works by Photos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            <CardTitle>Lavori più Documentati</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topWorks.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Nessun dato disponibile</p>
            ) : (
              <ProgressBarChart 
                data={analytics.topWorks.map((w, i) => ({
                  label: w.nome_progetto,
                  value: w.imgCount,
                  color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'][i % 5]
                }))}
                max={Math.max(...analytics.topWorks.map(w => w.imgCount), 1)}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Hazards */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-slate-500" />
            <CardTitle>Pericoli più Frequenti</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topHazards.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Nessun pericolo identificato</p>
            ) : (
              <div className="space-y-3">
                {analytics.topHazards.map(([hazard, count], i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                        {i + 1}
                      </div>
                      <span className="font-medium text-slate-700">{hazard}</span>
                    </div>
                    <Badge variant="secondary">{count} volte</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lavori Recenti */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lavori Recenti</CardTitle>
          <Link to="/lavori">
            <Button variant="ghost" size="sm" className="gap-1">
              Vedi tutti
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentLavori.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nessun lavoro trovato</p>
              <Link to="/lavori/nuovo">
                <Button variant="outline" className="mt-4">
                  Crea il tuo primo lavoro
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLavori.map((lavoro) => (
                <Link 
                  key={lavoro.id} 
                  to={`/lavori/${lavoro.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-slate-900 truncate">
                        {lavoro.nome_progetto}
                      </h3>
                      {getStatoBadge(lavoro.stato)}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {lavoro.nome_azienda_cliente}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(lavoro.data_modifica)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {lavoro.immagini_count || 0} foto
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 ml-4" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/lavori/nuovo">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Nuovo Lavoro</h3>
                <p className="text-sm text-slate-500">Crea un nuovo progetto</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/camera">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Scatta Foto</h3>
                <p className="text-sm text-slate-500">Documenta un pericolo</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/report">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Genera Report</h3>
                <p className="text-sm text-slate-500">Crea report professionali</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
