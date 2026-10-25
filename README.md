# Shopeasy

A fully responsive e-commerce website built with React and Tailwind CSS. This project features a modern design with complete shopping functionality including product browsing, cart management, and checkout process.

## Features

- 🛍️ **Product Catalog**: Browse products with filtering and search functionality
- 🛒 **Shopping Cart**: Add/remove items with quantity management
- 💳 **Checkout Process**: Complete checkout flow with form validation
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive design with Tailwind CSS
- ⚡ **Fast Performance**: Built with Vite for optimal development experience

## Tech Stack

- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Build tool and dev server
- **Context API** - State management for cart

## Getting Started

### Prerequisites

- Node.js (version 22 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Google sign-in

See [Google OAuth setup and local testing](docs/google-oauth.md) for Google Cloud Console configuration, required environment variables, and the manual flow checklist.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Site footer
│   ├── Layout.jsx      # Main layout wrapper
│   ├── ProductCard.jsx # Individual product display
│   └── ProductGrid.jsx # Product grid layout
├── context/            # React context for state management
│   └── CartContext.jsx # Shopping cart state
├── data/               # Static data
│   └── products.js     # Product data and categories
├── pages/              # Page components
│   ├── Home.jsx        # Homepage
│   ├── Products.jsx    # Product listing page
│   ├── ProductDetail.jsx # Individual product page
│   ├── Cart.jsx        # Shopping cart page
│   └── Checkout.jsx    # Checkout page
├── App.jsx             # Main app component with routing
├── main.jsx            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## Features Overview

### Homepage
- Hero section with call-to-action
- Featured products showcase
- Category browsing
- Newsletter signup

### Product Pages
- Product grid with filtering
- Search functionality
- Category-based filtering
- Sorting options (price, rating, name)

### Product Detail
- Large product images
- Detailed product information
- Add to cart functionality
- Related products
- Customer reviews display

### Shopping Cart
- Item quantity management
- Remove items functionality
- Price calculations
- Shipping and tax calculations

### Checkout
- Contact information form
- Shipping address form
- Payment information form
- Order summary
- Form validation

## Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Stacked layouts with mobile-first navigation

## Customization

### Adding Products
Edit `src/data/products.js` to add or modify products:

```javascript
{
  id: 1,
  name: "Product Name",
  price: 99.99,
  image: "image-url",
  category: "Category",
  description: "Product description",
  rating: 4.5,
  reviews: 128
}
```

### Styling
The project uses Tailwind CSS with custom configuration in `tailwind.config.js`. You can:
- Modify color schemes in the theme configuration
- Add custom components in `src/index.css`
- Update the primary brand colors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue in the repository or contact the development team.
