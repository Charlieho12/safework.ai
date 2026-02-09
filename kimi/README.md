# SafeWork AI

A workplace safety management platform with AI-powered hazard analysis.

## Features

- 📸 AI-powered image analysis for hazard detection
- 📊 Professional safety reports (DOCX/PDF)
- 💳 Stripe payment integration
- 🗄️ Supabase database
- 🚀 Deployed on Railway

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 Vision
- **Payments**: Stripe
- **Hosting**: Railway

## Project Structure

```
kimi/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/                # Backend (Express)
│   ├── src/
│   │   └── server.js
│   ├── supabase-schema.sql
│   └── package.json
└── README.md
```

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd kimi

# Install frontend dependencies
cd app
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and run the contents of `backend/supabase-schema.sql`
4. Get your credentials from Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (service_role key)
   - `SUPABASE_ANON_KEY` (anon/public key)

### 3. Environment Variables

**Frontend** (`app/.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

PORT=3001
NODE_ENV=development
```

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd app
npm run dev
```

## Deployment

### 1. Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/safework-ai.git

# Push
git push -u origin main
```

### 2. Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect the backend (or manually set root directory to `backend`)
6. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NODE_ENV=production`
7. Deploy!

Get your backend URL (e.g., `https://safework-api.railway.app`)

### 3. Deploy Frontend to Railway

1. Create another service in Railway
2. Choose "Deploy from GitHub repo"
3. Set root directory to `app`
4. Build command: `npm run build`
5. Start command: `npm run preview` (or use a static hosting)
6. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.railway.app/api`

**Alternative**: Use Vercel or Netlify for frontend:
- Connect your GitHub repo
- Set build command: `npm run build`
- Set output directory: `dist`
- Add environment variable `VITE_API_URL`

### 4. Update Stripe Webhook

In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Add endpoint: `https://your-backend-url.railway.app/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Update CORS

Update `backend/src/server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.railway.app', 'http://localhost:5173']
}));
```

## Environment Variables Summary

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |

### Backend
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | environment (development/production) |

## Database Schema

See `backend/supabase-schema.sql` for the complete database schema including:
- Users & Authentication
- Companies (Aziende)
- Works/Projects (Lavori)
- Images (Immagini)
- AI Analysis (Analisi AI)
- Subscriptions

## Testing Stripe Payments

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

## Support

For issues or questions, please open a GitHub issue.

## License

MIT
