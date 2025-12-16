# 🚀 Quick Start Guide

## Prerequisites Check
Before starting, make sure you have:
- ✅ Node.js (v16+) installed - Run: `node --version`
- ✅ npm installed - Run: `npm --version`
- ✅ MongoDB installed locally OR MongoDB Atlas account
- ✅ OpenAI API Key (get from https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
# From the root directory (MovieRecom)
cd backend
npm install

cd ../frontend
npm install
```

### 2️⃣ Configure Backend

Create a `.env` file in the `backend` folder:

```bash
cd backend
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movierecom
JWT_SECRET=your_super_secret_jwt_key_12345
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

**Important:** 
- Replace `your_super_secret_jwt_key_12345` with a strong random string
- Replace `sk-your-openai-api-key-here` with your actual OpenAI API key
- If using MongoDB Atlas, replace the MONGODB_URI with your connection string

### 3️⃣ Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if MongoDB is installed as a service, it should already be running)
# Check if running: 
mongod --version

# Mac/Linux
mongod
```

**Option B: MongoDB Atlas**
- Go to https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update MONGODB_URI in backend/.env

### 4️⃣ Seed the Database

```bash
# From the backend folder
cd backend
node scripts/seedMovies.js
```

You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing movies
✅ Inserted 15 sample movies
✨ Database seeded successfully!
```

### 5️⃣ Start the Backend Server

```bash
# From the backend folder
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### 6️⃣ Start the Frontend (New Terminal)

Open a **new terminal window** and run:

```bash
# From the root directory
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### 7️⃣ Access the Application

Open your browser and go to: **http://localhost:3000**

## 🎉 First Time Usage

1. **Sign Up**: Create a new account
2. **Browse Movies**: Explore trending movies on the dashboard
3. **Rate Movies**: Click on movies and rate them (this helps with recommendations)
4. **Get Recommendations**: The more you rate, the better your recommendations!
5. **Chat with AI**: Click the chat button (💬) in the bottom-right corner
6. **Try Queries**: Ask the chatbot:
   - "Suggest a movie like Inception"
   - "Who acted in The Dark Knight?"
   - "Show me romantic movies"

## 🔧 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error
```
**Solution**: Make sure MongoDB is running. Check MONGODB_URI in .env file.

### OpenAI API Error
```
Error: Invalid API key
```
**Solution**: Check your OPENAI_API_KEY in backend/.env. Make sure it's valid.

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Change PORT in backend/.env to another port (e.g., 5001)

### Frontend Can't Connect to Backend
**Solution**: Check if backend is running on port 5000. Update VITE_API_URL in frontend/.env if needed.

## 📱 Test the System

### Test Authentication
1. Sign up with: name, email, password
2. Login with the same credentials
3. You should be redirected to the dashboard

### Test Recommendations
1. Rate at least 3 movies (give them 7-10 stars)
2. Refresh the page
3. Check the "For You" tab for personalized recommendations

### Test Chatbot
1. Click the 💬 button
2. Type: "Suggest a movie like Inception"
3. The bot should respond with similar sci-fi movies

### Test Search
1. Use the search bar at the top
2. Search for "Dark"
3. You should see The Dark Knight in results

## 🎯 What's Next?

- Rate more movies to improve recommendations
- Explore different genres
- Chat with the AI assistant for movie suggestions
- Check trending movies

## 📞 Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Verify all environment variables are set correctly
3. Make sure MongoDB is running
4. Ensure ports 3000 and 5000 are not blocked

---

**Happy Movie Watching! 🍿🎬**
