import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Check, 
  RefreshCw, 
  Mic, 
  MicOff,
  MapPin,
  Loader2,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

export default function CameraPage() {
  const navigate = useNavigate();
  const { lavoroId } = useParams<{ lavoroId: string }>();
  const { getLavoro, createImmagine } = useData();
  
  const lavoro = lavoroId ? getLavoro(lavoroId) : null;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Avvia camera
  useEffect(() => {
    startCamera();
    
    // Richiedi geolocalizzazione
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Geolocalizzazione non disponibile
        }
      );
    }
    
    return () => {
      stopCamera();
    };
  }, [useFrontCamera]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: useFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Impossibile accedere alla camera. Verifica i permessi.');
      setShowFileUpload(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setDescription('');
    startCamera();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'it-IT';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      setIsRecording(true);
      
      // Salva riferimento per poterlo fermare
      (window as any).currentRecognition = recognition;
    } else {
      setError('Il tuo browser non supporta il riconoscimento vocale');
    }
  };

  const stopSpeechRecognition = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsRecording(false);
  };

  const savePhoto = async () => {
    if (!capturedImage || !lavoroId) return;
    
    setIsUploading(true);
    
    try {
      // Converti base64 in file
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      await createImmagine({
        lavoro_id: lavoroId,
        url_immagine: '', // Verrà generato dal server
        descrizione_utente: description,
        metodo_input: description ? 'testo' : 'voice',
        geolocalizzazione: geolocation || undefined
      }, file);
      
      navigate(`/lavori/${lavoroId}`);
    } catch (err) {
      setError('Errore durante il salvataggio della foto');
      setIsUploading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Scatta Foto</h1>
          <p className="text-slate-500">{lavoro.nome_progetto}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!capturedImage ? (
        <Card>
          <CardContent className="p-0">
            {showFileUpload ? (
              <div className="p-8 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-4">
                  Non è possibile accedere alla camera. Puoi selezionare un'immagine dalla galleria.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Seleziona Immagine
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video bg-black rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setUseFrontCamera(!useFrontCamera)}
                    className="w-12 h-12 rounded-full"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 border-4 border-primary"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowFileUpload(true)}
                    className="w-12 h-12 rounded-full"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </div>
                
                {geolocation && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      GPS Attivo
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0 relative">
              <img
                src={capturedImage}
                alt="Catturata"
                className="w-full aspect-video object-contain bg-black rounded-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={retakePhoto}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrivi il pericolo o la situazione..."
                    rows={4}
                    className="pr-12"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Registrazione in corso...
                  </p>
                )}
              </div>

              {geolocation && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Posizione: {geolocation.lat.toFixed(4)}, {geolocation.lng.toFixed(4)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={savePhoto} 
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salva Foto
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={retakePhoto}
                  disabled={isUploading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riscatta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
