# 🏗️ System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   Login    │  │  Dashboard │  │     Components      │   │
│  │   Signup   │  │   Search   │  │  - MovieCard        │   │
│  │            │  │   Browse   │  │  - Chatbot          │   │
│  │            │  │            │  │  - SearchBar        │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                    Axios HTTP                                │
└──────────────────────────┼───────────────────────────────────┘
                           │
                     REST API (JSON)
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   BACKEND (Express.js)                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Routes (API Endpoints)                │     │
│  │  /api/auth    /api/movies    /api/chatbot         │     │
│  └────────────┬───────────┬──────────────┬───────────┘     │
│               │           │              │                  │
│  ┌────────────▼───────────▼──────────────▼───────────┐     │
│  │           Middleware (JWT Auth)                    │     │
│  └────────────┬───────────┬──────────────┬───────────┘     │
│               │           │              │                  │
│  ┌────────────▼──┐   ┌────▼─────┐  ┌────▼──────────┐      │
│  │   Services    │   │  Models  │  │   External    │      │
│  │ - RecEngine   │   │  - User  │  │  - OpenAI API │      │
│  │ - Chatbot     │   │  - Movie │  │               │      │
│  └───────────────┘   │  - Inter │  └───────────────┘      │
│                      └────┬─────┘                           │
└───────────────────────────┼─────────────────────────────────┘
                            │
                     Mongoose ODM
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐          │
│  │  users   │    │  movies  │    │ interactions │          │
│  └──────────┘    └──────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow
```
User (Frontend)
    │
    │ 1. Enter credentials
    ▼
Login Component
    │
    │ 2. POST /api/auth/login
    ▼
Auth Route (Backend)
    │
    │ 3. Verify password
    ▼
User Model
    │
    │ 4. Generate JWT
    ▼
Response with Token
    │
    │ 5. Store in localStorage
    ▼
AuthContext (Frontend)
    │
    │ 6. Include in all requests
    ▼
Protected Routes
```

### 2. Recommendation Flow
```
User rates movies
    │
    ▼
Dashboard → POST /api/movies/rate
    │
    ▼
Movie Route (Backend)
    │
    ├─→ Save to Interaction Model
    │
    └─→ Update Movie rating
    │
    ▼
User requests recommendations
    │
    ▼
GET /api/movies/recommend/:userId
    │
    ▼
Recommendation Engine
    │
    ├─→ Collaborative Filtering
    │   (Find similar users)
    │
    ├─→ Content-Based Filtering
    │   (Match genres)
    │
    └─→ Hybrid Algorithm
        (Combine both)
    │
    ▼
Personalized movie list
    │
    ▼
Display on Dashboard
```

### 3. Chatbot Flow
```
User types message
    │
    ▼
Chatbot Component
    │
    │ POST /api/chatbot/message
    ▼
Chatbot Route
    │
    ▼
Chatbot Service
    │
    ├─→ Analyze intent (OpenAI)
    │
    ├─→ Query Movie Database
    │
    └─→ Generate response (OpenAI)
    │
    ▼
Response with movies/text
    │
    ▼
Display in chat window
```

---

## Component Architecture

### Frontend Component Tree
```
App
├── AuthProvider (Context)
│   └── Router
│       ├── PublicRoute
│       │   ├── Login
│       │   └── Signup
│       │
│       └── PrivateRoute
│           └── Dashboard
│               ├── Navbar
│               ├── SearchBar
│               │   └── MovieCard[]
│               ├── MovieCard[] (recommendations)
│               └── Chatbot (floating)
```

### Backend Module Structure
```
server.js
├── Express Setup
├── MongoDB Connection
│
├── Routes
│   ├── /api/auth
│   │   ├── POST /signup
│   │   ├── POST /login
│   │   └── GET /me
│   │
│   ├── /api/movies
│   │   ├── GET /
│   │   ├── GET /search
│   │   ├── GET /recommend/:userId
│   │   ├── POST /rate
│   │   └── GET /trending
│   │
│   └── /api/chatbot
│       └── POST /message
│
├── Middleware
│   └── auth (JWT verification)
│
├── Services
│   ├── recommendationEngine
│   └── chatbotService
│
└── Models
    ├── User
    ├── Movie
    └── Interaction
```

---

## Database Schema Relationships

```
┌────────────────┐
│     User       │
│ _id            │───┐
│ name           │   │
│ email          │   │ userId (reference)
│ password       │   │
│ preferences    │   │
│ watchHistory   │   │
└────────────────┘   │
                     │
                     ▼
              ┌──────────────────┐
              │   Interaction    │
              │ _id              │
              │ userId     ───────┘
              │ movieId    ───────┐
              │ rating           │
              │ feedback         │
              └──────────────────┘
                     │
                     │ movieId (reference)
                     │
                     ▼
              ┌──────────────────┐
              │     Movie        │
              │ _id              │
              │ title            │
              │ genre[]          │
              │ year             │
              │ rating           │
              │ cast[]           │
              └──────────────────┘
```

