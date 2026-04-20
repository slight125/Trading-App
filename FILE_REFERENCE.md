# Project File Reference

A complete guide to all important files in the Trading App project.

## Backend Files

### Configuration
- **`backend/package.json`** - Dependencies and scripts
- **`backend/tsconfig.json`** - TypeScript configuration
- **`backend/.env.example`** - Environment template
- **`backend/.env`** - Development environment (git ignored)

### Database
- **`backend/prisma/schema.prisma`** - Database models and relationships
- **`backend/prisma/seed.ts`** - Test data seeding script

### Source Code

#### Entry Point
- **`backend/src/index.ts`** - Express server setup, middleware, route imports

#### Utilities
- **`backend/src/utils/jwt.ts`** - JWT token generation and verification functions
  - `generateToken()` - Create JWT tokens for auth/trading sessions
  - `verifyToken()` - Decode and validate JWT tokens
  - `generateTradingLinkToken()` - Create unique one-time link tokens

#### Middleware
- **`backend/src/middleware/auth.ts`** - Authentication middleware
  - `authenticate` - Verify JWT and attach user to request
  - `requireTradingToken` - Check for trading session token

#### Routes

**Authentication Routes** - `backend/src/routes/auth.ts`
- `POST /api/auth/register` - User registration with password hashing
- `POST /api/auth/login` - User login with JWT cookie
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get authenticated user profile

**Payment Routes** - `backend/src/routes/payments.ts`
- `POST /api/payments/create` - Create new payment record
- `POST /api/payments/:id/confirm` - Mark payment as completed
- `GET /api/payments` - Fetch user's payments

**Trading Routes** - `backend/src/routes/trading.ts`
- `POST /api/trading/create-link` - Generate one-time trading link (requires completed payment)
- `GET /api/trading/links` - List user's trading links
- `GET /api/trading/validate-link/:token` - **CRITICAL** - Validate and consume link using atomic transaction

## Frontend Files

### Configuration
- **`frontend/package.json`** - Dependencies and scripts
- **`frontend/tsconfig.json`** - TypeScript configuration
- **`frontend/tsconfig.node.json`** - TypeScript for config files
- **`frontend/vite.config.ts`** - Vite bundler configuration with proxy
- **`frontend/tailwind.config.js`** - Tailwind CSS customization
- **`frontend/postcss.config.js`** - PostCSS configuration for Tailwind
- **`frontend/.env.example`** - Environment template
- **`frontend/.env.local`** - Development environment (git ignored)
- **`frontend/index.html`** - HTML entry point
- **`frontend/.eslintrc.json`** - ESLint configuration

### Source Code

#### Entry Points
- **`frontend/src/main.tsx`** - React app mount and ReactDOM render
- **`frontend/src/App.tsx`** - Main app component with routing
- **`frontend/src/index.css`** - Global styles and Tailwind imports

#### API Layer
- **`frontend/src/api/client.ts`** - Axios HTTP client with endpoints
  - `authAPI` - User authentication calls
  - `paymentAPI` - Payment management calls
  - `tradingAPI` - Trading link and validation calls

#### Context (State Management)
- **`frontend/src/context/AuthContext.tsx`** - Global authentication state
  - `AuthProvider` - Context provider wrapper
  - `useAuth()` - Hook to access auth state and methods

#### Components

**Layout** - `frontend/src/components/Layout.tsx`
- Navigation bar with logo and user menu
- Responsive design for all screen sizes
- Footer with copyright

**Trading Dashboard** - `frontend/src/components/TradingDashboard.tsx`
- Live price ticker with 24h change
- Interactive Recharts price chart
- Order entry panel (Buy/Sell, Market/Limit)
- Order book with bids/asks
- Recent executed trades
- Real-time price updates via setInterval
- Framer Motion animations
- Live order confirmation feedback

#### Pages (Routes)

**Login Page** - `frontend/src/pages/LoginPage.tsx`
- Email and password input
- Error handling and display
- Link to registration
- Redirects to dashboard on success

**Register Page** - `frontend/src/pages/RegisterPage.tsx`
- Email, password, confirm password inputs
- Password validation (min 8 chars)
- Error handling
- Link to login page
- Creates account and auto-logs in

**Dashboard Page** - `frontend/src/pages/DashboardPage.tsx`
- Payment summary and status display
- "Make Payment" button (creates and confirms payment)
- Trading links section
- "Create Link" button (requires completed payment)
- Copy-to-clipboard for link URLs
- List of user's trading links with status

**Trading Page** - `frontend/src/pages/TradingPage.tsx`
- Validates token from URL parameter
- Calls `/api/trading/validate-link/:token`
- Shows loading state while validating
- Shows error if link invalid/used/expired
- Renders TradingDashboard on success

#### Types
- **`frontend/src/types/index.ts`** - TypeScript interfaces
  - `User` - User data structure
  - `TradingSession` - Session information
  - `Order` - Order structure
  - `Ticker` - Price ticker data
  - `ChartDataPoint` - Chart data structure
  - `OrderBook` - Bid/ask levels
  - `RecentTrade` - Trade execution data

