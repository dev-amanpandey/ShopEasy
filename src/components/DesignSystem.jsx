import { Link } from 'react-router-dom'

export const Button = ({ variant = 'gold', as: Component = 'button', className = '', ...props }) => (
  <Component className={`${variant === 'outline' ? 'shopeasy-button-outline' : 'shopeasy-button'} ${className}`} {...props} />
)

export const Input = ({ label, id, className = '', ...props }) => (
  <label className="block" htmlFor={id}><span className="shopeasy-label">{label}</span><input id={id} className={`shopeasy-input ${className}`} {...props} /></label>
)

export const Card = ({ className = '', ...props }) => <section className={`shopeasy-card ${className}`} {...props} />

export const PageHeader = ({ title, description }) => (
  <header className="shopeasy-page-header"><div className="max-w-7xl mx-auto"><h1>{title}</h1>{description && <p>{description}</p>}</div></header>
)

export const Breadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" className="shopeasy-breadcrumb">{items.map((item, index) => <span key={item.label}>{index > 0 && <span aria-hidden="true"> / </span>}{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>
)

export const QuantityStepper = ({ value, onChange, min = 1 }) => (
  <div className="shopeasy-stepper"><button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(min, value - 1))}>−</button><span>{value}</span><button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>+</button></div>
)
