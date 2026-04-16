import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, formatINR } from '../context/AppContext'

interface InsightArticle {
  id: number
  date: string
  tag: string
  headline: string
  highlightWord: string
  pullQuote: { label: string; stat: string }
  body: string[]
  conclusion: string
  highlightStat: string
  actions: { label: string; icon: string; variant: 'primary' | 'default' | 'muted'; action: string }[]
}

export default function Insights() {
  const navigate = useNavigate()
  const { categorySpending, budgets, totalDebit, totalCredit, transactions } = useApp()
  const [activeArticle, setActiveArticle] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dismissed, setDismissed] = useState<number[]>([])
  const [showModal, setShowModal] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active') // New state

  // Find the most over-budget category
  const topSpendCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]
  const topCatName = topSpendCategory?.[0] || 'Food'
  const topCatSpend = topSpendCategory?.[1] || 0
  const topBudget = budgets.find(b => b.name === topCatName)
  const topCatLimit = topBudget?.limit || 1000

  const subscriptionSpend = categorySpending['Subscriptions'] || 0
  const foodSpend = categorySpending['Food'] || 0

  const articles: InsightArticle[] = [
    {
      id: 1,
      date: '10.04.2024',
      tag: 'SPENDING ALERT',
      headline: `${topCatName.toUpperCase()}: ${formatINR(topCatSpend)} SPENT THIS MONTH`,
      highlightWord: formatINR(topCatSpend),
      pullQuote: { label: 'YOUR SPENDING', stat: `${topCatLimit > 0 ? Math.round((topCatSpend / topCatLimit) * 100) : 0}% OF BUDGET USED` },
      body: [
        `You've spent ${formatINR(topCatSpend)} on ${topCatName} so far this month. ${topCatSpend > topCatLimit ? `That's already over your ${formatINR(topCatLimit)} budget limit.` : `Your budget is ${formatINR(topCatLimit)}, so you have ${formatINR(topCatLimit - topCatSpend)} left.`}`,
        `Small daily expenses add up fast. A ₹80 canteen lunch every weekday costs ₹1,600/month. Packing food even 2 days a week could save you ₹640.`,
      ],
      conclusion: `Try setting a daily spending limit. If you save just ₹50/day from this category, that's ₹1,500/month — enough for a mutual fund SIP that could grow to ₹25,000 in 12 months.`,
      highlightStat: '₹1,500/month',
      actions: [
        { label: `SET ${topCatName.toUpperCase()} CAP`, icon: '🔒', variant: 'primary', action: 'budget' },
        { label: 'VIEW ALL EXPENSES', icon: '→', variant: 'default', action: 'expenses' },
        { label: 'START A SIP', icon: '📈', variant: 'default', action: 'investments' },
        { label: 'DISMISS', icon: '✕', variant: 'muted', action: 'dismiss' },
      ],
    },
    {
      id: 2,
      date: '08.04.2024',
      tag: 'SUBSCRIPTION CHECK',
      headline: `SUBSCRIPTION AUDIT: ${formatINR(subscriptionSpend)} RECURRING`,
      highlightWord: formatINR(subscriptionSpend),
      pullQuote: { label: 'MONTHLY DRAIN', stat: `${formatINR(subscriptionSpend)} ON AUTO-PAY` },
      body: [
        `You're paying ${formatINR(subscriptionSpend)} every month on subscriptions like Netflix and Spotify. Are you using all of them regularly?`,
        `Students often forget about free trials that converted to paid plans. Check if your college provides free access to any of these through student programs.`,
      ],
      conclusion: `Even cancelling one ₹199 subscription saves ₹2,388/year. That's almost enough for a semester's worth of books. Review each subscription and ask: "Did I use this in the last 7 days?"`,
      highlightStat: '₹2,388/year',
      actions: [
        { label: 'LOCK SUB BUDGET', icon: '🔒', variant: 'primary', action: 'budget' },
        { label: 'VIEW SUBSCRIPTIONS', icon: '→', variant: 'default', action: 'expenses-sub' },
        { label: 'MOVE TO SAVINGS', icon: '💰', variant: 'default', action: 'investments' },
        { label: 'DISMISS', icon: '✕', variant: 'muted', action: 'dismiss' },
      ],
    },
    {
      id: 3,
      date: '05.04.2024',
      tag: 'SAVINGS TIP',
      headline: `YOUR MONEY: WHERE IT GOES`,
      highlightWord: formatINR(totalDebit),
      pullQuote: { label: 'SAVINGS RATE', stat: `${totalCredit > 0 ? Math.round(((totalCredit - totalDebit) / totalCredit) * 100) : 0}% OF INCOME SAVED` },
      body: [
        `Out of ${formatINR(totalCredit)} that came in, you spent ${formatINR(totalDebit)}. ${totalCredit > totalDebit ? `You saved ${formatINR(totalCredit - totalDebit)} — good job!` : `You overspent by ${formatINR(totalDebit - totalCredit)}. Time to review your budget.`}`,
        `The 50/30/20 rule works well for students: 50% on needs (food, transport), 30% on wants (entertainment), 20% saved or invested. How does your split compare?`,
      ],
      conclusion: `Setting up a small ₹500/month SIP now builds a powerful habit. Starting at 20 instead of 25 could mean ₹5 lakh more by the time you're 30, thanks to compounding.`,
      highlightStat: '₹5 lakh',
      actions: [
        { label: 'REVIEW BUDGET', icon: '📊', variant: 'primary', action: 'budget' },
        { label: 'ALL TRANSACTIONS', icon: '→', variant: 'default', action: 'expenses' },
        { label: 'START INVESTING', icon: '📈', variant: 'default', action: 'investments' },
        { label: 'DISMISS', icon: '✕', variant: 'muted', action: 'dismiss' },
      ],
    },
  ]

  const visibleArticles = articles.filter(a => !dismissed.includes(a.id))

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [activeArticle])

  const handleAction = (action: string, articleId: number) => {
    switch (action) {
      case 'budget': navigate('/budget'); break
      case 'expenses': navigate('/expenses'); break
      case 'expenses-sub': navigate('/expenses'); break
      case 'investments': navigate('/investments'); break
      case 'dismiss': 
        setDismissed(prev => [...prev, articleId])
        // Auto-switch to history view when all dismissed
        if (visibleArticles.length === 1) {
          setTimeout(() => setViewMode('history'), 300)
        }
        break
      case 'cancel': setShowModal('cancel'); break
      default: break
    }
  }

  const handleViewInsight = (id: number) => {
    setViewMode('active')
    setDismissed(prev => prev.filter(d => d !== id))
    const idx = articles.findIndex(a => a.id === id)
    if (idx !== -1) setActiveArticle(idx)
  }

  // History table view
  if (viewMode === 'history' || visibleArticles.length === 0) {
    const dismissedArticles = articles.filter(a => dismissed.includes(a.id))
    
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-muted/30 p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-[48px] text-text uppercase tracking-tight leading-none">
                INSIGHT HISTORY
              </h1>
              <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-2">
                PAST NOTIFICATIONS • {dismissedArticles.length} TOTAL
              </p>
            </div>
            {dismissedArticles.length > 0 && (
              <button
                onClick={() => {
                  setDismissed([])
                  setViewMode('active')
                }}
                className="py-3 px-6 border border-primary text-primary text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent"
              >
                RESTORE ALL
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 p-8">
          {dismissedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="font-display text-[32px] text-muted uppercase text-center leading-tight mb-4">
                NO DISMISSED INSIGHTS
              </h2>
              <p className="text-sm text-muted uppercase tracking-[0.1em]">
                ALL INSIGHTS ARE CURRENTLY ACTIVE
              </p>
            </div>
          ) : (
            <div className="border border-muted/30">
              {/* Table Header */}
              <div className="grid grid-cols-[120px_200px_1fr_140px_120px] bg-surface border-b border-muted/30">
                <div className="px-4 py-3 border-r border-muted/30">
                  <p className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold">DATE</p>
                </div>
                <div className="px-4 py-3 border-r border-muted/30">
                  <p className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold">TAG</p>
                </div>
                <div className="px-4 py-3 border-r border-muted/30">
                  <p className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold">HEADLINE</p>
                </div>
                <div className="px-4 py-3 border-r border-muted/30">
                  <p className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold">DISMISSED</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[9px] text-muted uppercase tracking-[0.15em] font-bold">ACTION</p>
                </div>
              </div>

              {/* Table Rows */}
              {dismissedArticles.map((article) => (
                <div
                  key={article.id}
                  className="grid grid-cols-[120px_200px_1fr_140px_120px] border-b border-muted/30 last:border-0 hover:bg-surface/50 transition-none"
                >
                  <div className="px-4 py-4 border-r border-muted/30 flex items-center">
                    <p className="text-xs text-text mono-number">{article.date}</p>
                  </div>
                  <div className="px-4 py-4 border-r border-muted/30 flex items-center">
                    <span className="text-[10px] text-primary uppercase tracking-[0.1em] font-bold">
                      {article.tag}
                    </span>
                  </div>
                  <div className="px-4 py-4 border-r border-muted/30 flex items-center">
                    <p className="text-sm text-text/80 font-sans truncate">
                      {article.headline}
                    </p>
                  </div>
                  <div className="px-4 py-4 border-r border-muted/30 flex items-center">
                    <p className="text-xs text-muted uppercase tracking-[0.1em]">
                      {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                    </p>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <button
                      onClick={() => handleViewInsight(article.id)}
                      className="text-[10px] text-primary uppercase tracking-[0.1em] font-bold hover:text-text transition-none"
                    >
                      VIEW →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
          <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // AI INSIGHTS</p>
          <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
        </div>
      </div>
    )
  }

  const safeIdx = Math.min(activeArticle, visibleArticles.length - 1)
  const article = visibleArticles[safeIdx]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-background/90 flex items-center justify-center" onClick={() => setShowModal(null)}>
          <div className="border border-muted/30 bg-surface p-8 max-w-[400px]" onClick={e => e.stopPropagation()}>
            <p className="text-[10px] text-danger uppercase tracking-[0.2em] mb-3">CONFIRM ACTION</p>
            <p className="font-display text-xl text-text uppercase mb-4">
              {showModal === 'cancel' ? 'CANCEL SUBSCRIPTION?' : 'LOCK THIS CATEGORY?'}
            </p>
            <p className="text-sm text-muted mb-6">
              This will take effect immediately. You can undo this from the Budget or Settings page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(null); navigate('/budget') }}
                className="flex-1 py-2 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary"
              >
                CONFIRM
              </button>
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 py-2 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article tabs */}
      <div className="border-b border-muted/30 flex">
        {visibleArticles.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setActiveArticle(i)}
            className={`flex-1 px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold border-r border-muted/30 last:border-r-0 transition-none ${
              i === safeIdx
                ? 'bg-surface text-primary border-b-2 border-b-primary'
                : 'text-muted hover:text-text hover:bg-surface/50'
            }`}
          >
            <span className="block text-[9px] text-muted mb-1">INSIGHT {String(i + 1).padStart(2, '0')}</span>
            {a.tag}
          </button>
        ))}
        {dismissed.length > 0 && (
          <button
            onClick={() => setViewMode('history')}
            className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted hover:text-primary hover:bg-surface/50 transition-none border-l border-muted/30"
          >
            <span className="block text-[9px] text-muted mb-1">DISMISSED</span>
            VIEW HISTORY ({dismissed.length})
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex-1 p-8">
          <div className="mb-4"><div className="redaction-block h-4 w-48 mb-3" /></div>
          <div className="mb-8">
            <div className="redaction-block h-12 w-[80%] mb-3" />
            <div className="redaction-block h-12 w-[60%]" />
          </div>
          <div className="grid grid-cols-[1fr_1fr] gap-8">
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="redaction-block h-4" style={{ width: `${70 + Math.random() * 30}%` }} />)}
            </div>
            <div><div className="redaction-block h-40 w-full" /></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in-up">
              <span className="text-primary text-sm">●</span>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">{article.tag}: {article.date}</p>
            </div>
            <h1 className="font-display text-[48px] lg:text-[64px] leading-[0.95] text-text uppercase tracking-tight mb-8 opacity-0 animate-fade-in-up stagger-1">
              {article.headline.split(article.highlightWord).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="text-primary bg-primary/10 px-2">{article.highlightWord}</span>
                  )}
                </span>
              ))}
            </h1>
          </div>

          {/* Content */}
          <div className="flex-1 px-8 pb-8">
            <div className="grid grid-cols-[1fr_320px] gap-8 opacity-0 animate-fade-in-up stagger-2">
              {/* Left: article */}
              <div>
                <div className="space-y-5 mb-8">
                  {article.body.map((para, i) => (
                    <p key={i} className="text-[15px] leading-[1.8] text-text/80 font-sans">{para}</p>
                  ))}
                </div>

                <div className="border-l-2 border-primary pl-6 py-2 mb-8">
                  <p className="text-[15px] leading-[1.8] text-text/80 font-sans">
                    {article.conclusion.split(article.highlightStat).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="text-primary font-bold">{article.highlightStat}</span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* Right: pull-quote + actions */}
              <div className="space-y-6">
                <div className="bg-surface border border-muted/30 p-8">
                  <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4">{article.pullQuote.label}</p>
                  <p className="font-display text-[28px] leading-[1.1] text-primary uppercase">{article.pullQuote.stat}</p>
                </div>

                <div>
                  <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3">WHAT YOU CAN DO</p>
                  <div className="grid grid-cols-2 gap-3">
                    {article.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action.action, article.id)}
                        className={`p-4 border text-center flex flex-col items-center justify-center gap-2 transition-none ${
                          action.variant === 'primary'
                            ? 'border-primary bg-primary/10 text-primary hover:bg-text hover:text-background hover:border-text'
                            : action.variant === 'muted'
                            ? 'border-muted/30 text-muted hover:bg-text hover:text-background hover:border-text'
                            : 'border-muted/50 text-text hover:bg-text hover:text-background hover:border-text'
                        }`}
                      >
                        <span className="text-lg">{action.icon}</span>
                        <span className="text-[10px] uppercase tracking-[0.1em] font-bold">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="border border-muted/30 p-4">
                  <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3">RELATED NUMBERS</p>
                  <div className="space-y-2">
                    {[
                      { label: 'TOTAL EXPENSES', value: formatINR(totalDebit) },
                      { label: 'FOOD THIS MONTH', value: formatINR(foodSpend) },
                      { label: 'TRANSACTIONS', value: String(transactions.length) },
                    ].map(dp => (
                      <div key={dp.label} className="flex justify-between items-center py-2 border-b border-muted/10 last:border-0">
                        <span className="text-[10px] text-muted uppercase tracking-[0.1em]">{dp.label}</span>
                        <span className="text-sm text-text font-bold mono-number">{dp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
            <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // AI INSIGHTS</p>
            <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
          </div>
        </div>
      )}
    </div>
  )
}
