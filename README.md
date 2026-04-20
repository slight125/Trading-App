# Gated Trading Web Application

A full-stack, gated trading platform with secure one-time link access, built with React, TypeScript, Express, PostgreSQL, and Prisma.

## Overview

Users register, pay, and receive a unique, single-use link. Clicking this link routes them to a protected trading dashboard. Once clicked, the link is immediately invalidated using atomic database transactions. The user then exchanges the link for a secure trading session JWT (valid for 4 hours), allowing uninterrupted trading even on page refresh.

## Project Structure

```
trading-app/
├── backend/              # Node.js + Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma # Database models
│   │   └── seed.ts       # Test data
│   ├── src/
│   │   ├── utils/        # JWT, token generation
│   │   ├── middleware/   # Authentication
│   │   ├── routes/       # API endpoints
│   │   └── index.ts      # Express server
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/          # HTTP client
│   │   ├── components/   # React components
│   │   ├── pages/        # Route pages
│   │   ├── context/      # Auth state
│   │   ├── types/        # TypeScript types
│   │   ├── constants/    # Mock data
│   │   ├── App.tsx       # Main app
│   │   └── main.tsx      # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── .github/
│   └── copilot-instructions.md
├── package.json          # Monorepo config
├── .env.example
├── .gitignore
├── .prettierrc
└── README.md
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern styling
- **Framer Motion** for smooth animations
- **Recharts** for interactive charts
- **Axios** for HTTP requests
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** for data persistence
- **JWT (jsonwebtoken)** for authentication
- **bcryptjs** for password hashing
- **Cookie Parser** for session management

### Database
- **PostgreSQL 12+**
- **Prisma Migrations** for schema versioning

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+

### Installation

1. **Clone & install dependencies:**
   ```bash
   cd trading-app
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   # Update backend/.env with your database URL and JWT secret
   
   # Frontend environment
   cp frontend/.env.example frontend/.env.local
   # Update VITE_API_URL if backend is not on localhost:5000
   ```

3. **Setup database:**
   ```bash
   npm run prisma:generate   # Generate Prisma client
   npm run prisma:migrate    # Run migrations
   npm run prisma:seed       # Populate with test data
   ```

4. **Start development servers:**
   ```bash
   npm run dev               # Runs both backend and frontend
   # OR separately:
   npm run dev:backend       # Terminal 1 - Backend on :5000
   npm run dev:frontend      # Terminal 2 - Frontend on :3000
   ```

5. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Health check: http://localhost:5000/api/health

## Database Models

### User
```typescript
{
  id: string (cuid)
  email: string (unique)
  password: string (hashed)
  createdAt: DateTime
  updatedAt: DateTime
  
  relations: Payment[], TradingLink[]
}
```

### Payment
```typescript
{
  id: string (cuid)
  userId: string (foreign key)
  status: "pending" | "completed" | "failed"
  amount: number
  createdAt: DateTime
  updatedAt: DateTime
  
  relations: User
}
```

### TradingLink
```typescript
{
  id: string (cuid)
  token: string (unique)
  userId: string (foreign key)
  isUsed: boolean (default: false)
  expiresAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  
  relations: User
}
```

## API Endpoints

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/logout` | POST | ✅ | Logout user |
| `/api/auth/me` | GET | ✅ | Get current user profile |

### Payments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments/create` | POST | ✅ | Create payment |
| `/api/payments/:id/confirm` | POST | ✅ | Confirm payment |
| `/api/payments` | GET | ✅ | Get user payments |

