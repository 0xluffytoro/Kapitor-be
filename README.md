# Kapitor - Express.js TypeScript API

A modern Express.js application built with TypeScript, following MVC architecture pattern.

## Features

- ✅ Express.js with TypeScript
- ✅ MVC Architecture
- ✅ MongoDB with Mongoose
- ✅ Zod validation
- ✅ CORS enabled
- ✅ ESLint & Prettier configured
- ✅ Husky git hooks
- ✅ pnpm package manager

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB (running locally or remote)

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kapitor
```

## Available Scripts

### Development

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server (requires build first)

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Database

- `pnpm db:seed` - Seed database with sample data
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database (delete all data)

## Project Structure

```
src/
├── config/          # Configuration files
│   └── database.ts  # MongoDB connection
├── controllers/     # Request handlers (MVC)
│   └── userController.ts
├── middleware/      # Express middleware
│   ├── cors.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── models/          # Mongoose models
│   └── User.ts
├── routes/          # Route definitions
│   ├── index.ts
│   └── userRoutes.ts
├── scripts/         # Database scripts
│   ├── migrate.ts
│   ├── reset.ts
│   └── seed.ts
└── index.ts         # Application entry point
```

## API Endpoints

### Health Check

- `GET /health` - Server health check

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Development Workflow

1. Start MongoDB (if running locally)
2. Run `pnpm dev` to start the development server
3. The server will be available at `http://localhost:3000`

## Git Hooks

Husky is configured to run linting and formatting checks before commits. Make sure to initialize git repository:

```bash
git init
pnpm prepare
```

## License

ISC
