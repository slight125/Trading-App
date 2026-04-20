# Trading App - Project Structure

```
trading-app/
│
├── 📄 README.md                          # Main project documentation
├── 📄 SETUP.md                           # Quick start guide
├── 📄 FILE_REFERENCE.md                  # Detailed file breakdown
├── 📄 IMPLEMENTATION_SUMMARY.md           # Overview of features
├── 📄 COMPLETION_CHECKLIST.md            # This checklist
├── 📄 PROJECT_STRUCTURE.md               # This file
│
├── 📄 package.json                       # Monorepo root config
├── 📄 .env.example                       # Environment template
├── 📄 .gitignore                         # Git ignore patterns
├── 📄 .prettierrc                        # Code formatting rules
│
├── 📁 .github/
│   └── 📄 copilot-instructions.md        # Development guidelines
│
├── 📁 backend/                           # Node.js Express Server
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 .env.example                   # Env template
│   ├── 📄 .env                           # Development env
│   │
│   ├── 📁 src/
│   │   ├── 📄 index.ts                   # Express server entry point
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── 📄 jwt.ts                 # JWT token generation & verification
│   │   │
│   │   ├── 📁 middleware/
│   │   │   └── 📄 auth.ts                # Authentication middleware
│   │   │
│   │   └── 📁 routes/
│   │       ├── 📄 auth.ts                # Authentication endpoints
│   │       │                             #  - register, login, logout, profile
│   │       ├── 📄 payments.ts            # Payment endpoints
│   │       │                             #  - create, confirm, get payments
│   │       └── 📄 trading.ts             # Trading endpoints
│   │                                     #  - create link, get links
│   │                                     #  - validate-link (TRANSACTION)
│   │
│   └── 📁 prisma/
│       ├── 📄 schema.prisma              # Database schema
│       │                                 #  - User, Payment, TradingLink
│       └── 📄 seed.ts                    # Test data seeding
│
├── 📁 frontend/                          # React + Vite Application
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 tsconfig.node.json             # Config file types
│   ├── 📄 vite.config.ts                 # Vite bundler config
│   ├── 📄 tailwind.config.js             # Tailwind CSS config
│   ├── 📄 postcss.config.js              # PostCSS config
│   ├── 📄 .eslintrc.json                 # ESLint config
│   ├── 📄 index.html                     # HTML entry point
│   ├── 📄 .env.example                   # Env template
│   ├── 📄 .env.local                     # Development env
│   │
│   └── 📁 src/
│       ├── 📄 main.tsx                   # React app mount point
│       ├── 📄 App.tsx                    # Main app component & routing
│       ├── 📄 index.css                  # Global styles
│       │
│       ├── 📁 api/
│       │   └── 📄 client.ts              # HTTP client setup
│       │                                 #  - authAPI, paymentAPI, tradingAPI
│       │
│       ├── 📁 context/
│       │   └── 📄 AuthContext.tsx        # Auth state management
│       │                                 #  - AuthProvider, useAuth hook
│       │
│       ├── 📁 components/
│       │   ├── 📄 Layout.tsx             # Navigation & layout wrapper
│       │   └── 📄 TradingDashboard.tsx   # Trading interface component
│       │                                 #  - Chart, ticker, orders, book
│       │
│       ├── 📁 pages/
│       │   ├── 📄 LoginPage.tsx          # Login route
│       │   ├── 📄 RegisterPage.tsx       # Registration route
│       │   ├── 📄 DashboardPage.tsx      # Dashboard route
│       │   └── 📄 TradingPage.tsx        # Trading terminal route
│       │
│       ├── 📁 types/
│       │   └── 📄 index.ts               # TypeScript interfaces
│       │                                 #  - User, Order, Ticker, Chart
│       │
│       └── 📁 constants/
│           └── 📄 mockData.ts            # Mock trading data
│                                         #  - Tickers, charts, orders
```

---

## Component Dependency Graph

