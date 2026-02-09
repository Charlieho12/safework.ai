import OpenAI from 'openai';
import type { AnalisiAI, LivelloRischio } from '@/types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export async function analyzeImageWithAI(
  imageBase64: string,
  userDescription: string
): Promise<AnalisiAI> {
  try {
    // Rimuovi il prefiso data:image se presente
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto consulente per la sicurezza sul lavoro in Italia, specializzato nel D.Lgs. 81/08.

Analizza l'immagine e fornisci una valutazione CONCISSA e DIRETTA.

Rispondi in formato JSON:
{
  "pericoli_identificati": ["max 3 pericoli chiave"],
  "livello_rischio": "basso|medio|alto|critico",
  "descrizione_dettagliata": "max 2 frasi sintetiche",
  "riferimenti_normativi": [
    {
      "articolo": "Art. XX",
      "decreto": "D.Lgs. 81/08",
      "descrizione": "breve"
    }
  ],
  "raccomandazioni": ["max 3 azioni concrete"]
}

SII BREVE E PRECISO. Massimo 3 pericoli, 3 raccomandazioni.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userDescription 
                ? `Analizza: "${userDescription}"`
                : 'Analizza questa immagine di sicurezza sul lavoro.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Nessuna risposta da OpenAI');
    }

    // Estrai il JSON dalla risposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato risposta non valido');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    return {
      id: crypto.randomUUID(),
      immagine_id: '',
      pericoli_identificati: analysisData.pericoli_identificati?.slice(0, 3) || [],
      livello_rischio: analysisData.livello_rischio as LivelloRischio,
      descrizione_dettagliata: analysisData.descrizione_dettagliata || '',
      riferimenti_normativi: analysisData.riferimenti_normativi?.slice(0, 2) || [],
      raccomandazioni: analysisData.raccomandazioni?.slice(0, 3) || [],
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore analisi OpenAI:', error);
    return generateFallbackAnalysis(userDescription);
  }
}

function generateFallbackAnalysis(userDescription: string): AnalisiAI {
  return {
    id: crypto.randomUUID(),
    immagine_id: '',
    pericoli_identificati: ['Rischio generico da verificare'],
    livello_rischio: 'medio',
    descrizione_dettagliata: userDescription 
      ? `Evidenza: ${userDescription}. Richiede valutazione approfondita.`
      : 'Rischio identificato. Necessaria verifica tecnica.',
    riferimenti_normativi: [
      {
        articolo: 'Art. 81',
        decreto: 'D.Lgs. 81/08',
        descrizione: 'Valutazione rischi'
      }
    ],
    raccomandazioni: [
      'Verificare conformità',
      'Consultare RSPP'
    ],
    created_at: new Date().toISOString()
  };
}
