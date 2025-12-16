# 🎬 Quick Reference Guide

## 🚀 Common Commands

### Installation
```bash
# Windows
setup-windows.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Database
```bash
# Seed database
cd backend
node scripts/seedMovies.js

# Clear and re-seed
# (Delete movierecom database in MongoDB, then run seed again)
```

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## 🎯 API Quick Reference

### Authentication
```bash
# Signup
POST /api/auth/signup
Body: { "name": "...", "email": "...", "password": "..." }

# Login
POST /api/auth/login
Body: { "email": "...", "password": "..." }

# Get current user
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Movies
```bash
# Get recommendations
GET /api/movies/recommend/:userId
Header: Authorization: Bearer <token>

# Rate a movie
POST /api/movies/rate
Header: Authorization: Bearer <token>
Body: { "movieId": "...", "rating": 8, "feedback": "..." }

# Search movies
GET /api/movies/search?q=inception

# Get trending
GET /api/movies/trending?limit=10
```

### Chatbot
```bash
# Send message
POST /api/chatbot/message
Header: Authorization: Bearer <token>
Body: { "message": "Suggest a movie like Inception" }
```

---

## 🤖 Chatbot Example Queries

```
"Suggest a movie like Inception"
"Who acted in Avengers: Endgame?"
"Show me top 5 romantic movies"
"What's The Dark Knight about?"
"Recommend me something good"
"Find sci-fi movies"
"Tell me about Titanic"
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongod --version

# Check if port 5000 is free
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Check .env file exists and is configured
```

### Frontend won't connect
```bash
# Check VITE_API_URL in frontend/.env
# Should be: http://localhost:5000/api

# Check backend is running on port 5000
```

### Database connection error
```bash
# Check MongoDB is running
# Check MONGODB_URI in backend/.env
# Default: mongodb://localhost:27017/movierecom
```

### OpenAI API error
```bash
# Check OPENAI_API_KEY in backend/.env
# Get key from: https://platform.openai.com/api-keys
```

---

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend API URL
- `backend/server.js` - Server entry point
- `frontend/src/main.jsx` - React entry point

### Key Components
- `backend/services/recommendationEngine.js` - ML algorithms
- `backend/services/chatbotService.js` - AI chatbot
- `frontend/src/context/AuthContext.jsx` - Auth state
- `frontend/src/pages/Dashboard.jsx` - Main UI

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movierecom
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Sample User Flow

1. **Sign Up** → Create account
2. **Browse** → View trending movies
3. **Rate** → Rate 3-5 movies (7+ stars)
4. **Recommendations** → Check "For You" tab
5. **Search** → Find specific movies
6. **Chat** → Ask AI for suggestions

---

## 🎨 UI Components Map

```
Dashboard
├── Navbar (top)
├── SearchBar
├── Tabs (For You / Trending)
├── Movies Grid
│   └── MovieCard (multiple)
│       └── Rating Form
└── Chatbot (floating button)
    └── Chat Window
```

---

## 🗄️ Database Collections

| Collection | Documents | Purpose |
|------------|-----------|---------|
| users | User accounts | Auth & preferences |
| movies | Movie catalog | Movie database |
| interactions | User ratings | Recommendation data |

---

## 🔄 Recommendation Flow

```
User rates movies
    ↓
Interactions stored
    ↓
Engine analyzes:
  - User's ratings (collaborative)
  - Movie genres (content-based)
  - User preferences
    ↓
Hybrid algorithm combines
    ↓
Personalized recommendations
```

---

## 🎯 Testing Checklist

- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Browse movies
- [ ] Search for a movie
- [ ] Rate a movie
- [ ] Check recommendations update
- [ ] Test chatbot queries
- [ ] View trending movies
- [ ] Logout and login again
- [ ] Check session persistence

---

## 📱 Mobile Testing

1. Open browser DevTools
2. Toggle device toolbar
3. Select mobile device
4. Test responsive design
5. Check chatbot on mobile

---

## 🚀 Deployment Quick Steps

### MongoDB Atlas
1. Create free cluster
2. Get connection string
3. Update MONGODB_URI

### Render (Backend)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Vercel (Frontend)
1. Import GitHub repo
2. Set VITE_API_URL
3. Deploy

**See DEPLOYMENT.md for full guide**

---

## 📞 Quick Support

**Issue**: Can't connect to MongoDB
**Fix**: Check MongoDB is running, verify MONGODB_URI

**Issue**: OpenAI not responding
**Fix**: Verify API key, check usage limits

**Issue**: Frontend shows errors
**Fix**: Check browser console, verify API URL

**Issue**: Recommendations not showing
**Fix**: Rate more movies (need 3+ ratings)

---

## 🎓 Learning Resources

- MongoDB: https://docs.mongodb.com/
- Express: https://expressjs.com/
- React: https://react.dev/
- Node.js: https://nodejs.org/
- OpenAI: https://platform.openai.com/docs

---

## ⚡ Performance Tips

- Clear browser cache if issues
- Use Chrome DevTools for debugging
- Check Network tab for API calls
- Monitor Console for errors
- Use React DevTools extension

---

**Quick help: Check SETUP.md for detailed instructions**
