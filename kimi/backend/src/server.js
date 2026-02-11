const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const OpenAI = require('openai');

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware - CORS
// Allow all origins in production for now (you should restrict this in production)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('lavori').select('count');
    
    if (error) {
      console.error('Supabase health check failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Supabase connection failed',
        error: error.message 
      });
      return;
    }
    
    res.json({ 
      status: 'ok', 
      stripe: 'connected',
      supabase: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// ========== AUTH ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nome_completo, azienda_nome } = req.body;
    
    console.log('Registering user:', email);
    
    // Step 1: Create user in Supabase Auth (this sends email confirmation by default)
    // We need to disable email confirmation in Supabase Dashboard or use a workaround
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo,
          azienda_nome
        }
      }
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    console.log('User created:', authData.user.id);
    
    // Step 2: Immediately confirm the email using admin API
    if (authData.user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error('Error confirming email:', updateError);
        // Continue anyway, user is created
      }
    }
    
    // Step 3: Create azienda
    const { data: azienda, error: aziendaError } = await supabase
      .from('aziende')
      .insert([{ nome: azienda_nome }])
      .select()
      .single();
    
    if (aziendaError) {
      console.error('Azienda error:', aziendaError);
      throw aziendaError;
    }
    
    console.log('Azienda created:', azienda.id);
    
    // Step 4: Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        nome_completo,
        azienda_id: azienda.id,
        ruolo: 'consulente'
      }]);
    
    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
    res.json({ 
      success: true, 
      user: authData.user,
      message: 'Account created successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    
    console.log('Auth successful for user:', data.user.id);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Return auth user even if profile not found
      res.json({ 
        success: true, 
        user: { 
          ...data.user, 
          nome_completo: data.user.user_metadata?.nome_completo || email,
          ruolo: 'consulente'
        },
        session: data.session
      });
      return;
    }
    
    console.log('Profile found:', profile);
    
    res.json({ 
      success: true, 
      user: { ...data.user, ...profile },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// ========== LAVORI (WORKS) ==========
app.get('/api/lavori', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    const { data, error } = await supabase
      .from('lavori')
      .select('*')
      .eq('created_by', user_id)
      .order('data_modifica', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lavori', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lavori')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lavori/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('lavori')
      .update({ ...req.body, data_modifica: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lavori/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('lavori')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transform database row to frontend format
function transformImmagine(row) {
  const result = { ...row };
  
  // Combine lat/lng into geolocalizzazione object
  if (row.geolocalizzazione_lat !== undefined && row.geolocalizzazione_lng !== undefined) {
    result.geolocalizzazione = {
      lat: row.geolocalizzazione_lat,
      lng: row.geolocalizzazione_lng
    };
    delete result.geolocalizzazione_lat;
    delete result.geolocalizzazione_lng;
  }
  
  // Transform analisi_ai array to single object (it's a one-to-one relationship)
  if (row.analisi_ai && Array.isArray(row.analisi_ai) && row.analisi_ai.length > 0) {
    result.analisi_ai = row.analisi_ai[0];
  } else if (row.analisi_ai === null || (Array.isArray(row.analisi_ai) && row.analisi_ai.length === 0)) {
    delete result.analisi_ai;
  }
  
  return result;
}

// ========== IMMAGINI (IMAGES) ==========
app.get('/api/immagini', async (req, res) => {
  try {
    const { lavoro_id } = req.query;
    
    // Join with analisi_ai to get analysis data
    let query = supabase.from('immagini').select('*, analisi_ai(*)');
    if (lavoro_id) {
      query = query.eq('lavoro_id', lavoro_id);
    }
    
    const { data, error } = await query.order('ordine', { ascending: true });
    
    if (error) throw error;
    
    // Transform each row
    const transformed = (data || []).map(transformImmagine);
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/immagini', async (req, res) => {
  try {
    console.log('Creating immagine:', req.body.lavoro_id);
    
    // Remove any undefined values
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined)
    );
    
    const { data, error } = await supabase
      .from('immagini')
      .insert([cleanBody])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Immagine created:', data.id);
    
    // Transform response to frontend format
    const transformed = transformImmagine(data);
    res.json(transformed);
  } catch (error) {
    console.error('Error creating immagine:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

app.put('/api/immagini/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('immagini')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform response to frontend format
    const transformed = transformImmagine(data);
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/immagini/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('immagini')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ANALISI AI ==========
app.get('/api/analisi', async (req, res) => {
  try {
    const { immagine_id } = req.query;
    
    let query = supabase.from('analisi_ai').select('*');
    if (immagine_id) {
      query = query.eq('immagine_id', immagine_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Language configurations for AI analysis
const LANGUAGE_CONFIGS = {
  it: {
    name: 'Italian',
    systemPrompt: `Sei un esperto consulente per la sicurezza sul lavoro in Italia, specializzato nel D.Lgs. 81/08.

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

SII BREVE E PRECISO. Massimo 3 pericoli, 3 raccomandazioni.

IMPORTANTE: Rispondi SEMPRE in italiano.`,
    analyzeText: (desc) => desc ? `Analizza: "${desc}"` : 'Analizza questa immagine di sicurezza sul lavoro.'
  },
  en: {
    name: 'English',
    systemPrompt: `You are an expert workplace safety consultant specializing in occupational health and safety regulations.

Analyze the image and provide a CONCISE and DIRECT assessment.

Respond in JSON format:
{
  "pericoli_identificati": ["max 3 key hazards"],
  "livello_rischio": "low|medium|high|critical",
  "descrizione_dettagliata": "max 2 concise sentences",
  "riferimenti_normativi": [
    {
      "articolo": "Section XX",
      "decreto": "OSHA Standards",
      "descrizione": "brief"
    }
  ],
  "raccomandazioni": ["max 3 concrete actions"]
}

BE BRIEF AND PRECISE. Maximum 3 hazards, 3 recommendations.

IMPORTANT: Always respond in English.`,
    analyzeText: (desc) => desc ? `Analyze: "${desc}"` : 'Analyze this workplace safety image.'
  },
  fr: {
    name: 'French',
    systemPrompt: `Vous êtes un expert consultant en sécurité au travail, spécialisé dans la réglementation sur la santé et la sécurité.

Analysez l'image et fournissez une évaluation CONCISE et DIRECTE.

Répondez au format JSON:
{
  "pericoli_identificati": ["max 3 dangers clés"],
  "livello_rischio": "faible|moyen|élevé|critique",
  "descrizione_dettagliata": "max 2 phrases concises",
  "riferimenti_normativi": [
    {
      "articolo": "Art. XX",
      "decreto": "Code du Travail",
      "descrizione": "bref"
    }
  ],
  "raccomandazioni": ["max 3 actions concrètes"]
}

SOYEZ BREF ET PRÉCIS. Maximum 3 dangers, 3 recommandations.

IMPORTANT: Répondez TOUJOURS en français.`,
    analyzeText: (desc) => desc ? `Analysez: "${desc}"` : 'Analysez cette image de sécurité au travail.'
  },
  de: {
    name: 'German',
    systemPrompt: `Sie sind ein Experte für Arbeitssicherheit, spezialisiert auf Arbeitsschutzvorschriften.

Analysieren Sie das Bild und geben Sie eine KNAPPE und DIREKTE Bewertung ab.

Antworten Sie im JSON-Format:
{
  "pericoli_identificati": ["max 3 wichtige Gefahren"],
  "livello_rischio": "niedrig|mittel|hoch|kritisch",
  "descrizione_dettagliata": "max 2 prägnante Sätze",
  "riferimenti_normativi": [
    {
      "articolo": "§ XX",
      "decreto": "ArbSchG",
      "descrizione": "kurz"
    }
  ],
  "raccomandazioni": ["max 3 konkrete Maßnahmen"]
}

SEIEN SIE KNAPP UND PRÄZISE. Maximal 3 Gefahren, 3 Empfehlungen.

WICHTIG: Antworten Sie IMMER auf Deutsch.`,
    analyzeText: (desc) => desc ? `Analysieren Sie: "${desc}"` : 'Analysieren Sie dieses Arbeitssicherheitsbild.'
  },
  es: {
    name: 'Spanish',
    systemPrompt: `Eres un experto consultor en seguridad laboral, especializado en normativas de salud y seguridad en el trabajo.

Analiza la imagen y proporciona una evaluación CONCISA y DIRECTA.

Responde en formato JSON:
{
  "pericoli_identificati": ["max 3 peligros clave"],
  "livello_rischio": "bajo|medio|alto|crítico",
  "descrizione_dettagliata": "max 2 frases concisas",
  "riferimenti_normativi": [
    {
      "articolo": "Art. XX",
      "decreto": "Ley de Prevención de Riesgos",
      "descrizione": "breve"
    }
  ],
  "raccomandazioni": ["max 3 acciones concretas"]
}

SE CONCISO Y PRECISO. Máximo 3 peligros, 3 recomendaciones.

IMPORTANTE: Responde SIEMPRE en español.`,
    analyzeText: (desc) => desc ? `Analiza: "${desc}"` : 'Analiza esta imagen de seguridad laboral.'
  }
};

// AI Analysis endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, description, immagine_id, language = 'it' } = req.body;
    
    console.log('AI Analysis request for image:', immagine_id);
    console.log('Description:', description);
    console.log('Language:', language);
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Get language config (default to Italian)
    const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.it;
    
    // Remove data:image prefix if present
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    
    console.log('Calling OpenAI with language:', langConfig.name);
    
    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: langConfig.systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: langConfig.analyzeText(description)
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
    
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    
    console.log('OpenAI response received');
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const analysisData = JSON.parse(jsonMatch[0]);
    
    // Save to database
    const analisiRecord = {
      immagine_id,
      pericoli_identificati: analysisData.pericoli_identificati?.slice(0, 3) || [],
      livello_rischio: analysisData.livello_rischio || 'medio',
      descrizione_dettagliata: analysisData.descrizione_dettagliata || '',
      riferimenti_normativi: analysisData.riferimenti_normativi?.slice(0, 2) || [],
      raccomandazioni: analysisData.raccomandazioni?.slice(0, 3) || []
    };
    
    console.log('Saving analysis to database...');
    
    const { data, error } = await supabase
      .from('analisi_ai')
      .insert([analisiRecord])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Analysis saved:', data.id);
    
    res.json(data);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/analisi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('analisi_ai')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STRIPE PAYMENTS ==========
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, email, successUrl, cancelUrl } = req.body;

    // Get plan amount
    const amounts = {
      starter: 2900,
      professional: 7900,
      enterprise: 19900
    };
    const amount = amounts[planId] || 7900;

    // Create customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId, planId }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `SafeWork AI - Piano ${planId}`,
            description: `Abbonamento mensile`,
          },
          unit_amount: amount,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planId }
    });

    // Save subscription to Supabase
    await supabase.from('subscriptions').insert([{
      user_id: userId,
      stripe_customer_id: customer.id,
      stripe_session_id: session.id,
      plan: planId,
      status: 'pending',
      amount: amount / 100
    }]);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify checkout session
app.get('/api/verify-checkout-session', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: session.payment_status === 'paid',
      status: session.payment_status,
      plan: session.metadata?.planId,
      customerId: session.customer,
      subscriptionId: session.subscription
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          stripe_subscription_id: session.subscription
        })
        .eq('stripe_session_id', session.id);
      break;
      
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
      
    case 'customer.subscription.deleted':
      // Handle cancellation
      break;
  }

  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
