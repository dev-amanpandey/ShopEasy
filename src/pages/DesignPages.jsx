import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Truck, ShieldCheck, Headphones, MapPin, Phone, Mail, PackageCheck, RotateCcw, Globe2, CheckCircle2 } from 'lucide-react'
import { Input, PageHeader } from '../components/DesignSystem'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

const Content = ({ children, className = '' }) => <div className={`shopeasy-main ${className}`}>{children}</div>

export const CategoriesPage = () => {
  const groups = [
    ['Electronics', 'Headphones, watches, mice and more', 'Electronics'],
    ['Home & Kitchen', 'Coffee makers, bottles and everyday essentials', 'Home & Kitchen'],
    ['Furniture', 'Comfortable pieces for home and office', 'Furniture'],
    ['Clothing', 'Soft, sustainable everyday wear', 'Clothing'],
    ['Sports', 'Gear for training, yoga and staying active', 'Sports'],
  ]
  return <><PageHeader title="Categories" description="Pick an aisle and start browsing." /><Content><div className="category-tiles">{groups.map(([name, copy, category]) => <Link className="category-tile" key={name} to={`/products?category=${encodeURIComponent(category)}`}><span className="eyebrow">Shop by category</span><h2>{name}</h2><p>{copy}</p><span className="tile-action">Browse →</span></Link>)}<Link className="category-tile category-tile-all" to="/products"><span className="eyebrow">The full collection</span><h2>All products</h2><p>Everything in one place</p><span className="tile-action">Shop now →</span></Link></div></Content></>
}

const infoPageContent = {
  Shipping: { title: 'Shipping Info', intro: 'What shipping costs and when your order arrives.', rows: [['Free shipping', 'Orders over $50 ship free.'], ['Orders under $50', 'A shipping fee applies and is shown at checkout before you pay.'], ['Delivery times', '[DELIVERY TIME ESTIMATES]'], ['Where we deliver', '[DELIVERY AREAS]'] ] },
  Returns: { title: 'Returns', intro: 'Simple, 30-day returns on every order.', rows: [['30-day return policy', 'Not right for you? Return your order within 30 days.'], ['2-year warranty included', 'Products come with a 2-year warranty at no extra cost.'], ['How to start a return', '[DESCRIBE YOUR RETURN PROCESS]'] ] },
}

export const PolicyPage = ({ type }) => {
  const page = infoPageContent[type]
  const icons = type === 'Shipping' ? [Truck, PackageCheck, RotateCcw, Globe2] : [RotateCcw, ShieldCheck, PackageCheck]
  return <><PageHeader title={page.title} description={page.intro} /><Content><div className="policy-list">{page.rows.map(([title, copy], index) => { const Icon = icons[index]; return <article className="policy-card" key={title}><span className="policy-icon"><Icon /></span><div><h2>{title}</h2><p className={copy.startsWith('[') ? 'accent-copy' : ''}>{copy}</p></div></article> })}</div><Link className="shopeasy-button" to="/contact">Contact Us</Link></Content></>
}

const faqItems = [
  ['Is shipping free?', 'Yes, on orders over $50. Smaller orders pay a shipping fee that is shown at checkout.'],
  ['What is your return policy?', 'You can return an order within 30 days.'],
  ['Do products come with a warranty?', 'Yes. Every product includes a 2-year warranty.'],
  ['Is my payment information safe?', 'Yes. Checkout is secure and your payment information is encrypted.'],
  ['How long will delivery take?', '[DELIVERY TIME ESTIMATES]'],
  ['How do I contact you?', 'Email info@shopeasy.com or call +1 (555) 123-4567.'],
]
export const FAQPage = () => <><PageHeader title="FAQ" description="Quick answers to the questions we hear most." /><Content><div className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p className={answer.startsWith('[') ? 'accent-copy' : ''}>{answer}</p></details>)}</div></Content></>

