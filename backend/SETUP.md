# Backend Setup Guide

## Quick Setup

1. **Install MongoDB:**
   - **Local**: Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Cloud (Recommended)**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

2. **Create `.env` file** in the `backend` folder:
   ```
   PORT=4000
   DATABASE_URL=mongodb://localhost:27017/habitdash
   JWT_SECRET=your_random_secret_key_here_make_it_long
   ```
   
   **For MongoDB Atlas**, use:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/habitdash
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

   You should see: `Connected to MongoDB` and `Server running on 4000`

## Common Issues

- **"Server error" when registering**: 
  - Check if MongoDB is running (local) or if your Atlas connection string is correct
  - Verify `DATABASE_URL` in `.env` is correct
  - Check backend terminal for detailed error messages

- **"Database connection failed"**:
  - **Local MongoDB**: Make sure MongoDB service is running
    - Windows: Check Services or run `mongod` manually
    - Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`
  - **MongoDB Atlas**: 
    - Verify your IP is whitelisted in Atlas Network Access
    - Check your username/password in the connection string
    - Ensure the database name is correct

- **"Email already exists"**:
  - That email is already registered. Try logging in instead.

## MongoDB Connection String Examples

**Local:**
```
mongodb://localhost:27017/habitdash
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/habitdash?retryWrites=true&w=majority
```

**With authentication (local):**
```
mongodb://username:password@localhost:27017/habitdash
```
