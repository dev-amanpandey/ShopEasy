const renderWords = (children, keyPrefix = 'word') => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).split(/(\s+)/).map((part, index) => part.trim()
      ? <span className="word-mask" key={`${keyPrefix}-${index}`}><span className="split-word">{part}</span></span>
      : part)
  }
  if (Array.isArray(children)) return children.map((child, index) => renderWords(child, `${keyPrefix}-${index}`))
  if (children?.type) return cloneElement(children, {}, renderWords(children.props.children, `${keyPrefix}-nested`))
  return children
}

const SplitHeading = ({ as: Tag = 'h2', children, className = '', ...props }) => (
  <Tag className={`split-heading ${className}`} {...props}>{renderWords(children)}</Tag>
)

export default SplitHeading
import { cloneElement } from 'react'

