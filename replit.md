# Frontend Checklist - Project Task Manager

## Overview

This is a full-stack web application designed as a minimal, clean, responsive UI/UX checklist app for frontend development teams. The application helps developers track design implementation using project-based task boards with detailed deadlines, priorities, and progress tracking. It's inspired by Notion's clean design aesthetic with generous whitespace, smooth interactions, and modern UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React icons

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: In-memory session store with HTTP-only cookies
- **API Design**: RESTful endpoints with consistent error handling
- **Development Server**: Vite with HMR for development mode

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for production bundling
- **Development**: tsx for TypeScript execution in development
- **Type Checking**: Shared TypeScript configuration across client/server

## Key Components

### Authentication System
- **User Management**: Username/password authentication with 5-user limit
- **Session Handling**: Cookie-based sessions with in-memory storage
- **Route Protection**: Authentication checks on protected routes

### Data Models
- **Users**: Basic username/password with unique constraints
- **Projects**: User-owned project containers with name and description
- **Tasks**: Detailed task items with deadlines, priorities, and completion status

### UI Component System
- **Design System**: Consistent component library based on Radix UI
- **Theme System**: Light/dark mode toggle with localStorage persistence
- **Responsive Design**: Mobile-first approach with breakpoint considerations
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML

### Task Management Features
- **Project Organization**: Tasks grouped by projects with progress tracking
- **Priority Levels**: Low, medium, high priority assignments
- **Deadline Management**: Date and time scheduling for tasks
- **Progress Visualization**: Real-time progress bars and completion statistics
- **Default Tasks**: Pre-defined accessibility and responsiveness checklists

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Login/register → session creation → cookie storage
2. **Data Fetching**: React Query handles caching, background updates, and error states
3. **Mutations**: Optimistic updates with automatic cache invalidation
4. **Real-time Updates**: Manual refetching after mutations for consistency

### State Management Strategy
- **Server State**: Managed by TanStack Query with automatic caching
- **Client State**: Local component state and theme preference in localStorage
- **Form State**: React Hook Form for complex form validation and submission
- **Session State**: HTTP-only cookies with server-side session validation

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router alternative)
- Vite for build tooling and development server
- Express.js for backend API server

### Database and ORM
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Zod schema validation
- **Connection**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for schema management

### UI and Styling Dependencies
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- Custom CSS variables for theme management

### Development Tools
- TypeScript for type safety across the stack
- Replit-specific plugins for development environment
- PostCSS with Autoprefixer for CSS processing

## Deployment Strategy

### Production Build Process
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Static Assets**: Frontend build output served by Express in production
4. **Environment**: NODE_ENV determines development vs production behavior

### Development Environment
- **Hot Reload**: Vite middleware integrated with Express server
- **Type Checking**: Continuous TypeScript checking across client/server
- **Database**: PostgreSQL connection via environment variable
- **Session Storage**: In-memory storage suitable for development and small deployments

### Configuration Management
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Build Scripts**: Separate commands for development, build, and production
- **Type Safety**: Shared schema definitions between client and server
- **Asset Handling**: Vite handles static assets with proper versioning

The application follows modern web development practices with a focus on developer experience, type safety, and user accessibility. The architecture supports both development and production environments with clear separation of concerns between frontend and backend responsibilities.