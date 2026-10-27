import ProductCard from './ProductCard'
import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ProductGrid = ({ products, isLoading = false, reveal = false }) => {
  const gridRef = useRef(null)
  const hasRendered = useRef(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [products])

  useGSAP(() => {
    if (!reveal || isLoading) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const cards = gridRef.current?.querySelectorAll('.product-card-link')
    if (!cards?.length) return undefined

    if (hasRendered.current) {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(cards, { autoAlpha: 0.6 }, { autoAlpha: 1, duration: 0.3, stagger: 0.025, overwrite: true })
      })
      return () => mm.revert()
    }

    hasRendered.current = true
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(cards, { autoAlpha: 0, y: 60 })
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', overwrite: true }),
      })
    })
    return () => mm.revert()
  }, { scope: gridRef, dependencies: [products, isLoading, reveal], revertOnUpdate: true })

  if (isLoading) {
    return (
      <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No products found</div>
        <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
