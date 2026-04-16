import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, formatINR, formatINRSigned } from '../context/AppContext'
import * as api from '../lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { transactions, totalCredit, totalDebit, balance, totalInvested, categorySpending, budgets, user, investments } = useApp()
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [insightMessage, setInsightMessage] = useState<string | null>(null)

  const recentTransactions = transactions.slice(0, 12)

  // Monthly data for chart (group by rough month)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']
  const chartHeight = 180
  const chartWidth = 100

  // Simulated monthly income vs spending for chart
  const monthlyData = [
    { income: 5000, expenses: 3200 },
    { income: 4500, expenses: 3800 },
    { income: 5000, expenses: 2900 },
    { income: 6000, expenses: 4200 },
    { income: 5000, expenses: 3500 },
    { income: totalCredit, expenses: totalDebit },
  ]
  const maxVal = Math.max(...monthlyData.flatMap(d => [d.income, d.expenses]), 1)
  const incomePoints = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * chartWidth
    const y = chartHeight - (d.income / maxVal) * chartHeight
    return `${x},${y}`
  }).join(' ')
  const expensePoints = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * chartWidth
    const y = chartHeight - (d.expenses / maxVal) * chartHeight
    return `${x},${y}`
  }).join(' ')

  // Top over-budget categories
  const overBudgetCategories = budgets.filter(b => b.spent > b.limit * 0.8)

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true)
    setInsightMessage(null)
    
    try {
      const result = await api.generateInsights()
      setInsightMessage(`✓ Generated ${result.insights_generated} insights! ${result.remaining_this_period} remaining this ${user.plan === 'PRO' ? 'week' : 'month'}.`)
      setTimeout(() => navigate('/insights'), 1500)
    } catch (error: any) {
      if (error.message.includes('429') || error.message.includes('limit')) {
        setInsightMessage(`⚠ Insight limit reached. Upgrade to PRO for more insights.`)
      } else {
        setInsightMessage(`✗ Failed to generate insights: ${error.message}`)
      }
    } finally {
      setGeneratingInsights(false)
      setTimeout(() => setInsightMessage(null), 5000)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Ledger Pane */}
      <div className="w-[62.5%] border-r border-muted/30 flex flex-col">
        {/* Anomaly banner */}
        {overBudgetCategories.length > 0 && (
          <div
            onClick={() => navigate('/insights')}
            className="border-b border-muted/30 p-6 bg-primary/5 cursor-pointer group budget-warning-bar"
          >
            <div className="flex items-center gap-3">
              <span className="text-danger text-lg">▲</span>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary group-hover:text-text">
                {overBudgetCategories.length} BUDGET WARNING{overBudgetCategories.length > 1 ? 'S' : ''} — CLICK TO VIEW ANALYSIS →
              </p>
            </div>
          </div>
        )}

        {/* Balance Block */}
        <div className="p-8 border-b border-muted/30">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2 terminal-prompt">
            CURRENT BALANCE
          </p>
          <h2 className="font-display text-[72px] text-primary leading-none tracking-tight mono-number animate-stat">
            {formatINR(balance)}
          </h2>
          <div className="flex gap-8 mt-4">
            <div className="animate-stat stagger-1">
              <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL IN</span>
              <p className="text-lg text-primary font-bold mt-1 mono-number">{formatINR(totalCredit)}</p>
            </div>
            <div className="animate-stat stagger-2">
              <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL OUT</span>
              <p className="text-lg text-danger font-bold mt-1 mono-number">-{formatINR(totalDebit)}</p>
            </div>
            <div className="animate-stat stagger-3">
              <span className="text-[10px] text-muted uppercase tracking-[0.15em]">INVESTED</span>
              <p className="text-lg text-text font-bold mt-1 mono-number">{formatINR(totalInvested)}</p>
            </div>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="flex-1 flex flex-col">
          <div className="px-8 py-4 border-b border-muted/30 flex justify-between items-center">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] terminal-prompt">RECENT ENTRIES</p>
            <button
              onClick={() => navigate('/expenses')}
              className="text-[10px] text-primary uppercase tracking-[0.15em] hover:underline"
            >
              VIEW ALL ({transactions.length}) →
            </button>
          </div>

          {/* Terminal-style table header */}
          <div className="grid grid-cols-[32px_70px_1fr_100px_90px] px-8 py-3 text-[10px] text-muted uppercase tracking-[0.15em] border-b border-muted/20 bg-surface/20">
            <span className="terminal-gutter">#</span>
            <span>DATE</span>
            <span>DESCRIPTION</span>
            <span className="text-right">CATEGORY</span>
            <span className="text-right">AMOUNT</span>
          </div>

          <div className="flex-1 overflow-auto">
            {recentTransactions.map((entry, i) => (
              <div
                key={entry.id}
                className={`grid grid-cols-[32px_70px_1fr_100px_90px] px-8 py-3 border-b border-muted/10 terminal-row cursor-default ${
                  entry.type === 'credit' ? 'terminal-row-credit' : 'terminal-row-debit'
                }`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <span className="terminal-gutter">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs text-muted mono-number">{entry.date.slice(5)}</span>
                <span className="text-sm text-text font-sans">{entry.description}</span>
                <span className="text-[10px] text-muted uppercase tracking-[0.1em] text-right self-center">{entry.category}</span>
                <span className={`text-sm text-right font-bold mono-number ${
                  entry.type === 'credit' ? 'text-primary' : 'text-text'
                }`}>
                  {formatINRSigned(entry.type === 'credit' ? entry.amount : -entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
          <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // DASHBOARD ACTIVE</p>
          <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
        </div>
      </div>

      {/* Right Rail */}
      <div className="w-[37.5%] flex flex-col">
        {/* Cash Flow Graph */}
        <div className="p-6 border-b border-muted/30">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4">CASH FLOW — INCOME VS. SPENDING</p>
          <div className="border border-muted/20 p-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[180px]" preserveAspectRatio="none">
              {[0.25, 0.5, 0.75].map(ratio => (
                <line key={ratio} x1="0" y1={chartHeight * ratio} x2={chartWidth} y2={chartHeight * ratio} stroke="#71717A" strokeWidth="0.3" strokeDasharray="2,2" />
              ))}
              <polyline points={incomePoints} fill="none" stroke="#CCFF00" strokeWidth="1.5" strokeLinejoin="bevel" className="animate-draw" />
              <polyline points={expensePoints} fill="none" stroke="#FA114F" strokeWidth="1" strokeLinejoin="bevel" className="animate-draw-delay" />
            </svg>
            <div className="flex justify-between mt-3 px-1">
              {months.map(m => <span key={m} className="text-[8px] text-muted uppercase">{m}</span>)}
            </div>
          </div>
          <div className="flex gap-6 mt-3">
            <span className="text-[10px] text-primary uppercase tracking-[0.15em]">● INCOME</span>
            <span className="text-[10px] text-danger uppercase tracking-[0.15em]">- - EXPENSES</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-muted/30">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4 terminal-prompt">QUICK ACTIONS</p>
          
          {insightMessage && (
            <div className={`mb-3 p-3 border text-xs uppercase tracking-[0.1em] ${
              insightMessage.startsWith('✓') 
                ? 'border-primary/40 bg-primary/10 text-primary' 
                : 'border-danger/40 bg-danger/10 text-danger'
            }`}>
              {insightMessage}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="quick-action h-12 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all" 
              onClick={() => navigate('/expenses')}
            >
              ADD EXPENSE
            </button>
            <button 
              className="quick-action h-12 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all" 
              onClick={() => navigate('/budget')}
            >
              SET BUDGET
            </button>
            <button 
              className="quick-action h-12 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all" 
              onClick={() => navigate('/settings')}
            >
              SETTINGS
            </button>
            <button 
              className="quick-action h-12 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all relative disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleGenerateInsights}
              disabled={generatingInsights}
            >
              {generatingInsights ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-blink">●</span> GENERATING...
                </span>
              ) : (
                '⚡ GENERATE INSIGHTS'
              )}
            </button>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 border-b border-muted/30 flex-1">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4 terminal-prompt">CATEGORY BREAKDOWN</p>
          <div className="space-y-4">
            {budgets.map(cat => {
              const pct = cat.limit > 0 ? Math.round((cat.spent / cat.limit) * 100) : 0
              const isWarning = pct > 80 && pct <= 100
              const isDanger = pct > 100
              return (
                <div key={cat.id}>
                  <div className="flex justify-between mb-1 items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-[2px] h-3 flex-shrink-0"
                        style={{ backgroundColor: isDanger ? '#FA114F' : isWarning ? '#CCFF00' : '#71717A' }}
                      />
                      <span className="text-[10px] text-muted uppercase tracking-[0.15em]">{cat.icon} {cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-[0.15em] mono-number ${
                        isDanger ? 'text-danger' : isWarning ? 'text-primary' : 'text-muted'
                      }`}>
                        {formatINR(cat.spent)} / {formatINR(cat.limit)}
                      </span>
                      <span className={`pct-badge ${
                        isDanger ? 'text-danger border-danger/30' : isWarning ? 'text-primary border-primary/30' : 'text-muted'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 bg-surface w-full relative ${isWarning ? 'budget-warning-bar' : ''} ${isDanger ? 'budget-danger-bar' : ''}`}>
                    <div
                      className="h-full animate-fill-bar"
                      style={{
                        '--fill-width': `${Math.min(pct, 100)}%`,
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: isDanger ? '#FA114F' : isWarning ? '#CCFF00' : '#71717A',
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="p-6">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3 terminal-prompt">INVESTMENT STATUS</p>
          <div className="border border-muted/30 p-4 flex justify-between items-center cursor-pointer hover:border-primary/50" onClick={() => navigate('/investments')}>
            <div>
              <p className="font-display text-2xl text-primary mono-number">{formatINR(totalInvested)}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL INVESTED</p>
                <span className="text-[10px] text-muted/60 uppercase tracking-[0.1em]">·</span>
                <p className="text-[10px] text-muted/60 uppercase tracking-[0.1em] mono-number">{investments.length} ASSET{investments.length !== 1 ? 'S' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini sparkline dots */}
              <div className="flex items-end gap-[2px] h-4">
                {[3, 5, 4, 7, 6, 8, 5, 9].map((h, i) => (
                  <div key={i} className="w-[2px] bg-primary/40" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
              <span className="text-primary text-xl">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
