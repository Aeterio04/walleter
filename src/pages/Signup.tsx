import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signup } = useApp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('NAME REQUIRED')
    if (!email.trim()) return setError('EMAIL REQUIRED')
    if (password.length < 6) return setError('PASSWORD MIN 6 CHARACTERS')
    if (password !== confirm) return setError('PASSWORDS DO NOT MATCH')

    try {
      await signup(name.trim(), email.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      setError((error as Error).message.toUpperCase())
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="w-[45%] border-r border-muted/30 flex flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="font-display text-[120px] text-text leading-none whitespace-nowrap" style={{ transform: `translateY(${i * 120}px)` }}>
              WALLETER WALLETER WALLETER
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <Link to="/" className="block mb-16">
            <h1 className="font-display text-xl text-text uppercase leading-none tracking-tight">WEALTH</h1>
            <span className="font-bold text-xs text-primary uppercase tracking-[0.1em]">ARCHITECTED.</span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="font-display text-[72px] leading-[0.9] text-text uppercase tracking-tight mb-8">
            CREATE<br />
            YOUR<br />
            <span className="text-primary">IDENTITY.</span>
          </h2>
          <p className="font-sans text-lg text-text/60 max-w-[360px] leading-relaxed">
            Join thousands of students who are taking control of their finances.
            Every rupee tracked is a step toward financial clarity.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] text-muted uppercase tracking-[0.15em]">
            © WALLETER {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right side - signup form */}
      <div className="w-[55%] flex items-center justify-center">
        <div className="w-full max-w-[420px] px-8">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2">SYS.AUTH // REGISTRATION</p>
          <h3 className="font-display text-3xl text-text uppercase mb-8">NEW IDENTITY</h3>

          {error && (
            <div className="border border-danger bg-danger/10 px-4 py-3 mb-6">
              <p className="text-xs text-danger font-bold uppercase tracking-[0.1em]">⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">COLLEGE EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                placeholder="rahul@college.edu"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.15em] block mb-2">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-transparent border border-muted/50 px-4 py-3 text-sm text-text font-sans focus:border-primary focus:outline-none"
                placeholder="Re-type password"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-primary text-background font-bold text-sm uppercase tracking-[0.1em] btn-primary mt-2">
              CREATE ACCOUNT
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-muted/20">
            <p className="text-[10px] text-muted uppercase tracking-[0.1em]">
              EXISTING USER?{' '}
              <Link to="/" className="text-primary hover:underline">LOGIN →</Link>
            </p>
          </div>

          {/* Plan info */}
          <div className="mt-8 border border-muted/20 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-[0.15em]">DEFAULT PLAN</p>
                <p className="text-sm text-text font-bold uppercase mt-1">OBSERVER — FREE</p>
              </div>
              <span className="text-[10px] text-primary uppercase tracking-[0.1em]">UPGRADE ANYTIME →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
