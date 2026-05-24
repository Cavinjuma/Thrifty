# Thrifty — Cloth Thrift App

A full-stack web application for buying and selling second-hand clothing.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, tRPC
- **Backend**: Node.js, Express, tRPC, Drizzle ORM
- **Database**: MySQL
- **Auth**: JWT session cookies

## Project Structure

```
client/       # React frontend (Vite)
  src/
    pages/    # App pages (Home, Shop, Cart, Checkout, Admin…)
    components/ # Shared components & shadcn/ui primitives
    hooks/    # Custom React hooks
    lib/      # tRPC client, utilities
server/       # Express backend
  _core/      # Server runtime (auth, tRPC, vite integration)
  db.ts       # Database queries
  routers.ts  # tRPC API routes
  storage.ts  # File storage helpers
shared/       # Types and constants shared between client & server
drizzle/      # Database schema and migrations
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

## Scripts

| Command       | Description                        |
|---------------|------------------------------------|
| `pnpm dev`    | Start dev server (client + server) |
| `pnpm build`  | Build for production               |
| `pnpm start`  | Run production build               |
| `pnpm check`  | TypeScript type check              |
| `pnpm test`   | Run tests                          |
| `pnpm format` | Format code with Prettier          |

## Environment Variables

Create a `.env` file at the root with:

```env
DATABASE_URL=mysql://user:password@localhost:3306/thrifty
JWT_SECRET=your_secret_here
PORT=3000
```
