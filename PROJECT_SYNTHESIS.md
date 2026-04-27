# 📷 LensLeaseVN - Project Documentation

**Version:** 1.0.0  
**Last Updated:** April 23, 2026  
**Status:** Development Phase

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Features](#features)
8. [Setup & Installation](#setup--installation)
9. [Available Scripts](#available-scripts)
10. [API Endpoints](#api-endpoints)
11. [Dependencies](#dependencies)
12. [Development Guidelines](#development-guidelines)

---

## Project Overview

**LensLeaseVN** is a comprehensive platform for renting cameras and lenses in Vietnam. The application enables users to:

- Browse available cameras and lenses for rental
- Create bookings for desired equipment
- Manage their rental orders
- Leave reviews and ratings
- Track rental status (ongoing, overdue, completed)

The platform uses a modern web stack with:
- **Backend:** NestJS with PostgreSQL (Supabase)
- **Frontend:** React 18 with TypeScript and Vite
- **Database:** PostgreSQL with Prisma ORM

---

## Tech Stack

### Backend Stack
| Technology | Purpose | Version |
|-----------|---------|---------|
| **NestJS** | API Framework | ^11.0.1 |
| **Prisma** | ORM & Database Client | ^5.22.0 |
| **PostgreSQL** | Database (Cloud) | - |
| **Swagger** | API Documentation | ^11.4.1 |
| **TypeScript** | Language | ^5.7.3 |
| **Jest** | Testing Framework | ^30.0.0 |
| **Class Validator** | Data Validation | ^0.15.1 |
| **Class Transformer** | DTO Transformation | ^0.5.1 |

### Frontend Stack
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | ^19.2.4 |
| **TypeScript** | Language | ~6.0.2 |
| **Vite** | Build Tool | ^8.0.4 |
| **React Router** | Routing | ^7.14.2 |
| **Axios** | HTTP Client | ^1.15.2 |
| **Material-UI** | Component Library | ^9.0.0 |
| **Emotion** | CSS-in-JS | ^11.14.0 |
| **TailwindCSS** | Utility CSS | ^4.2.2 |

### Infrastructure
- **Database Host:** Supabase (PostgreSQL)
- **Connection Pooling:** pgBouncer (IPv4 Session Pooler)
- **API Port:** 3000
- **Frontend Port:** 5173

---

## Project Structure

```
LensLeaseVN/
├── backend/                          # NestJS Backend API
│   ├── src/
│   │   ├── main.ts                  # Application entry point
│   │   ├── app.module.ts            # Root module
│   │   ├── app.controller.ts        # Root controller
│   │   ├── app.service.ts           # Root service
│   │   ├── prisma.service.ts        # Prisma client service
│   │   ├── config/
│   │   │   └── database.config.ts   # Database configuration
│   │   ├── database/
│   │   │   └── seeders/
│   │   │       └── seed_data.sql    # Database seed data
│   │   └── modules/
│   │       ├── cameras/             # Lens & Camera module
│   │       │   ├── cameras.controller.ts
│   │       │   ├── cameras.service.ts
│   │       │   ├── cameras.module.ts
│   │       │   └── dto/
│   │       │       ├── create-camera.dto.ts
│   │       │       └── update-camera.dto.ts
│   │       └── users/               # User management module
│   │           ├── users.controller.ts
│   │           ├── users.service.ts
│   │           └── users.module.ts
│   ├── test/                        # E2E tests
│   ├── prisma/
│   │   └── schema.prisma           # Database schema definition
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   ├── App.css                 # App styles
│   │   ├── assets/
│   │   │   ├── images/             # Image assets
│   │   │   └── styles/             # Style assets
│   │   ├── components/
│   │   │   ├── common/             # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── index.ts
│   │   │   └── layout/             # Layout components
│   │   │       ├── DashboardLayout.tsx
│   │   │       ├── Header.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── MainLayout.tsx
│   │   │       ├── OrderItem.tsx
│   │   │       └── HandoverForm.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Home/
│   │   │   │   └── HomePage.tsx
│   │   │   ├── Cart/
│   │   │   │   ├── CartPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Checkout/
│   │   │   │   └── CheckoutPage.tsx
│   │   │   ├── Wallet/
│   │   │   │   └── WalletPage.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── NewListingPage.tsx
│   │   │   └── Lender/
│   │   │       └── Orders.tsx
│   │   ├── routes/
│   │   │   └── index.tsx           # Route configuration
│   │   ├── context/                # React Context API
│   │   │   ├── CartContext.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useFetch.ts
│   │   │   └── index.ts
│   │   ├── services/               # API services
│   │   │   ├── api.ts              # Axios instance
│   │   │   └── lensService.ts
│   │   ├── styles/                 # CSS modules
│   │   │   ├── AdminDashboard.css
│   │   │   ├── cart.css
│   │   │   ├── checkout.css
│   │   │   ├── dashboard.css
│   │   │   ├── wallet.css
│   │   │   └── ...
│   │   ├── utils/                  # Utility functions
│   │   │   ├── format.ts
│   │   │   └── index.ts
│   │   ├── store/                  # State management
│   │   │   └── index.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       └── index.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── package.json                     # Root workspace (optional)
```

---

## Database Schema

### Entity Relationship Diagram

```
users (1) ──── (many) lens_listings
  │
  ├── (many) bookings
  └── (many) reviews

lens_listings (1) ──── (many) lens_images
  │
  ├── (many) bookings
  └── (many) reviews
```

### Table: `users`
Stores user profile information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | User identifier |
| `full_name` | Text | NULL | User's full name |
| `email` | Text | UNIQUE, NULL | Email address for login |
| `password_hash` | Text | NULL | Hashed password |
| `phone` | Text | NULL | Phone number |
| `address` | Text | NULL | User's address |
| `role` | Text | NULL | User role (admin, lender, renter) |

### Table: `lens_listings`
Stores product information for cameras and lenses available for rent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Product identifier |
| `owner_id` | UUID | FOREIGN KEY (users) | Owner of the equipment |
| `title` | Text | NULL | Product name |
| `description` | Text | NULL | Detailed description |
| `brand` | Text | NULL | Equipment brand |
| `type` | Text | NULL | Equipment type (camera, lens, etc.) |
| `price_per_day` | Decimal | NULL | Daily rental price |
| `available` | Boolean | DEFAULT: true | Availability status |
| `created_at` | Timestamp | DEFAULT: now() | Creation timestamp |

### Table: `lens_images`
Stores product images for lens listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Image identifier |
| `lens_id` | UUID | FOREIGN KEY (lens_listings) | Associated product |
| `image_url` | Text | NULL | Image URL |

### Table: `bookings`
Stores rental booking information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Booking identifier |
| `user_id` | UUID | FOREIGN KEY (users) | Renter identifier |
| `lens_id` | UUID | FOREIGN KEY (lens_listings) | Rented product |
| `start_date` | Date | NULL | Rental start date |
| `end_date` | Date | NULL | Rental end date |
| `status` | Text | NULL | Booking status (confirmed, overdue, completed) |
| `total_price` | Decimal | NULL | Total rental price |
| `created_at` | Timestamp | DEFAULT: now() | Booking timestamp |

### Table: `reviews`
Stores customer reviews and ratings for products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Review identifier |
| `user_id` | UUID | FOREIGN KEY (users) | Reviewer |
| `lens_id` | UUID | FOREIGN KEY (lens_listings) | Reviewed product |
| `rating` | Integer | NULL | Rating (1-5 stars) |
| `comment` | Text | NULL | Review comment |
| `created_at` | Timestamp | DEFAULT: now() | Review timestamp |

---

## Backend Architecture

### Module Structure

#### **AppModule** (Root Module)
Imports all feature modules and provides global services.

```typescript
Imports: ConfigModule, UsersModule, CamerasModule
Providers: AppService, PrismaService
Controllers: AppController
```

#### **CamerasModule**
Handles all lens and camera product operations.

**Key Features:**
- List all available lenses/cameras with images and owner details
- Filter by type, brand, price range
- Support for product images relationship management

**API Endpoints:**
- `GET /api/lenses` - Get all products
- `GET /api/lenses/:id` - Get product details
- `POST /api/lenses` - Create listing (Admin/Lender)
- `PUT /api/lenses/:id` - Update listing
- `DELETE /api/lenses/:id` - Remove listing

**Service Methods:**
```typescript
findAll()              // Fetch all products with relations
findOne(id)           // Get single product
create(createCameraDto)
update(id, updateCameraDto)
remove(id)
```

#### **UsersModule**
Manages user accounts, authentication, and profiles.

**Key Features:**
- User registration and authentication
- Profile management
- Role-based access control

**API Endpoints:**
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update profile
- `DELETE /api/users/:id` - Remove user

### Core Services

#### **PrismaService**
Custom Prisma wrapper service for type-safe database operations.
- Handles database connection
- Provides ORM methods for all models
- Manages connection lifecycle

#### **AppService**
Root application service for general operations.

### Configuration

#### **Environment Variables**
```env
# Database Configuration (Required)
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Server
PORT=3000 (default)

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

#### **Database Configuration**
- **Provider:** PostgreSQL
- **Host:** Supabase (Cloud Database)
- **Connection Pool:** pgBouncer with IPv4 Session Pooler
- **ORM:** Prisma v5

### API Documentation
- **Swagger UI:** Available at `http://localhost:3000/api-docs`
- **Format:** OpenAPI 3.0
- **Authentication:** Bearer Token (JWT prepared)

### CORS Configuration
```typescript
Origin: http://localhost:5173
Methods: GET, HEAD, PUT, PATCH, POST, DELETE
Credentials: Enabled (for cookie/token support)
```

---

## Frontend Architecture

### Page Structure

#### **Home Page** (`HomePage.tsx`)
Landing page showing featured products and category browsing.

#### **Admin Dashboard** (`AdminDashboard.tsx`)
Administrative interface for managing products, users, and orders.

#### **User Dashboard** (`UserDashboard.tsx`)
Personal dashboard showing user's rental history and bookings.

#### **New Listing Page** (`NewListingPage.tsx`)
Form for lenders to add new equipment for rent.

#### **Checkout Page** (`CheckoutPage.tsx`)
Purchase flow for completing rental bookings.

#### **Cart Page** (`CartPage.tsx`)
Shopping cart management with item preview and quantity adjustment.

#### **Wallet Page** (`WalletPage.tsx`)
User's wallet/payment history and balance management.

#### **Lender Orders** (`Orders.tsx`)
View incoming rental requests for lenders.

### Context API (State Management)

#### **CartContext**
Manages shopping cart state globally.
- Add/remove items
- Update quantities
- Calculate totals

### Custom Hooks

#### **useFetch**
Custom hook for data fetching with loading and error states.
```typescript
const { data, loading, error } = useFetch(url);
```

### Services

#### **API Service** (`api.ts`)
Axios instance with interceptors for:
- Base URL configuration from environment
- Request interceptors (JWT token injection)
- Response interceptors (error handling)
- Request timeout: 10 seconds

```typescript
// Features:
- Automatic Bearer token injection from localStorage
- 401 Unauthorized handling
- Centralized error handling
```

#### **Lens Service** (`lensService.ts`)
API methods for lens/camera operations.

### Component Library

#### **Common Components**
Reusable UI components for consistency:
- `Button.tsx` - Customizable button
- `Input.tsx` - Input field with validation
- `Modal.tsx` - Modal dialogs

#### **Layout Components**
- `Header.tsx` - Top navigation bar
- `Sidebar.tsx` - Side navigation
- `Footer.tsx` - Footer section
- `MainLayout.tsx` - Main layout wrapper
- `DashboardLayout.tsx` - Dashboard layout
- `OrderItem.tsx` - Rental order display
- `HandoverForm.tsx` - Equipment handover form

### Styling Strategy

**Multiple CSS Approaches:**
1. **CSS Modules** - Component-scoped styles
2. **Tailwind CSS** - Utility-first CSS
3. **Emotion** - CSS-in-JS library
4. **Material-UI** - Pre-built component themes

**Style Files:**
- Global: `index.css`, `App.css`
- Component-specific: `*.css` files per feature
- Responsive design with mobile-first approach

### Routing

**Route Configuration** (`routes/index.tsx`):
- Home page
- Product listing
- Product detail
- User authentication flows
- User dashboard
- Admin dashboard
- Checkout & cart
- Wallet

### Constants
- Route definitions (`routes.ts`)
- Application-wide constants

### Utilities
- Date/time formatting (`format.ts`)
- Helper functions

---

## Features

### Current Features ✅

#### **Product Management**
- [x] Browse available cameras and lenses
- [x] View product details with images
- [x] Display owner/lender information
- [x] Product categorization by type and brand
- [x] Price display (per day rental)

#### **User Management**
- [x] User registration (basic structure)
- [x] User profiles
- [x] Role-based system (admin, lender, renter)
- [x] User dashboard

#### **Shopping Cart**
- [x] Add/remove items
- [x] Quantity management
- [x] Persistent cart state via Context API

#### **Bookings**
- [x] Create rental bookings
- [x] View booking status
- [x] Track rental dates (start_date, end_date)
- [x] Booking history

#### **Admin Features**
- [x] Admin dashboard for management
- [x] Order/booking tracking

#### **Reviews**
- [x] Database structure for reviews
- [x] Rating system (1-5 stars)

### Planned Features 🚀

- [ ] Authentication (JWT with login/logout)
- [ ] Payment integration
- [ ] Email notifications
- [ ] Equipment handover workflow
- [ ] Late return penalties
- [ ] User ratings and reviews display
- [ ] Search and advanced filtering
- [ ] Wishlist feature
- [ ] Booking cancellation & modification
- [ ] Chat/messaging between users
- [ ] Insurance options
- [ ] Damage reporting system

---

## Setup & Installation

### Prerequisites

- **Node.js:** v18.x or v20.x (v20.17.0+ recommended)
- **npm:** Included with Node.js
- **PostgreSQL:** Supabase cloud instance
- **Git:** For version control

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd LensLeaseVN
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password%40host:port/db
# DIRECT_URL=postgresql://user:password%40host:port/db

# Run migrations (if any)
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF
```

### Step 4: Start Services

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run start:dev
# Server runs on http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Available Scripts

### Backend Scripts

```bash
npm run build          # Build for production
npm run start          # Start in production mode
npm run start:dev      # Start in development with auto-reload
npm run start:debug    # Start with debug mode
npm run start:prod     # Run built app

npm run lint           # Lint and fix TypeScript
npm run format         # Format code with Prettier

npm test              # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Generate coverage report
npm run test:debug   # Debug tests
npm run test:e2e     # Run end-to-end tests

npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Run migrations
npx prisma studio            # Open Prisma Studio (GUI)
npx prisma db seed           # Run seeders
```

### Frontend Scripts

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint with ESLint
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Products (Lenses & Cameras)

#### Get All Products
```http
GET /lenses
```
**Response:**
```json
{
  "message": "Lấy danh sách sản phẩm thành công!",
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "title": "Sony Alpha A7 IV",
      "brand": "Sony",
      "type": "camera",
      "price_per_day": 500000,
      "available": true,
      "owner": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "lens_images": [
        {
          "id": "uuid",
          "image_url": "https://..."
        }
      ]
    }
  ]
}
```

#### Get Product Details
```http
GET /lenses/:id
```

#### Create Listing (Admin/Lender)
```http
POST /lenses
Content-Type: application/json

{
  "title": "Canon EOS R5",
  "brand": "Canon",
  "type": "camera",
  "description": "Full-frame mirrorless camera",
  "price_per_day": 450000
}
```

#### Update Listing
```http
PUT /lenses/:id
```

#### Delete Listing
```http
DELETE /lenses/:id
```

### Users

#### List Users (Admin)
```http
GET /users
```

#### Get User Profile
```http
GET /users/:id
```

#### Create User
```http
POST /users
```

#### Update Profile
```http
PUT /users/:id
```

#### Delete User
```http
DELETE /users/:id
```

### Documentation
```
http://localhost:3000/api-docs  # Swagger UI
```

---

## Dependencies

### Backend Dependencies Summary

**Production:**
- `@nestjs/common` - Core NestJS functionality
- `@nestjs/core` - NestJS framework
- `@nestjs/config` - Environment configuration
- `@nestjs/platform-express` - Express adapter
- `@nestjs/swagger` - Swagger/OpenAPI documentation
- `@nestjs/mapped-types` - DTO helpers
- `@prisma/client` - Prisma ORM client
- `class-validator` - Data validation
- `class-transformer` - DTO transformation
- `reflect-metadata` - Metadata reflection
- `swagger-ui-express` - Swagger UI
- `rxjs` - Reactive extensions

**Development:**
- `@nestjs/cli` - NestJS command-line tools
- `@nestjs/schematics` - Code generators
- `@nestjs/testing` - Testing utilities
- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `ts-node` - TypeScript Node runner
- `prettier` - Code formatter
- `eslint` - Code linter
- `prisma` - Prisma CLI

**Total:** 37 packages (711 dependencies)

### Frontend Dependencies Summary

**Production:**
- `react` - UI framework
- `react-dom` - React DOM binding
- `react-router-dom` - Routing library
- `axios` - HTTP client
- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material icons
- `@emotion/react` - CSS-in-JS
- `@emotion/styled` - Styled components
- `@tailwindcss/vite` - Tailwind CSS

**Development:**
- `typescript` - TypeScript compiler
- `@types/react` - React type definitions
- `@types/react-dom` - React DOM types
- `@types/node` - Node.js types
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linter
- `eslint-plugin-react-hooks` - React hooks linting
- `eslint-plugin-react-refresh` - React refresh plugin

**Total:** 20 packages (267 dependencies)

### Installation Status ✅

✅ **Backend:** 711 packages installed successfully  
✅ **Frontend:** 267 packages installed successfully  
⚠️ **Note:** Minor engine compatibility warnings (Node.js v20.17.0 vs recommended v20.19.0+) - does not affect functionality

---

## Development Guidelines

### Code Style

#### TypeScript
- Use strict mode in `tsconfig.json`
- Use interfaces over types for public APIs
- Document complex functions with JSDoc

#### Naming Conventions
- **Classes:** PascalCase (e.g., `UserService`, `CameraController`)
- **Functions/Methods:** camelCase (e.g., `getUserById`, `calculatePrice`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_PRICE`)
- **Database Tables:** snake_case (e.g., `lens_listings`, `user_roles`)
- **Files:** kebab-case (e.g., `user.service.ts`)

#### NestJS Best Practices
- One module per feature
- Separate controllers, services, and repositories
- Use dependency injection
- Add API documentation with Swagger decorators
- Implement proper error handling

#### React Best Practices
- Functional components only (no class components)
- Use React hooks for state management
- Memoize components when necessary
- Keep components small and focused
- Use meaningful prop names

### Testing

#### Backend Testing
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

#### Frontend Testing
- Setup Jest for component testing
- Use React Testing Library
- Mock API calls in tests

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_field_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"

# Push and create pull request
git push origin feature/feature-name
```

### Environment Configuration

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://user:password@host/db
DIRECT_URL=postgresql://user:password@host/db
PORT=3000
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Debugging

#### Backend
```bash
# Start with debug mode
npm run start:debug

# Debug tests
npm run test:debug
```

#### Frontend
- Use React DevTools browser extension
- Chrome DevTools (F12)
- VSCode Debugger
- Vite debug server

### Performance Optimization

#### Backend
- Use database indexes for frequently queried fields
- Implement caching strategies
- Optimize Prisma queries with `select` and `include`
- Implement pagination for large datasets

#### Frontend
- Code splitting with React Router
- Image lazy loading
- Memoization with `React.memo`
- Bundle analysis with Vite plugins

---

## Troubleshooting

### Backend Issues

**Issue:** `DATABASE_URL error`
```
Solution: Check .env file has correct database credentials
- Ensure @ character is URL-encoded (%40)
- Verify connection string format
```

**Issue:** `Prisma schema not found`
```
Solution: Run: npx prisma generate
```

**Issue:** `Port 3000 already in use`
```
Solution: Kill process or use different port: PORT=3001 npm run start:dev
```

### Frontend Issues

**Issue:** API calls failing with 404
```
Solution: Verify VITE_API_BASE_URL in .env matches backend address
```

**Issue:** Component not updating
```
Solution: Check React hooks dependencies array
- Verify Context is properly wrapped
- Clear browser cache
```

**Issue:** Build fails
```
Solution: 
- Clear node_modules: rm -rf node_modules && npm install
- Clear Vite cache: rm -rf .vite && npm run build
```

---

## Contributing

### Code Review Checklist
- [ ] Code follows project style guide
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded values (use constants/env)
- [ ] Security considerations addressed

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Build successful

### Backend Deployment
```bash
npm run build
npm run start:prod
```

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to hosting
```

### Post-Deployment
- [ ] Verify API endpoints
- [ ] Check Swagger documentation
- [ ] Monitor error logs
- [ ] Verify database connection

---

## Additional Resources

### Documentation Links
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Material-UI Documentation](https://mui.com/)

### Tools
- Supabase Console: https://supabase.com/
- Swagger UI: http://localhost:3000/api-docs
- Prisma Studio: `npx prisma studio`

---

## Contact & Support

For questions or issues, please:
1. Check existing documentation
2. Review code comments and examples
3. Create an issue in the repository
4. Contact the development team

---

**Last Updated:** April 23, 2026  
**Project Version:** 1.0.0  
**Status:** Development Phase

