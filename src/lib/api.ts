// API Client for Walleter Backend

const API_BASE = 'http://localhost:8000'

// ── Token Management ──────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// ── HTTP Client ───────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  // Auto-refresh on 401
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${getAccessToken()}`
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      })
    } else {
      clearTokens()
      window.location.href = '/'
      throw new Error('Session expired')
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// ── Auth API ──────────────────────────────────────────

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  plan: 'FREE' | 'PRO'
  emergency_fund: number
  emergency_target: number
  created_at: string
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) return false

    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    return true
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch {
      // Ignore errors on logout
    }
  }
  clearTokens()
}

// ── User API ──────────────────────────────────────────

export async function getCurrentUser(): Promise<UserProfile> {
  return request<UserProfile>('/users/me')
}

export async function updateUser(data: {
  name?: string
  plan?: 'FREE' | 'PRO'
  emergency_fund?: number
  emergency_target?: number
}): Promise<UserProfile> {
  return request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ── Transaction API ───────────────────────────────────

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'credit' | 'debit'
  created_at: string
}

export async function getTransactions(filters?: {
  type?: string
  category?: string
}): Promise<Transaction[]> {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.category) params.append('category', filters.category)
  const query = params.toString() ? `?${params}` : ''
  return request<Transaction[]>(`/transactions${query}`)
}

export async function createTransaction(data: {
  date: string
  description: string
  amount: number
  category: string
  type: 'credit' | 'debit'
}): Promise<Transaction> {
  return request<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'created_at'>>
): Promise<Transaction> {
  return request<Transaction>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  return request<void>(`/transactions/${id}`, { method: 'DELETE' })
}

// ── Budget API ────────────────────────────────────────

export interface Budget {
  id: string
  name: string
  icon: string
  limit_amount: number
  locked: boolean
  spent: number
  created_at: string
}

export async function getBudgets(): Promise<Budget[]> {
  return request<Budget[]>('/budgets')
}

export async function createBudget(data: {
  name: string
  icon: string
  limit_amount: number
  locked?: boolean
}): Promise<Budget> {
  return request<Budget>('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, 'id' | 'spent' | 'created_at'>>
): Promise<Budget> {
  return request<Budget>(`/budgets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteBudget(id: string): Promise<void> {
  return request<void>(`/budgets/${id}`, { method: 'DELETE' })
}

// ── Investment API ────────────────────────────────────

export interface Investment {
  id: string
  name: string
  type: string
  value: number
  notes: string | null
  date_added: string
  created_at: string
}

export async function getInvestments(): Promise<Investment[]> {
  return request<Investment[]>('/investments')
}

export async function createInvestment(data: {
  name: string
  type: string
  value: number
  notes?: string
  date_added: string
}): Promise<Investment> {
  return request<Investment>('/investments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateInvestment(
  id: string,
  data: Partial<Omit<Investment, 'id' | 'created_at'>>
): Promise<Investment> {
  return request<Investment>(`/investments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteInvestment(id: string): Promise<void> {
  return request<void>(`/investments/${id}`, { method: 'DELETE' })
}

// ── AI Insights API ───────────────────────────────────

export interface AIInsight {
  id: string
  tag: string
  headline: string
  content: string  // JSON string
  dismissed: boolean
  dismissed_at: string | null
  created_at: string
}

export interface GenerateInsightResponse {
  success: boolean
  message: string
  insights_generated: number
  remaining_this_period: number
}

export interface InsightLimits {
  plan: string
  limit: number
  period: string
  used: number
  remaining: number
}

export async function generateInsights(force: boolean = false): Promise<GenerateInsightResponse> {
  return request<GenerateInsightResponse>('/insights/generate', {
    method: 'POST',
    body: JSON.stringify({ force }),
  })
}

export async function getInsights(includeDismissed: boolean = false): Promise<AIInsight[]> {
  const params = includeDismissed ? '?include_dismissed=true' : ''
  return request<AIInsight[]>(`/insights${params}`)
}

export async function dismissInsight(id: string): Promise<void> {
  return request<void>(`/insights/${id}/dismiss`, { method: 'PATCH' })
}

export async function deleteInsight(id: string): Promise<void> {
  return request<void>(`/insights/${id}`, { method: 'DELETE' })
}

export async function getInsightLimits(): Promise<InsightLimits> {
  return request<InsightLimits>('/insights/limits')
}

// ── Copilot API ───────────────────────────────────────

export interface CopilotChatRequest {
  message: string
}

export interface CopilotChatResponse {
  success: boolean
  intent?: {
    domain: string
    action: string
    confidence: number
    raw_input: string
  }
  entities?: {
    amount: number | null
    category: string | null
    description: string | null
    missing: string[]
  }
  response: {
    type: string
    message: string
    data: any
    actions: Array<{ label: string; type: string; data?: any }>
  }
  error?: string
}

export async function sendCopilotMessage(message: string): Promise<CopilotChatResponse> {
  return request<CopilotChatResponse>('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}
