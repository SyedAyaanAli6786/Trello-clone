# Trello Clone

A full-stack Kanban-style project management application.

## Quick Start

See the main [README.md](README.md) for full setup instructions.

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`
