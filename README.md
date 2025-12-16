# Movie Recommendation System

A full-stack Movie Recommendation System built with the MERN stack, featuring AI-powered chatbot and Machine Learning recommendation algorithms.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based signup/login system
- **Personalized Recommendations**: ML-powered movie suggestions based on:
  - Collaborative Filtering (similar users' preferences)
  - Content-Based Filtering (movie genres and descriptions)
  - Hybrid Approach (combining both methods)
  - Popularity-based (for new users)

### AI Chatbot
- Intelligent movie queries powered by OpenAI GPT
- Natural language understanding for:
  - Similar movie recommendations
  - Actor/cast information
  - Genre-based searches
  - Personalized suggestions
  - General movie questions

### User Interface
- Modern, responsive React dashboard
- Real-time movie search
- Interactive rating system
- Trending movies section
- Beautiful gradient UI design

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**: REST API server
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: Secure authentication
- **OpenAI API**: AI chatbot integration

### Frontend
- **React.js** with Vite
- **React Router**: Navigation
- **Axios**: HTTP client
- **CSS3**: Modern styling

### ML Algorithms
- Collaborative Filtering
- Content-Based Filtering
- Cosine Similarity
- Hybrid Recommendation System

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API Key

### Setup Instructions

1. **Clone the repository**
```bash
cd MovieRecom
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Configure Backend Environment**
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movierecom
JWT_SECRET=your_jwt_secret_key_change_in_production
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. **Configure Frontend Environment**
The `frontend/.env` file is already created with:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Seed the Database**
```bash
npm run seed
```

## 🎬 Running the Application

### Development Mode

**Start Backend** (Terminal 1):
```bash
cd backend
npm install
npm run dev
```

**Start Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update preferences

### Movies
- `GET /api/movies` - Get all movies (with filters)
- `GET /api/movies/search?q=query` - Search movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/recommend/:userId` - Get recommendations
- `GET /api/movies/trending` - Get trending movies
- `POST /api/movies/rate` - Rate a movie
- `GET /api/movies/user/ratings` - Get user ratings

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/message?query=...` - Query chatbot (GET)

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  preferences: {
    favoriteGenres: [String],
    dislikedGenres: [String]
  },
  watchHistory: [{
    movieId: ObjectId,
    watchedAt: Date
  }]
}
```

### Movies Collection
```javascript
{
  movieId: String (unique),
  title: String,
  genre: [String],
  year: Number,
  description: String,
  rating: Number,
  poster: String,
  director: String,
  cast: [String],
  trailerUrl: String,
  totalRatings: Number,
  ratingCount: Number
}
```

### Interactions Collection
```javascript
{
  userId: ObjectId,
  movieId: ObjectId,
  rating: Number (0-10),
  feedback: String,
  interactionType: String
}
```

## 🤖 Chatbot Examples

Try asking the chatbot:
- "Suggest a movie like Inception"
- "Who acted in Avengers: Endgame?"
- "Show me top 5 romantic movies"
- "What's Titanic about?"
- "Recommend me something good"

## 🎯 Recommendation Algorithms

### Content-Based Filtering
- Analyzes movie genres and user preferences
- Uses cosine similarity for genre matching
- Recommends movies similar to highly-rated ones

### Collaborative Filtering
- Finds users with similar tastes
- Recommends movies liked by similar users
- Based on user-movie rating matrix

### Hybrid Approach
- Combines both methods for better accuracy
- 60% content-based + 40% collaborative
- Fallback to popularity for new users

## 🚀 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variable: `VITE_API_URL`

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## 🔐 Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- CORS configuration

## 🎨 UI Features
- Gradient backgrounds
- Responsive design
- Interactive movie cards
- Real-time search
- Floating chatbot
- Smooth animations

## 📝 Future Enhancements
- Voice chat support (Speech Recognition API)
- YouTube trailer integration
- Social sharing features
- Movie watchlist
- User reviews system
- Email notifications
- Multi-language support

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

## 👨‍💻 Author
Built with ❤️ using MERN Stack

---

**Enjoy discovering your next favorite movie! 🎬🍿**
