# Project Structure

```
MovieRecom/
│
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema with authentication
│   │   ├── Movie.js             # Movie schema with ratings
│   │   └── Interaction.js       # User-movie interactions
│   │
│   ├── routes/
│   │   ├── auth.js              # Authentication routes (signup/login)
│   │   ├── movies.js            # Movie CRUD and recommendations
│   │   └── chatbot.js           # AI chatbot endpoints
│   │
│   ├── services/
│   │   ├── recommendationEngine.js  # ML recommendation algorithms
│   │   └── chatbotService.js        # OpenAI chatbot logic
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   │
│   ├── scripts/
│   │   └── seedMovies.js        # Database seeding script
│   │
│   ├── server.js                # Express server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env                     # Your environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js         # Axios configuration
│   │   │   └── index.js         # API functions
│   │   │
│   │   ├── components/
│   │   │   ├── MovieCard.jsx    # Movie display card
│   │   │   ├── MovieCard.css
│   │   │   ├── SearchBar.jsx    # Search functionality
│   │   │   ├── SearchBar.css
│   │   │   ├── Chatbot.jsx      # AI chatbot UI
│   │   │   ├── Chatbot.css
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   └── Navbar.css
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Signup.jsx       # Signup page
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Dashboard.css
│   │   │   └── Auth.css         # Auth pages styling
│   │   │
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env                     # Frontend env variables
│
├── package.json                 # Root package.json
├── .gitignore
├── README.md                    # Full documentation
└── SETUP.md                     # Quick start guide
```

## Key Files Description

### Backend

**server.js**
- Express server setup
- MongoDB connection
- Route mounting
- Error handling

**models/**
- `User.js`: User authentication and preferences
- `Movie.js`: Movie data with ratings
- `Interaction.js`: User-movie interactions tracking

**routes/**
- `auth.js`: User signup, login, profile management
- `movies.js`: Movie CRUD, search, recommendations, ratings
- `chatbot.js`: AI chatbot message handling

**services/**
- `recommendationEngine.js`: 
  - Collaborative filtering
  - Content-based filtering
  - Hybrid recommendations
  - Popularity-based recommendations
  
- `chatbotService.js`:
  - OpenAI integration
  - Intent analysis
  - Movie queries handling

### Frontend

**src/api/**
- Axios configuration with interceptors
- API functions for all endpoints

**src/components/**
- `MovieCard`: Display and rate movies
- `SearchBar`: Movie search functionality
- `Chatbot`: AI assistant interface
- `Navbar`: Navigation and logout

**src/context/**
- `AuthContext`: Global authentication state

**src/pages/**
- `Login`: User login page
- `Signup`: User registration page
- `Dashboard`: Main app interface with recommendations

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movierecom
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API Routes

### Authentication
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/auth/me`
- PUT `/api/auth/preferences`

### Movies
- GET `/api/movies`
- GET `/api/movies/search?q=`
- GET `/api/movies/:id`
- GET `/api/movies/recommend/:userId`
- GET `/api/movies/trending`
- POST `/api/movies/rate`
- GET `/api/movies/user/ratings`
- GET `/api/movies/genres/list`

### Chatbot
- POST `/api/chatbot/message`
- GET `/api/chatbot/message?query=`

## Technologies Used

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- OpenAI API
- bcryptjs for password hashing

**Frontend:**
- React 18 with Vite
- React Router v6
- Axios
- Context API for state management

**ML Algorithms:**
- Collaborative Filtering
- Content-Based Filtering
- Cosine Similarity
- Hybrid Recommendation System
