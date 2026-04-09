import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Landing() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const sparklineRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()
  const { login } = useApp()

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login('Student', email)
    navigate('/dashboard')
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
    <div className="min-h-screen bg-background overflow-hidden">
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

            {/* Pricing */}
            <div className="flex-1 p-8 opacity-0 animate-fade-in-up stagger-5">
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-6">SUBSCRIPTION PROTOCOL</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-muted/30 p-6">
                  <p className="text-[10px] text-muted uppercase tracking-[0.15em] mb-3">OBSERVER</p>
                  <p className="font-display text-4xl text-text mb-1">₹0</p>
                  <p className="text-[10px] text-muted uppercase tracking-[0.15em] mb-6">/MONTH</p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-xs text-muted">— BASIC BUDGET</li>
                    <li className="text-xs text-muted">— EXPENSE TRACKING</li>
                    <li className="text-xs text-muted">— WEEKLY SUMMARY</li>
                  </ul>
                  <button className="w-full py-2 border border-muted/50 text-muted text-xs uppercase tracking-[0.1em] font-bold btn-brutal">SELECT</button>
                </div>
                <div className="border border-text p-6 relative">
                  <div className="absolute top-0 right-0 bg-primary px-3 py-1">
                    <span className="text-[10px] text-background font-bold uppercase tracking-[0.1em]">REC.</span>
                  </div>
                  <p className="text-[10px] text-primary uppercase tracking-[0.15em] mb-3">ARCHITECT</p>
                  <p className="font-display text-4xl text-primary mb-1">₹149</p>
                  <p className="text-[10px] text-muted uppercase tracking-[0.15em] mb-6">/MONTH</p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-xs text-text">— AI INSIGHTS ENGINE</li>
                    <li className="text-xs text-text">— INVESTMENT TRACKER</li>
                    <li className="text-xs text-text">— BUDGET AUTOMATION</li>
                    <li className="text-xs text-text">— REAL-TIME ALERTS</li>
                  </ul>
                  <button className="w-full py-2 bg-primary text-background text-xs uppercase tracking-[0.1em] font-bold btn-primary">SELECT</button>
                </div>
              </div>
            </div>
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
