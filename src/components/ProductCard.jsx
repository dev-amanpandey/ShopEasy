import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Button, Card } from './DesignSystem'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <Link to={`/products/${product.id}`} className="group product-card-link">
      <Card className="product-card p-4 h-full">
        <div className="product-card-image aspect-square mb-4 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-1 product-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
              <span className="text-sm text-gray-500 ml-1">
              ({product.reviews})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-primary-600">
              ${product.price}
            </span>
            <Button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="product-add-button bg-primary-600 hover:bg-primary-700 text-white p-2 transition-colors duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>
      </Card>
    </Link>
  )
}

export default ProductCard
