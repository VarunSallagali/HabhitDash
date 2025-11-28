# HabitDash

A Habit & Productivity Dashboard — React (Vite) + Node.js/Express + MongoDB.

## Stack

- **Frontend**: React + Vite, React Router, simple custom styles (ready for Tailwind), room to add Zustand and charts.
- **Backend**: Node.js + Express, JWT auth, bcrypt password hashing.
- **Database**: MongoDB with Mongoose (users, habits, habit_completions collections).

## Run locally

### 1) Backend

```bash
cd backend
# Create .env file with:
# PORT=4000
# DATABASE_URL=mongodb://localhost:27017/habitdash
# JWT_SECRET=your_random_secret_key_here
npm install
npm run dev
```

The API will default to `http://localhost:4000`. MongoDB connection will be established automatically.

### 2) Frontend

```bash
cd frontend
echo VITE_API_URL=http://localhost:4000/api > .env   # or create .env manually
npm install
npm run dev
```

Then open the printed `localhost` URL (usually `http://localhost:5173`).

## Database setup (MongoDB)

MongoDB collections are created automatically when you first use them. No manual schema setup needed!

**MongoDB Connection String Format:**
- Local: `mongodb://localhost:27017/habitdash`
- MongoDB Atlas (cloud): `mongodb+srv://username:password@cluster.mongodb.net/habitdash`

**Collections:**
- `users` - User accounts with email, password hash, name
- `habits` - User habits with title, description, frequency, color
- `habitcompletions` - Completion records with habit_id and completed_on date

The Mongoose models handle all schema validation and relationships automatically.

## Deploy

- **Backend**: Railway or Render  
  - Set `DATABASE_URL` (MongoDB connection string) and `JWT_SECRET` as environment variables.
  - For MongoDB Atlas, use the connection string from your cluster.
- **Frontend**: Netlify or Vercel  
  - Set `VITE_API_URL` to your deployed backend URL, e.g. `https://your-api.com/api`.

## Next steps / nice-to-haves

- **UI**: Add a create/edit habit modal, calendar view, and charts for streaks/completion%.
- **State**: Introduce Zustand or React Context for global auth/user state.
- **Bonus**: AI habit suggestions, CSV/PDF export, realtime updates via WebSocket, polished portfolio-ready styling and screenshots.


