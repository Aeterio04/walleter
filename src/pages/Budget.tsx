import { useState } from 'react'
import { useApp, formatINR, CATEGORIES, type ExpenseCategory } from '../context/AppContext'

export default function Budget() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useApp()

  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState('')

  // Add form
  const [newName, setNewName] = useState<ExpenseCategory>('Food')
  const [newIcon, setNewIcon] = useState('🍽')
  const [newLimit, setNewLimit] = useState('')

  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0)
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLimit || Number(newLimit) <= 0) return
    addBudget({
      name: newName,
      icon: newIcon,
      limit: Number(newLimit),
      locked: false,
    })
    setNewLimit('')
    setShowAdd(false)
  }

  const startEdit = (id: string) => {
    const b = budgets.find(x => x.id === id)
    if (!b) return
    setEditId(id)
    setEditLimit(String(b.limit))
  }

  const saveEdit = () => {
    if (!editId || !editLimit) return
    const snapped = Math.round(Number(editLimit) / 25) * 25
    updateBudget(editId, { limit: Math.max(snapped, 100) })
    setEditId(null)
  }

  const toggleLock = (id: string) => {
    const b = budgets.find(x => x.id === id)
    if (b) updateBudget(id, { locked: !b.locked })
  }

  // Update icon when category changes
  const handleCategoryChange = (val: ExpenseCategory) => {
    setNewName(val)
    const cat = CATEGORIES.find(c => c.value === val)
    if (cat) setNewIcon(cat.icon)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-muted/30">
        <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">BUDGET ARCHITECTURE</p>
        <h1 className="font-display text-[48px] leading-[0.95] text-text uppercase tracking-tight mb-4">
          SPENDING<br /><span className="text-primary">PROTOCOLS</span>
        </h1>
        <div className="flex gap-8 items-end">
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL BUDGET</span>
            <p className="font-display text-2xl text-text mono-number mt-1">{formatINR(totalLimit)}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">SPENT</span>
            <p className="font-display text-2xl text-primary mono-number mt-1">{formatINR(totalSpent)}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">UTILIZATION</span>
            <p className={`font-display text-2xl mono-number mt-1 ${
              totalLimit > 0 && (totalSpent / totalLimit) > 0.9 ? 'text-danger' : 'text-primary'
            }`}>
              {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%
            </p>
          </div>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="py-3 px-6 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary"
            >
              {showAdd ? '✕ CLOSE' : '+ ADD CATEGORY'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 border-b border-primary/30 bg-primary/5">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4">NEW BUDGET CATEGORY</p>
          <div className="grid grid-cols-[200px_60px_140px_120px] gap-4 items-end">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">CATEGORY</label>
              <select
                value={newName}
                onChange={e => handleCategoryChange(e.target.value as ExpenseCategory)}
                className="w-full bg-background border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">ICON</label>
              <input
                type="text"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-3 py-2 text-xl text-center focus:border-primary focus:outline-none"
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">LIMIT (₹)</label>
              <input
                type="number"
                min="100"
                step="25"
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
                placeholder="₹500"
                className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <button type="submit" className="h-[38px] bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary">
              ADD
            </button>
          </div>
        </form>
      )}

      {/* Table header */}
      <div className="grid grid-cols-[40px_180px_1fr_90px_90px_50px_50px] gap-4 px-8 py-3 border-b border-muted/30 items-center">
        <span className="text-[10px] text-muted uppercase tracking-[0.15em]"></span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em]">CATEGORY</span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em]">PROGRESS</span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em] text-right">STATUS</span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em] text-right">LIMIT</span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em] text-center">🔒</span>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em] text-center"></span>
      </div>

      {/* Category rows */}
      <div className="flex-1">
        {budgets.map(cat => {
          const pct = cat.limit > 0 ? Math.round((cat.spent / cat.limit) * 100) : 0
          const isOver = pct > 100
          const isWarning = pct > 80 && pct <= 100
          const fillColor = isOver ? '#FA114F' : isWarning ? '#CCFF00' : '#71717A'
          const fillWidth = Math.min(pct, 100)
          const isEditing = editId === cat.id

          return (
            <div
              key={cat.id}
              className="grid grid-cols-[40px_180px_1fr_90px_90px_50px_50px] gap-4 px-8 py-4 border-b border-muted/10 items-center ledger-row group"
            >
              <span className="text-xl">{cat.icon}</span>

              <div>
                <p className="text-sm text-text font-bold uppercase tracking-[0.05em]">{cat.name}</p>
                <p className="text-[10px] text-muted mono-number mt-0.5">{formatINR(cat.spent)} SPENT</p>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-8 bg-surface w-full relative overflow-hidden">
                  <div
                    className="h-full animate-fill-bar"
                    style={{
                      '--fill-width': `${fillWidth}%`,
                      width: `${fillWidth}%`,
                      backgroundColor: fillColor,
                    } as React.CSSProperties}
                  />
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold mono-number ${
                    fillWidth > 50 ? 'text-background' : 'text-text'
                  }`} style={fillWidth <= 50 ? { left: `calc(${fillWidth}% + 8px)`, right: 'auto' } : undefined}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="text-right">
                <span className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-1 ${
                  isOver ? 'text-danger bg-danger/10' : isWarning ? 'text-primary bg-primary/10' : 'text-muted'
                }`}>
                  {isOver ? 'BREACH' : isWarning ? 'WARNING' : 'OK'}
                </span>
              </div>

              {/* Limit (editable) */}
              <div className="text-right">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editLimit}
                      onChange={e => setEditLimit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      autoFocus
                      className="w-[70px] bg-transparent border border-primary px-2 py-1 text-sm text-primary text-right mono-number focus:outline-none"
                    />
                    <button onClick={saveEdit} className="text-primary text-xs">✓</button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(cat.id)}
                    className="text-sm text-text mono-number hover:text-primary"
                    title="Click to edit"
                  >
                    {formatINR(cat.limit)}
                  </button>
                )}
              </div>

              {/* Lock toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleLock(cat.id)}
                  className={`w-6 h-6 border-2 flex items-center justify-center transition-none ${
                    cat.locked ? 'border-primary bg-primary text-background' : 'border-muted/50 text-transparent hover:border-text'
                  }`}
                >
                  {cat.locked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Delete */}
              <div className="flex justify-center">
                <button
                  onClick={() => deleteBudget(cat.id)}
                  className="text-muted hover:text-danger text-xs opacity-0 group-hover:opacity-100"
                  title="Delete category"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}

        {budgets.length === 0 && (
          <div className="px-8 py-16 text-center">
            <p className="font-display text-2xl text-muted uppercase">NO BUDGETS SET</p>
            <p className="text-xs text-muted mt-2 uppercase tracking-[0.1em]">CREATE YOUR FIRST BUDGET CATEGORY</p>
          </div>
        )}
      </div>

      {/* Summary bar + Pie chart */}
      <div className="border-t border-muted/30 p-6">
        <div className="flex gap-8">
          {/* Remaining cards */}
          <div className="flex-1">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3">REMAINING THIS MONTH</p>
            <div className="flex gap-4 flex-wrap">
              {budgets.map(b => {
                const remaining = b.limit - b.spent
                return (
                  <div key={b.id} className="border border-muted/20 px-4 py-2">
                    <span className="text-[10px] text-muted uppercase tracking-[0.1em]">{b.icon} {b.name}</span>
                    <p className={`text-sm font-bold mono-number mt-0.5 ${remaining >= 0 ? 'text-primary' : 'text-danger'}`}>
                      {formatINR(remaining)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pie Chart */}
          {budgets.length > 0 && (() => {
            const pieColors = ['#CCFF00', '#FA114F', '#71717A', '#F4F4F5', '#A3E635', '#FB923C']
            const total = budgets.reduce((a, b) => a + b.spent, 0) || 1
            const radius = 50
            const cx = 60
            const cy = 60
            let cumulative = 0

            return (
              <div className="flex-shrink-0 animate-pie">
                <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3">ALLOCATION</p>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {budgets.map((b, i) => {
                    const pct = b.spent / total
                    const startAngle = cumulative * 360
                    const endAngle = (cumulative + pct) * 360
                    cumulative += pct

                    const startRad = (startAngle - 90) * Math.PI / 180
                    const endRad = (endAngle - 90) * Math.PI / 180
                    const largeArc = pct > 0.5 ? 1 : 0

                    const x1 = cx + radius * Math.cos(startRad)
                    const y1 = cy + radius * Math.sin(startRad)
                    const x2 = cx + radius * Math.cos(endRad)
                    const y2 = cy + radius * Math.sin(endRad)

                    if (pct < 0.01) return null

                    return (
                      <path
                        key={b.id}
                        d={`M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
                        fill={pieColors[i % pieColors.length]}
                        stroke="#09090B"
                        strokeWidth="1.5"
                        opacity={0.85}
                      />
                    )
                  })}
                  <circle cx={cx} cy={cy} r="22" fill="#09090B" />
                  <text x={cx} y={cy + 4} textAnchor="middle" fill="#71717A" fontSize="9" fontFamily="var(--font-sans)" letterSpacing="0.1em">
                    {Math.round((totalSpent / totalLimit) * 100)}%
                  </text>
                </svg>
              </div>
            )
          })()}
        </div>
      </div>

      <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // BUDGET MANAGEMENT</p>
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
      </div>
    </div>
  )
}