```
App.tsx (Router)
│
├── AuthProvider (Context)
│   └── AuthContext.tsx
│
├── Layout
│   ├── Navigation
│   └── Children:
│       ├── LoginPage
│       ├── RegisterPage
│       └── DashboardPage
│           ├── useAuth
│           ├── paymentAPI
│           └── tradingAPI
│
└── TradingPage (/trade/:token)
    └── TradingDashboard
        ├── Recharts (Chart)
        ├── Framer Motion (Animations)
        ├── Mock Data (Prices, Orders)
        └── State (Orders, Ticker)
```

---

## API Route Structure

```
express app
├── /api/health (GET)
│   └── Health check endpoint
│
├── /api/auth
│   ├── POST /register          → authAPI.register()
│   ├── POST /login             → authAPI.login()
│   ├── POST /logout            → authAPI.logout()
│   └── GET /me                 → authAPI.getProfile()
│
├── /api/payments
│   ├── POST /create            → paymentAPI.createPayment()
│   ├── POST /:id/confirm       → paymentAPI.confirmPayment()
│   └── GET /                   → paymentAPI.getPayments()
│
└── /api/trading
    ├── POST /create-link       → tradingAPI.createLink()
    ├── GET /links              → tradingAPI.getLinks()
    └── GET /validate-link/:token → tradingAPI.validateLink()
        ↓
        [ATOMIC TRANSACTION]
        1. Check token exists
        2. Check not used
        3. Check not expired
        4. Mark as used (atomic)
        5. Generate session JWT
        ↓
        Returns sessionToken in HttpOnly cookie
```

---

## Data Flow Diagram

### User Registration & Payment Flow
```
User
  ↓
Register Page
  ↓ submitForm
API: POST /api/auth/register
  ↓
Backend: Hash password, Create user
  ↓
Database: INSERT User
  ↓ setUser (AuthContext)
Dashboard
  ↓
Make Payment Button
  ↓ onClick
API: POST /api/payments/create
  ↓
Backend: Create payment record
  ↓
API: POST /api/payments/:id/confirm
  ↓
Backend: Update status to "completed"
  ↓ Update UI
Trading Link Button Enabled
```

### One-Time Link Flow (CRITICAL)
```
Dashboard
  ↓
Create Trading Link Button
  ↓ onClick
API: POST /api/trading/create-link
  ↓
Backend: [TRANSACTION BEGIN]
  1. Verify payment completed
  2. Generate unique token
  3. Set expires 24hrs
  4. INSERT TradingLink
Backend: [TRANSACTION COMMIT]
  ↓
Return token + link URL
  ↓
Display link, User copies
  ↓
User clicks link in new tab
  ↓
/trade/:token route
  ↓
API: GET /api/trading/validate-link/:token
  ↓
Backend: [TRANSACTION BEGIN]
  1. SELECT TradingLink WHERE token=?
  2. CHECK isUsed = false
  3. CHECK expiredAt > NOW
  4. UPDATE isUsed = true [ATOMIC]
  5. Fetch user
Backend: [TRANSACTION COMMIT]
  ↓
Generate trading session JWT
  ↓
Set HttpOnly cookie: tradingSession
  ↓ Response with sessionToken
Frontend: Redirect to TradingDashboard
  ↓
TradingDashboard Component
  ├── Live prices (setInterval)
  ├── Chart (Recharts)
  ├── Order entry
  ├── Order execution
  └── Order history
```

---

## Database Schema Relationships

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password        │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         ├─────────────────────┬──────────────────────┐
         │                     │                      │
         ▼                     ▼                      ▼
    ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐
    │  Payment    │    │ TradingLink  │    │  (Other models)  │
    ├─────────────┤    ├──────────────┤    │                  │
    │ id (PK)     │    │ id (PK)      │    │ (Future)         │
    │ userId (FK) │    │ token (UNIQUE)│   │                  │
    │ status      │    │ userId (FK)  │    │                  │
    │ amount      │    │ isUsed       │    │                  │
    │ createdAt   │    │ expiresAt    │    │                  │
    │ updatedAt   │    │ createdAt    │    │                  │
    └─────────────┘    │ updatedAt    │    └──────────────────┘
                       └──────────────┘

