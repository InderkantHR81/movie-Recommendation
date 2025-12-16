const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
async function connectDB() {
  try {
    // Try MongoDB Atlas or local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movierecom';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected to:', mongoURI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
    
    // Seed data if database is empty
    setTimeout(async () => {
      try {
        const Movie = require('./models/Movie');
        const count = await Movie.countDocuments();
        if (count === 0) {
          const { seedInMemory } = require('./scripts/seedMovies');
          await seedInMemory();
        }
      } catch (seedErr) {
        console.log('⚠️  Seeding skipped:', seedErr.message);
      }
    }, 1000);
    
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.log('\n📋 Please install MongoDB or use MongoDB Atlas:');
    console.log('   1. MongoDB Atlas (Free): https://www.mongodb.com/cloud/atlas');
    console.log('   2. Local MongoDB: https://www.mongodb.com/try/download/community');
    console.log('   3. Update MONGODB_URI in .env file');
    console.log('\n⚠️  Server running WITHOUT database\n');
  }
}

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/shows', require('./routes/shows'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Movie Recommendation API is running' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
