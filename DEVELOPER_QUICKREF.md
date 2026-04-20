# Developer Quick Reference Card

## 🚀 Quick Start (Copy-Paste Ready)

```bash
# 1. Install all dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Run database migrations
npm run prisma:migrate

# 4. Seed test data
npm run prisma:seed

# 5. Start development servers
npm run dev

# Then open:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - Health: curl http://localhost:5000/api/health
```

---

## 📁 Quick File Locations

| Need | File | Path |
|------|------|------|
| Add API route | Route file | `backend/src/routes/` |
| Add page | Page component | `frontend/src/pages/` |
| Modify database | Schema | `backend/prisma/schema.prisma` |
| Add frontend component | Component | `frontend/src/components/` |
| Change styling | Tailwind | `frontend/tailwind.config.js` |
| API endpoints | Client | `frontend/src/api/client.ts` |
| Auth logic | Routes | `backend/src/routes/auth.ts` |
| Auth state | Context | `frontend/src/context/AuthContext.tsx` |
| Environment vars | Backend .env | `backend/.env` |
| Environment vars | Frontend .env | `frontend/.env.local` |

---

## 🔗 Key API Endpoints

```
POST   /api/auth/register        # Create account
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Get profile

POST   /api/payments/create      # Create payment
POST   /api/payments/:id/confirm # Confirm payment
GET    /api/payments             # Get payments

POST   /api/trading/create-link  # Create link
GET    /api/trading/links        # Get links
GET    /api/trading/validate-link/:token # Validate & consume link
```

---

## 📦 NPM Scripts Quick Reference

```bash
# Development
npm run dev                      # Start both servers
npm run dev:backend             # Start backend only (:5000)
npm run dev:frontend            # Start frontend only (:3000)

# Database
npm run prisma:generate         # Generate Prisma client
npm run prisma:migrate          # Run migrations
npm run prisma:seed             # Seed test data
npm run prisma:studio           # Visual DB editor

# Production
npm run build                   # Build both
npm run build --workspace=backend
npm run build --workspace=frontend
npm start                       # Run built backend
```

---

## 🔐 Authentication Flow

```
1. User registers
   ↓
2. Password hashed (bcryptjs)
   ↓
3. User created in DB
   ↓
4. JWT generated
   ↓
5. JWT stored in HttpOnly cookie
   ↓
6. Auto-login to dashboard
```

---

## 💳 Payment & Trading Link Flow

```
1. User completes payment
   ↓
2. Payment status = "completed"
   ↓
3. User clicks "Create Trading Link"
   ↓
4. Unique token generated
   ↓
5. Link expires in 24 hours
   ↓
6. User shares link with trader
   ↓
7. Trader clicks link: /trade/:token
   ↓
8. Backend validates token [ATOMIC TRANSACTION]
   ↓
9. Link marked as used (one-time only)
   ↓
10. Trading session JWT issued
   ↓
11. TradingDashboard loads
```

---

## 🎨 Styling Quick Reference

```css
/* Tailwind Classes Used Throughout */
bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
bg-slate-800/50 backdrop-blur-md
border border-purple-500/30
hover:from-purple-700 hover:to-pink-700
text-purple-400 text-green-400 text-red-400
px-4 py-2 rounded-lg
transition duration-200
disabled:opacity-50
```

---

## 🔧 Common Tasks

### Add a new trading symbol to the dashboard

**File:** `frontend/src/constants/mockData.ts`

```typescript
export const MOCK_TICKERS: Record<string, Ticker> = {
  // ... existing
  XRP: {
    symbol: "XRP/USD",
    price: 2.50,
    change: 0.10,
    changePercent: 4.17,
    high: 2.60,
    low: 2.40,
    volume: 5000000,
  },
};
```

### Add a new API endpoint

**File:** `backend/src/routes/newFeature.ts`

```typescript
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/endpoint", authenticate, async (req: Request, res: Response) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
```

Then import in `backend/src/index.ts`:
```typescript
import newFeatureRoutes from "./routes/newFeature";
app.use("/api/newfeature", newFeatureRoutes);
```

### Add a new database model

**File:** `backend/prisma/schema.prisma`

