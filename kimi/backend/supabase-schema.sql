-- SafeWork AI Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Aziende (Companies)
CREATE TABLE aziende (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users (profiles)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    azienda_id UUID REFERENCES aziende(id),
    ruolo VARCHAR(50) DEFAULT 'consulente' CHECK (ruolo IN ('admin', 'consulente', 'visualizzatore')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lavori (Works/Projects)
CREATE TABLE lavori (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_azienda_cliente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    descrizione TEXT,
    data_creazione TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_modifica TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stato VARCHAR(50) DEFAULT 'in_corso' CHECK (stato IN ('in_corso', 'completato', 'archiviato')),
    created_by UUID REFERENCES users(id),
    azienda_consulenza UUID REFERENCES aziende(id),
    immagini_count INTEGER DEFAULT 0
);

-- Immagini (Images)
CREATE TABLE immagini (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lavoro_id UUID REFERENCES lavori(id) ON DELETE CASCADE,
    url_immagine TEXT NOT NULL,
    descrizione_utente TEXT,
    metodo_input VARCHAR(50) DEFAULT 'testo' CHECK (metodo_input IN ('testo', 'voice')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    geolocalizzazione_lat DECIMAL(10, 8),
    geolocalizzazione_lng DECIMAL(11, 8),
    ordine INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analisi AI
CREATE TABLE analisi_ai (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    immagine_id UUID REFERENCES immagini(id) ON DELETE CASCADE,
    pericoli_identificati TEXT[],
    livello_rischio VARCHAR(50) CHECK (livello_rischio IN ('basso', 'medio', 'alto', 'critico')),
    descrizione_dettagliata TEXT,
    riferimenti_normativi JSONB,
    raccomandazioni TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions (for Stripe)
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'past_due')),
    amount DECIMAL(10, 2),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE aziende ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lavori ENABLE ROW LEVEL SECURITY;
ALTER TABLE immagini ENABLE ROW LEVEL SECURITY;
ALTER TABLE analisi_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Aziende: everyone can read, only admin can modify
CREATE POLICY "Aziende readable by all" ON aziende
    FOR SELECT USING (true);

-- Users: users can read their own profile and colleagues in same company
CREATE POLICY "Users readable by same company" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        azienda_id IN (SELECT azienda_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Lavori: users can CRUD their own works
CREATE POLICY "Lavori readable by creator" ON lavori
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Lavori insertable by authenticated" ON lavori
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Lavori updatable by creator" ON lavori
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Lavori deletable by creator" ON lavori
    FOR DELETE USING (created_by = auth.uid());

-- Immagini: users can CRUD images for their works
CREATE POLICY "Immagini readable by work owner" ON immagini
    FOR SELECT USING (
        lavoro_id IN (SELECT id FROM lavori WHERE created_by = auth.uid())
    );

CREATE POLICY "Immagini insertable by work owner" ON immagini
    FOR INSERT WITH CHECK (
        lavoro_id IN (SELECT id FROM lavori WHERE created_by = auth.uid())
    );

CREATE POLICY "Immagini updatable by work owner" ON immagini
    FOR UPDATE USING (
        lavoro_id IN (SELECT id FROM lavori WHERE created_by = auth.uid())
    );

CREATE POLICY "Immagini deletable by work owner" ON immagini
    FOR DELETE USING (
        lavoro_id IN (SELECT id FROM lavori WHERE created_by = auth.uid())
    );

-- Analisi AI: same as immagini
CREATE POLICY "Analisi readable by work owner" ON analisi_ai
    FOR SELECT USING (
        immagine_id IN (
            SELECT i.id FROM immagini i 
            JOIN lavori l ON i.lavoro_id = l.id 
            WHERE l.created_by = auth.uid()
        )
    );

CREATE POLICY "Analisi insertable by work owner" ON analisi_ai
    FOR INSERT WITH CHECK (
        immagine_id IN (
            SELECT i.id FROM immagini i 
            JOIN lavori l ON i.lavoro_id = l.id 
            WHERE l.created_by = auth.uid()
        )
    );

-- Subscriptions: users can read their own
CREATE POLICY "Subscriptions readable by owner" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_data_modifica()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_modifica = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update data_modifica
CREATE TRIGGER update_lavori_data_modifica
    BEFORE UPDATE ON lavori
    FOR EACH ROW
    EXECUTE FUNCTION update_data_modifica();

-- Indexes for performance
CREATE INDEX idx_lavori_created_by ON lavori(created_by);
CREATE INDEX idx_lavori_azienda ON lavori(azienda_consulenza);
CREATE INDEX idx_immagini_lavoro ON immagini(lavoro_id);
CREATE INDEX idx_analisi_immagine ON analisi_ai(immagine_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
