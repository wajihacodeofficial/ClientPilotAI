# Client Pilot AI - Full Stack

This repository contains the full-stack code for Client Pilot AI.

## Project Structure

- `/` - Frontend (Vite + React + TS + Tailwind + shadcn/ui)
- `/backend` - Backend (Node.js + Express + TS)
- `/supabase/migrations` - Database schema and RLS policies

## Prerequisites

1. Node.js (v18+)
2. A Supabase project (local or remote)
3. OpenAI API Key

## Setup Instructions

### 1. Database Setup (Supabase)
1. In your Supabase project, go to the SQL Editor and run the script located in `supabase/migrations/00001_initial_schema.sql`.
2. This creates the required tables (`workspaces`, `profiles`, `leads`, etc.) and enforces Row Level Security (RLS).
3. Under Database -> Replication, ensure `leads` and `lead_scores` tables are enabled for Realtime.

### 2. Backend Setup
1. Open a terminal and navigate to `/backend`.
2. Run `npm install` (already done if scaffolding succeeded).
3. Create a `.env` file in `/backend` with the following:
   ```env
   PORT=3001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the backend: `npm run dev` (you may need to add a dev script like `"dev": "nodemon --watch src --exec ts-node src/index.ts"` to package.json).

### 3. Frontend Setup
1. In the root directory, create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3001/api
   ```
2. Run `npm install` (if you haven't already).
3. Start the Vite dev server: `npm run dev`.

## Running the app
1. Navigate to `http://localhost:5173`.
2. Sign up for a new account. This will automatically create a User in Supabase Auth.
3. *Note: You will need a database trigger or manual step to insert a row into `workspaces` and `profiles` for the new user before they can use the app fully.*
