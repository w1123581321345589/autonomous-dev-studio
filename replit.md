# Autonomous AI Development Environment

## Overview

This is an autonomous AI development studio designed to visualize and manage long-running AI coding sessions. The application monitors AI agent workflows that can run for extended periods (30+ hours), tracking artifacts, decisions, tool calls, and session metrics in real-time. It serves as a developer productivity tool combining IDE familiarity with modern dev tool aesthetics, inspired by VS Code, Linear, and Vercel Dashboard patterns.

The system tracks three operating modes for AI agents: **deliberation** (planning), **action** (code execution), and **research** (information gathering via tool calls). It enforces constraints like preventing localStorage/sessionStorage usage and blocking HTML forms in React components to maintain clean runtime behavior.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state with real-time WebSocket updates
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Design System**: Dark mode primary with IDE-like aesthetics (deep slate backgrounds, monospace code fonts). Uses Inter for UI text and JetBrains Mono/Fira Code for code display

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API with WebSocket support for real-time updates
- **Build**: esbuild for production server bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all type definitions and database schemas
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage**: Currently uses in-memory storage implementation with PostgreSQL schema ready for migration

### Real-Time Communication
- **WebSocket Server**: Native ws library for broadcasting session updates, artifact changes, and decision events
- **Client Integration**: Custom WebSocket client with automatic reconnection and event subscription pattern

### Key Domain Concepts
- **Sessions**: Long-running development sessions with status, mode, metrics, and configuration
- **Artifacts**: Code files generated during sessions (React components, TypeScript, JSON, etc.) with version history
- **Decisions**: Logged choices between update (small diffs) vs rewrite (structural changes)
- **Tool Calls**: Tracked external tool invocations during research mode

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets/*` → `./attached_assets/*`

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Neon Serverless**: PostgreSQL client using `@neondatabase/serverless` driver

### AI/LLM Integration
- **Anthropic SDK**: `@anthropic-ai/sdk` for Claude API integration (agent orchestration)

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, dropdown, tabs, tooltips, etc.)
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Carousel functionality
- **recharts**: Data visualization for metrics dashboards
- **react-day-picker**: Calendar/date picker component
- **vaul**: Drawer component
- **react-resizable-panels**: Resizable panel layouts
- **cmdk**: Command palette component

### Development Tools
- **Vite**: Development server with HMR and production bundling
- **Drizzle Kit**: Database migration and schema management (`db:push` script)
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment