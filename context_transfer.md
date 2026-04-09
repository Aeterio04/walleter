# Walleter — Context Transfer

> **Student-oriented editorial finance dashboard** built with React + TypeScript + Tailwind CSS v3 + Vite.
> Brutalist design inspired by Bloomberg Businessweek, Teenage Engineering, and editorial fintech.

---

## Project Location

```
c:\projects\django\walleter
```

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS v3 + React Router v6

**Run:** `npm run dev` → `http://localhost:5173`  
**Build:** `npm run build`

---

## Architecture

```
src/
├── context/
│   └── AppContext.tsx         ← Global state (user, transactions, budgets, investments)
├── layouts/
│   └── DashboardLayout.tsx    ← Sidebar nav + outlet wrapper
├── pages/
│   ├── Landing.tsx            ← Public landing with login + pricing
│   ├── Signup.tsx             ← Registration page
│   ├── Dashboard.tsx          ← Overview: balance, ledger, charts
│   ├── Expenses.tsx           ← Full CRUD transaction ledger (credit/debit)
│   ├── Insights.tsx           ← AI-generated editorial spending insights
│   ├── Budget.tsx             ← CRUD budget categories with progress bars
│   ├── Investments.tsx        ← CRUD investment tracker + emergency fund
│   └── Settings.tsx           ← Profile, subscription toggle, notifications
├── App.tsx                    ← Router config
├── main.tsx                   ← Entry point with BrowserRouter + AppProvider
└── index.css                  ← Design system (tokens, animations, utilities)
```

---

## Global State (`AppContext.tsx`)

All app data lives in a single React Context. No backend wired yet — everything is client-side state.

### Data Models

| Model | Key Fields | CRUD |
|---|---|---|
| `UserProfile` | name, email, plan (`FREE`/`PRO`), isLoggedIn | login, signup, logout, togglePlan |
| `Transaction` | id, date, description, amount, category, type (`credit`/`debit`) | add, update, delete |
| `BudgetCategory` | id, name, icon, limit, spent (derived), locked | add, update, delete |
| `Investment` | id, name, type, value, notes, dateAdded | add, update, delete |

### Derived Values

- `totalCredit`, `totalDebit`, `balance` — computed from transactions
- `totalInvested` — sum of all investment values
- `categorySpending` — spending per category (from debit transactions)
- Budget `spent` fields — auto-synced from `categorySpending`

### Expense Categories

`Food` · `Transport` · `Stationery` · `Entertainment` · `Subscriptions` · `Investment`

### Investment Types

`Mutual Fund` · `Stocks` · `Gold` · `FD` · `Crypto` · `PPF` · `Other`

### Currency

**₹ (INR)** everywhere. Student-scale amounts: ₹50–₹5,000 typical range.

Helper functions: `formatINR(val)` and `formatINRSigned(val)` for display.

---

## Routes

| Path | Page | Layout |
|---|---|---|
| `/` | Landing (login + pricing) | Standalone |
| `/signup` | Signup form | Standalone |
| `/dashboard` | Dashboard overview | DashboardLayout (sidebar) |
| `/expenses` | Transaction CRUD ledger | DashboardLayout |
| `/insights` | AI editorial insights | DashboardLayout |
| `/budget` | Budget category CRUD | DashboardLayout |
| `/investments` | Investment CRUD + metrics | DashboardLayout |
| `/settings` | Profile, plan toggle, notifications | DashboardLayout |

---

## Page Details

### Landing (`/`)
- Neon green wipe-in loading animation (1.8s)
- Market ticker (NIFTY, SENSEX, Gold in INR)
- Split layout: 40% manifesto / 60% interactive sparkline + login + pricing
- Hero: **"WEALTH, ARCHITECTED."** — full word highlighted in `#CCFF00`
- Login form → sets user in context → navigates to `/dashboard`
- Pricing: ₹0 (Observer) / ₹149 (Architect)
- Link to `/signup`

### Signup (`/signup`)
- Split layout with background watermark
- Fields: Name, Email, Password, Confirm
- Validation: required fields, min 6 chars, password match
- Sets user in context → navigates to `/dashboard`

### Dashboard (`/dashboard`)
- **Reads from context** — balance, transactions, budgets, investments
- Anomaly banner (shows when any budget category > 80% used)
- Balance block with total in/out/invested
- Recent ledger (first 12 transactions from context)
- Cash flow chart (SVG polyline)
- Quick action buttons → navigate to other pages
- Category breakdown bars (auto-calculated from transactions)
- Investment widget → links to `/investments`

### Expenses (`/expenses`)
- **Full CRUD** for transactions
- **Add:** Top form with date, description, amount, category dropdown, credit/debit toggle
- **Edit:** Click ✎ on any row → inline edit mode with all fields
- **Delete:** Click ✕ on hover
- **Filters:** By type (All/Credit/Debit) and by category
- Shows totals: Total In, Total Out, Balance
- Dashboard reads from this same data

### AI Insights (`/insights`)
- 3 insight articles generated from **real context data**
  - Top spending category analysis
  - Subscription audit
  - Overall savings rate
- Tabbed article selector
- Redaction-block loading animation
- **Functional buttons:**
  - Budget/Expenses/Investments → navigate to those pages
  - Dismiss → removes article from view
  - "Restore All" button when all dismissed
- Confirmation modal for destructive actions
- Pull-quote blocks with dynamic stats

