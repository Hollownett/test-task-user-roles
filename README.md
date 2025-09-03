# User Role Dashboard

This project contains both a React + TypeScript + Vite frontend and a NestJS backend for role/user management.

## App view
<img width="1423" height="585" alt="image" src="https://github.com/user-attachments/assets/7122d090-23fb-4815-9b19-7049484437da" />


## Prerequisites

- Node.js (v20 or later recommended)
- npm (comes with Node.js)
- PostgreSQL (for backend)

---

## Frontend (React + Vite)

### Setup & Run

1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173` by default.

3. **Run unit tests:**
   ```sh
   npm test
   ```

4. **Run e2e tests:**
   ```sh
   npm run test:e2e
   ```
   Make sure to start the backend application and frontend application before running frontend e2e tests.

### Build for production

```sh
npm run build
```

---

## Backend (NestJS)

### Setup & Run

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```

2. **Configure your environment variables:**
   Set PostgreSQL-related .env variables see `src/app.module.ts` and `.env.example`

3. **Seed the database**:
   ```sh
   npm run seed
   ```

4. **Start the development server:**
   ```sh
   npm run start:dev
   ```
   The backend will be available at `http://localhost:3000` by default.

5. **Run unit tests:**
   ```sh
   npm run test
   ```

6. **Run e2e tests:**
   ```sh
   npm run test:e2e
   ```

---
