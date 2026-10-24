import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, Headphones, ArrowRight, Star } from 'lucide-react'

const Home = () => (
  <div className="landing-page">
    <section className="landing-hero">
      <div className="hero-art" aria-hidden="true"><svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa6a8" stopOpacity="0" /><stop offset="1" stopColor="#b9a68c" stopOpacity=".28" /></linearGradient>
          <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#f1b46a" stopOpacity=".75" /><stop offset="1" stopColor="#f1b46a" stopOpacity="0" /></radialGradient>
          <linearGradient id="box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6b4a2d" /><stop offset=".55" stopColor="#b98550" /><stop offset="1" stopColor="#8b5f38" /></linearGradient>
          <linearGradient id="tall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1e2a30" /><stop offset=".5" stopColor="#4a5d66" /><stop offset="1" stopColor="#1a252a" /></linearGradient>
          <radialGradient id="orb" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#fff1d6" /><stop offset=".55" stopColor="#e8b878" /><stop offset="1" stopColor="#9c6b3c" /></radialGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b272d" /><stop offset="1" stopColor="#0e171b" /></linearGradient>
        </defs>
        <rect width="1440" height="520" fill="url(#mist)" /><ellipse cx="720" cy="330" rx="520" ry="150" fill="url(#glow)" opacity=".5" />
        <rect y="410" width="1440" height="110" fill="url(#floor)" /><rect x="260" y="396" width="920" height="14" rx="2" fill="#0a1114" /><rect x="260" y="394" width="920" height="2" fill="#c89a62" opacity=".55" />
        <g><rect x="420" y="250" width="70" height="144" rx="10" fill="url(#tall)" /><rect x="438" y="232" width="34" height="22" rx="4" fill="#2e3f47" /><rect x="612" y="300" width="150" height="94" rx="6" fill="url(#box)" /><rect x="612" y="338" width="150" height="6" fill="#f0d3a8" opacity=".5" /><rect x="684" y="300" width="6" height="94" fill="#f0d3a8" opacity=".45" /><circle cx="900" cy="326" r="68" fill="url(#orb)" /><rect x="1012" y="280" width="92" height="114" rx="14" fill="url(#tall)" /><rect x="1030" y="262" width="56" height="22" rx="11" fill="none" stroke="#4a5d66" strokeWidth="6" /></g>
        <g opacity=".22" transform="translate(0,804) scale(1,-1)"><rect x="420" y="250" width="70" height="144" rx="10" fill="url(#tall)" /><rect x="612" y="300" width="150" height="94" rx="6" fill="url(#box)" /><circle cx="900" cy="326" r="68" fill="url(#orb)" /><rect x="1012" y="280" width="92" height="114" rx="14" fill="url(#tall)" /></g>
        <rect y="410" width="1440" height="110" fill="#0e171b" opacity=".35" />
      </svg></div>
      <div className="hero-veil" />
      <div className="landing-hero-copy">
        <h1>Shopping, made easy.</h1>
        <p>Thousands of products, fast shipping, secure payments and service that puts your satisfaction first.</p>
        <div className="landing-hero-actions"><Link to="/products" className="shopeasy-button">Shop now</Link><Link to="/categories" className="browse-link">Browse categories <ArrowRight size={18} /></Link></div>
      </div>
      <div className="rating-chip"><Star size={20} fill="currentColor" /><strong>4.8/5 rating</strong><span>based on 10,000+ reviews</span></div>
    </section>
    <section className="promise-section"><div className="promise-inner"><p className="eyebrow">Why ShopEasy</p><h2>From first search to your front door, nothing gets in the way.</h2><div className="promise-grid"><article><Truck /><h3>Fast shipping</h3><p>Orders leave quickly and arrive when you expect them.</p></article><article><ShieldCheck /><h3>Secure payments</h3><p>Check out with confidence. Your details stay protected.</p></article><article><Headphones /><h3>Customer care</h3><p>Real people ready to help, because your satisfaction is our priority.</p></article></div></div></section>
    <section className="landing-cta"><h2>Find something you love today.</h2><Link to="/products" className="shopeasy-button">Shop now</Link></section>
  </div>
)

export default Home
