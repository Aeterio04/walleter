import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

type PlanTier = 'student' | 'standard' | 'family'

const plans = [
  {
    id: 'student' as PlanTier,
    name: 'STUDENT',
    codename: 'ARYAN',
    price: '₹0',
    period: '/FOREVER',
    tag: null,
    features: [
      '> UNLIMITED EXPENSE TRACKING',
      '> 6 BUDGET CATEGORIES',
      '> CASH FLOW DASHBOARD',
      '> BASIC INVESTMENTS',
      '> CSV EXPORT',
      '> AI COPILOT (10/DAY)',
      '— AI INSIGHTS: 3/MONTH',
    ],
    cta: 'START FREE',
  },
  {
    id: 'standard' as PlanTier,
    name: 'STANDARD',
    codename: 'PROFESSIONAL',
    price: '₹199',
    period: '/MONTH',
    tag: 'RECOMMENDED',
    features: [
      '> EVERYTHING IN STUDENT',
      '> AI INSIGHTS: 10/WEEK',
      '> UNLIMITED AI COPILOT',
      '> RECEIPT SCANNING (OCR)',
      '> RECURRING TRANSACTIONS',
      '> ADVANCED ANALYTICS',
      '> BUDGET ALERTS (SMS/EMAIL)',
      '> CUSTOM CATEGORIES',
      '> EXCEL/PDF EXPORT',
    ],
    cta: 'UPGRADE',
  },
  {
    id: 'family' as PlanTier,
    name: 'FAMILY',
    codename: 'HOUSEHOLD',
    price: '₹399',
    period: '/MONTH',
    tag: 'BEST VALUE',
    features: [
      '> EVERYTHING IN STANDARD',
      '> UP TO 5 MEMBERS',
      '> SHARED BUDGETS',
      '> BANK ACCOUNT SYNC',
      '> MULTI-CURRENCY (NRI)',
      '> FAMILY INSIGHTS',
      '> ALLOWANCE TRACKING',
      '> BILL SPLITTING',
      '> UNLIMITED AI INSIGHTS',
    ],
    cta: 'GO FAMILY',
  },
]

const featureShowcase = [
  {
    label: 'AI COPILOT',
    desc: 'Natural language expense management. Just type "spent ₹120 on food" and we handle the rest.',
    icon: '⚡',
  },
  {
    label: 'SMART INSIGHTS',
    desc: 'AI-generated editorial reports on your spending. Find leaks, optimize budgets, grow savings.',
    icon: '◆',
  },
  {
    label: 'ZERO FRICTION',
    desc: 'From pocket money to SIPs — track everything in under 5 seconds. Built for speed.',
    icon: '→',
  },
  {
    label: 'BANK-GRADE',
    desc: 'Your data never leaves your device. End-to-end encryption. No third-party analytics.',
    icon: '■',
  },
]

const comparisonRows = [
  { feature: 'AI INSIGHTS', student: '3/MONTH', standard: '10/WEEK', family: 'UNLIMITED' },
  { feature: 'AI COPILOT', student: '10/DAY', standard: 'UNLIMITED', family: 'UNLIMITED' },
  { feature: 'USERS', student: '1', standard: '1', family: 'UP TO 5' },
  { feature: 'RECEIPT SCANNING', student: '—', standard: '✓', family: '✓' },
  { feature: 'RECURRING TXN', student: '—', standard: '✓', family: '✓' },
  { feature: 'BANK SYNC', student: '—', standard: '—', family: '✓' },
  { feature: 'SHARED BUDGETS', student: '—', standard: '—', family: '✓' },
  { feature: 'MULTI-CURRENCY', student: '—', standard: '—', family: '✓' },
  { feature: 'SUPPORT', student: 'COMMUNITY', standard: '24HR', family: '4HR' },
]