### Budget (`/budget`)
- **Full CRUD** for budget categories
- **Add:** "Add Category" button → inline form (category dropdown, icon, limit)
- **Edit:** Click the limit value → inline number input, Enter to save
- **Delete:** ✕ button appears on hover
- **Lock toggle:** Square checkbox with X mark
- Progress bars: green (OK), neon (warning >80%), red (breach >100%)
- Bottom summary bar showing remaining per category

### Investments (`/investments`)
- **Full CRUD** for investments
- **Add:** Form with name, type dropdown, value, notes
- **Edit:** Click ✎ → full inline edit form
- **Delete:** Click ✕ on hover
- 50/50 split: left = portfolio list, right = metrics
- Allocation breakdown bars (grouped by type)
- Editable emergency fund with progress bar
- Student investing tips section
- Hover effect: grays out non-hovered items

### Settings (`/settings`)
- Centered 640px column
- Profile fields (name, email)
- **Subscription toggle:** Click to switch between FREE ↔ PRO (display only, ready for backend)
- Notification toggles (brutalist square switches)
- Data export format selector (CSV/JSON/PDF)
- Logout button → clears context, navigates to `/`
- Danger zone: "WIPE ACCOUNT" with confirmation step

---

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#CCFF00` | CTAs, key data, charts (neon green) |
| `--color-background` | `#09090B` | Page background (deep charcoal) |
| `--color-surface` | `#18181B` | Cards, hover states |
| `--color-text` | `#F4F4F5` | Primary text (off-white) |
| `--color-muted` | `#71717A` | Secondary labels, borders |
| `--color-danger` | `#FA114F` | Negative values, alerts (neon pink) |

### Fonts (Google Fonts, loaded in index.html + index.css)
- **Archivo Black** — Display headings (uppercase, tight tracking)
- **League Spartan** — Subheadings, buttons (700 weight, uppercase)
- **Space Grotesk** — Body text, labels (400/500)

### Key Design Rules
- **0px border radius** everywhere
- **1px solid borders** with `muted/30` opacity
- **Hover = instant color swap** (no transitions on buttons)
- **Uppercase** small labels with `tracking-[0.1em]` to `tracking-[0.2em]`
- **Tabular nums** via `.mono-number` class

### CSS Animations (defined in `index.css`)
- `animate-wipe` — Left-to-right clip-path reveal (landing loader)
- `animate-fade-in-up` — Opacity + translateY entrance
- `animate-ticker` — Continuous horizontal scroll (market ticker)
- `animate-blink` — Opacity pulse (loading / syncing states)
- `animate-fill-bar` — Width animation for progress bars
- `.stagger-1` through `.stagger-6` — Delay classes
- `.btn-brutal` — Instant hover swap (no transition)
- `.btn-primary` — Neon green button with instant hover
- `.ledger-row:hover` — Surface background on table rows
- `.asset-group:hover .asset-item:not(:hover)` — Fades non-hovered items
- `.error-flash` — Red border flash animation
- `.redaction-block` — Blinking gray placeholder blocks

---

## Seed Data

Pre-loaded in `AppContext.tsx` for demo purposes:

- **15 transactions** — student expenses (canteen lunch ₹80, bus pass ₹250, notebooks ₹180, etc.) and income (pocket money ₹3,000, freelance gig ₹2,000, scholarship ₹5,000)
- **6 budget categories** — Food ₹3,000, Transport ₹1,500, Stationery ₹800, Entertainment ₹1,000, Subscriptions ₹500 (locked), Investment ₹1,000
- **4 investments** — SBI Bluechip Fund ₹5,000, Digital Gold ₹2,000, Zerodha Stocks ₹3,500, Post Office FD ₹10,000
- **Emergency fund** — ₹3,000 / ₹15,000 target

---

## ⚠️ UNBREAKABLE RULES

### Design Preservation — ABSOLUTE PRIORITY

**THE FRONT-END DESIGN IS SACRED AND MUST NEVER BE TOUCHED.**

- **Design concepts** (brutalist aesthetic, Bloomberg/Teenage Engineering inspiration, editorial layout) are **FROZEN**
- **Visual elements** (colors, fonts, spacing, borders, animations) are **LOCKED**
- **Layout structure** (split screens, grid systems, component positioning) is **IMMUTABLE**
- **Content** can and will change (text, data, dynamic values) — that's expected and required
- **Functionality** can be enhanced (making things responsive, adding backend integration) — but visual design stays identical

**What you CAN change:**
- Dynamic content (transaction data, user info, API responses)
- Responsive behavior (making layouts adapt to screen sizes without changing the design language)
- Backend integration (wiring up APIs, auth, persistence)
- State management improvements

**What you CANNOT change:**
- Color palette (`#CCFF00`, `#09090B`, `#18181B`, etc.)
- Typography (Archivo Black, League Spartan, Space Grotesk)
- Border radius (0px everywhere)
- Animation styles (wipe, fade-in-up, ticker, etc.)
- Button styles (brutal instant hover, no transitions)
- Layout proportions (40/60 splits, card arrangements, etc.)
- Any visual design element whatsoever

**Violation of this rule is grounds for immediate termination of the entire project.**

---

## What's Left / Next Steps

- **Build verification** — TypeScript check + production build
- **Backend wiring** — Auth, data persistence, subscription payments
- **Subscription gating** — PRO features behind plan check (currently just a toggle)
- **Data persistence** — Currently in-memory React state; needs localStorage or backend DB