export const AboutPage = () => <><PageHeader title="About Us" description="Quality products, fair prices and service we stand behind." /><Content><p className="about-lead">Your one-stop destination for quality products at great prices. We're committed to providing the best shopping experience.</p><div className="about-values"><article><Truck /><h2>Fast shipping</h2><p>Orders leave quickly and arrive when you expect them.</p></article><article><ShieldCheck /><h2>Secure payments</h2><p>Check out with confidence. Your details stay protected.</p></article><article><Headphones /><h2>Customer care</h2><p>Real people ready to help, because your satisfaction is our priority.</p></article></div><article className="story-card"><h2>Our story</h2><p className="accent-copy">[YOUR STORY: who you are, why you started ShopEasy]</p></article><div className="about-cta"><Link to="/products" className="shopeasy-button">Shop now</Link><span>Rated 4.8/5 based on 10,000+ reviews</span></div></Content></>

export const ContactPage = () => {
  const [message, setMessage] = useState('')
  return <><PageHeader title="Contact Us" description="Questions about an order or a product? Reach us any way you like." /><Content><div className="contact-layout"><section className="contact-details" aria-label="Contact details">{[[MapPin, 'Visit us', '123 5KM Stone Road Rajnagar Extension Ghaziabad'], [Phone, 'Call us', '+1 (555) 123-4567'], [Mail, 'Email us', 'info@shopeasy.com']].map(([Icon, label, value]) => <article key={label}><Icon /><div><span>{label}</span><p>{value}</p></div></article>)}</section><section className="contact-form-card"><h2>Send us a message</h2><form onSubmit={(event) => { event.preventDefault(); setMessage('This form is not connected yet. Please email info@shopeasy.com.') }}><Input label="Name" id="contact-name" required /><Input label="Email" id="contact-email" type="email" required /><label htmlFor="contact-message">Message</label><textarea id="contact-message" rows="5" required /><button className="shopeasy-button" type="submit">Send message</button>{message && <p role="status" className="accent-copy">{message}</p>}</form></section></div></Content></>
}

export const OrderConfirmationPage = () => {
  const location = useLocation()
  const { token } = useAuth()
  const orderId = new URLSearchParams(location.search).get('id')
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    const loadOrder = async () => {
      if (!orderId) {
        setError('Order details are unavailable because no order ID was provided.')
        setIsLoading(false)
        return
      }
      if (!token) {
        setError('Sign in to view this order confirmation.')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const data = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}`, { token })
        if (isActive) setOrder(data.order)
      } catch (requestError) {
        if (isActive) setError(requestError.message || 'Could not load this order.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    loadOrder()
    return () => { isActive = false }
  }, [orderId, token])

  const shipping = order?.shippingAddress
  const shippingAddress = shipping
    ? `${shipping.firstName} ${shipping.lastName}, ${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`
    : '[SHIPPING ADDRESS FROM CHECKOUT]'

  return <><section className="shopeasy-page-header"><div className="confirmation-header"><span className="confirmation-icon"><CheckCircle2 /></span><h1>Thank you for your order</h1><p>We've received your order and it is on its way to being packed.</p></div></section><Content className="confirmation-page">{isLoading && <p role="status">Loading your order…</p>}{error && <p className="accent-copy" role="alert">{error}</p>}{order && <><div className="confirmation-grid"><section className="confirmation-card"><h2>Order details</h2><dl>{[['Order number', order._id], ['Estimated delivery', '[ESTIMATED DELIVERY DATE]'], ['Shipping to', shippingAddress], ['Payment', order.paymentMethod || 'Card'], ['Confirmation sent to', shipping?.email || '[EMAIL FROM CHECKOUT]']].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section><aside className="confirmation-card"><h2>Order Summary</h2><ul className="confirmation-items">{order.items.map((item) => <li key={item.id}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>Qty: {item.quantity}</span></div><b>${(item.price * item.quantity).toFixed(2)}</b></li>)}</ul><div className="confirmation-total"><span>Total</span><strong>${Number(order.total).toFixed(2)}</strong></div></aside></div><div className="confirmation-actions"><Link className="shopeasy-button" to="/products">Continue Shopping</Link><Link className="shopeasy-button-outline" to="/profile">View My Orders</Link></div></>}</Content></>
}