export default function Landing() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('standard')
  const sparklineRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()
  const { login } = useApp()

  // Scroll-triggered animation
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sparklineRef.current) return
      const rect = sparklineRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      const paths = sparklineRef.current.querySelectorAll('.spark-path')
      paths.forEach((path, i) => {
        const offset = i * 15
        const d = `M0,${60 + offset} Q${x * 0.3},${y * 0.5 + offset} ${x * 0.5},${50 + offset} T${x},${40 - i * 10 + offset} Q${x + 20},${30 + offset} 100,${20 + offset}`
        path.setAttribute('d', d)
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.15 }
    )

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loading])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      alert('Login failed: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-primary animate-wipe flex items-center justify-center">
        <h1 className="font-display text-6xl md:text-8xl text-background uppercase tracking-tight">
          LOADING
        </h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top ticker */}
      <div className="border-b border-muted/30 overflow-hidden py-2">
        <div className="animate-ticker whitespace-nowrap flex">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="text-[10px] text-muted uppercase tracking-[0.2em] font-sans mr-12">
              NIFTY 50 ▲ 22,513 &nbsp;&nbsp;●&nbsp;&nbsp; SENSEX ▲ 74,248 &nbsp;&nbsp;●&nbsp;&nbsp; GOLD ₹72,450/10g ▲ &nbsp;&nbsp;●&nbsp;&nbsp;
              SBI FD 7.1% &nbsp;&nbsp;●&nbsp;&nbsp; BTC ₹56,21,000 ▲ &nbsp;&nbsp;●&nbsp;&nbsp; USD/INR 83.42 &nbsp;&nbsp;●&nbsp;&nbsp;
              PPF 7.1% &nbsp;&nbsp;●&nbsp;&nbsp; NIFTY IT ▲ 34,891 &nbsp;&nbsp;●&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-32px)]">
        {/* Left Side - 40% - Typography & Manifesto */}
        <div className="w-[40%] border-r border-muted/30 flex flex-col justify-between p-12 relative">
          {/* Issue tag */}
          <div className="opacity-0 animate-fade-in-up stagger-1">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-sans mb-2">
              ISSUE NO. 001 — {new Date().getFullYear()}
            </p>
            <div className="neon-underline w-16 mb-12"></div>
          </div>

          {/* Manifesto */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="opacity-0 animate-fade-in-up stagger-2">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-sans mb-6">
                THE MANIFESTO
              </p>
              <p className="font-sans text-lg text-text/80 leading-relaxed mb-8 max-w-[380px]">
                Your money is a system. Even as a student, every rupee flows through
                decisions you make daily. We don't simplify it — we <span className="text-primary font-semibold">architect</span> it.
              </p>
              <p className="font-sans text-lg text-text/80 leading-relaxed mb-8 max-w-[380px]">
                Track your hostel mess bill, split expenses with friends,
                watch your first SIP grow. Every ₹10 is a data point.
              </p>
            </div>

            {/* Stats */}
            <div className="opacity-0 animate-fade-in-up stagger-3 grid grid-cols-2 gap-8 mt-8">
              <div className="border-t border-muted/40 pt-4">
                <p className="font-display text-3xl text-primary">12K+</p>
                <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-1">STUDENTS TRACKING</p>
              </div>
              <div className="border-t border-muted/40 pt-4">
                <p className="font-display text-3xl text-text">₹4.2Cr</p>
                <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-1">BUDGETS MANAGED</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="opacity-0 animate-fade-in-up stagger-4">
            <p className="text-[10px] text-muted uppercase tracking-[0.15em]">
              © WALLETER {new Date().getFullYear()} — ALL RIGHTS RESERVED
            </p>
          </div>
        </div>

        {/* Right Side - 60% - Product Visual & Login */}
        <div className="w-[60%] flex flex-col relative">
          {/* Hero Title - spans across */}
          <div className="absolute top-[8%] left-[-120px] z-10 opacity-0 animate-fade-in-up">
            <h1 className="font-display text-[120px] leading-[0.9] text-text uppercase tracking-tight">
              WEALTH,
              <br />
              <span className="text-primary">ARCHITECTED.</span>
            </h1>
          </div>

          {/* Interactive Sparkline Chart */}
          <div className="flex-1 flex items-center justify-center pt-[280px] px-12">
            <div className="w-full max-w-[560px] relative opacity-0 animate-fade-in-up stagger-3">
              <div className="border border-muted/30 p-6">
                <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-4">
                  MONTHLY SAVINGS TRACKER — INTERACTIVE
                </p>
                <svg
                  ref={sparklineRef}
                  viewBox="0 0 100 80"
                  className="w-full h-[200px]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[20, 40, 60].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#71717A" strokeWidth="0.2" strokeDasharray="2,2" />
                  ))}
                  <path
                    className="spark-path"
                    d="M0,60 Q20,50 40,45 T70,30 Q80,25 100,20"
                    fill="none"
                    stroke="#CCFF00"
                    strokeWidth="1.5"
                  />
                  <path
                    className="spark-path"
                    d="M0,70 Q25,60 50,55 T75,45 Q85,40 100,35"
                    fill="none"
                    stroke="#71717A"
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                  />
                </svg>
                <div className="flex justify-between mt-4 text-[10px] text-muted uppercase tracking-[0.15em]">
                  <span>JAN</span><span>MAR</span><span>JUN</span><span>SEP</span><span>DEC</span>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[10px] text-primary uppercase tracking-[0.15em]">● SAVINGS</span>
                <span className="text-[10px] text-muted uppercase tracking-[0.15em]">- - AVG STUDENT</span>
              </div>
            </div>
          </div>

          {/* Bottom section: Login + Pricing */}
          <div className="flex border-t border-muted/30">
            {/* Login Terminal */}
            <div className="w-[320px] border-r border-muted/30 p-8 opacity-0 animate-fade-in-up stagger-4">
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-6">
                SYS.AUTH // TERMINAL
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">EMAIL</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                    placeholder="student@college.edu"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">PASSWORD</label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <button id="login-submit" type="submit" className="w-full py-3 bg-primary text-background font-bold text-sm uppercase tracking-[0.1em] btn-primary">
                  INITIATE SESSION
                </button>
              </form>
              <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.1em]">
                NO ACCOUNT?{' '}
                <Link to="/signup" className="text-primary cursor-pointer hover:underline">CREATE IDENTITY →</Link>
              </p>
            </div>

            {/* Pricing — 3 Column Cards (PricingTableTwo style) */}
            <div className="flex-1 p-8 opacity-0 animate-fade-in-up stagger-5">
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">SUBSCRIPTION PROTOCOL</p>
              <p className="text-[10px] text-muted/60 uppercase tracking-[0.1em] mb-5">SELECT YOUR TIER</p>
              
              <div className="flex gap-0">
                {plans.map((plan, idx) => {
                  const isCenter = plan.id === 'standard'
                  const isSelected = selectedPlan === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`flex-1 relative cursor-pointer transition-none opacity-0 animate-fade-in-up ${
                        isCenter
                          ? 'border-2 border-primary bg-surface/60 z-10 -mx-[1px]'
                          : 'border border-muted/25 bg-background'
                      } ${isSelected && !isCenter ? 'border-primary/60' : ''}`}
                      style={{ animationDelay: `${0.6 + idx * 0.12}s` }}
                    >
                      {/* Tag badge */}
                      {plan.tag && (
                        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 bg-primary px-3 py-0.5">
                          <span className="text-[8px] text-background font-bold uppercase tracking-[0.12em]">{plan.tag}</span>
                        </div>
                      )}

                      <div className={`p-5 ${plan.tag ? 'pt-6' : ''}`}>
                        {/* Plan name */}
                        <p className={`text-xs font-bold uppercase tracking-[0.12em] text-center mb-1.5 ${isCenter ? 'text-primary' : 'text-text'}`}>
                          {plan.name}
                        </p>
                        {/* Description */}
                        <p className="text-[9px] text-muted/60 text-center uppercase tracking-[0.08em] mb-4 leading-relaxed">
                          {plan.id === 'student' && 'FOR STUDENTS & BASIC USERS'}
                          {plan.id === 'standard' && 'FOR SERIOUS BUDGETERS'}
                          {plan.id === 'family' && 'FOR SHARED FINANCES'}
                        </p>

                        {/* Price */}
                        <div className="text-center mb-1">
                          <span className={`font-display text-[36px] leading-none ${isCenter ? 'text-primary' : 'text-text'} mono-number`}>
                            {plan.price}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted text-center uppercase tracking-[0.12em] mb-5">{plan.period}</p>

                        {/* CTA */}
                        <button className={`w-full py-2.5 text-[10px] uppercase tracking-[0.1em] font-bold mb-4 ${
                          isCenter
                            ? 'bg-primary text-background btn-primary'
                            : 'border border-muted/40 text-muted btn-brutal bg-transparent'
                        }`}>
                          {plan.cta}
                        </button>

                        {/* Features */}
                        <div className="space-y-2 pt-3 border-t border-muted/15">
                          {plan.features.slice(0, 5).map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-primary text-[10px] mt-[1px] flex-shrink-0">{f.startsWith('>') ? '✓' : '—'}</span>
                              <span className={`text-[9px] uppercase tracking-[0.05em] leading-snug ${f.startsWith('>') ? 'text-text/80' : 'text-muted/50'}`}>
                                {f.replace(/^> /, '').replace(/^— /, '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          NEW SECTIONS BELOW — SCROLLABLE CONTENT
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Section Divider — Scroll Indicator */}
      <div className="border-t border-muted/30 py-6 flex flex-col items-center gap-3">
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-primary to-transparent"></div>
        <p className="text-[9px] text-muted/50 uppercase tracking-[0.3em]">SCROLL TO EXPLORE</p>
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-blink"></div>
      </div>

      {/* Section 2: Feature Showcase */}
      <div
        id="features"
        ref={(el) => { sectionRefs.current['features'] = el }}
        className="border-t border-muted/30"
      >
        <div className="px-12 py-16 max-w-[1200px] mx-auto">
          <div className={`transition-all duration-700 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-baseline gap-4 mb-2">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em]">SYS.CAPABILITIES</p>
              <div className="flex-1 h-[1px] bg-muted/20"></div>
              <p className="text-[10px] text-muted uppercase tracking-[0.15em]">004 MODULES</p>
            </div>
            <h2 className="font-display text-[56px] leading-[0.95] text-text uppercase tracking-tight mb-12">
              BUILT<br />
              <span className="text-primary">DIFFERENT.</span>
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-0">
            {featureShowcase.map((feat, i) => (
              <div
                key={feat.label}
                className={`border border-muted/20 p-8 group hover:bg-surface hover:border-primary/30 transition-all duration-300 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? `${i * 150}ms` : '0ms' }}
              >
                <div className="text-3xl text-primary mb-6 group-hover:scale-110 inline-block transition-transform duration-200">{feat.icon}</div>
                <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-3 font-bold">{feat.label}</p>
                <p className="text-sm text-muted leading-relaxed group-hover:text-text/70 transition-colors duration-200">
                  {feat.desc}
                </p>
                <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-primary transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Animated Data Tape */}
      <div className="border-t border-muted/30 overflow-hidden py-4 bg-surface/30">
        <div className="animate-ticker whitespace-nowrap flex" style={{ animationDuration: '30s' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-[11px] text-muted/40 uppercase tracking-[0.3em] font-display mr-20">
              TRACK &nbsp;●&nbsp; ANALYZE &nbsp;●&nbsp; OPTIMIZE &nbsp;●&nbsp; INVEST &nbsp;●&nbsp; GROW &nbsp;●&nbsp;
              BUDGET &nbsp;●&nbsp; SAVE &nbsp;●&nbsp; ARCHITECT &nbsp;●&nbsp; COMPOUND &nbsp;●&nbsp; SECURE &nbsp;●&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Plan Comparison Table */}
      <div
        id="comparison"
        ref={(el) => { sectionRefs.current['comparison'] = el }}
        className="border-t border-muted/30"
      >
        <div className="px-12 py-16 max-w-[1000px] mx-auto">
          <div className={`transition-all duration-700 ${visibleSections.has('comparison') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-baseline gap-4 mb-2">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em]">SYS.COMPARE</p>
              <div className="flex-1 h-[1px] bg-muted/20"></div>
            </div>
            <h2 className="font-display text-[48px] leading-[0.95] text-text uppercase tracking-tight mb-12">
              PICK YOUR<br />
              <span className="text-primary">PROTOCOL.</span>
            </h2>
          </div>

          {/* Comparison Table */}
          <div className={`transition-all duration-700 delay-200 ${visibleSections.has('comparison') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px_120px] border border-muted/30 bg-surface/40">
              <div className="px-6 py-4 text-[10px] text-muted uppercase tracking-[0.15em]">FEATURE</div>
              <div className="px-4 py-4 text-[10px] text-muted uppercase tracking-[0.15em] text-center border-l border-muted/20">🎓 STUDENT</div>
              <div className="px-4 py-4 text-[10px] text-primary uppercase tracking-[0.15em] text-center border-l border-muted/20 font-bold">💼 STANDARD</div>
              <div className="px-4 py-4 text-[10px] text-text uppercase tracking-[0.15em] text-center border-l border-muted/20">👨‍👩‍👧 FAMILY</div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1fr_120px_120px_120px] border-x border-b border-muted/20 hover:bg-surface/30 transition-none group"
                style={{
                  transitionDelay: visibleSections.has('comparison') ? `${300 + i * 60}ms` : '0ms',
                }}
              >
                <div className="px-6 py-3 text-xs text-text uppercase tracking-[0.05em]">{row.feature}</div>
                <div className="px-4 py-3 text-xs text-muted text-center border-l border-muted/10 mono-number">
                  {row.student}
                </div>
                <div className="px-4 py-3 text-xs text-primary text-center border-l border-muted/10 font-bold mono-number">
                  {row.standard}
                </div>
                <div className="px-4 py-3 text-xs text-text text-center border-l border-muted/10 mono-number">
                  {row.family}
                </div>
              </div>
            ))}

            {/* Price row */}
            <div className="grid grid-cols-[1fr_120px_120px_120px] border-x border-b border-muted/30 bg-surface/20">
              <div className="px-6 py-4 text-xs text-muted uppercase tracking-[0.1em] font-bold">PRICE</div>
              <div className="px-4 py-4 text-center border-l border-muted/20">
                <span className="font-display text-lg text-text">₹0</span>
              </div>
              <div className="px-4 py-4 text-center border-l border-muted/20">
                <span className="font-display text-lg text-primary">₹199</span>
                <span className="text-[9px] text-muted uppercase">/MO</span>
              </div>
              <div className="px-4 py-4 text-center border-l border-muted/20">
                <span className="font-display text-lg text-text">₹399</span>
                <span className="text-[9px] text-muted uppercase">/MO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Social Proof / Numbers Strip */}
      <div
        id="numbers"
        ref={(el) => { sectionRefs.current['numbers'] = el }}
        className="border-t border-muted/30 bg-surface/20"
      >
        <div className="px-12 py-16 max-w-[1200px] mx-auto">
          <div className={`grid grid-cols-4 gap-0 transition-all duration-700 ${visibleSections.has('numbers') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { number: '12,483', label: 'ACTIVE STUDENTS', accent: true },
              { number: '₹4.2Cr', label: 'BUDGETS MANAGED', accent: false },
              { number: '94%', label: 'SAVED MORE IN MONTH 1', accent: true },
              { number: '< 5s', label: 'AVG TIME TO LOG EXPENSE', accent: false },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="border border-muted/20 p-8 text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className={`font-display text-[40px] leading-none mb-3 mono-number ${stat.accent ? 'text-primary' : 'text-text'}`}>
                  {stat.number}
                </p>
                <p className="text-[10px] text-muted uppercase tracking-[0.15em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: CTA Banner */}
      <div
        id="cta"
        ref={(el) => { sectionRefs.current['cta'] = el }}
        className="border-t border-muted/30"
      >
        <div className={`px-12 py-20 max-w-[900px] mx-auto text-center transition-all duration-700 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[10px] text-primary uppercase tracking-[0.3em] mb-6">SYS.PROMPT</p>
          <h2 className="font-display text-[64px] leading-[0.9] text-text uppercase tracking-tight mb-6">
            YOUR WEALTH.<br />
            <span className="text-primary">YOUR RULES.</span>
          </h2>
          <p className="font-sans text-lg text-muted leading-relaxed max-w-[500px] mx-auto mb-10">
            Join 12,000+ students who stopped guessing and started architecting their financial future.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="px-10 py-4 bg-primary text-background font-bold text-sm uppercase tracking-[0.1em] btn-primary inline-block"
            >
              CREATE YOUR IDENTITY →
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('comparison')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-10 py-4 border border-muted/50 text-muted text-sm uppercase tracking-[0.1em] font-bold btn-brutal"
            >
              COMPARE PLANS
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted/30 px-12 py-3 flex justify-between">
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">SYS.LOG // LANDING SEQUENCE COMPLETE</p>
        <p className="text-[10px] text-muted uppercase tracking-[0.15em]">BUILD: WA-V2.4.1</p>
      </div>
    </div>
  )
}
