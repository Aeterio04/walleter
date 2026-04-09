import { useState } from 'react'
import { useApp, formatINR } from '../context/AppContext'

const INVESTMENT_TYPES = ['Mutual Fund', 'Stocks', 'Gold', 'FD', 'Crypto', 'PPF', 'Other']

export default function Investments() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, emergencyFund, emergencyTarget, setEmergencyFund, totalInvested } = useApp()

  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [hoveredAsset, setHoveredAsset] = useState<number | null>(null)
  const [editEmergency, setEditEmergency] = useState(false)
  const [emergencyInput, setEmergencyInput] = useState(String(emergencyFund))

  // Add form
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Mutual Fund')
  const [newValue, setNewValue] = useState('')
  const [newNotes, setNewNotes] = useState('')

  // Edit form
  const [eName, setEName] = useState('')
  const [eType, setEType] = useState('')
  const [eValue, setEValue] = useState('')
  const [eNotes, setENotes] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newValue) return
    addInvestment({
      name: newName.trim(),
      type: newType,
      value: Number(newValue),
      notes: newNotes.trim(),
      dateAdded: new Date().toISOString().slice(0, 10),
    })
    setNewName(''); setNewValue(''); setNewNotes('')
    setShowAdd(false)
  }

  const startEdit = (id: string) => {
    const inv = investments.find(x => x.id === id)
    if (!inv) return
    setEditId(id)
    setEName(inv.name)
    setEType(inv.type)
    setEValue(String(inv.value))
    setENotes(inv.notes)
  }

  const saveEdit = () => {
    if (!editId) return
    updateInvestment(editId, {
      name: eName.trim(),
      type: eType,
      value: Number(eValue),
      notes: eNotes.trim(),
    })
    setEditId(null)
  }

  const emergencyPct = emergencyTarget > 0 ? Math.round((emergencyFund / emergencyTarget) * 100) : 0

  // Group by type for allocation view
  const typeBreakdown: Record<string, number> = {}
  investments.forEach(i => {
    typeBreakdown[i.type] = (typeBreakdown[i.type] || 0) + i.value
  })
  const typeEntries = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Left: Portfolio List */}
        <div className="w-1/2 border-r border-muted/30 flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-muted/30">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">PORTFOLIO</p>
            <h1 className="font-display text-[48px] leading-[0.95] text-text uppercase tracking-tight">
              YOUR<br /><span className="text-primary">INVESTMENTS</span>
            </h1>
          </div>

          {/* Total */}
          <div className="p-8 border-b border-muted/30 flex justify-between items-end">
            <div>
              <p className="font-display text-[36px] text-primary mono-number leading-none">{formatINR(totalInvested)}</p>
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] mt-2">TOTAL INVESTED</p>
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="py-3 px-6 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary"
            >
              {showAdd ? '✕ CLOSE' : '+ ADD INVESTMENT'}
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <form onSubmit={handleAdd} className="p-6 border-b border-primary/30 bg-primary/5">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4">NEW INVESTMENT</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">NAME</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="SBI Bluechip Fund"
                    className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">TYPE</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full bg-background border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  >
                    {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">VALUE (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="₹500"
                    className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">NOTES</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Monthly SIP, etc."
                    className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="py-2 px-6 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary">
                ADD INVESTMENT
              </button>
            </form>
          )}

          {/* Investment list */}
          <div className="flex-1 p-6 overflow-auto asset-group">
            <div className="space-y-3">
              {investments.map((inv, i) =>
                editId === inv.id ? (
                  /* Edit mode */
                  <div key={inv.id} className="border border-primary p-5 bg-primary/5">
                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-3">EDITING</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input value={eName} onChange={e => setEName(e.target.value)} className="bg-transparent border border-primary/50 px-3 py-2 text-sm text-text focus:outline-none" placeholder="Name" />
                      <select value={eType} onChange={e => setEType(e.target.value)} className="bg-background border border-primary/50 px-3 py-2 text-sm text-text focus:outline-none">
                        {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="number" value={eValue} onChange={e => setEValue(e.target.value)} className="bg-transparent border border-primary/50 px-3 py-2 text-sm text-text focus:outline-none" placeholder="Value" />
                      <input value={eNotes} onChange={e => setENotes(e.target.value)} className="bg-transparent border border-primary/50 px-3 py-2 text-sm text-text focus:outline-none" placeholder="Notes" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="py-1.5 px-4 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold">SAVE</button>
                      <button onClick={() => setEditId(null)} className="py-1.5 px-4 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold">CANCEL</button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div
                    key={inv.id}
                    className="asset-item border border-muted/30 p-5 flex items-center gap-5 cursor-default group"
                    onMouseEnter={() => setHoveredAsset(i)}
                    onMouseLeave={() => setHoveredAsset(null)}
                    style={{
                      opacity: hoveredAsset !== null && hoveredAsset !== i ? 0.3 : 1,
                      borderColor: hoveredAsset === i ? '#CCFF00' : undefined,
                    }}
                  >
                    <div className="w-10 h-10 border border-muted/30 flex items-center justify-center text-lg bg-surface">
                      {inv.type === 'Mutual Fund' ? '📈' : inv.type === 'Gold' ? '🥇' : inv.type === 'Stocks' ? '📊' : inv.type === 'FD' ? '🏛' : inv.type === 'Crypto' ? '₿' : '💼'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text font-bold uppercase tracking-[0.03em]">{inv.name}</p>
                      <p className="text-[10px] text-muted uppercase tracking-[0.1em] mt-0.5">{inv.type} · {inv.notes || 'No notes'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-primary mono-number">{formatINR(inv.value)}</p>
                      <p className="text-[10px] text-muted mono-number">{inv.dateAdded}</p>
                    </div>
                    {/* Actions on hover */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => startEdit(inv.id)} className="text-muted hover:text-primary text-xs" title="Edit">✎</button>
                      <button onClick={() => deleteInvestment(inv.id)} className="text-muted hover:text-danger text-xs" title="Delete">✕</button>
                    </div>
                  </div>
                )
              )}

              {investments.length === 0 && (
                <div className="py-16 text-center">
                  <p className="font-display text-2xl text-muted uppercase">NO INVESTMENTS YET</p>
                  <p className="text-xs text-muted mt-2 uppercase tracking-[0.1em]">START WITH A SMALL SIP</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="w-1/2 flex flex-col">
          {/* Allocation Breakdown */}
          <div className="p-8 border-b border-muted/30">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">ALLOCATION</p>
            <h2 className="font-display text-[36px] leading-[0.95] text-text uppercase tracking-tight mb-6">BREAKDOWN</h2>
            <div className="space-y-3">
              {typeEntries.map(([type, value]) => {
                const pct = totalInvested > 0 ? Math.round((value / totalInvested) * 100) : 0
                return (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text uppercase tracking-[0.05em] font-bold">{type}</span>
                      <span className="text-xs text-primary mono-number">{pct}% · {formatINR(value)}</span>
                    </div>
                    <div className="h-3 bg-surface w-full">
                      <div
                        className="h-full bg-primary animate-fill-bar"
                        style={{ '--fill-width': `${pct}%`, width: `${pct}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Emergency Reserve */}
          <div className="p-8 border-b border-muted/30">
            <div className="border border-muted/30 p-6">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-bold text-lg text-text uppercase tracking-[0.05em]">EMERGENCY FUND</p>
                  <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-1">TARGET: RAINY DAY FUND</p>
                </div>
                <div className="text-right">
                  {editEmergency ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={emergencyInput}
                        onChange={e => setEmergencyInput(e.target.value)}
                        className="w-24 bg-transparent border border-primary px-2 py-1 text-sm text-primary text-right mono-number focus:outline-none"
                      />
                      <button onClick={() => { setEmergencyFund(Number(emergencyInput)); setEditEmergency(false) }} className="text-primary text-xs font-bold">✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEmergencyInput(String(emergencyFund)); setEditEmergency(true) }} className="text-right">
                      <p className="font-display text-2xl text-text mono-number">{formatINR(emergencyFund)}</p>
                      <p className="text-[10px] text-muted uppercase tracking-[0.15em]">/ {formatINR(emergencyTarget)}</p>
                    </button>
                  )}
                </div>
              </div>
              <div className="h-10 bg-surface mt-4 relative">
                <div
                  className="h-full bg-primary animate-fill-bar flex items-center justify-center"
                  style={{ '--fill-width': `${Math.min(emergencyPct, 100)}%`, width: `${Math.min(emergencyPct, 100)}%` } as React.CSSProperties}
                >
                  <span className="text-xs text-background font-bold uppercase tracking-[0.1em]">
                    {emergencyPct}% SECURED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="p-8 flex-1">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4">STUDENT INVESTING TIPS</p>
            <div className="space-y-3">
              {[
                { tip: 'Start a ₹500/month SIP — even small amounts compound over time.', icon: '💡' },
                { tip: 'Digital Gold lets you buy gold for as little as ₹10.', icon: '🥇' },
                { tip: 'Your college years are the best time to learn about investing risk-free.', icon: '🎓' },
                { tip: 'Keep 3 months of expenses as an emergency fund before investing more.', icon: '🛡' },
              ].map((item, i) => (
                <div key={i} className="border border-muted/20 p-4 flex gap-3 items-start">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-sm text-text/80">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
            <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // INVESTMENTS</p>
            <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
          </div>
        </div>
      </div>
    </div>
  )
}
