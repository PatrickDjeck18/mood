# MingleMood Social

Exclusive club for curated connections - A premium dating and event platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account with project set up
- Stripe account (for payments)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials
   - Add your other API keys

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🌐 Deploy to Production

See **DEPLOY_CUSTOM_DOMAIN.md** for complete deployment instructions to app.minglemood.co

## 📁 Project Structure

```
minglemood-social/
├── App.tsx                 # Main app component
├── main.tsx                # React entry point
├── index.html              # HTML template
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   ├── auth-component.tsx
│   ├── events-component.tsx
│   └── ...
├── utils/                  # Utility functions
│   ├── analytics.tsx      # Google Analytics tracking
│   └── supabase/          # Supabase client
├── supabase/               # Supabase backend
│   └── functions/         # Edge functions
└── styles/                 # Global styles
    └── globals.css        # Tailwind styles
```

## 🔧 Environment Variables

Required environment variables (set these in Vercel):

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

Optional:
- `VITE_GA_MEASUREMENT_ID` - Google Analytics measurement ID

## 📚 Documentation

- **DEPLOY_CUSTOM_DOMAIN.md** - Complete deployment guide
- **PRODUCTION_LAUNCH_GUIDE.md** - Pre-launch checklist
- **PROFILE_SCALING_GUIDE.md** - Scaling to 400+ profiles

## 🆘 Support

For issues or questions:
- Email: hello@minglemood.co
- Website: https://minglemood.co

## 📄 License

Private and confidential - All rights reserved.