```prisma
model NewModel {
  id        String     @id @default(cuid())
  name      String
  userId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Then run: `npm run prisma:migrate`

---

## 🐛 Debugging Tips

### Backend
```bash
# View logs
npm run dev:backend
# You'll see all console.log and errors

# Check API
curl http://localhost:5000/api/health

# Visual DB editor
npm run prisma:studio
```

### Frontend
```bash
# Open browser DevTools (F12)
# - Console tab for errors
# - Network tab for API calls
# - React DevTools extension for component state

# Check if backend is reachable
curl http://localhost:5000/api/health
```

### Database
```bash
# Check database
npm run prisma:studio

# Manual SQL
psql -U postgres -d trading_app
# Then SQL queries like: SELECT * FROM "User";
```

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Port 3000 already in use" | `lsof -i :3000` then `kill -9 <PID>` |
| "Cannot connect to database" | Check DATABASE_URL in backend/.env |
| "Frontend shows 401" | Clear cookies, refresh, login again |
| "Link validation fails" | Link may be expired or already used |
| "HMR not working" | Restart dev server |
| "TypeScript errors" | Run `npm run prisma:generate` |

---

## 📊 Performance Notes

### Frontend
- Recharts updates every data point change (consider memoization)
- Price ticker updates every 2 seconds (customizable in TradingDashboard.tsx)
- Framer Motion animations are GPU-accelerated

### Backend
- Transactions prevent race conditions
- Indexes on `token` and `userId` for fast queries
- HttpOnly cookies avoid XSS attacks

### Database
- Three models with proper relationships
- Cascade deletes for data integrity
- Connection pool managed by Prisma

---

## 🔐 Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT signed with secret key
- [x] HttpOnly cookies (no JavaScript access)
- [x] CORS allows only frontend origin
- [x] Atomic transactions prevent double-spending
- [x] Input validation on all endpoints
- [ ] HTTPS enabled (production only)
- [ ] Rate limiting (future)
- [ ] 2FA (future)

---

## 📚 Documentation Files

```
README.md                    ← Start here for overview
SETUP.md                     ← Quick start guide
FILE_REFERENCE.md            ← Detailed file breakdown
PROJECT_STRUCTURE.md         ← Visual structure
IMPLEMENTATION_SUMMARY.md    ← Feature overview
COMPLETION_CHECKLIST.md      ← What's been built
DEVELOPER_QUICKREF.md        ← This file
```

---

## 🎯 Next Steps

### For Testing
```bash
1. npm install
2. npm run dev
3. Register at http://localhost:3000/register
4. Pay at dashboard
5. Create link
6. Click link in new tab
7. Trade!
```

### For Production
```bash
1. Update backend/.env with real database
2. Change JWT_SECRET to random 64-char string
3. Set NODE_ENV=production
4. npm run build
5. Deploy to Azure
6. Setup monitoring
```

### For Extension
```bash
1. Add more symbols to mockData.ts
2. Replace mock prices with real API
3. Add WebSocket for live updates
4. Integrate payment provider
5. Add more order types
6. Build portfolio tracking
```

---

## 💡 Pro Tips

1. **TypeScript**: Full type coverage means fewer runtime errors
2. **React Context**: Authentication state syncs across all components
3. **Prisma Studio**: `npm run prisma:studio` for visual DB editing
4. **Hot Reload**: Changes reflect instantly during development
5. **Transactions**: Critical for financial operations, prevents race conditions
6. **HttpOnly Cookies**: Secure session storage, automatic with requests
7. **Atomic Operations**: All-or-nothing guarantees data consistency

---

## 📞 Quick Help

**Can't start the app?**
→ Follow SETUP.md step-by-step

**Where's the trading dashboard?**
→ After validation: `frontend/src/components/TradingDashboard.tsx`

**How does link validation work?**
→ See: `backend/src/routes/trading.ts` (atomic transaction logic)

**How to add a new symbol?**
→ Edit: `frontend/src/constants/mockData.ts`

**How to change styling?**
→ Edit: Tailwind classes in components or `frontend/tailwind.config.js`

**How to test the full flow?**
→ See: SETUP.md → "Test the Complete Flow"

---

## ✨ You're Ready!

Everything is set up and ready to go. Start with:

```bash
npm install && npm run dev
```

Happy coding! 🚀
