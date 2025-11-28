# HabhitDash

Lightweight habit-tracking dashboard with analytics for daily habits.

## Overview

HabhitDash is a full-stack web app to create and track habits, record daily completions, and view simple analytics. The project includes a Node/Express backend with MongoDB and a React frontend built with Vite.

## Tech Stack

- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Frontend:** React (Vite), Chart.js (analytics), React Router
- **Auth:** JWT (jsonwebtoken), bcrypt for password hashing
- **Dev tools:** nodemon (backend), Vite (frontend)

## Setup (Windows - cmd.exe)

Prerequisites:
- Node.js (v16+ recommended)
- npm (comes with Node)
- MongoDB (local) or MongoDB Atlas connection string

1. Clone repository

   git clone https://github.com/VarunSallagali/HabhitDash.git

2. Backend

   cd backend
   npm install

   Create a `.env` file in `backend` with the following variables:

   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000

   Run backend dev server:

   set MONGO_URI=your_mongo_connection_string
   set JWT_SECRET=your_jwt_secret
   npm run dev

   Notes:
   - `npm run dev` uses `nodemon src/index.js` (see `backend/package.json`).
   - If you prefer production start: `npm start`.

3. Frontend

   cd ../frontend
   npm install

   Run dev server:

   npm run dev

   - Frontend uses Vite. Dev server runs on `http://localhost:5173` by default.

4. Open the frontend in your browser (likely `http://localhost:5173`). The frontend will call the backend API (default backend port configured in `.env`).

## Environment / Configuration

- Backend expects `MONGO_URI` and `JWT_SECRET` environment variables. The backend uses `dotenv` to load `.env`.
- If you run backend on a different port, update the frontend API base URL in `frontend/src/lib/api.js`.

## Features Implemented

- User authentication (register/login) with JWT.
- CRUD for habits (create, update, delete).
- Track habit completions (model `HabitCompletion`).
- Dashboard with analytics chart component (`AnalyticsChart.jsx`).
- Simple responsive UI with habit cards, modal for habit creation.

## Screenshots / Short Screen Recording

Add screenshots or a short recording into `assets/screenshots/` (create that folder at project root). Example markdown to embed:

```
![Dashboard screenshot](assets/screenshots/dashboard-1.png)
```

For a short screen recording (webm or mp4) add the file to `assets/screenshots/` and link to it in this README. On Windows you can record with the Xbox Game Bar (Win+G) or use a tool like ShareX to capture a GIF/MP4.

Suggested captures:
- Dashboard view
- Creating a habit modal
- Analytics chart / stats

## Assumptions

- MongoDB is available via a connection string (Atlas or local). The app does not include a DB provisioning script.
- Emails/password reset flows are out of scope.
- Frontend assumes backend API routes are at the same host/port configured in `frontend/src/lib/api.js`.

## Bonus / Extra Notes

- Analytics: `AnalyticsChart.jsx` uses `chart.js` to display habit completion stats.
- Models include `Habit`, `HabitCompletion`, and `User` to support per-user tracking and analytics.
- You can extend the app with daily reminders, streak calculations, or export of analytics.

## Troubleshooting

- If CORS errors appear, ensure backend `cors` middleware is configured (see `backend/src/index.js`).
- If frontend can't reach backend, verify backend is running and `MONGO_URI` is set correctly.

## Next Steps / Optional

- Add a sample `.env.example` file with variable names (without secrets).
- Add a Docker Compose file to run MongoDB + backend + frontend together.

---

If you want, I can:
- Add `assets/screenshots/` and include a placeholder screenshot file.
- Add a `.env.example` and small Docker Compose setup.

Contact: Open an issue or message me in the repo for follow-ups.
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


