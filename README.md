# Yu-Gi-Oh! Deck Builder & Meta Website

## Overview

This project is a full-stack Yu-Gi-Oh! website currently under development. The goal is to provide tools for deck building, card browsing, and eventually meta analysis using a modern web stack.

The project is primarily a learning exercise in full-stack software engineering, covering frontend development, REST APIs, database design, Docker, and deployment workflows.

---

## Architecture

```text
React + TypeScript (Frontend)
            |
            v
Express + TypeScript (REST API)
            |
            v
Prisma ORM
            |
            v
PostgreSQL (Docker)
```

### Frontend

Built with:

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS

Responsibilities:

* Display card information
* Deck building interface
* Tier list and meta pages
* User-facing search and filtering
* Communicate with backend APIs

Example request:

```text
GET /cards
GET /cards/:id
GET /decks/:id
```

---

### Backend

Built with:

* Node.js
* Express
* TypeScript

Responsibilities:

* Expose REST API endpoints
* Validate requests
* Query the database through Prisma
* Handle deck and card data

Example endpoint:

```ts
app.get("/cards", async (_, res) => {
    const cards = await prisma.card.findMany();
    res.json(cards);
});
```

---

### Database

Built with:

* PostgreSQL
* Docker
* Prisma ORM

The database stores:

* Card information
* Decks
* Deck contents

Current schema:

```text
Card
 └── DeckCard
          └── Deck
```

Relationship:

```text
Deck
 1 ---- * DeckCard * ---- 1 Card
```

This allows a deck to contain many cards while preserving database normalization.

---

## Development Environment

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on:

```text
http://localhost:3000
```

---

### PostgreSQL

Database runs inside Docker:

```bash
docker compose up -d
```

Default connection:

```text
Host: localhost
Port: 5432
Database: yugioh_db
```

---

## Prisma

Create migrations:

```bash
npx prisma migrate dev --name migration_name
```

Generate Prisma Client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── types/
│   └── assets/

backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── server.ts

docker-compose.yml
```

---

## Current Status

Implemented:

* React + TypeScript frontend setup
* Express backend setup
* PostgreSQL database
* Prisma ORM integration
* Dockerized local database
* Initial card and deck schema

Planned:

* Card import pipeline
* Search and filtering
* Deck builder
* User accounts
* Deck sharing
* Meta statistics and analytics
* Deployment

```
```
