import { Outlet, NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'DASHBOARD', icon: <DashboardIcon /> },
  { path: '/expenses', label: 'EXPENSES', icon: <ExpensesIcon /> },
  { path: '/insights', label: 'AI INSIGHTS', icon: <InsightsIcon /> },
  { path: '/budget', label: 'BUDGET', icon: <BudgetIcon /> },
  { path: '/investments', label: 'INVESTMENTS', icon: <InvestmentsIcon /> },
  { path: '/settings', label: 'SETTINGS', icon: <SettingsIcon /> },
]

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ExpensesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function InsightsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 16L6 8L10 12L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M13 2H16V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3" width="16" height="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function InvestmentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14L6 10L10 12L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <circle cx="16" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1V3M9 15V17M1 9H3M15 9H17M3.5 3.5L5 5M13 13L14.5 14.5M14.5 3.5L13 5M5 13L3.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-[200px] min-h-screen border-r border-muted/30 flex flex-col fixed top-0 left-0 z-50 bg-background">
        {/* Logo */}
        <div className="p-6 border-b border-muted/30">
          <NavLink to="/dashboard" className="block">
            <h1 className="font-display text-xl text-text uppercase leading-none tracking-tight">
              WEALTH
            </h1>
            <span className="font-bold text-xs text-primary uppercase tracking-[0.1em]">
              ARCHITECTED.
            </span>
          </NavLink>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] border-l-[3px] transition-none ${
                  isActive
                    ? 'border-primary bg-surface text-primary'
                    : 'border-transparent text-muted hover:text-text hover:bg-surface/50'
                }`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Status bar */}
        <div className="p-4 border-t border-muted/30">
          <p className="font-sans text-[10px] text-muted uppercase tracking-[0.15em]">
            SYS.STATUS: ONLINE
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[200px] min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
