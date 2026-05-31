# AI Codebase Intelligence Platform

Monorepo layout: **client** (React + Vite) and **server** (Node.js + Express + MongoDB).

## Quick start

```bash
# Frontend
cd client
cp .env.example .env
npm install
npm run dev

# Backend (separate terminal)
cd server
cp .env.example .env
npm install
npm run dev
```

## Project structure

See repository folders below. Feature code is added incrementally under `controllers`, `services`, `models`, and `client/src/pages`.

## MVC request flow (backend)

```
HTTP Request → routes → controller → service → model (MongoDB) → response
```
