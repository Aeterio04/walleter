import { createContext, useContext, useState, ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────

export type ExpenseCategory = 'Food' | 'Transport' | 'Stationery' | 'Entertainment' | 'Subscriptions' | 'Investment'
export type TransactionType = 'credit' | 'debit'

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: ExpenseCategory
  type: TransactionType
}

export interface BudgetCategory {
  id: string
  name: string
  icon: string
  limit: number
  spent: number
  locked: boolean
}

export interface Investment {
  id: string
  name: string
  type: string
  value: number
  notes: string
  dateAdded: string
}

export interface UserProfile {
  name: string
  email: string
  plan: 'FREE' | 'PRO'
  isLoggedIn: boolean
}

export const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'Food', label: 'FOOD', icon: '🍽' },
  { value: 'Transport', label: 'TRANSPORT', icon: '🚌' },
  { value: 'Stationery', label: 'STATIONERY', icon: '📝' },
  { value: 'Entertainment', label: 'ENTERTAINMENT', icon: '🎬' },
  { value: 'Subscriptions', label: 'SUBSCRIPTIONS', icon: '♾' },
  { value: 'Investment', label: 'INVESTMENT', icon: '📈' },
]

// ── Helpers ────────────────────────────────────────────

let _id = 100
function uid() { return String(++_id) }

