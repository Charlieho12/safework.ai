import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { StatoLavoro } from '@/types';

export default function LavoroFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getLavoro, createLavoro, updateLavoro } = useData();
  
  const isEditing = !!id;
  const lavoro = isEditing ? getLavoro(id) : null;

  const [formData, setFormData] = useState({
    nome_azienda_cliente: '',
    nome_progetto: '',
    descrizione: '',
    stato: 'in_corso' as StatoLavoro
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && lavoro) {
      setFormData({
        nome_azienda_cliente: lavoro.nome_azienda_cliente,
        nome_progetto: lavoro.nome_progetto,
        descrizione: lavoro.descrizione,
        stato: lavoro.stato
      });
      setIsLoading(false);
    } else if (isEditing && !lavoro) {
      // Lavoro non trovato
      navigate('/lavori');
    }
  }, [isEditing, lavoro, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validazione
    if (!formData.nome_azienda_cliente.trim()) {
      setError('Inserisci il nome dell\'azienda cliente');
      return;
    }
    if (!formData.nome_progetto.trim()) {
      setError('Inserisci il nome del progetto');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && id) {
        await updateLavoro(id, formData);
      } else {
        if (user) {
          await createLavoro(formData, user.id, user.azienda_id);
        }
      }
      navigate('/lavori');
    } catch (err) {
      setError('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/lavori">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Modifica Lavoro' : 'Nuovo Lavoro'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing 
              ? 'Modifica i dettagli del progetto' 
              : 'Crea un nuovo progetto per iniziare'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Lavoro</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome_azienda_cliente">
                  Azienda Cliente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome_azienda_cliente"
                  value={formData.nome_azienda_cliente}
                  onChange={(e) => handleChange('nome_azienda_cliente', e.target.value)}
                  placeholder="Es. Edilizia Moderna Spa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_progetto">
                  Nome Progetto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome_progetto"
                  value={formData.nome_progetto}
                  onChange={(e) => handleChange('nome_progetto', e.target.value)}
                  placeholder="Es. Valutazione Rischi Cantiere Milano"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descrizione">Descrizione</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => handleChange('descrizione', e.target.value)}
                placeholder="Descrivi lo scopo e i dettagli del progetto..."
                rows={4}
              />
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="stato">Stato</Label>
                <Select 
                  value={formData.stato} 
                  onValueChange={(value) => handleChange('stato', value as StatoLavoro)}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Seleziona stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_corso">In Corso</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="archiviato">Archiviato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Salva Modifiche' : 'Crea Lavoro'}
                  </>
                )}
              </Button>
              <Link to="/lavori">
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
