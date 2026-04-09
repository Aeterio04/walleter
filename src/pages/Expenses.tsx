import { useState } from 'react'
import { useApp, formatINR, formatINRSigned, CATEGORIES, type ExpenseCategory, type TransactionType } from '../context/AppContext'

export default function Expenses() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, totalCredit, totalDebit, balance } = useApp()

  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Add form state
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newDesc, setNewDesc] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Food')
  const [newType, setNewType] = useState<TransactionType>('debit')

  // Edit form state
  const [editDate, setEditDate] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('Food')
  const [editType, setEditType] = useState<TransactionType>('debit')

  const filtered = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false
    if (catFilter !== 'all' && t.category !== catFilter) return false
    return true
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDesc.trim() || !newAmount) return
    addTransaction({
      date: newDate,
      description: newDesc.trim(),
      amount: Number(newAmount),
      category: newCategory,
      type: newType,
    })
    setNewDesc('')
    setNewAmount('')
    setNewType('debit')
    setShowAdd(false)
  }

  const startEdit = (id: string) => {
    const t = transactions.find(x => x.id === id)
    if (!t) return
    setEditId(id)
    setEditDate(t.date)
    setEditDesc(t.description)
    setEditAmount(String(t.amount))
    setEditCategory(t.category)
    setEditType(t.type)
  }

  const saveEdit = () => {
    if (!editId || !editDesc.trim() || !editAmount) return
    updateTransaction(editId, {
      date: editDate,
      description: editDesc.trim(),
      amount: Number(editAmount),
      category: editCategory,
      type: editType,
    })
    setEditId(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-muted/30">
        <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">EXPENSE & INCOME LEDGER</p>
        <h1 className="font-display text-[48px] leading-[0.95] text-text uppercase tracking-tight mb-4">
          TRANSACTION<br /><span className="text-primary">TRACKER</span>
        </h1>
        <div className="flex gap-8 items-end">
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL IN</span>
            <p className="font-display text-2xl text-primary mono-number mt-1">{formatINR(totalCredit)}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TOTAL OUT</span>
            <p className="font-display text-2xl text-danger mono-number mt-1">{formatINR(totalDebit)}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase tracking-[0.15em]">BALANCE</span>
            <p className={`font-display text-2xl mono-number mt-1 ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatINR(balance)}
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="py-3 px-6 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary"
            >
              {showAdd ? '✕ CLOSE' : '+ ADD ENTRY'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 border-b border-primary/30 bg-primary/5">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4">NEW ENTRY</p>
          <div className="grid grid-cols-[120px_1fr_120px_140px_100px_120px] gap-3 items-end">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">DATE</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">DESCRIPTION</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">AMOUNT (₹)</label>
              <input
                type="number"
                min="1"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="₹0"
                className="w-full bg-transparent border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">CATEGORY</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-background border border-muted/50 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-1">TYPE</label>
              <div className="flex border border-muted/50 h-[38px]">
                <button
                  type="button"
                  onClick={() => setNewType('debit')}
                  className={`flex-1 text-[10px] uppercase tracking-[0.1em] font-bold transition-none ${
                    newType === 'debit' ? 'bg-danger text-background' : 'text-muted'
                  }`}
                >
                  OUT
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('credit')}
                  className={`flex-1 text-[10px] uppercase tracking-[0.1em] font-bold transition-none ${
                    newType === 'credit' ? 'bg-primary text-background' : 'text-muted'
                  }`}
                >
                  IN
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="h-[38px] bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary"
            >
              ADD
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="px-8 py-3 border-b border-muted/30 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted uppercase tracking-[0.15em]">TYPE:</span>
          <div className="flex border border-muted/30">
            {([['all', 'ALL'], ['credit', 'CREDIT'], ['debit', 'DEBIT']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-bold transition-none border-r border-muted/30 last:border-r-0 ${
                  filter === val ? 'bg-primary text-background' : 'text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted uppercase tracking-[0.15em]">CATEGORY:</span>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as ExpenseCategory | 'all')}
            className="bg-background border border-muted/30 px-3 py-1.5 text-[10px] text-text uppercase tracking-[0.1em] focus:outline-none focus:border-primary"
          >
            <option value="all">ALL</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <span className="text-[10px] text-muted uppercase tracking-[0.15em] ml-auto">
          {filtered.length} ENTRIES
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[90px_1fr_110px_70px_100px_60px] px-8 py-3 text-[10px] text-muted uppercase tracking-[0.15em] border-b border-muted/20">
        <span>DATE</span>
        <span>DESCRIPTION</span>
        <span>CATEGORY</span>
        <span className="text-center">TYPE</span>
        <span className="text-right">AMOUNT</span>
        <span className="text-right">ACT.</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {filtered.map(entry => (
          <div key={entry.id}>
            {editId === entry.id ? (
              /* Edit mode */
              <div className="grid grid-cols-[90px_1fr_110px_70px_100px_60px] px-8 py-2 border-b border-primary/30 bg-primary/5 gap-2 items-center">
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="bg-transparent border border-primary/50 px-2 py-1 text-xs text-text focus:outline-none"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="bg-transparent border border-primary/50 px-2 py-1 text-xs text-text focus:outline-none"
                />
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as ExpenseCategory)}
                  className="bg-background border border-primary/50 px-2 py-1 text-xs text-text focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setEditType(editType === 'credit' ? 'debit' : 'credit')}
                  className={`text-[10px] font-bold uppercase py-1 ${editType === 'credit' ? 'text-primary' : 'text-danger'}`}
                >
                  {editType === 'credit' ? 'IN' : 'OUT'}
                </button>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="bg-transparent border border-primary/50 px-2 py-1 text-xs text-text text-right focus:outline-none"
                />
                <div className="flex gap-1 justify-end">
                  <button onClick={saveEdit} className="text-primary text-xs font-bold">✓</button>
                  <button onClick={() => setEditId(null)} className="text-muted text-xs">✕</button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="grid grid-cols-[90px_1fr_110px_70px_100px_60px] px-8 py-3 border-b border-muted/10 ledger-row group items-center">
                <span className="text-xs text-muted mono-number">{entry.date}</span>
                <span className="text-sm text-text">{entry.description}</span>
                <span className="text-[10px] text-muted uppercase tracking-[0.1em]">{entry.category}</span>
                <span className={`text-[10px] text-center uppercase font-bold ${
                  entry.type === 'credit' ? 'text-primary' : 'text-danger'
                }`}>
                  {entry.type === 'credit' ? 'IN' : 'OUT'}
                </span>
                <span className={`text-sm text-right font-bold mono-number ${
                  entry.type === 'credit' ? 'text-primary' : 'text-text'
                }`}>
                  {formatINRSigned(entry.type === 'credit' ? entry.amount : -entry.amount)}
                </span>
                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100">
                  <button onClick={() => startEdit(entry.id)} className="text-muted hover:text-primary text-xs">✎</button>
                  <button onClick={() => deleteTransaction(entry.id)} className="text-muted hover:text-danger text-xs">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-8 py-16 text-center">
            <p className="font-display text-2xl text-muted uppercase">NO ENTRIES FOUND</p>
            <p className="text-xs text-muted mt-2 uppercase tracking-[0.1em]">
              {filter !== 'all' || catFilter !== 'all' ? 'TRY CHANGING FILTERS' : 'ADD YOUR FIRST TRANSACTION'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-muted/30 flex justify-between">
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // EXPENSE TRACKER</p>
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
      </div>
    </div>
  )
}
