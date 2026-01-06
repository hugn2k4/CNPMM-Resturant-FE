# Restaurant Customer App

> Modern restaurant web application built with React 19, TypeScript, and Material-UI.

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)

## Features

- 🍕 Browse Restaurant Menu
- 🛒 Shopping Cart
- 📦 Order Placement & Tracking
- ❤️ Wishlist/Favorites
- 👤 User Profile & Account Management
- 🎫 Vouchers & Loyalty Points
- ⭐ Product Reviews & Ratings
- 🔔 Real-time Notifications
- 💬 Customer Support Chat
- 📱 Fully Responsive Design

## Tech Stack

**Framework:** React 19 + Vite 7  
**Language:** TypeScript 5.8  
**UI Library:** Material-UI (MUI) 7.3  
**Styling:** Tailwind CSS 4 + Emotion  
**Router:** React Router DOM 7.8  
**HTTP:** Axios  
**Real-time:** Socket.io Client  
**Forms:** React Hook Form  
**Animation:** Framer Motion  

## Prerequisites

- Node.js >= 18.x (recommended v20.19.4)
- npm >= 8.x (recommended 11.5.2)
- Backend API running (see CNPMM-Resturant-BE)

## Getting Started

```bash
# Clone repository
git clone <repository-url>
cd CNPMM-Resturant-FE

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME=Restaurant App
```

## Project Structure

```
src/
├── pages/          # Page components
│   ├── Home/      # Homepage
│   ├── Auth/      # Login, Register
│   ├── Product/   # Product list, detail, search
│   ├── Cart/      # Shopping cart
│   ├── Checkout/  # Checkout process
│   ├── MyOrders/  # Order history
│   ├── Favorites/ # Wishlist
│   ├── Profile/   # User profile
│   └── Account/   # Account management
├── components/     # Reusable components
│   ├── common/    # Header, Footer, Layout
│   ├── product/   # Product-related
│   ├── cart/      # Cart-related
│   └── order/     # Order-related
├── api/           # API services
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── routers/       # Route configuration
├── services/      # Business logic
├── types/         # TypeScript types
├── utils/         # Utilities
└── assets/        # Static assets
```

## Pages

### Home
- Hero banner
- Featured categories
- Special products
- Promotions
- Testimonials

### Products
- Product listing with filters
- Product detail with reviews
- Search functionality
- Category navigation

### Cart & Checkout
- Cart management
- Apply vouchers
- Multi-step checkout
- Order confirmation

### User Account
- Profile management
- Order history
- Wishlist
- Addresses
- Loyalty points
- Vouchers

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Key Features

### Authentication
- Email/password login
- Registration
- Password recovery
- Email verification
- JWT token management

### Shopping Experience
- Browse products by category
- Advanced search & filters
- Add to cart
- Apply discount vouchers
- Multiple payment methods

### Order Management
- Place orders
- Real-time order tracking
- Order history
- Order details
- Cancel orders
- Re-order

### Social Features
- Product reviews & ratings
- Wishlist/Favorites
- Customer support chat

### Loyalty Program
- Earn points on purchases
- Redeem points for vouchers
- View points history

## Git Workflow

### Commit Convention

This project uses **Husky + Commitlint** for enforcing commit message standards.

```
<type>(scope?): description
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/tools

**Examples:**
```bash
feat(auth): add Google OAuth
fix(cart): fix quantity update bug
docs: update README
```

### Branch Strategy

```
main              # Production
├── dev           # Development
├── feature/*     # New features
├── bugfix/*      # Bug fixes
└── hotfix/*      # Critical fixes
```

### Workflow

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/feature-name
```

## API Integration

```typescript
// Example API call
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Styling

### Material-UI Theme

```typescript
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#ff9f0d' },
    secondary: { main: '#999966' }
  }
})
```

### Tailwind CSS

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold">Title</h2>
</div>
```

## Deployment

### Build

```bash
npm run build
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Documentation

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Material-UI](https://mui.com)
- [Tailwind CSS](https://tailwindcss.com)

## License

ISC

## Team

Developed by CNPMM Team
