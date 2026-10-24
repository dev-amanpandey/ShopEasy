import { Link } from 'react-router-dom'
import { Facebook, Instagram, MapPin, Mail, Phone } from 'lucide-react'

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-grid">
      <section className="footer-about"><Link to="/" className="footer-brand">ShopEasy</Link><p>Your one-stop destination for quality products at great prices. We're committed to providing the best shopping experience.</p><div className="social-links"><a href="#facebook" aria-label="Facebook"><Facebook /></a><a href="#twitter" aria-label="Twitter">𝕏</a><a href="#instagram" aria-label="Instagram"><Instagram /></a></div></section>
      <section><h2>Quick Links</h2><nav><Link to="/">Home</Link><Link to="/products">Products</Link><Link to="/cart">Shopping Cart</Link><Link to="/about">About Us</Link></nav></section>
      <section><h2>Customer Service</h2><nav><Link to="/contact">Contact Us</Link><Link to="/shipping">Shipping Info</Link><Link to="/returns">Returns</Link><Link to="/faq">FAQ</Link></nav></section>
      <section><h2>Contact Info</h2><ul className="contact-list"><li><MapPin /><span>123 5KM Stone Road Rajnagar Extension Ghaziabad</span></li><li><Phone /><span>+1 (555) 123-4567</span></li><li><Mail /><span>info@shopeasy.com</span></li></ul></section>
    </div>
    <div className="footer-bottom">© 2026 ShopEasy. All rights reserved.</div>
  </footer>
)

export default Footer