export function formatINR(val: number): string {
  const abs = Math.abs(val)
  return (val < 0 ? '-' : '') + '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function formatINRSigned(val: number): string {
  const abs = Math.abs(val)
  const prefix = val < 0 ? '-' : '+'
  return prefix + '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ── Seed Data ──────────────────────────────────────────

const seedTransactions: Transaction[] = [
  { id: uid(), date: '2024-04-09', description: 'Canteen Lunch', amount: 80, category: 'Food', type: 'debit' },
  { id: uid(), date: '2024-04-09', description: 'Bus Pass Recharge', amount: 250, category: 'Transport', type: 'debit' },
  { id: uid(), date: '2024-04-08', description: 'Pocket Money from Home', amount: 3000, category: 'Food', type: 'credit' },
  { id: uid(), date: '2024-04-08', description: 'Notebooks & Pens', amount: 180, category: 'Stationery', type: 'debit' },
  { id: uid(), date: '2024-04-07', description: 'Netflix Subscription', amount: 199, category: 'Subscriptions', type: 'debit' },
  { id: uid(), date: '2024-04-07', description: 'Auto Rickshaw', amount: 45, category: 'Transport', type: 'debit' },
  { id: uid(), date: '2024-04-06', description: 'Movie Tickets', amount: 350, category: 'Entertainment', type: 'debit' },
  { id: uid(), date: '2024-04-06', description: 'Mutual Fund SIP', amount: 500, category: 'Investment', type: 'debit' },
  { id: uid(), date: '2024-04-05', description: 'Freelance Gig Payment', amount: 2000, category: 'Entertainment', type: 'credit' },
  { id: uid(), date: '2024-04-05', description: 'Tea & Snacks', amount: 60, category: 'Food', type: 'debit' },
  { id: uid(), date: '2024-04-04', description: 'Spotify Premium', amount: 59, category: 'Subscriptions', type: 'debit' },
  { id: uid(), date: '2024-04-04', description: 'Photocopy & Print', amount: 120, category: 'Stationery', type: 'debit' },
  { id: uid(), date: '2024-04-03', description: 'Scholarship Credit', amount: 5000, category: 'Entertainment', type: 'credit' },
  { id: uid(), date: '2024-04-03', description: 'Street Food', amount: 90, category: 'Food', type: 'debit' },
  { id: uid(), date: '2024-04-02', description: 'Metro Card Top-up', amount: 200, category: 'Transport', type: 'debit' },
]

const seedBudgets: BudgetCategory[] = [
  { id: uid(), name: 'Food', icon: '🍽', limit: 3000, spent: 0, locked: false },
  { id: uid(), name: 'Transport', icon: '🚌', limit: 1500, spent: 0, locked: false },
  { id: uid(), name: 'Stationery', icon: '📝', limit: 800, spent: 0, locked: false },
  { id: uid(), name: 'Entertainment', icon: '🎬', limit: 1000, spent: 0, locked: false },
  { id: uid(), name: 'Subscriptions', icon: '♾', limit: 500, spent: 0, locked: true },
  { id: uid(), name: 'Investment', icon: '📈', limit: 1000, spent: 0, locked: false },
]

const seedInvestments: Investment[] = [
  { id: uid(), name: 'SBI Bluechip Fund', type: 'Mutual Fund', value: 5000, notes: 'Monthly SIP ₹500', dateAdded: '2024-01-15' },
  { id: uid(), name: 'Digital Gold', type: 'Gold', value: 2000, notes: 'Bought on PhonePe', dateAdded: '2024-02-10' },
  { id: uid(), name: 'Zerodha Stocks', type: 'Stocks', value: 3500, notes: 'Infosys, TCS shares', dateAdded: '2024-03-01' },
  { id: uid(), name: 'Post Office FD', type: 'FD', value: 10000, notes: '1-year lock-in', dateAdded: '2023-12-01' },
]

// ── Context ────────────────────────────────────────────

interface AppState {
  user: UserProfile
  transactions: Transaction[]
  budgets: BudgetCategory[]
  investments: Investment[]
  emergencyFund: number
  emergencyTarget: number

  // User actions
  login: (name: string, email: string) => void
  signup: (name: string, email: string) => void
  logout: () => void
  togglePlan: () => void

  // Transaction CRUD
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Budget CRUD
  addBudget: (b: Omit<BudgetCategory, 'id' | 'spent'>) => void
  updateBudget: (id: string, b: Partial<BudgetCategory>) => void
  deleteBudget: (id: string) => void

  // Investment CRUD
  addInvestment: (inv: Omit<Investment, 'id'>) => void
  updateInvestment: (id: string, inv: Partial<Investment>) => void
  deleteInvestment: (id: string) => void

  setEmergencyFund: (val: number) => void

  // Derived
  totalCredit: number
  totalDebit: number
  balance: number
  totalInvested: number
  categorySpending: Record<string, number>
}

const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

// ── Provider ───────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', plan: 'FREE', isLoggedIn: false })
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions)
  const [budgets, setBudgets] = useState<BudgetCategory[]>(seedBudgets)
  const [investments, setInvestments] = useState<Investment[]>(seedInvestments)
  const [emergencyFund, setEmergencyFund] = useState(3000)
  const emergencyTarget = 15000

  // ── User ──
  const login = (name: string, email: string) => setUser({ name: name || 'Student', email, plan: user.plan, isLoggedIn: true })
  const signup = (name: string, email: string) => setUser({ name, email, plan: 'FREE', isLoggedIn: true })
  const logout = () => setUser({ name: '', email: '', plan: 'FREE', isLoggedIn: false })
  const togglePlan = () => setUser(u => ({ ...u, plan: u.plan === 'FREE' ? 'PRO' : 'FREE' }))

  // ── Transactions ──
  const addTransaction = (t: Omit<Transaction, 'id'>) => setTransactions(prev => [{ ...t, id: uid() }, ...prev])
  const updateTransaction = (id: string, t: Partial<Transaction>) => setTransactions(prev => prev.map(x => x.id === id ? { ...x, ...t } : x))
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(x => x.id !== id))

  // ── Budgets ──
  const addBudget = (b: Omit<BudgetCategory, 'id' | 'spent'>) => setBudgets(prev => [...prev, { ...b, id: uid(), spent: 0 }])
  const updateBudget = (id: string, b: Partial<BudgetCategory>) => setBudgets(prev => prev.map(x => x.id === id ? { ...x, ...b } : x))
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(x => x.id !== id))

  // ── Investments ──
  const addInvestment = (inv: Omit<Investment, 'id'>) => setInvestments(prev => [...prev, { ...inv, id: uid() }])
  const updateInvestment = (id: string, inv: Partial<Investment>) => setInvestments(prev => prev.map(x => x.id === id ? { ...x, ...inv } : x))
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(x => x.id !== id))

  // ── Derived ──
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0)
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0)
  const balance = totalCredit - totalDebit
  const totalInvested = investments.reduce((a, i) => a + i.value, 0)

  const categorySpending: Record<string, number> = {}
  transactions.filter(t => t.type === 'debit').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
  })

  // Sync budget spent from transactions
  const budgetsWithSpent = budgets.map(b => ({
    ...b,
    spent: categorySpending[b.name] || 0,
  }))

  return (
    <AppContext.Provider value={{
      user, transactions, budgets: budgetsWithSpent, investments, emergencyFund, emergencyTarget,
      login, signup, logout, togglePlan,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addInvestment, updateInvestment, deleteInvestment,
      setEmergencyFund,
      totalCredit, totalDebit, balance, totalInvested, categorySpending,
    }}>
      {children}
    </AppContext.Provider>
  )
}
