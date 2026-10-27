import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, Headphones, ArrowRight, Star, RotateCcw, Sparkles, Heart, PackageCheck, Shirt, Home as HomeIcon, Dumbbell, Gift } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductGrid from '../components/ProductGrid'
import SplitHeading from '../components/SplitHeading'
import { products } from '../data/products'

const categories = [
  { title: 'Electronics', copy: 'Audio, wearables and more', icon: Headphones, category: 'Electronics' },
  { title: 'Clothing', copy: 'Everyday style and seasonal picks', icon: Shirt, category: 'Clothing' },
  { title: 'Home & Kitchen', copy: 'Useful pieces for every room', icon: HomeIcon, category: 'Home & Kitchen' },
  { title: 'Furniture', copy: 'Comfort for home and office', icon: PackageCheck, category: 'Furniture' },
  { title: 'Sports', copy: 'Gear for active days', icon: Dumbbell, category: 'Sports' },
  { title: 'Gifts', copy: 'A little something for someone', icon: Gift, category: 'all' },
]

const stats = [
  { value: 10000, suffix: '+', label: 'Happy shoppers' },
  { value: products.length, suffix: '', label: 'Products to explore' },
  { value: 4.8, suffix: '/5', decimals: 1, label: 'Average rating' },
  { value: 7, suffix: ' days', label: 'Easy returns' },
]

