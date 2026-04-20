# Quick Start Guide

This guide will help you get the Trading App running locally in 5 minutes.

## Prerequisites

Before starting, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Step 1: Start PostgreSQL

### On macOS (using Homebrew)
```bash
brew services start postgresql
```

### On Windows
Open PostgreSQL and start the server, or use:
```bash
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
```

### On Linux
```bash
sudo service postgresql start
```

### Verify PostgreSQL is running
```bash
psql --version
```

## Step 2: Create Database

Open PostgreSQL terminal:
```bash
psql -U postgres
```

Inside psql terminal:
```sql
CREATE DATABASE trading_app;
\q
```

## Step 3: Install Dependencies

```bash
cd /path/to/trading-app
npm install
```

This installs dependencies for both backend and frontend (monorepo setup).

## Step 4: Setup Prisma Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations (creates tables):
```bash
npm run prisma:migrate
```

Seed database with test data:
```bash
npm run prisma:seed
```

## Step 5: Start Development Servers

Option A - Start both servers at once:
```bash
npm run dev
```

Option B - Start in separate terminals:
```bash
# Terminal 1 - Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:3000)
npm run dev:frontend
```

## Step 6: Access the Application

Open your browser and go to: **http://localhost:3000**

## Test the Full Flow

### 1. Register a New Account
- Go to the Register page
- Create an account with any email and password (min 8 chars)

### 2. Make a Payment
- Go to Dashboard
- Click "Make Payment ($99.99)"
- Payment will be simulated and marked as completed

### 3. Create a Trading Link
- Still on Dashboard
- Click "Create Trading Link"
- Copy the generated link

### 4. Access Trading Dashboard
- Open a new tab/window
- Paste the trading link you copied
- The link will validate and show the trading terminal

### 5. Trade
- Select a symbol (BTC, ETH, AAPL, MSFT)
- Choose Buy or Sell
- Enter quantity and price
- Click the Buy/Sell button
- See the order execute with animation

## What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app - User interface |
| Backend | http://localhost:5000 | Express API - Business logic |
| Database | localhost:5432 | PostgreSQL - Data storage |
| Health Check | http://localhost:5000/api/health | Backend status |

## Stopping the Servers

Press `Ctrl+C` in each terminal to stop the servers.

## Troubleshooting

### "PostgreSQL connection refused"
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `backend/.env`
- Default should be: `postgresql://postgres:postgres@localhost:5432/trading_app`

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or change frontend port in frontend/vite.config.ts
```

### "Port 5000 already in use"
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or change PORT in backend/.env
```

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### "Migration error"
```bash
# Reset database and run migrations fresh
npm run prisma:migrate

# Or manually:
npm run prisma:migrate -- --skip-generate
```

### Frontend shows "Unauthorized" when accessing trading dashboard
- Make sure the token in the URL is valid
- Try creating a new trading link from dashboard
- Make sure cookies are enabled in your browser

## Next Steps

Once everything is running:

1. **Explore the Code:**
   - Backend routes: `backend/src/routes/`
   - Frontend components: `frontend/src/components/`
   - Database schema: `backend/prisma/schema.prisma`

2. **Understand the Flow:**
   - User registers/logs in
   - Makes payment → gets trading link
   - Clicks link → validates token → gets trading session
   - Trades on the platform

3. **Modify for Your Needs:**
   - Replace mock data with real APIs
   - Add more trading pairs
   - Customize styling with Tailwind
   - Add real payment provider (Stripe, PayPal)

## Production Deployment

See the main README.md for Azure deployment instructions.

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for development guidelines
- Check component files for inline documentation

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Database setup
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Populate test data
npm run prisma:studio      # Open Prisma Studio (visual DB editor)

# Development
npm run dev                # Start both servers
npm run dev:backend        # Start just backend
npm run dev:frontend       # Start just frontend

# Building
npm run build              # Build both
npm run build --workspace=backend
npm run build --workspace=frontend

# API Health Check
curl http://localhost:5000/api/health
```

---

**Happy trading! 🚀**