FK: Foreign Key
PK: Primary Key
UNIQUE: Unique constraint
```

---

## File Size Estimates

| Category | Component | Size |
|----------|-----------|------|
| Backend | auth.ts (routes) | ~3.5 KB |
| Backend | trading.ts (critical) | ~5.2 KB |
| Backend | payments.ts | ~3.8 KB |
| Frontend | TradingDashboard.tsx | ~18 KB |
| Frontend | DashboardPage.tsx | ~12 KB |
| Frontend | App.tsx + routing | ~4 KB |
| Database | schema.prisma | ~2 KB |
| **Total** | **All source code** | **~150 KB** |

---

## Directory Tree (Text Format)

```
.
├── README.md
├── SETUP.md
├── FILE_REFERENCE.md
├── IMPLEMENTATION_SUMMARY.md
├── COMPLETION_CHECKLIST.md
├── PROJECT_STRUCTURE.md
├── package.json
├── .env.example
├── .gitignore
├── .prettierrc
├── .github/
│   └── copilot-instructions.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env
│   ├── src/
│   │   ├── index.ts
│   │   ├── utils/jwt.ts
│   │   ├── middleware/auth.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── payments.ts
│   │       └── trading.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .eslintrc.json
    ├── index.html
    ├── .env.example
    ├── .env.local
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/client.ts
        ├── context/AuthContext.tsx
        ├── components/
        │   ├── Layout.tsx
        │   └── TradingDashboard.tsx
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── DashboardPage.tsx
        │   └── TradingPage.tsx
        ├── types/index.ts
        └── constants/mockData.ts
```

---

## Hot Spots (Key Components)

### 🔴 CRITICAL (Complex Logic)
1. **`backend/src/routes/trading.ts`** - Atomic transaction for link validation
2. **`frontend/src/components/TradingDashboard.tsx`** - Trading interface (600+ LOC)
3. **`backend/src/utils/jwt.ts`** - Token generation logic

### 🟡 IMPORTANT (Business Logic)
1. **`backend/src/routes/auth.ts`** - Authentication flows
2. **`backend/src/routes/payments.ts`** - Payment processing
3. **`frontend/src/context/AuthContext.tsx`** - State management
4. **`frontend/src/pages/DashboardPage.tsx`** - Payment & link management

### 🟢 STANDARD (Standard Implementation)
1. **`frontend/src/pages/LoginPage.tsx`** - Login form
2. **`frontend/src/pages/RegisterPage.tsx`** - Registration form
3. **`frontend/src/components/Layout.tsx`** - Navigation layout
4. **`frontend/src/api/client.ts`** - HTTP client setup

---

## Build Output Structure (After `npm run build`)

```
backend/
├── dist/
│   ├── index.js
│   ├── utils/jwt.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── payments.js
│       └── trading.js
└── node_modules/

frontend/
├── dist/
│   ├── index.html
│   ├── assets/
│   │   ├── index-<hash>.js
│   │   └── index-<hash>.css
│   └── ...
└── node_modules/
```

---

## Development Workflow

```
┌─ DEVELOPMENT ────────────────────────────────────────┐
│                                                      │
│  npm install                                        │
│  npm run prisma:generate                            │
│  npm run prisma:migrate                             │
│  npm run dev                                        │
│  │                                                  │
│  ├─ Terminal 1: Backend (:5000)                    │
│  │  ├─ ts-node-dev watches src/                   │
│  │  ├─ Auto-reloads on changes                    │
│  │  └─ API ready at localhost:5000                │
│  │                                                  │
│  └─ Terminal 2: Frontend (:3000)                   │
│     ├─ Vite HMR watches src/                      │
│     ├─ Auto-reload browser on changes             │
│     └─ App ready at localhost:3000                │
│                                                      │
└──────────────────────────────────────────────────────┘

┌─ PRODUCTION ─────────────────────────────────────────┐
│                                                      │
│  npm run build                                      │
│  │                                                  │
│  ├─ backend/ → dist/ (JavaScript)                 │
│  │  └─ node dist/index.js                         │
│  │                                                  │
│  └─ frontend/ → dist/ (Static HTML/JS)            │
│     └─ Deploy to static hosting                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

**For more details, see:**
- README.md - Complete documentation
- SETUP.md - Quick start guide
- FILE_REFERENCE.md - Detailed file breakdown
- IMPLEMENTATION_SUMMARY.md - Feature overview
