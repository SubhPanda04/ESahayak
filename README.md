# Buyer Lead Management System

A modern, full-stack web application for managing buyer leads built with Next.js 15, TypeScript, Drizzle ORM, and SQLite.

## Screenshots
![Alt text](https://github.com/user-attachments/assets/cb2163d9-bb58-4fa9-86f9-28ceacac8b65)
![Alt text](https://github.com/user-attachments/assets/6baadd97-a440-4aa1-a35f-b59852e4db4c)
![Alt text](https://github.com/user-attachments/assets/cf6cb2af-37d3-4561-9156-405a4f56b92b)
![Alt text](https://github.com/user-attachments/assets/13dadc29-6747-4f39-8362-b26bdadbfe41)


## 🚀 Features

- ✅ **Lead Management**: Create, view, edit, and manage buyer leads
- ✅ **Advanced Filtering**: Filter leads by city, property type, status, timeline
- ✅ **Search Functionality**: Search leads by name, phone, or email
- ✅ **Data Export/Import**: CSV export and import capabilities
- ✅ **User Authentication**: Secure login system with session management
- ✅ **Responsive Design**: Modern UI with Tailwind CSS
- ✅ **Real-time Updates**: Server-side rendering with optimized performance
- ✅ **Type Safety**: Full TypeScript implementation with Zod validation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd buyer-lead-management
npm install
```

### 2. Database Setup

The application uses SQLite with Drizzle ORM. The database file is automatically created when you run the application.

```bash
# The database schema is defined in src/lib/db/schema.ts
# Migrations are handled automatically by Drizzle
```

### 3. Environment Variables

No environment variables are required for basic functionality. The app uses:
- SQLite database (file-based)
- Session-based authentication (demo mode)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── buyers/            # Buyer management pages
│   │   ├── page.tsx       # Buyers list page
│   │   ├── [id]/          # Dynamic buyer pages
│   │   │   ├── page.tsx   # Buyer detail view
│   │   │   └── edit/      # Edit buyer page
│   │   ├── new/           # Create new buyer
│   │   ├── import/        # CSV import
│   │   └── api/           # API routes
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── Filters.tsx       # Filter component
├── lib/                   # Business logic & utilities
│   ├── actions.ts         # Server actions
│   ├── auth.ts           # Authentication logic
│   ├── db/               # Database configuration
│   │   ├── db.ts         # Drizzle client
│   │   └── schema.ts     # Database schema
│   ├── queries.ts        # Database queries
│   ├── validations.ts    # Zod validation schemas
│   └── rateLimit.ts      # Rate limiting
└── __tests__/            # Test files
```

## 🎨 Design Decisions

### Validation Strategy

**Where validation lives:**
- **Client-side**: Basic HTML5 validation for required fields
- **Server-side**: Comprehensive Zod validation in `src/lib/validations.ts`
- **Database-level**: Schema constraints in `src/lib/db/schema.ts`

**Why this approach:**
- **Security**: Server-side validation prevents malicious data
- **UX**: Client-side validation provides immediate feedback
- **Type Safety**: Zod schemas generate TypeScript types automatically

### SSR vs Client Components

**Server Components (SSR):**
- `src/app/buyers/page.tsx` - Buyers list (needs SEO, fast initial load)
- `src/app/buyers/[id]/page.tsx` - Buyer details (data fetching)
- `src/app/buyers/[id]/edit/page.tsx` - Edit form (server actions)

**Client Components:**
- `src/components/Filters.tsx` - Interactive filtering
- Form components with `useActionState` (when needed)

**Why this balance:**
- **Performance**: Server components for fast initial page loads
- **Interactivity**: Client components for dynamic features
- **SEO**: Server rendering for search engine optimization

### Ownership Enforcement

**How ownership is enforced:**
- **Database Level**: `ownerId` foreign key in buyers table
- **Query Level**: All queries filter by `userId`
- **Authentication**: `requireAuth()` middleware on protected routes

**Implementation:**
```typescript
// In queries.ts
const whereConditions = [eq(buyers.ownerId, userId)];

// In actions.ts
const userId = await requireAuth();
```

**Why this approach:**
- **Security**: Multi-layer protection against data leaks
- **Performance**: Database-level filtering is most efficient
- **Maintainability**: Centralized ownership logic

## ✅ What's Done

### Core Features
- ✅ **Lead CRUD Operations**: Create, read, update, delete buyer leads
- ✅ **Advanced Filtering**: City, property type, status, timeline filters
- ✅ **Search**: Full-text search across name, phone, email
- ✅ **Pagination**: Efficient pagination with page size controls
- ✅ **CSV Export**: Export filtered results to CSV
- ✅ **Authentication**: Session-based login system
- ✅ **Responsive UI**: Mobile-friendly design with Tailwind CSS

### Technical Implementation
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Zod Validation**: Comprehensive input validation
- ✅ **Drizzle ORM**: Type-safe database operations
- ✅ **Server Actions**: Modern Next.js server action pattern
- ✅ **Error Handling**: Proper error boundaries and user feedback
- ✅ **Database Schema**: Well-designed relational schema

### UI/UX
- ✅ **Modern Design**: Clean, professional interface
- ✅ **Status Badges**: Visual status indicators
- ✅ **Loading States**: Proper loading and error states
- ✅ **Form Validation**: Real-time validation feedback
- ✅ **Responsive Layout**: Works on all device sizes

## ❌ What's Skipped & Why

### Authentication Features
- **Multi-user support**: Skipped for demo purposes - uses single demo user
- **Password authentication**: Not needed for demo - uses email-only login
- **User registration**: Out of scope for this demo

### Advanced Features
- **Email notifications**: Would require email service integration
- **Lead assignment**: Single-user demo doesn't need assignment features
- **Lead scoring**: Complex business logic not implemented
- **Bulk operations**: CRUD operations cover basic needs
- **Audit logging**: Basic history tracking implemented

### Performance Optimizations
- **Database indexing**: Basic schema works for demo scale
- **Caching**: Not needed for small dataset
- **CDN**: Static assets served locally
- **Database connection pooling**: SQLite doesn't need pooling

### Testing
- **Unit tests**: Basic validation tests exist
- **Integration tests**: Not implemented (would need test database)
- **E2E tests**: Out of scope for demo

### Deployment & DevOps
- **CI/CD**: Not configured for demo
- **Environment management**: Single environment setup
- **Monitoring**: Not implemented
- **Backup**: SQLite file-based (manual backup)

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Current tests cover:
- Input validation schemas
- Basic component rendering

## 📊 Database Schema

```sql
-- Buyers table
CREATE TABLE buyers (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  propertyType TEXT NOT NULL,
  bhk TEXT,
  purpose TEXT NOT NULL,
  budgetMin INTEGER,
  budgetMax INTEGER,
  timeline TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'New' NOT NULL,
  notes TEXT,
  tags TEXT, -- JSON array
  ownerId TEXT NOT NULL,
  updatedAt INTEGER DEFAULT (unixepoch()) NOT NULL
);

-- Buyer history table
CREATE TABLE buyer_history (
  id TEXT PRIMARY KEY,
  buyerId TEXT NOT NULL,
  changedBy TEXT NOT NULL,
  changedAt INTEGER DEFAULT (unixepoch()) NOT NULL,
  diff TEXT NOT NULL -- JSON changes
);
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on push
3. SQLite database will be created on first run

### Manual Deployment

```bash
npm run build
npm start
```

