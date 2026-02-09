import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Camera, 
  FileText, 
  MapPin, 
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Mic
} from 'lucide-react';
import type { Immagine, LivelloRischio } from '@/types';

export default function LavoroDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLavoro, getImmaginiByLavoro, deleteLavoro, requestAIAnalysis } = useData();
  
  const lavoro = id ? getLavoro(id) : null;
  const immagini = id ? getImmaginiByLavoro(id) : [];
  
  const [selectedImage, setSelectedImage] = useState<Immagine | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);

  if (!lavoro) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Lavoro non trovato</h2>
        <p className="text-slate-500 mb-4">Il lavoro che stai cercando non esiste</p>
        <Link to="/lavori">
          <Button>Torna ai Lavori</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteLavoro(lavoro.id);
    navigate('/lavori');
  };

  const handleReanalyze = async (immagineId: string) => {
    setAnalyzingImageId(immagineId);
    await requestAIAnalysis(immagineId);
    setAnalyzingImageId(null);
  };

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

  const getRischioBadge = (livello: LivelloRischio) => {
    switch (livello) {
      case 'basso':
        return <Badge className="bg-green-500">Basso</Badge>;
      case 'medio':
        return <Badge className="bg-yellow-500">Medio</Badge>;
      case 'alto':
        return <Badge className="bg-orange-500">Alto</Badge>;
      case 'critico':
        return <Badge className="bg-red-500">Critico</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const immaginiConAnalisi = immagini.filter(i => i.analisi_ai).length;
  const immaginiInAttesa = immagini.length - immaginiConAnalisi;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/lavori">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{lavoro.nome_progetto}</h1>
              {getStatoBadge(lavoro.stato)}
            </div>
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span>{lavoro.nome_azienda_cliente}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Creato il {formatDate(lavoro.data_creazione)}
              </span>
              <span className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {immagini.length} foto
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/lavori/${lavoro.id}/camera`}>
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Aggiungi Foto
            </Button>
          </Link>
          <Link to={`/lavori/${lavoro.id}/report`}>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Report
            </Button>
          </Link>
          <Link to={`/lavori/${lavoro.id}/modifica`}>
            <Button variant="outline" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Descrizione */}
      {lavoro.descrizione && (
        <Card>
          <CardContent className="p-4">
            <p className="text-slate-600">{lavoro.descrizione}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{immagini.length}</p>
              <p className="text-sm text-slate-500">Foto totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{immaginiConAnalisi}</p>
              <p className="text-sm text-slate-500">Analisi completate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{immaginiInAttesa}</p>
              <p className="text-sm text-slate-500">In attesa di analisi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="galleria" className="space-y-4">
        <TabsList>
          <TabsTrigger value="galleria">Galleria Foto</TabsTrigger>
          <TabsTrigger value="analisi">Analisi AI</TabsTrigger>
        </TabsList>

        <TabsContent value="galleria" className="space-y-4">
          {immagini.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Nessuna foto ancora
                </h3>
                <p className="text-slate-500 mb-6">
                  Inizia a documentare i pericoli scattando foto
                </p>
                <Link to={`/lavori/${lavoro.id}/camera`}>
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Scatta Foto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {immagini.map((immagine, index) => (
                <div 
                  key={immagine.id}
                  className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(immagine)}
                >
                  <img
                    src={immagine.url_immagine}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {immagine.analisi_ai && (
                    <div className="absolute top-2 right-2">
                      {getRischioBadge(immagine.analisi_ai.livello_rischio)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {immagine.descrizione_utente || 'Nessuna descrizione'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analisi" className="space-y-4">
          {immagini.filter(i => i.analisi_ai).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Nessuna analisi disponibile
                </h3>
                <p className="text-slate-500">
                  Le analisi AI appariranno qui dopo aver scattato le foto
                </p>
              </CardContent>
            </Card>
          ) : (
            immagini.filter(i => i.analisi_ai).map((immagine) => (
              <Card key={immagine.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div 
                      className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                      onClick={() => setSelectedImage(immagine)}
                    >
                      <img
                        src={immagine.url_immagine}
                        alt="Foto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {immagine.analisi_ai && getRischioBadge(immagine.analisi_ai.livello_rischio)}
                          <span className="text-sm text-slate-400">
                            {formatDate(immagine.timestamp)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReanalyze(immagine.id)}
                          disabled={analyzingImageId === immagine.id}
                        >
                          {analyzingImageId === immagine.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      {immagine.analisi_ai && (
                        <>
                          <p className="text-slate-600 mb-4">
                            {immagine.analisi_ai.descrizione_dettagliata}
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900 mb-2">
                                Pericoli Identificati:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {immagine.analisi_ai.pericoli_identificati.map((pericolo, idx) => (
                                  <Badge key={idx} variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {pericolo}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-slate-900 mb-2">
                                Raccomandazioni:
                              </p>
                              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                {immagine.analisi_ai.raccomandazioni.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={selectedImage.url_immagine}
                  alt="Foto"
                  className="max-h-[60vh] md:max-h-[80vh] object-contain"
                />
              </div>
              <div className="w-full md:w-80 p-6 bg-white overflow-y-auto max-h-[40vh] md:max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="text-lg">Dettagli Foto</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Descrizione</p>
                    <p className="text-slate-900">
                      {selectedImage.descrizione_utente || 'Nessuna descrizione'}
                    </p>
                    {selectedImage.metodo_input === 'voice' && (
                      <Badge variant="outline" className="mt-2 gap-1">
                        <Mic className="w-3 h-3" />
                        Input Vocale
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Data e Ora</p>
                    <p className="text-slate-900">{formatDate(selectedImage.timestamp)}</p>
                  </div>
                  
                  {selectedImage.geolocalizzazione && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Posizione</p>
                      <div className="flex items-center gap-2 text-slate-900">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {selectedImage.geolocalizzazione.lat.toFixed(4)}, {selectedImage.geolocalizzazione.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedImage.analisi_ai && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-2">Analisi AI</p>
                      <div className="mb-3">
                        {getRischioBadge(selectedImage.analisi_ai.livello_rischio)}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {selectedImage.analisi_ai.descrizione_dettagliata}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">Pericoli:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedImage.analisi_ai.pericoli_identificati.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il lavoro "{lavoro.nome_progetto}"? 
              Questa azione eliminerà anche tutte le {immagini.length} foto associate e non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
