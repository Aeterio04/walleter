import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as api from '../lib/api'

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

export function formatINR(val: number): string {
  const abs = Math.abs(val)
  return (val < 0 ? '-' : '') + '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function formatINRSigned(val: number): string {
  const abs = Math.abs(val)
  const prefix = val < 0 ? '-' : '+'
  return prefix + '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ── Context ────────────────────────────────────────────

interface AppState {
  user: UserProfile
  transactions: Transaction[]
  budgets: BudgetCategory[]
  investments: Investment[]
  emergencyFund: number
  emergencyTarget: number
  loading: boolean

  // User actions
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  togglePlan: () => Promise<void>

  // Transaction CRUD
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  refreshTransactions: () => Promise<void>

  // Budget CRUD
  addBudget: (b: Omit<BudgetCategory, 'id' | 'spent'>) => Promise<void>
  updateBudget: (id: string, b: Partial<BudgetCategory>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  refreshBudgets: () => Promise<void>

  // Investment CRUD
  addInvestment: (inv: Omit<Investment, 'id'>) => Promise<void>
  updateInvestment: (id: string, inv: Partial<Investment>) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
  refreshInvestments: () => Promise<void>

  setEmergencyFund: (val: number) => Promise<void>

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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<BudgetCategory[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [emergencyFund, setEmergencyFundState] = useState(0)
  const [emergencyTarget, setEmergencyTarget] = useState(15000)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const token = api.getAccessToken()
    if (token) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUserData() {
    try {
      const userProfile = await api.getCurrentUser()
      setUser({
        name: userProfile.name,
        email: userProfile.email,
        plan: userProfile.plan,
        isLoggedIn: true,
      })
      setEmergencyFundState(userProfile.emergency_fund)
      setEmergencyTarget(userProfile.emergency_target)

      // Load all data in parallel
      await Promise.all([
        refreshTransactions(),
        refreshBudgets(),
        refreshInvestments(),
      ])
    } catch (error) {
      console.error('Failed to load user data:', error)
      api.clearTokens()
    } finally {
      setLoading(false)
    }
  }

  // ── User ──
  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    api.setTokens(response.access_token, response.refresh_token)
    await loadUserData()
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await api.signup(name, email, password)
    api.setTokens(response.access_token, response.refresh_token)
    await loadUserData()
  }

  const logout = async () => {
    await api.logout()
    setUser({ name: '', email: '', plan: 'FREE', isLoggedIn: false })
    setTransactions([])
    setBudgets([])
    setInvestments([])
    setEmergencyFundState(0)
  }

  const togglePlan = async () => {
    const newPlan = user.plan === 'FREE' ? 'PRO' : 'FREE'
    await api.updateUser({ plan: newPlan })
    setUser(u => ({ ...u, plan: newPlan }))
  }

  // ── Transactions ──
  const refreshTransactions = async () => {
    const data = await api.getTransactions()
    setTransactions(data.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category as ExpenseCategory,
      type: t.type,
    })))
  }

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    await api.createTransaction({
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
    })
    await refreshTransactions()
  }

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    await api.updateTransaction(id, t)
    await refreshTransactions()
  }

  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id)
    await refreshTransactions()
  }

  // ── Budgets ──
  const refreshBudgets = async () => {
    const data = await api.getBudgets()
    setBudgets(data.map(b => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      limit: b.limit_amount,
      spent: b.spent,
      locked: b.locked,
    })))
  }

  const addBudget = async (b: Omit<BudgetCategory, 'id' | 'spent'>) => {
    await api.createBudget({
      name: b.name,
      icon: b.icon,
      limit_amount: b.limit,
      locked: b.locked,
    })
    await refreshBudgets()
  }

  const updateBudget = async (id: string, b: Partial<BudgetCategory>) => {
    const payload: any = {}
    if (b.name !== undefined) payload.name = b.name
    if (b.icon !== undefined) payload.icon = b.icon
    if (b.limit !== undefined) payload.limit_amount = b.limit
    if (b.locked !== undefined) payload.locked = b.locked
    await api.updateBudget(id, payload)
    await refreshBudgets()
  }

  const deleteBudget = async (id: string) => {
    await api.deleteBudget(id)
    await refreshBudgets()
  }

  // ── Investments ──
  const refreshInvestments = async () => {
    const data = await api.getInvestments()
    setInvestments(data.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      value: i.value,
      notes: i.notes || '',
      dateAdded: i.date_added,
    })))
  }

  const addInvestment = async (inv: Omit<Investment, 'id'>) => {
    await api.createInvestment({
      name: inv.name,
      type: inv.type,
      value: inv.value,
      notes: inv.notes,
      date_added: inv.dateAdded,
    })
    await refreshInvestments()
  }

  const updateInvestment = async (id: string, inv: Partial<Investment>) => {
    const payload: any = {}
    if (inv.name !== undefined) payload.name = inv.name
    if (inv.type !== undefined) payload.type = inv.type
    if (inv.value !== undefined) payload.value = inv.value
    if (inv.notes !== undefined) payload.notes = inv.notes
    if (inv.dateAdded !== undefined) payload.date_added = inv.dateAdded
    await api.updateInvestment(id, payload)
    await refreshInvestments()
  }

  const deleteInvestment = async (id: string) => {
    await api.deleteInvestment(id)
    await refreshInvestments()
  }

  const setEmergencyFund = async (val: number) => {
    await api.updateUser({ emergency_fund: val })
    setEmergencyFundState(val)
  }

  // ── Derived ──
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0)
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0)
  const balance = totalCredit - totalDebit
  const totalInvested = investments.reduce((a, i) => a + i.value, 0)

  const categorySpending: Record<string, number> = {}
  transactions.filter(t => t.type === 'debit').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
  })

  return (
    <AppContext.Provider value={{
      user, transactions, budgets, investments, emergencyFund, emergencyTarget, loading,
      login, signup, logout, togglePlan,
      addTransaction, updateTransaction, deleteTransaction, refreshTransactions,
      addBudget, updateBudget, deleteBudget, refreshBudgets,
      addInvestment, updateInvestment, deleteInvestment, refreshInvestments,
      setEmergencyFund,
      totalCredit, totalDebit, balance, totalInvested, categorySpending,
    }}>
      {children}
    </AppContext.Provider>
  )
}
