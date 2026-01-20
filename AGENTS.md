# AI PC Planner - Agent Instructions

An AI-powered PC build recommendation tool for the Philippines. This document provides context for AI agents working with this codebase.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui + Tailwind CSS 4
- **AI**: OpenRouter (Gemini 2.0 Flash) via Vercel AI SDK
- **Auth/DB**: Supabase (SSR authentication)
- **Testing**: Vitest + React Testing Library

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run Vitest tests
npm run start    # Start production server
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # Supabase auth callback
│   │   ├── builds/         # User builds CRUD
│   │   ├── components/     # PC component data API
│   │   └── recommend/      # AI recommendation endpoint
│   ├── builds/             # Builds page (saved builds)
│   ├── mock/               # UI testing with mock data
│   └── page.tsx            # Main landing page
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives (55 components)
│   ├── build-result.tsx    # Build recommendation display
│   ├── quiz-form.tsx       # User preferences form
│   ├── pc-planner.tsx      # Main planner orchestration
│   ├── auth-modal.tsx      # Authentication modal
│   └── part-picker-modal.tsx # Manual part selection
├── data/
│   └── components/         # Static JSON data (PC parts from PCPartPicker)
│       ├── cpu.json, video-card.json, memory.json, etc.
│       └── README.md       # Data source documentation
├── lib/
│   ├── api/                # API utilities
│   ├── data/               # Data loading utilities
│   ├── supabase/           # Supabase client (server/middleware)
│   ├── validation/         # Zod schemas
│   ├── constants.tsx       # App constants and defaults
│   ├── env.ts              # Environment variable validation
│   ├── logger.ts           # Structured logging utility
│   ├── types.ts            # TypeScript types & interfaces
│   └── utils.ts            # General utilities (cn helper)
└── middleware.ts           # Supabase auth middleware
```

## Architecture Notes

### Data Flow
1. User fills out `quiz-form.tsx` with preferences (budget, use case, brand preferences)
2. Form submits to `/api/recommend` which calls OpenRouter AI
3. AI returns component recommendations with prices
4. Results displayed in `build-result.tsx`
5. Authenticated users can save builds via `/api/builds`

### Static Component Data
- Located in `/data/components/` as JSON files
- Sourced from PCPartPicker (dated July 2025)
- Prices are historical - users should verify current prices

### Authentication
- Supabase SSR authentication via `@supabase/ssr`
- Auth state managed in middleware
- Protected routes check auth in API handlers

## Conventions

### Code Style
- Use TypeScript strict mode
- Prefer named exports for components
- Use `cn()` utility for conditional classnames
- Follow conventional commits for git messages

### API Routes
- All API routes must validate input with Zod
- Protected endpoints must check Supabase auth
- Use structured logging via `lib/logger.ts`
- Return consistent JSON response format

### Components
- Use shadcn/ui primitives from `components/ui/`
- Keep components focused and composable
- Use React Hook Form + Zod for forms

### Testing
- Test files use `.test.ts` or `.test.tsx` suffix
- Place tests in `__tests__` directories
- Use Vitest + React Testing Library

## Environment Variables

Required in `.env.local`:
```
OPENROUTER_API_KEY=       # OpenRouter API key
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
```

## Important Files

- `lib/types.ts` - Core TypeScript interfaces (PCComponent, BuildResult, etc.)
- `lib/env.ts` - Environment validation (check before adding new env vars)
- `lib/logger.ts` - Structured logging (use instead of console.log)
- `components/quiz-form.tsx` - Main user input form (complex, 25KB)
- `components/build-result.tsx` - Build display (complex, 20KB)

## Do's and Don'ts

### Do
- Run `npm run lint` before committing
- Validate environment variables through `lib/env.ts`
- Use the logger for debugging, not console.log
- Check authorization in API route handlers
- Keep the static component data disclaimer visible (July 2025 pricing)

### Don't
- Don't hardcode API keys
- Don't bypass TypeScript strict checks
- Don't add new shadcn/ui components without using `npx shadcn@latest add`
- Don't modify files in `components/ui/` directly (they're generated)
