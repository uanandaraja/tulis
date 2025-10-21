# Next.js Starter Pack

Stop configuring. Start building.

Full-stack Next.js starter with auth, database, and type-safe APIs already set up.

## Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **tRPC** - End-to-end type-safe APIs
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Database
- **Better Auth** - Authentication (magic link + Google OAuth)
- **Tailwind CSS** - Styling
- **Bun** - Runtime and package manager

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd next-starterpack
   bun install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in:
   - `DATABASE_URL` - PostgreSQL connection string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - [Google OAuth credentials](https://console.cloud.google.com)
   - `BETTER_AUTH_SECRET` - Random secret (run `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` - Your app URL (e.g., `http://localhost:3000`)
   - `RESEND_API_KEY` - [Resend API key](https://resend.com) for emails

3. **Set up database**
   ```bash
   bun db:push
   ```

4. **Run dev server**
   ```bash
   bun dev
   ```

Visit `http://localhost:3000`

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── features/    # Feature-specific components
├── server/          # Backend code
│   ├── routers/     # tRPC API routes
│   └── services/    # Business logic
└── lib/             # Utils, DB, auth config
```

## Key Features

- **Authentication** - Magic link email + Google OAuth out of the box
- **Type-safe APIs** - tRPC with automatic type inference
- **Database** - Drizzle ORM with PostgreSQL, migrations ready
- **UI Components** - Radix UI + Tailwind, light/dark mode
- **Email** - React Email templates with Resend

## Common Commands

```bash
bun dev          # Start dev server
bun build        # Build for production
bun start        # Start production server
bun lint         # Lint and format code

# Database
bun db:push      # Push schema changes to database
bun db:generate  # Generate migration files
bun db:migrate   # Run migrations
bun db:studio    # Open database GUI
```

## Adding Features

### Create a new API route
Edit `src/server/routers/[name].ts`:
```typescript
import { router, protectedProcedure } from "../trpc";

export const myRouter = router({
  myQuery: protectedProcedure.query(({ ctx }) => {
    // Access user via ctx.user
    return { message: "Hello!" };
  }),
});
```

Add to `src/server/routers/_app.ts`

### Use in components
```typescript
import { trpc } from "@/lib/trpc/react";

function MyComponent() {
  const { data } = trpc.myRouter.myQuery.useQuery();
  return <div>{data?.message}</div>;
}
```