#### Constants
- **`frontend/src/constants/mockData.ts`** - Mock trading data for development
  - `MOCK_TICKERS` - BTC, ETH, AAPL, MSFT price data
  - `MOCK_CHART_DATA` - Historical price points
  - `MOCK_ORDER_BOOK` - Bid/ask data
  - `MOCK_RECENT_TRADES` - Recent transactions

## Root Files

### Configuration
- **`package.json`** - Monorepo configuration with workspaces
- **`tsconfig.json`** - Root TypeScript settings (unused, each workspace has own)
- **`.gitignore`** - Git ignore patterns (node_modules, build, env files)
- **`.prettierrc`** - Code formatting rules
- **`.env.example`** - Example environment variables

### Documentation
- **`README.md`** - Complete project documentation
- **`SETUP.md`** - Quick start guide (THIS FILE)
- **`.github/copilot-instructions.md`** - Development guidelines

## Key Algorithms & Implementations

### One-Time Link Validation (CRITICAL)
**Location:** `backend/src/routes/trading.ts` - `/api/trading/validate-link/:token`

```typescript
// Uses Prisma $transaction for atomicity:
1. Check if link exists
2. Check if link is not used (isUsed = false)
3. Check if link not expired
4. Atomically UPDATE isUsed to true
5. Generate trading session JWT
6. Return session via HttpOnly cookie
```

**Why transactions matter:** Prevents race conditions where:
- User clicks link twice concurrently → should only succeed once
- User clicks link → another system attempts duplicate click
- Ensures link consumption is atomic and guaranteed

### Authentication Flow

1. **Register/Login:**
   - User submits email/password
   - Password hashed with bcryptjs
   - User stored/retrieved from database
   - JWT token generated and stored in HttpOnly cookie

2. **Protected Requests:**
   - Middleware extracts JWT from cookie or Authorization header
   - Token verified with secret
   - User ID attached to request object
   - Request proceeds if valid, returns 401 if not

3. **Trading Session:**
   - User validates one-time link (different from auth JWT)
   - Receives trading session JWT (type: "trading")
   - Session valid for 4 hours
   - Persists across page refreshes via HttpOnly cookie

### Price Update Simulation

**Location:** `frontend/src/components/TradingDashboard.tsx`

```typescript
// Every 2 seconds:
1. Generate random price change (-0.5 to +0.5) * 100
2. Calculate new price
3. Update ticker with change percentage
4. Add new data point to chart
5. Trigger Recharts re-render
```

## Database Relationships

```
User (1) ──→ (Many) Payment
User (1) ──→ (Many) TradingLink

Payment.userId → User.id
TradingLink.userId → User.id
```

On user delete: All payments and trading links cascade deleted.

## API Authentication Flow

```
┌─────────────────────────────────────────────┐
│ Public Routes (no auth needed)              │
├─────────────────────────────────────────────┤
│ POST   /api/auth/register                   │
│ POST   /api/auth/login                      │
│ GET    /api/trading/validate-link/:token    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Protected Routes (JWT required)             │
├─────────────────────────────────────────────┤
│ GET    /api/auth/me (Auth JWT)              │
│ POST   /api/auth/logout (Auth JWT)          │
│ POST   /api/payments/create (Auth JWT)      │
│ POST   /api/payments/:id/confirm (Auth JWT) │
│ GET    /api/payments (Auth JWT)             │
│ POST   /api/trading/create-link (Auth JWT)  │
│ GET    /api/trading/links (Auth JWT)        │
└─────────────────────────────────────────────┘
```

JWT extracted from:
1. HttpOnly `sessionToken` cookie (preferred)
2. Authorization header: `Bearer <token>`

## Development Tips

### Hot Reload
- Backend: ts-node-dev watches files automatically
- Frontend: Vite HMR updates code instantly

### Debugging
- Backend: Add `console.log()` statements, visible in terminal
- Frontend: Use browser DevTools (F12)
- Database: Use `npm run prisma:studio` for visual editor

### Adding New Features
1. **Add database field:** Update `prisma/schema.prisma` → Run `npm run prisma:migrate`
2. **Add API endpoint:** Create route file in `backend/src/routes/`
3. **Add frontend page:** Create component in `frontend/src/pages/`
4. **Add route:** Update `frontend/src/App.tsx` with new Route

### Code Organization
- **Monorepo:** Backend and frontend are separate npm workspaces
- **Shared:** `frontend/src/types/` has shared TypeScript types (document API contracts)
- **Isolation:** Backend doesn't depend on frontend, frontend imports from backend via HTTP

---

For more details, see:
- **Backend specifics:** `backend/README.md` (if exists) or `backend/src/` files
- **Frontend specifics:** `frontend/` directory structure
- **Database schema:** `backend/prisma/schema.prisma`
- **API documentation:** See endpoint descriptions in main README.md
