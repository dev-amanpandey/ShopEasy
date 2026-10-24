# ShopEasy UI redesign: design spec

The 15 files in `design/pages/` are the approved designs, one HTML file per page.
Treat them as the visual source of truth (layout, spacing, sizes, colours, copy).

## How to read the files
- Each file is a "design component" page. Ignore the wrapper: `<x-dc>`, `<helmet>`, the `<script type="text/x-dc">` block, `support.js`, and `data-props`.
- `{{accent}}` means the accent colour `#d1a063`.
- `<sc-for list="{{products}}" as="p">` is a loop; the 8 products and their data are in the script block of `Products.dc.html`.
- Styles are inline. Convert them into your project's styling approach (Tailwind classes or CSS modules). Keep the exact values.
- Photo placeholders (grey boxes with an image icon) must be replaced with the site's real product images.
- Text in gold square brackets, like [DELIVERY TIME ESTIMATES], is intentional placeholder copy to be filled in by the owner. Keep it exactly as is.

## Design tokens
- Font: Josefin Sans (Google Fonts), weights 300, 400, 500, 600. Headings are weight 300 (light) and large; UI text is 400 to 600.
- Page background: #0e171b. Nav / card surface: #16232a. Footer: #0a1114.
- Text: #e8edf4 (body), #f1f4f8 (headings). Muted text: rgba(232,237,244,.78 to .9). Never lower than that, for contrast.
- Accent (buttons, prices, active links, icons, focus ring): #d1a063. Text on accent: #1d1710.
- Borders: 1px solid rgba(232,237,244,.12) for cards; rgba(232,237,244,.38) for inputs.
- Danger (delete / clear cart): #ff9a90. Success dot: #4cc38a.
- Page header band: radial-gradient(ellipse 50% 120% at 15% 0%, rgba(196,160,118,.22), transparent 70%) over linear-gradient(180deg, #2a373e, #18242a 55%, #0e171b).
- Square corners (no border radius) on buttons, inputs and cards. Content max width 1280px, side padding 80px (smaller on mobile).
- Minimum touch target 44px. Visible gold focus outline on every interactive element.

## Shared components to build once
Navbar (logged-out and logged-in variants, search, cart badge), Footer (4 columns), Button (primary gold, ghost outline), Input / Label, Card, ProductCard, PageHeader band, QuantityStepper, Breadcrumb.
The landing page nav sits transparently over the hero. All other pages use the solid #16232a nav.

## Pages and routes
Main (landing), Login, SignUp, Products, ProductDetail, Categories, Cart, Checkout, OrderConfirmation, Dashboard, Contact, Shipping, Returns, FAQ, About.
Link destinations are in the `href` attributes (for example `Cart.dc.html` becomes `/cart`). Map them to the existing routes.

## Rules
- Do NOT change business logic, API calls, auth, cart state, routing or data fetching. Only change markup and styling.
- Do not invent content. Use the existing site's real data where the design shows sample data.
- Layouts must work from 360px wide up to 1440px+. Grids collapse to one column on phones.
