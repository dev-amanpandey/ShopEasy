import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AtSign, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../services/api'
import './Login.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const googleErrorMessages = {
  google_denied: 'Google sign-in was cancelled. You can try again whenever you’re ready.',
  invalid_state: 'This sign-in attempt expired or could not be verified. Please try again.',
  email_unverified: 'Verify your email with Google before using it to sign in.',
  google_unavailable: 'Google sign-in is not configured yet. Please use email and password.',
  account_link_conflict: 'This email is already connected to a different Google account. Sign in with your existing method.',
  google_failed: 'Google sign-in could not be completed. Please try again.',
}

const ShopBackground = () => (
  <div className="auth-backdrop" aria-hidden="true">
    <div className="auth-backdrop-base" />
    <div className="auth-grid" />
    <div className="auth-orb auth-orb-one" />
    <div className="auth-orb auth-orb-two" />
    <div className="auth-orb auth-orb-three" />
    <div className="auth-ring auth-ring-one" />
    <div className="auth-ring auth-ring-two" />
    <div className="auth-float auth-float-bag"><svg viewBox="0 0 64 64"><path d="M14 20h36l3 36H11l3-36z"/><path d="M23 20a9 9 0 0 1 18 0"/></svg></div>
    <div className="auth-float auth-float-cart"><svg viewBox="0 0 64 64"><path d="M6 12h8l6 28h28l6-20H18"/><circle cx="24" cy="50" r="4"/><circle cx="44" cy="50" r="4"/></svg></div>
    <div className="auth-float auth-float-gift"><svg viewBox="0 0 64 64"><rect x="8" y="24" width="48" height="32" rx="3"/><path d="M8 34h48M32 24v32M32 24c-8-14-20-6-12 0M32 24c8-14 20-6 12 0"/></svg></div>
    <div className="auth-float auth-float-tag"><svg viewBox="0 0 64 64"><path d="M32 6 8 30l26 26 22-22V6H32z"/><circle cx="44" cy="18" r="4"/></svg></div>
    <div className="auth-float auth-float-heart"><svg viewBox="0 0 64 64"><path d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z"/></svg></div>
    <div className="auth-float auth-float-star"><svg viewBox="0 0 64 64"><path d="m32 6 7 17 18 2-14 12 4 18-15-10-15 10 4-18L7 25l18-2 7-17z"/></svg></div>
  </div>
)

const Field = ({ id, label, type, value, onChange, placeholder, autoComplete, error, icon: Icon }) => (
  <div className="auth-field-group">
    <label htmlFor={id}>{label}</label>
    <div className="auth-input-wrap">
      <Icon aria-hidden="true" />
      <input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
    </div>
    {error && <p className="auth-field-error" id={`${id}-error`} role="alert">{error}</p>}
  </div>
)

const Login = ({ initialMode = 'login' }) => {
  const { login, signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = location.state?.from?.pathname || '/profile'
  const [mode, setMode] = useState(() => location.hash === '#signup' || initialMode === 'signup' ? 'signup' : 'login')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const isSignup = mode === 'signup'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    if (location.hash === '#signup') setMode('signup')
    else if (location.hash === '#login') setMode('login')
  }, [location.hash])

  useEffect(() => {
    const errorCode = searchParams.get('error')
    if (errorCode) setServerError(googleErrorMessages[errorCode] || 'Sign-in could not be completed. Please try again.')
  }, [searchParams])

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setErrors({})
    setServerError('')
    const hash = nextMode === 'signup' ? '#signup' : '#login'
    if (location.hash !== hash) navigate(`${location.pathname}${hash}`, { replace: true, state: location.state })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
    setServerError('')
  }

  const handleGoogleSignIn = () => {
    if (!API_BASE_URL) {
      setServerError('The backend URL is not configured. Set VITE_API_BASE_URL and try again.')
      return
    }
    setIsGoogleLoading(true)
    const googleUrl = new URL('/auth/google', API_BASE_URL)
    googleUrl.searchParams.set('redirect', from)
    window.location.assign(googleUrl.toString())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (isSignup && !formData.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!formData.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(formData.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!formData.password) nextErrors.password = 'Enter your password.'
    if (isSignup && formData.password && formData.password.length < 6) nextErrors.password = 'Use at least 6 characters.'
    if (isSignup && !formData.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (isSignup && formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    setServerError('')
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      if (isSignup) {
        await signup({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password })
        navigate('/profile', { replace: true })
      } else {
        await login({ email: formData.email.trim(), password: formData.password })
        navigate(from, { replace: true })
      }
    } catch (error) {
      setServerError(error.message || (isSignup ? 'Signup failed' : 'Login failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <ShopBackground />
      <div className="auth-glass-card">
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'is-active' : ''} onClick={() => changeMode('login')}>Login</button>
          <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'is-active' : ''} onClick={() => changeMode('signup')}>Sign up</button>
        </div>
        <h1>{isSignup ? 'Create account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">{isSignup ? 'Join ShopEasy and start shopping' : 'Log in to continue shopping'}</p>

        {serverError && <div className="auth-server-error" role="alert">{serverError}</div>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isSignup && <Field id="name" label="Full name" type="text" value={formData.name} onChange={handleChange} placeholder="Your name" autoComplete="name" error={errors.name} icon={User} />}
          <Field id="email" label="Email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" error={errors.email} icon={AtSign} />
          <Field id="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete={isSignup ? 'new-password' : 'current-password'} error={errors.password} icon={Lock} />
          {isSignup && <Field id="confirmPassword" label="Confirm password" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" autoComplete="new-password" error={errors.confirmPassword} icon={Lock} />}
          {!isSignup && <div className="auth-helper-row"><span>Secure checkout, always</span><a href="#forgot-password" onClick={(event) => event.preventDefault()}>Forgot password?</a></div>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? (isSignup ? 'Creating account…' : 'Logging in…') : (isSignup ? 'CREATE ACCOUNT' : 'LOGIN')}</button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>
        <div className="auth-socials"><button type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>{isGoogleLoading ? 'Connecting to Google…' : 'Continue with Google'}</button><button type="button" onClick={() => {}}>Apple</button></div>
        <p className="auth-switch">{isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}<button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>{isSignup ? 'Login' : 'Sign up'}</button></p>
      </div>
    </section>
  )
}

export default Login