---

## Technology Stack Detail

### Frontend Stack
```
React 18
├── React Router v6 (Routing)
├── Context API (State)
├── Axios (HTTP Client)
└── Vite (Build Tool)
```

### Backend Stack
```
Node.js
└── Express.js
    ├── Mongoose (ODM)
    ├── JWT (Auth)
    ├── bcryptjs (Hashing)
    ├── CORS (Security)
    └── dotenv (Config)
```

### External Services
```
MongoDB Atlas (Database)
OpenAI API (Chatbot)
```

---

## Security Architecture

### Authentication Flow
```
1. User Sign Up
   ├── Password hashed with bcrypt (10 rounds)
   └── Stored in MongoDB

2. User Login
   ├── Password compared with hash
   ├── JWT token generated (7 day expiry)
   └── Token sent to client

3. Protected Requests
   ├── Token sent in Authorization header
   ├── Middleware verifies token
   └── User ID extracted from token
```

### Security Layers
```
┌─────────────────────────────────────┐
│  Client-Side (Frontend)             │
│  - Token stored in localStorage     │
│  - Auto-attach to requests          │
│  - Redirect on auth failure         │
└─────────────────┬───────────────────┘
                  │
         Bearer Token in Header
                  │
┌─────────────────▼───────────────────┐
│  Middleware (Backend)               │
│  - Verify JWT signature             │
│  - Check expiration                 │
│  - Extract user ID                  │
└─────────────────┬───────────────────┘
                  │
           Authorized Request
                  │
┌─────────────────▼───────────────────┐
│  Protected Routes                   │
│  - Access user data                 │
│  - Perform operations               │
└─────────────────────────────────────┘
```

---

## ML Algorithm Architecture

### Recommendation Engine Flow
```
User Request → Recommendation Engine
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Collaborative  Content-Based  Popularity
    Filtering      Filtering      Based
        │             │             │
        │             │             │
   Find similar   Match genres   Top rated
   users' likes   & preferences  movies
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
              Hybrid Algorithm
               (60% + 40%)
                      │
                      ▼
            Ranked Movie List
                      │
                      ▼
            Return to User
```

### Collaborative Filtering Algorithm
```javascript
1. Get user's rated movies
2. Find other users who rated same movies highly
3. Calculate user similarity scores
4. Get movies liked by similar users
5. Score and rank recommendations
6. Return top N movies
```

### Content-Based Filtering Algorithm
```javascript
1. Get user's highly rated movies
2. Extract genre preferences
3. Calculate genre frequency
4. Find movies with matching genres
5. Use cosine similarity for scoring
6. Return top N movies
```

---

## API Request/Response Flow

### Example: Get Recommendations
```
Request:
GET /api/movies/recommend/user123
Headers: {
  Authorization: "Bearer eyJhbGc..."
}

↓ Auth Middleware verifies token
↓ Extract userId from token
↓ Call Recommendation Engine
↓ Engine queries database
↓ ML algorithms process data
↓ Generate recommendations

Response:
{
  "recommendations": [
    {
      "_id": "mov001",
      "title": "Inception",
      "genre": ["Sci-Fi", "Action"],
      "rating": 8.8,
      ...
    }
  ],
  "method": "hybrid",
  "count": 10
}
```

---

## Deployment Architecture

### Production Setup
```
┌─────────────────────────────────────┐
│  Vercel (Frontend)                  │
│  - Static React build               │
│  - CDN distribution                 │
│  - HTTPS enabled                    │
└──────────────┬──────────────────────┘
               │
          HTTPS API Calls
               │
┌──────────────▼──────────────────────┐
│  Render (Backend)                   │
│  - Node.js server                   │
│  - Auto-scaling                     │
│  - HTTPS enabled                    │
└──────────────┬──────────────────────┘
               │
        Secure Connection
               │
┌──────────────▼──────────────────────┐
│  MongoDB Atlas (Database)           │
│  - Cloud cluster                    │
│  - Automatic backups                │
│  - Encrypted at rest                │
└─────────────────────────────────────┘
               │
        External API Call
               │
┌──────────────▼──────────────────────┐
│  OpenAI API                         │
│  - GPT model                        │
│  - Natural language processing      │
└─────────────────────────────────────┘
```

---

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Compound indexes for complex queries
- Efficient query patterns
- Pagination for large datasets

### Frontend Optimization
- Code splitting (React lazy loading)
- Asset optimization
- Caching strategies
- Minimal re-renders

### Backend Optimization
- Connection pooling
- Response caching
- Efficient algorithms
- Async/await patterns

---

This architecture ensures:
✅ Scalability
✅ Security
✅ Maintainability
✅ Performance
✅ User Experience
