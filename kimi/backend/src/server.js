const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
        ruolo: 'admin'
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
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
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

// ========== IMMAGINI (IMAGES) ==========
app.get('/api/immagini', async (req, res) => {
  try {
    const { lavoro_id } = req.query;
    
    let query = supabase.from('immagini').select('*');
    if (lavoro_id) {
      query = query.eq('lavoro_id', lavoro_id);
    }
    
    const { data, error } = await query.order('ordine', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/immagini', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('immagini')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.json(data);
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