const Home = () => {
  const pageRef = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = pageRef.current?.querySelector('.landing-hero')
      const headline = pageRef.current?.querySelector('.landing-hero .split-heading')
      if (headline) {
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .from(headline.querySelectorAll('.split-word'), { yPercent: 115, duration: 1.2, stagger: 0.09 })
          .from(hero.querySelectorAll('[data-hero]'), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
      }

      const heroDecorations = pageRef.current?.querySelectorAll('.landing-hero [data-speed]')
      heroDecorations?.forEach((element) => {
        gsap.to(element, {
          y: () => Number(element.dataset.speed) * -260,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
      if (hero) gsap.to(hero.querySelector('.landing-hero-copy'), {
        yPercent: 18, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 20%', scrub: true },
      })

      pageRef.current?.querySelectorAll('.split-heading:not(.landing-hero .split-heading)').forEach((heading) => {
        gsap.from(heading.querySelectorAll('.split-word'), {
          yPercent: 115, duration: 1, stagger: 0.07, ease: 'power4.out',
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
        })
      })

      pageRef.current?.querySelectorAll('[data-count]').forEach((element) => {
        const counter = { value: 0 }
        const target = Number(element.dataset.count)
        element.textContent = '0'
        gsap.to(counter, {
          value: target, duration: 2.2, ease: 'power2.out',
          onUpdate: () => {
            const decimals = Number(element.dataset.decimals || 0)
            const value = counter.value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            element.textContent = `${value}${element.dataset.suffix || ''}`
          },
          scrollTrigger: { trigger: element, start: 'top 90%', once: true },
        })
      })
      gsap.from(pageRef.current?.querySelectorAll('.stat-card'), {
        y: 50, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: pageRef.current?.querySelector('.stats-grid'), start: 'top 85%', once: true },
      })

      const revealBox = pageRef.current?.querySelector('.reveal-banner')
      const revealArt = pageRef.current?.querySelector('.reveal-banner-art')
      if (revealBox && revealArt) {
        gsap.fromTo(revealBox, { clipPath: 'inset(18% 18% 18% 18% round 28px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: revealBox, start: 'top 90%', end: 'top 20%', scrub: true },
        })
        gsap.fromTo(revealArt, { scale: 1.35 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: revealBox, start: 'top 90%', end: 'bottom 40%', scrub: true },
        })
      }

      const footer = document.querySelector('.site-footer')
      const footerWrap = footer?.parentElement
      if (footer && footerWrap) gsap.from(footer, {
        yPercent: -35, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: footerWrap, start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
    })

    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const track = pageRef.current?.querySelector('.category-track')
      const rail = pageRef.current?.querySelector('.category-rail')
      if (track && rail) {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40)
        gsap.to(track, {
          x: () => -distance(), ease: 'none',
          scrollTrigger: { trigger: rail, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
        })
        gsap.from(track.querySelectorAll('.category-card'), {
          rotate: 4, y: 40, autoAlpha: 0.4, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: rail, start: 'top 70%', end: 'top top', scrub: true },
        })
      }

      const showcase = pageRef.current?.querySelector('.showcase-section')
      const steps = showcase ? [...showcase.querySelectorAll('.showcase-step')] : []
      const disc = showcase?.querySelector('.showcase-disc')
      if (showcase && steps.length && disc) {
        const icons = ['🚚', '↩️', '🔒']
        let current = -1
        ScrollTrigger.create({
          trigger: showcase, start: 'top top', end: 'bottom bottom',
          onUpdate: (trigger) => {
            const index = Math.min(steps.length - 1, Math.floor(trigger.progress * steps.length))
            if (index === current) return
            current = index
            steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index))
            gsap.fromTo(disc, { scale: 0.82 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,.55)' })
            disc.textContent = icons[index]
          },
        })
        gsap.to(showcase.querySelector('.showcase-ring'), { rotate: 360, ease: 'none', scrollTrigger: { trigger: showcase, start: 'top top', end: 'bottom bottom', scrub: true } })
        gsap.to(showcase.querySelector('.showcase-ring-inner'), { rotate: -540, ease: 'none', scrollTrigger: { trigger: showcase, start: 'top top', end: 'bottom bottom', scrub: true } })
        gsap.to(disc, { rotate: 360, ease: 'none', scrollTrigger: { trigger: showcase, start: 'top top', end: 'bottom bottom', scrub: true } })
      }
    })
    return () => mm.revert()
  }, { scope: pageRef })

  return (
    <div className="landing-page" ref={pageRef}>
      <section className="landing-hero">
        <div className="hero-art" aria-hidden="true" data-speed="0.6"><svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
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
        </svg></div>
        <div className="hero-veil" />
        <div className="hero-orb hero-orb-one" data-speed="1.2" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" data-speed="0.8" aria-hidden="true" />
        <Sparkles className="hero-float hero-float-one" data-speed="1.6" aria-hidden="true" />
        <Heart className="hero-float hero-float-two" data-speed="0.7" aria-hidden="true" />
        <div className="landing-hero-copy">
          <span className="eyebrow" data-hero>Thoughtful finds for everyday life</span>
          <SplitHeading as="h1">Shopping, made <b>easy.</b></SplitHeading>
          <p data-hero>Thousands of products, fast shipping, secure payments and service that puts your satisfaction first.</p>
          <div className="landing-hero-actions" data-hero><Link to="/products" className="shopeasy-button">Shop now</Link><Link to="/categories" className="browse-link">Browse categories <ArrowRight size={18} /></Link></div>
        </div>
        <div className="rating-chip" data-hero><Star size={20} fill="currentColor" /><strong>4.8/5 rating</strong><span>based on 10,000+ reviews</span></div>
      </section>

      <section className="stats-section">
        <div className="stats-inner"><p className="eyebrow">Why ShopEasy</p><SplitHeading>Shopping made <b>simple</b></SplitHeading>
          <div className="stats-grid">{stats.map((stat) => <article className="stat-card" key={stat.label}><strong data-count={stat.value} data-suffix={stat.suffix} data-decimals={stat.decimals || 0}>{stat.value.toLocaleString('en-IN', { minimumFractionDigits: stat.decimals || 0, maximumFractionDigits: stat.decimals || 0 })}{stat.suffix}</strong><span>{stat.label}</span></article>)}</div>
        </div>
      </section>

      <section className="home-products">
        <div className="home-section-heading"><div><p className="eyebrow">Selected for you</p><SplitHeading>Fresh <b>arrivals</b></SplitHeading></div><Link to="/products" className="browse-link">Shop all products <ArrowRight size={18} /></Link></div>
        <ProductGrid products={products.slice(0, 4)} reveal />
      </section>

      <section className="category-rail">
        <div className="category-rail-inner">
          <div className="category-rail-heading"><p className="eyebrow">Find your next favourite</p><SplitHeading>Shop by <b>category</b></SplitHeading></div>
          <div className="category-track">{categories.map(({ title, copy, icon: Icon, category }) => <Link className="category-card" key={title} to={category === 'all' ? '/products' : `/products?category=${encodeURIComponent(category)}`}><Icon size={52} strokeWidth={1.3} /><div><h3>{title}</h3><p>{copy}</p></div></Link>)}</div>
        </div>
      </section>

      <section className="showcase-section">
        <div className="showcase-sticky">
          <div className="showcase-orbit"><div className="showcase-ring" /><div className="showcase-ring showcase-ring-inner" /><div className="showcase-disc">🚚</div></div>
          <div className="showcase-copy"><p className="eyebrow">The ShopEasy difference</p><SplitHeading>Why people <b>love us</b></SplitHeading>
            <div className="showcase-steps">
              <article className="showcase-step is-active"><h3><Truck /> Fast, reliable delivery</h3><p>Clear delivery estimates and dependable updates from checkout to your door.</p></article>
              <article className="showcase-step"><h3><RotateCcw /> Easy returns</h3><p>Changed your mind? Start a return without a complicated process.</p></article>
              <article className="showcase-step"><h3><ShieldCheck /> Secure checkout</h3><p>Your payment details stay protected every time you shop.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-section"><div className="reveal-section-inner"><p className="eyebrow">A little inspiration</p><div className="reveal-banner"><div className="reveal-banner-art" /><div className="reveal-banner-copy"><SplitHeading as="h2">Your next favourite thing is <b>here</b></SplitHeading><Link to="/products" className="shopeasy-button">Explore the collection</Link></div></div></div></section>
      <section className="landing-cta"><SplitHeading>Find something you <b>love</b> today.</SplitHeading><Link to="/products" className="shopeasy-button">Shop now</Link></section>
    </div>
  )
}

export default Home
