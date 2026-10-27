import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSmoothScroll } from '../scroll/SmoothScrollProvider'

const SearchForm = ({ mobile = false, value, onChange, onSubmit }) => (
  <form onSubmit={onSubmit} className={mobile ? 'header-search header-search-mobile' : 'header-search'} role="search">
    <label className="sr-only" htmlFor={mobile ? 'mobile-search' : 'site-search'}>Search products</label>
    <input id={mobile ? 'mobile-search' : 'site-search'} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search products..." />
    <button type="submit" aria-label="Search products"><Search size={19} aria-hidden="true" /></button>
  </form>
)

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { setScrollStopped } = useSmoothScroll()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const home = location.pathname === '/'
  const navigation = [{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }, { name: 'Categories', href: '/categories' }]

  useEffect(() => {
    setScrollStopped(isMenuOpen)
    return () => setScrollStopped(false)
  }, [isMenuOpen, setScrollStopped])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  return (
    <header className={`site-header ${home ? 'site-header-home' : ''}`}>
      <div className="site-header-inner">
        <Link to="/" className="brand"><span className="brand-mark"><ShoppingBag size={20} /></span><span>ShopEasy</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navigation.map((item) => <Link key={item.name} to={item.href} className={location.pathname === item.href ? 'active' : ''}>{item.name}</Link>)}</nav>
        <SearchForm value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearch} />
        <div className="header-actions">
          {isAuthenticated ? <>
            {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
            <Link to="/profile">{user?.avatar ? <img className="avatar-mini" src={user.avatar} alt="" /> : <span className="avatar-mini">{(user?.name || 'U').charAt(0).toUpperCase()}</span>}<span className="profile-label">My profile</span></Link>
            <button className="header-link" onClick={logout}>Logout</button>
          </> : <><Link to="/login">Login</Link><Link className="signup-link" to="/signup">Sign up</Link></>}
          <Link className="cart-link" to="/cart" aria-label={`Cart, ${getTotalItems()} items`}><ShoppingBag size={23} />{getTotalItems() > 0 && <span>{getTotalItems()}</span>}</Link>
          <button className="menu-toggle" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {isMenuOpen && <div className="mobile-menu"><SearchForm mobile value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearch} />{navigation.map((item) => <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)}>{item.name}</Link>)}{isAuthenticated ? <><Link to="/profile" onClick={() => setIsMenuOpen(false)}>My profile</Link><button onClick={() => { logout(); setIsMenuOpen(false) }}>Logout</button></> : <><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link><Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign up</Link></>}</div>}
    </header>
  )
}

export default Header
