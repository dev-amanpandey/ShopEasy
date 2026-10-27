import Header from './Header'
import Footer from './Footer'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className={`site-header-spacer ${pathname === '/' ? 'site-header-spacer-home' : ''}`} aria-hidden="true" />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
