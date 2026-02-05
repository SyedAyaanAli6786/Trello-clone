# Trello Clone - Project Management Tool

A full-stack Kanban-style project management web application that closely replicates Trello's design and user experience. Built with Next.js, Express, and PostgreSQL.

![Trello Clone](https://img.shields.io/badge/Status-Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)

## 🚀 Features

### Core Features ✅
- **Board Management**: Create and view boards with customizable backgrounds
- **List Management**: Create, edit, delete, and reorder lists via drag & drop
- **Card Management**: 
  - Create, edit, and delete cards
  - Drag & drop cards between lists
  - Drag & drop to reorder cards within lists
  - Archive cards
- **Card Details**:
  - Add/remove colored labels
  - Set and manage due dates
  - Create checklists with completion tracking
  - Assign multiple members to cards
- **Search & Filter**:
  - Real-time search by card title
  - Filter by labels, members, and due dates

### UI/UX Features ✨
- Trello-inspired design with authentic color palette
- Smooth drag-and-drop interactions
- Responsive design (mobile, tablet, desktop)
- Visual indicators for due dates (overdue, due soon)
- Checklist progress bars
- Member avatars
- Hover effects and micro-animations

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS Modules
- **Drag & Drop**: @hello-pangea/dnd
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **CORS**: Enabled for frontend communication

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/trello_clone?schema=public"
PORT=5000
NODE_ENV=development
```

4. **Generate Prisma client**:
```bash
npm run prisma:generate
```

5. **Run database migrations**:
```bash
npm run prisma:migrate
```

6. **Seed the database with sample data**:
```bash
npm run prisma:seed
```

7. **Start the backend server**:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env.local
```

The default configuration should work:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. **Start the frontend development server**:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the seeded board "Project Management Board" with sample data
3. Try the following features:
   - **Drag lists** horizontally to reorder them
   - **Drag cards** within a list or between lists
   - **Click a card** to open the detailed modal
   - **Add new lists** using the "+ Add another list" button
   - **Add new cards** using the "+ Add a card" button in any list
   - **Search cards** using the search bar in the header
   - **Filter cards** by labels or members

## 📁 Project Structure

```
TrelloClone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Sample data seeder
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   │   ├── boards.ts
│   │   │   ├── lists.ts
│   │   │   ├── cards.ts
│   │   │   ├── labels.ts
│   │   │   ├── members.ts
│   │   │   └── checklist.ts
│   │   └── server.ts          # Express server setup
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx         # Root layout
    │   ├── page.tsx           # Home page
    │   └── globals.css        # Global styles & design system
    ├── components/
    │   ├── Board/             # Board component
    │   ├── List/              # List component
    │   ├── Card/              # Card component
    │   ├── CardModal/         # Card details modal
    │   └── SearchFilter/      # Search & filter component
    ├── lib/
    │   └── api.ts             # API service layer
    ├── types/
    │   └── index.ts           # TypeScript interfaces
    ├── package.json
    ├── tsconfig.json
    └── next.config.js
```

## 🗄️ Database Schema

The application uses 8 PostgreSQL tables:

- **boards**: Board information
- **lists**: Lists belonging to boards
- **cards**: Cards belonging to lists
- **labels**: Predefined label types
- **card_labels**: Many-to-many relationship (cards ↔ labels)
- **members**: Sample users for assignment
- **card_members**: Many-to-many relationship (cards ↔ members)
- **checklist_items**: Checklist items for cards

All relationships use proper foreign keys with cascade deletes.

## 🔌 API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board with lists and cards
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list title
- `PUT /api/lists/:id/position` - Update list position
- `DELETE /api/lists/:id` - Delete list

### Cards
- `POST /api/cards` - Create card
- `GET /api/cards/:id` - Get card details
- `PUT /api/cards/:id` - Update card
- `PUT /api/cards/:id/move` - Move card
- `PUT /api/cards/:id/archive` - Archive card
- `DELETE /api/cards/:id` - Delete card
- `GET /api/cards/search/query` - Search cards
- `GET /api/cards/filter/query` - Filter cards

### Labels
- `GET /api/labels` - Get all labels
- `POST /api/labels/:cardId/labels` - Add label to card
- `DELETE /api/labels/:cardId/labels/:labelId` - Remove label

### Members
- `GET /api/members` - Get all members
- `POST /api/members/:cardId/members` - Assign member
- `DELETE /api/members/:cardId/members/:memberId` - Remove member

### Checklist
- `POST /api/checklist/:cardId/items` - Add checklist item
- `PUT /api/checklist/:id` - Update checklist item
- `DELETE /api/checklist/:id` - Delete checklist item

## 🎨 Design Decisions

1. **Vanilla CSS over Tailwind**: For maximum flexibility and authentic Trello replication
2. **@hello-pangea/dnd**: Maintained fork of react-beautiful-dnd for drag & drop
3. **Prisma ORM**: Type-safe database access with excellent TypeScript integration
4. **CSS Modules**: Scoped styling to prevent conflicts
5. **Position-based ordering**: Cards and lists use integer positions for efficient reordering

## 🚢 Deployment

### Backend (Railway/Render)
1. Create a PostgreSQL database
2. Set environment variables
3. Deploy the backend folder
4. Run migrations: `npm run prisma:migrate`
5. Seed database: `npm run prisma:seed`

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Set environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`
4. Deploy

## 🧪 Testing

Manual testing checklist:
- ✅ Create, edit, delete lists
- ✅ Drag lists to reorder
- ✅ Create, edit, delete cards
- ✅ Drag cards within lists
- ✅ Drag cards between lists
- ✅ Add/remove labels
- ✅ Set/clear due dates
- ✅ Add/complete/delete checklist items
- ✅ Assign/remove members
- ✅ Search cards by title
- ✅ Filter by labels and members
- ✅ Archive and delete cards

## 📝 Assumptions

- No authentication system (default user assumed)
- Sample members are pre-seeded in the database
- Single board focus (can be extended to multiple boards)
- Labels are predefined (not user-creatable)

## 🔮 Future Enhancements

- Multiple boards support
- File attachments on cards
- Comments and activity log
- Card covers (images)
- Board background customization
- Real-time collaboration with WebSockets
- User authentication and authorization

## 👨‍💻 Development

This project was built as part of an SDE Intern Fullstack Assignment. All code is original and written with a deep understanding of the implementation.

## 📄 License

MIT

---

**Built with ❤️ using Next.js, Express, and PostgreSQL**
