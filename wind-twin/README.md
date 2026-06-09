# OceanSentinel — Offshore Wind Turbine Digital Twin

Phase 1 scaffold for a full-stack wind farm digital twin platform.

## Tech stack

- pnpm workspaces
- React 18 + TypeScript + Vite
- Three.js r160 via @react-three/fiber
- Zustand v4
- Socket.io v4
- TailwindCSS
- Express + TypeScript backend
- Prisma v5 + PostgreSQL
- InfluxDB client v3
- Redis
- JWT auth + bcrypt
- Zod validation
- Docker compose for local services

## Getting started

1. Install pnpm if not already installed:
   ```bash
   npm install -g pnpm
   ```
2. Install dependencies:
   ```bash
   cd wind-twin
   pnpm install
   ```
3. Start local infrastructure:
   ```bash
   docker-compose up -d
   ```
4. Start development servers:
   ```bash
   pnpm dev
   ```

## Project structure

- `shared/` — shared TypeScript models and types
- `server/` — Express + Socket.io backend
- `client/` — Vite + React frontend