### Trading Links
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/trading/create-link` | POST | ✅ | Create one-time link |
| `/api/trading/links` | GET | ✅ | Get user links |
| `/api/trading/validate-link/:token` | GET | ❌ | **Validate & consume link** |

**Critical:** The `/api/trading/validate-link/:token` endpoint uses a **Prisma transaction** to atomically:
1. Verify link exists and hasn't been used
2. Verify link hasn't expired
3. Mark link as `isUsed = true` (single atomic operation)
4. Generate trading session JWT
5. Return session token via HttpOnly cookie

This ensures one-time link consumption is guaranteed, even under concurrent requests.

## Frontend Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---|-------------|
| `/` | Redirect | - | Routes to login or dashboard |
| `/login` | LoginPage | ❌ | User login form |
| `/register` | RegisterPage | ❌ | User registration form |
| `/dashboard` | DashboardPage | ✅ | Payment & trading link management |
| `/trade/:token` | TradingPage → TradingDashboard | ❌* | Trading terminal (validates token) |

*Requires valid token passed via URL

## Key Features

### 🔐 Security
- Password hashing with bcryptjs
- JWT-based authentication
- HttpOnly cookies for session management
- CORS with credentials enabled
- Atomic database transactions for link validation
- One-time link consumption guaranteed

### 💳 Payment Flow
1. User registers/logs in
2. Makes payment (mock or real provider)
3. Payment confirmation creates trading link
4. Link shared with trader
5. Trader clicks link, token is validated & consumed
6. Trading session established (4-hour session)

### 📊 Trading Interface
- **Live Price Ticker:** Real-time price updates with 24h change
- **Interactive Chart:** Recharts with price history
- **Order Entry:** Market/Limit orders, Buy/Sell execution
- **Order Book:** Bid/Ask levels visualization
- **Recent Trades:** Live market transactions
- **Animations:** Framer Motion for smooth UX

### 🎨 UI/UX
- Dark-mode gradient design
- Responsive layout (mobile-friendly)
- Smooth transitions and animations
- Real-time data updates
- Copy-to-clipboard functionality
- Loading states and error handling

## Development Workflow

### Making Changes

1. **Backend changes:**
   ```bash
   # Changes are auto-reloaded with ts-node-dev
   ```

2. **Frontend changes:**
   ```bash
   # Changes are auto-reloaded with Vite
   ```

3. **Database changes:**
   ```bash
   # Create migration
   npm run prisma:migrate
   # Modify schema, run migrations automatically
   ```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or individually:
npm run build --workspace=backend
npm run build --workspace=frontend
```

## Testing the Flow

1. **Register:** http://localhost:3000/register
   - Create account with email/password

2. **Make Payment:** Go to dashboard
   - Click "Make Payment"
   - Confirms payment and unlocks link creation

3. **Create Trading Link:** Still on dashboard
   - Click "Create Trading Link"
   - Copy the generated link

4. **Access Trading Dashboard:**
   - Paste link in new tab: `http://localhost:3000/trade/link_xxx`
   - Link validates automatically
   - Trading session established
   - Access trading dashboard

5. **Trade:**
   - Select symbol (BTC, ETH, AAPL, MSFT)
   - Enter quantity & price
   - Execute Buy/Sell orders
   - See real-time price updates
   - View order book and recent trades

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/trading_app"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=14400
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
VITE_API_URL="http://localhost:5000"
```

## Production Deployment

### Azure Deployment

1. **Database:** Azure Database for PostgreSQL
   - Create instance
   - Update `DATABASE_URL` in App Service configuration

2. **Backend:** Azure App Service
   ```bash
   # Build and deploy
   npm run build --workspace=backend
   az webapp deployment source config-zip --src dist.zip
   ```

3. **Frontend:** Azure Static Web Apps
   ```bash
   # Build and deploy
   npm run build --workspace=frontend
   # Upload dist folder to Static Web Apps
   ```

4. **Environment:** Use Azure Key Vault
   - Store JWT_SECRET
   - Store database credentials
   - Reference in App Service

5. **Monitoring:** Enable Application Insights
   - Log API calls
   - Track errors
   - Monitor performance

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Run `npm run prisma:generate` and `npm run prisma:migrate`

### Frontend can't reach backend
- Check VITE_API_URL in `frontend/.env.local`
- Verify backend health: `curl http://localhost:5000/api/health`
- Check CORS in backend (should allow localhost:3000)

### Link validation fails
- Verify link hasn't been used before
- Check link hasn't expired (24 hours)
- Ensure token is valid format

### Page refresh loses trading session
- Session token stored in HttpOnly cookie
- Should persist across page refreshes
- Check browser cookie settings

## Performance Considerations

- **Price Updates:** Currently 2s interval (setInterval). Use WebSocket for production
- **Chart Data:** Stores last 11 data points. Use time-series database for production
- **API Calls:** Implement caching with React Query or SWR
- **Database:** Add indexes on `token` and `userId` (already present in schema)
- **Bundle Size:** Tree-shake unused dependencies in production build

## Future Enhancements

1. **Real Trading Data:** Integrate with trading APIs (Coinbase Pro, Binance)
2. **WebSocket:** Replace polling with real-time updates
3. **Payment Providers:** Stripe, PayPal, cryptocurrency payments
4. **Advanced Orders:** Stop-loss, take-profit, trailing stops
5. **Portfolio:** Track user holdings and P&L
6. **Charts:** Advanced charting with TradingView Lightweight Charts
7. **Two-Factor Auth:** Email/SMS/TOTP authentication
8. **Audit Logging:** Track all user actions
9. **Rate Limiting:** Protect API endpoints
10. **Mobile App:** React Native version

## Support

For issues or questions, refer to:
- `.github/copilot-instructions.md` - Development guidelines
- Individual component files - Inline documentation
- Error messages - Specific error codes and solutions

## License

MIT

# Trading-App
