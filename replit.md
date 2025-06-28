# Number Database Management System

## Overview

This is a full-stack web application built with React and Express that provides a secure interface for managing a database of numbers with optional notes. The system features user authentication, CRUD operations, and a modern UI built with shadcn/ui components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with file-based storage
- **Data Storage**: File-based JSON storage (development setup)
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for production)
- **Schema Validation**: Zod for runtime type checking

## Key Components

### Authentication System
- Session-based authentication with configurable credentials
- Default credentials: username "admin", password "admin123"
- Session middleware protecting API routes
- Automatic session timeout (30 minutes)

### Data Management
- **File Storage**: JSON-based storage for development (`server/data/numbers.json`)
- **Database Ready**: Drizzle ORM configured for PostgreSQL migration
- **Schema**: Numbers table with id, number, note, and timestamp fields
- **Validation**: Zod schemas for input validation and type safety

### UI Components
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Neutral color scheme with CSS variables
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessibility**: Radix UI primitives ensure ARIA compliance

### API Structure
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/me` - Current user info
- `GET /api/numbers` - Retrieve all numbers
- `POST /api/numbers` - Add new number
- `DELETE /api/numbers/:id` - Remove number

## Data Flow

1. **Authentication Flow**:
   - User submits login form → Validation → Session creation → Dashboard redirect
   - Protected routes check session status → Redirect to login if unauthorized

2. **Data Operations**:
   - Dashboard loads → Query numbers from API → Display in UI
   - Add number → Form validation → API call → Optimistic update → Refresh data
   - Delete number → Confirmation → API call → Remove from UI

3. **Error Handling**:
   - Client-side validation with React Hook Form + Zod
   - Server-side validation and error responses
   - Toast notifications for user feedback

## External Dependencies

### Frontend Dependencies
- **Core**: React, TypeScript, Vite
- **UI**: Radix UI components, Tailwind CSS, Lucide icons
- **Data**: TanStack Query, React Hook Form, Zod
- **Routing**: Wouter
- **Utils**: clsx, tailwind-merge, date-fns

### Backend Dependencies
- **Core**: Express.js, TypeScript (tsx for development)
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Auth**: express-session, connect-pg-simple
- **Validation**: Zod
- **Build**: esbuild for production bundling

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with file watching
- **Storage**: File-based JSON storage for rapid prototyping
- **Session**: In-memory sessions (development only)

### Production Ready
- **Database**: PostgreSQL with Neon serverless configured
- **Sessions**: PostgreSQL-backed session storage
- **Build**: Vite build for frontend, esbuild for backend
- **Environment**: Requires `DATABASE_URL` and `SESSION_SECRET`

### Build Commands
- `npm run dev` - Development with file watching
- `npm run build` - Production build (frontend + backend)
- `npm run start` - Production server
- `npm run db:push` - Database schema migration

## Changelog
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.