import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  FileText, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Building2,
  Camera,
  Calendar,
  Brain,
  FileSpreadsheet,
  Table
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { FormatoReport, AnalisiAI } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ReportPage() {
  const { lavoroId } = useParams<{ lavoroId: string }>();
  const { getLavoro, getImmaginiByLavoro, updateImmagine } = useData();
  
  const lavoro = lavoroId ? getLavoro(lavoroId) : null;
  const immaginiLavoro = lavoroId ? getImmaginiByLavoro(lavoroId) : [];
  
  const [formato, setFormato] = useState<FormatoReport>('docx');
  const [includeImages, setIncludeImages] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!lavoro) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Lavoro non trovato</h2>
        <Link to="/lavori">
          <Button>Torna ai Lavori</Button>
        </Link>
      </div>
    );
  }

  const immaginiConAnalisi = immaginiLavoro.filter(i => i.analisi_ai);
  const immaginiSenzaAnalisi = immaginiLavoro.filter(i => !i.analisi_ai);

  // Converte base64 in array di bytes per docx
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Analisi AI di tutte le foto - chiama il backend
  const handleAnalyzeAll = async () => {
    if (immaginiSenzaAnalisi.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const total = immaginiSenzaAnalisi.length;
    
    for (let i = 0; i < immaginiSenzaAnalisi.length; i++) {
      const img = immaginiSenzaAnalisi[i];
      setCurrentAnalysis(`Analizzando foto ${i + 1} di ${total}...`);
      setAnalysisProgress(Math.round(((i) / total) * 100));
      
      try {
        // Chiama il backend per l'analisi AI
        const response = await fetch(`${API_URL}/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            immagine_id: img.id,
            imageBase64: img.url_immagine,
            description: img.descrizione_utente
          }),
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const analisi: AnalisiAI = await response.json();
        
        // Aggiorna l'immagine con l'analisi
        updateImmagine({ ...img, analisi_ai: analisi });
        
      } catch (error) {
        console.error('Errore analisi foto:', error);
      }
      
      setAnalysisProgress(Math.round(((i + 1) / total) * 100));
    }
    
    setCurrentAnalysis('Analisi completata!');
    setIsAnalyzing(false);
    
    setTimeout(() => {
      setCurrentAnalysis('');
      setAnalysisProgress(0);
    }, 2000);
  };

  const generateDOCX = async () => {
    const children: any[] = [
      // Titolo
      new Paragraph({
        text: 'REPORT DI SICUREZZA SUL LAVORO',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      
      // Informazioni generali
      new Paragraph({
        children: [
          new TextRun({ text: 'Progetto: ', bold: true }),
          new TextRun(lavoro.nome_progetto)
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Azienda Cliente: ', bold: true }),
          new TextRun(lavoro.nome_azienda_cliente)
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Data: ', bold: true }),
          new TextRun(new Date().toLocaleDateString('it-IT'))
        ],
        spacing: { after: 400 }
      }),
      
      // Descrizione
      new Paragraph({
        text: 'Descrizione del Progetto',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        text: lavoro.descrizione || 'Nessuna descrizione disponibile',
        spacing: { after: 400 }
      }),
      
      // Riepilogo
      new Paragraph({
        text: 'Riepilogo',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Totale foto documentate: ', bold: true }),
          new TextRun(String(immaginiLavoro.length))
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Analisi AI completate: ', bold: true }),
          new TextRun(String(immaginiConAnalisi.length))
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Pericoli identificati: ', bold: true }),
          new TextRun(String(immaginiConAnalisi.reduce((acc, img) => 
            acc + (img.analisi_ai?.pericoli_identificati.length || 0), 0)))
        ],
        spacing: { after: 400 }
      }),
    ];

    // Dettaglio immagini
    children.push(
      new Paragraph({
        text: 'Dettaglio Evidenze',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );
    
    for (let i = 0; i < immaginiLavoro.length; i++) {
      const immagine = immaginiLavoro[i];
      
      // Titolo evidenza
      children.push(
        new Paragraph({
          text: `Evidenza ${i + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        })
      );
      
      // Data
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Data: ', bold: true }),
            new TextRun(new Date(immagine.timestamp).toLocaleString('it-IT'))
          ],
          spacing: { after: 100 }
        })
      );
      
      // Descrizione utente
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Descrizione: ', bold: true }),
            new TextRun(immagine.descrizione_utente || 'Nessuna descrizione')
          ],
          spacing: { after: 200 }
        })
      );
      
      // Immagine
      if (includeImages && immagine.url_immagine) {
        try {
          const imageData = base64ToUint8Array(immagine.url_immagine);
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 500,
                    height: 375
                  },
                  type: 'jpg'
                })
              ],
              spacing: { after: 200 }
            })
          );
        } catch (e) {
          console.error('Errore conversione immagine:', e);
        }
      }
      
      // Analisi AI
      if (immagine.analisi_ai) {
        children.push(
          new Paragraph({
            text: 'Analisi AI',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Livello di Rischio: ', bold: true }),
              new TextRun(immagine.analisi_ai.livello_rischio.toUpperCase())
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Analisi: ', bold: true })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: immagine.analisi_ai.descrizione_dettagliata,
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Pericoli:', bold: true })
            ],
            spacing: { after: 100 }
          })
        );
        
        // Lista pericoli
        immagine.analisi_ai.pericoli_identificati.forEach(pericolo => {
          children.push(
            new Paragraph({
              text: `• ${pericolo}`,
              spacing: { after: 50 }
            })
          );
        });
        
        // Riferimenti Normativi
        if (immagine.analisi_ai.riferimenti_normativi.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Normative:', bold: true })
              ],
              spacing: { before: 100, after: 100 }
            })
          );
          
          immagine.analisi_ai.riferimenti_normativi.forEach(rif => {
            children.push(
              new Paragraph({
                text: `• ${rif.articolo} - ${rif.decreto}`,
                spacing: { after: 50 }
              })
            );
          });
        }
        
        // Raccomandazioni
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Azioni:', bold: true })
            ],
            spacing: { before: 100, after: 100 }
          })
        );
        
        immagine.analisi_ai.raccomandazioni.forEach(rec => {
          children.push(
            new Paragraph({
              text: `• ${rec}`,
              spacing: { after: 50 }
            })
          );
        });
      }
      
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Report_${lavoro.nome_progetto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`);
  };

  // Export to CSV
  const generateCSV = () => {
    const headers = ['Evidenza', 'Data', 'Descrizione', 'Livello Rischio', 'Pericoli', 'Raccomandazioni'];
    const rows = immaginiLavoro.map((img, idx) => {
      const analisi = img.analisi_ai;
      return [
        `Evidenza ${idx + 1}`,
        new Date(img.timestamp).toLocaleString('it-IT'),
        `"${(img.descrizione_utente || 'Nessuna descrizione').replace(/"/g, '""')}"`,
        analisi?.livello_rischio.toUpperCase() || 'N/A',
        analisi ? `"${analisi.pericoli_identificati.join('; ').replace(/"/g, '""')}"` : 'N/A',
        analisi ? `"${analisi.raccomandazioni.join('; ').replace(/"/g, '""')}"` : 'N/A'
      ];
    });
    
    const csvContent = [
      ['Report Sicurezza Sul Lavoro'],
      ['Progetto:', lavoro.nome_progetto],
      ['Azienda:', lavoro.nome_azienda_cliente],
      ['Data:', new Date().toLocaleDateString('it-IT')],
      [''],
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Report_${lavoro.nome_progetto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export to Excel (HTML table that opens in Excel)
  const generateExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .header { background-color: #f3f4f6; font-weight: bold; }
          .risk-basso { background-color: #dcfce7; }
          .risk-medio { background-color: #fef9c3; }
          .risk-alto { background-color: #ffedd5; }
          .risk-critico { background-color: #fee2e2; }
        </style>
      </head>
      <body>
        <h2>Report Sicurezza Sul Lavoro</h2>
        <p><strong>Progetto:</strong> ${lavoro.nome_progetto}</p>
        <p><strong>Azienda:</strong> ${lavoro.nome_azienda_cliente}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
        <br>
        <table>
          <thead>
            <tr>
              <th>Evidenza</th>
              <th>Data</th>
              <th>Descrizione</th>
              <th>Livello Rischio</th>
              <th>Pericoli Identificati</th>
              <th>Raccomandazioni</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    immaginiLavoro.forEach((img, idx) => {
      const analisi = img.analisi_ai;
      const riskClass = analisi ? `risk-${analisi.livello_rischio}` : '';
      html += `
        <tr>
          <td>Evidenza ${idx + 1}</td>
          <td>${new Date(img.timestamp).toLocaleString('it-IT')}</td>
          <td>${img.descrizione_utente || 'Nessuna descrizione'}</td>
          <td class="${riskClass}">${analisi?.livello_rischio.toUpperCase() || 'N/A'}</td>
          <td>${analisi ? analisi.pericoli_identificati.join(', ') : 'N/A'}</td>
          <td>${analisi ? analisi.raccomandazioni.join(', ') : 'N/A'}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    saveAs(blob, `Report_${lavoro.nome_progetto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      if (formato === 'docx') {
        await generateDOCX();
      } else if (formato === 'csv') {
        generateCSV();
      } else if (formato === 'xls') {
        generateExcel();
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Errore generazione report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRischioColor = (livello: string) => {
    switch (livello) {
      case 'basso': return 'bg-green-500';
      case 'medio': return 'bg-yellow-500';
      case 'alto': return 'bg-orange-500';
      case 'critico': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/lavori/${lavoroId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Genera Report</h1>
          <p className="text-slate-500">{lavoro.nome_progetto}</p>
        </div>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Report generato con successo!
          </AlertDescription>
        </Alert>
      )}

      {/* Analisi AI Banner */}
      {immaginiSenzaAnalisi.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {immaginiSenzaAnalisi.length} foto da analizzare
                  </p>
                  <p className="text-sm text-slate-500">
                    Avvia l'analisi AI per generare il report completo
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAnalyzeAll}
                disabled={isAnalyzing}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Avvia Analisi AI
                  </>
                )}
              </Button>
            </div>
            
            {isAnalyzing && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{currentAnalysis}</span>
                  <span className="font-medium">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analisi Completata Banner */}
      {immaginiSenzaAnalisi.length === 0 && immaginiLavoro.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Tutte le foto sono state analizzate. Il report è pronto per il download!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Lavoro */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Lavoro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Azienda Cliente</p>
                  <p className="font-medium">{lavoro.nome_azienda_cliente}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Foto Documentate</p>
                  <p className="font-medium">{immaginiLavoro.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Data Creazione</p>
                  <p className="font-medium">{formatDate(lavoro.data_creazione)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Analisi AI</p>
                  <p className="font-medium">
                    {immaginiConAnalisi.length}/{immaginiLavoro.length} completate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opzioni Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formato</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={formato === 'docx' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormato('docx')}
                    className="w-full"
                  >
                    DOCX
                  </Button>
                  <Button
                    variant={formato === 'csv' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormato('csv')}
                    className="w-full"
                  >
                    CSV
                  </Button>
                  <Button
                    variant={formato === 'xls' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormato('xls')}
                    className="w-full"
                  >
                    Excel
                  </Button>
                </div>
              </div>

              {formato === 'docx' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="images" 
                    checked={includeImages}
                    onCheckedChange={(c) => setIncludeImages(c as boolean)}
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    Includi immagini
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Anteprima Foto ({immaginiLavoro.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {immaginiLavoro.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">
                    Nessuna foto disponibile per il report
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {immaginiLavoro.map((img, idx) => (
                    <div key={img.id} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={img.url_immagine}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.analisi_ai ? (
                        <div className="absolute top-2 right-2">
                          <Badge className={getRischioColor(img.analisi_ai.livello_rischio)}>
                            {img.analisi_ai.livello_rischio}
                          </Badge>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Da analizzare</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Link to={`/lavori/${lavoroId}`}>
          <Button variant="outline">Annulla</Button>
        </Link>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || immaginiLavoro.length === 0 || (formato === 'docx' && immaginiSenzaAnalisi.length > 0)}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generazione...
            </>
          ) : (
            <>
              {formato === 'docx' && <FileText className="w-4 h-4" />}
              {formato === 'csv' && <Table className="w-4 h-4" />}
              {formato === 'xls' && <FileSpreadsheet className="w-4 h-4" />}
              Scarica {formato === 'docx' ? 'DOCX' : formato === 'csv' ? 'CSV' : 'Excel'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
