# FranchiseIQ — Deployment Guide
# Vercel + Neon PostgreSQL + Claude API

## Prerequisites
- Node.js 18+ installed on your machine
- A GitHub account
- A Vercel account (free at vercel.com)
- A Neon account (free at neon.tech)
- An Anthropic API key (console.anthropic.com)

---

## Step 1 — Set up Neon Database (10 minutes)

1. Go to https://console.neon.tech and create a free account
2. Click "New Project" → name it "franchiseiq" → region: US East (AWS)
3. Once created, click "SQL Editor"
4. Copy the entire contents of `schema.sql` and paste it in → click Run
5. Go to "Dashboard" → copy your "Connection string" (starts with postgresql://)

---

## Step 2 — Get Your Anthropic API Key (2 minutes)

1. Go to https://console.anthropic.com
2. Click "API Keys" → "Create Key"
3. Name it "franchiseiq-production" → copy the key

---

## Step 3 — Deploy to Vercel (10 minutes)

### Option A: GitHub (recommended)
1. Push this project to a GitHub repo:
   ```
   git init
   git add .
   git commit -m "Initial FranchiseIQ build"
   git remote add origin https://github.com/YOURUSERNAME/franchiseiq.git
   git push -u origin main
   ```
2. Go to https://vercel.com → "New Project" → Import your GitHub repo
3. Vercel auto-detects Next.js — click Deploy

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel deploy
```

---

## Step 4 — Set Environment Variables in Vercel

In your Vercel project dashboard:
Settings → Environment Variables → Add each of these:

| Variable | Value |
|---|---|
| DATABASE_URL | Your Neon connection string |
| ANTHROPIC_API_KEY | Your Anthropic API key |
| NEXTAUTH_SECRET | Run: `openssl rand -base64 32` |
| NEXTAUTH_URL | https://your-project.vercel.app |
| CRON_SECRET | Any random string you create |
| R365_CLIENT_ID | (from R365 — add when you have it) |
| R365_CLIENT_SECRET | (from R365 — add when you have it) |
| R365_ORG_ID | (from R365 — add when you have it) |
| R365_TOKEN_URL | https://identity.restaurant365.com/connect/token |
| R365_API_BASE | https://api.restaurant365.com/v1 |

After adding variables → click "Redeploy"

---

## Step 5 — Test Your Deployment

Visit your Vercel URL. You should see the FranchiseIQ dashboard.

Test the database:
https://your-project.vercel.app/api/sales

Test the AI (POST request):
https://your-project.vercel.app/api/ai/chat

---

## Step 6 — Add R365 Credentials (when available)

Once R365 provides your API credentials:
1. Go to Vercel → Settings → Environment Variables
2. Update R365_CLIENT_ID, R365_CLIENT_SECRET, R365_ORG_ID
3. Trigger a manual sync: POST to /api/sync with body {"type":"locations"}
4. Then: POST to /api/sync with body {"type":"full","days":90}

---

## Cron Schedule

Vercel will automatically run /api/cron every 15 minutes to:
- Sync last 2 days of R365 data → Neon database
- Regenerate AI insights hourly
- Check for anomalies and create alerts

You can check cron logs in: Vercel Dashboard → Logs → filter by /api/cron

---

## Custom Domain

In Vercel → Settings → Domains → Add your domain
e.g. franchiseiq.yourcompany.com

Update NEXTAUTH_URL environment variable to match.

---

## Cost Estimate (production)

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Pro | $20/mo |
| Neon | Launch | $19/mo |
| Anthropic API | Pay-per-use | ~$30-80/mo |
| **Total** | | **~$70-120/mo** |

At your revenue scale ($40M+/mo) this is negligible infrastructure cost.
