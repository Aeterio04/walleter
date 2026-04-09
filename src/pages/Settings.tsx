import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const notificationDefaults = [
  { key: 'spending_alerts', label: 'SPENDING ANOMALY ALERTS', enabled: true },
  { key: 'budget_breach', label: 'BUDGET BREACH ALERTS', enabled: true },
  { key: 'weekly_digest', label: 'WEEKLY SUMMARY', enabled: true },
  { key: 'investment_updates', label: 'INVESTMENT UPDATES', enabled: false },
  { key: 'security_alerts', label: 'SECURITY & LOGIN ALERTS', enabled: true },
]

export default function Settings() {
  const { user, togglePlan, logout } = useApp()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(notificationDefaults)
  const [showDangerConfirm, setShowDangerConfirm] = useState(false)
  const [exportFormat, setExportFormat] = useState('CSV')
  const [displayName, setDisplayName] = useState(user.name || 'Student')
  const [displayEmail, setDisplayEmail] = useState(user.email || 'student@college.edu')

  const toggleNotification = (key: string) => {
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[640px] pt-[80px] pb-16 px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">SYS.CONFIG // TERMINAL</p>
          <h1 className="font-display text-[48px] leading-[0.95] text-text uppercase tracking-tight">
            SETTINGS
          </h1>
        </div>

        {/* Profile */}
        <section className="mb-12">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4 pb-2 border-b border-muted/30">PROFILE</p>
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-[10px] text-muted uppercase tracking-[0.15em]">NAME</span>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="bg-transparent border border-muted/30 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none w-full"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-[10px] text-muted uppercase tracking-[0.15em]">EMAIL</span>
              <input
                type="email"
                value={displayEmail}
                onChange={e => setDisplayEmail(e.target.value)}
                className="bg-transparent border border-muted/30 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none w-full"
              />
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-12">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4 pb-2 border-b border-muted/30">SUBSCRIPTION PLAN</p>
          <div className="border border-muted/30 p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    user.plan === 'PRO' ? 'bg-primary text-background' : 'bg-surface text-muted border border-muted/30'
                  }`}>
                    {user.plan === 'PRO' ? 'ARCHITECT' : 'OBSERVER'}
                  </span>
                  <span className="text-xs text-muted">
                    {user.plan === 'PRO' ? '₹149/MO' : 'FREE'}
                  </span>
                </div>
                <p className="text-[10px] text-muted mt-2 uppercase tracking-[0.1em]">
                  {user.plan === 'PRO'
                    ? 'AI INSIGHTS · INVESTMENT TRACKER · BUDGET AUTOMATION'
                    : 'BASIC BUDGET · EXPENSE TRACKING · WEEKLY SUMMARY'}
                </p>
              </div>
              <button
                onClick={togglePlan}
                className={`py-2 px-6 text-xs uppercase tracking-[0.1em] font-bold transition-none ${
                  user.plan === 'PRO'
                    ? 'border border-muted/50 text-muted hover:border-danger hover:text-danger'
                    : 'bg-primary text-background btn-primary'
                }`}
              >
                {user.plan === 'PRO' ? 'DOWNGRADE' : 'UPGRADE TO PRO'}
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-12">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4 pb-2 border-b border-muted/30">NOTIFICATIONS</p>
          {notifications.map(n => (
            <div key={n.key} className="flex items-center justify-between py-3 border-b border-muted/10">
              <span className="text-xs text-text uppercase tracking-[0.05em]">{n.label}</span>
              <button
                onClick={() => toggleNotification(n.key)}
                className={`w-12 h-6 border-2 relative transition-none ${
                  n.enabled ? 'border-primary bg-primary/20' : 'border-muted/50 bg-transparent'
                }`}
              >
                <div className={`w-4 h-4 absolute top-[2px] transition-none ${
                  n.enabled ? 'right-[2px] bg-primary' : 'left-[2px] bg-muted'
                }`} />
              </button>
            </div>
          ))}
        </section>

        {/* Data Export */}
        <section className="mb-12">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4 pb-2 border-b border-muted/30">DATA EXPORT</p>
          <div className="flex items-center gap-4">
            <div className="flex border border-muted/30">
              {['CSV', 'JSON', 'PDF'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.1em] font-bold transition-none border-r border-muted/30 last:border-r-0 ${
                    exportFormat === fmt ? 'bg-primary text-background' : 'text-muted hover:text-text'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <button className="py-2 px-6 border border-primary text-primary text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent">
              EXPORT DATA
            </button>
          </div>
        </section>

        {/* Session */}
        <section className="mb-12">
          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-4 pb-2 border-b border-muted/30">SESSION</p>
          <button
            onClick={handleLogout}
            className="py-3 px-8 border border-muted/50 text-text text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent"
          >
            LOGOUT
          </button>
        </section>

        {/* Danger Zone */}
        <section>
          <p className="text-[10px] text-danger uppercase tracking-[0.2em] mb-4 pb-2 border-b border-danger/30">DANGER ZONE</p>
          {!showDangerConfirm ? (
            <button
              onClick={() => setShowDangerConfirm(true)}
              className="py-3 px-8 border-2 border-danger text-danger text-xs uppercase tracking-[0.1em] font-bold transition-none hover:bg-danger hover:text-background"
            >
              WIPE ACCOUNT
            </button>
          ) : (
            <div className="border-2 border-danger p-6">
              <p className="text-sm text-danger font-bold uppercase mb-3">CONFIRM DELETION</p>
              <p className="text-xs text-muted mb-4">This will delete all data. This cannot be undone.</p>
              <div className="flex gap-3">
                <button className="py-2 px-6 bg-danger text-background text-xs uppercase tracking-[0.1em] font-bold">CONFIRM</button>
                <button onClick={() => setShowDangerConfirm(false)} className="py-2 px-6 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal bg-transparent">ABORT</button>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="w-full px-8 py-3 border-t border-muted/30 flex justify-between mt-auto">
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // SETTINGS</p>
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
      </div>
    </div>
  )
}
