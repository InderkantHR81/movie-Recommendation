const express = require('express');
const Movie = require('../models/Movie');
const Interaction = require('../models/Interaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const recommendationEngine = require('../services/recommendationEngine');

const router = express.Router();

// GET /api/movies - Get all movies with optional filters
router.get('/', async (req, res) => {
  try {
    const { genre, year, search, limit = 100, page = 1 } = req.query;
    
    let query = {};
    
    if (genre) {
      query.genre = { $in: [genre] };
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movies = await Movie.find(query)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET /api/movies/search - Search movies by title
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } },
        { cast: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json({ movies });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/movies/recommend/:userId - Get personalized recommendations
router.get('/recommend/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, method = 'hybrid' } = req.query;
    
    // Verify user is requesting their own recommendations or is authorized
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    let recommendations;
    
    switch(method) {
      case 'content':
        recommendations = await recommendationEngine.contentBasedRecommendation(userId, parseInt(limit));
        break;
      case 'collaborative':
        recommendations = await recommendationEngine.collaborativeFiltering(userId, parseInt(limit));
        break;
      case 'popular':
        recommendations = await recommendationEngine.popularityBasedRecommendation(parseInt(limit));
        break;
      default:
        recommendations = await recommendationEngine.hybridRecommendation(userId, parseInt(limit));
    }
    
    res.json({
      recommendations,
      method,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// GET /api/movies/trending - Get trending movies
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trending = await recommendationEngine.getTrendingMovies(parseInt(limit));
    
    res.json({ movies: trending });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// GET /api/movies/:id - Get single movie details
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Get similar movies
    const similar = await recommendationEngine.findSimilarMovies(movie._id, 5);
    
    res.json({ movie, similar });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// GET /api/movies/:id/similar - Get similar movies
router.get('/:id/similar', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const similar = await recommendationEngine.findSimilarMovies(req.params.id, parseInt(limit));
    
    res.json({ movies: similar });
  } catch (error) {
    console.error('Get similar movies error:', error);
    res.status(500).json({ error: 'Failed to fetch similar movies' });
  }
});

// POST /api/movies/rate - Rate a movie
router.post('/rate', auth, async (req, res) => {
  try {
    const { movieId, rating, feedback } = req.body;
    
    // Validation
    if (!movieId || rating === undefined) {
      return res.status(400).json({ error: 'Movie ID and rating are required' });
    }
    
    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if user already rated this movie
    let interaction = await Interaction.findOne({
      userId: req.userId,
      movieId
    });
    
    if (interaction) {
      // Update existing rating
      const oldRating = interaction.rating;
      interaction.rating = rating;
      interaction.feedback = feedback;
      await interaction.save();
      
      // Update movie rating
      movie.totalRatings = movie.totalRatings - oldRating + rating;
      movie.rating = movie.totalRatings / movie.ratingCount;
    } else {
      // Create new rating
      interaction = new Interaction({
        userId: req.userId,
        movieId,
        rating,
        feedback,
        interactionType: 'rating'
      });
      await interaction.save();
      
      // Update movie rating
      movie.ratingCount += 1;
      movie.totalRatings += rating;
      movie.rating = movie.totalRatings / movie.ratingCount;
      
      // Add to user's watch history
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          watchHistory: {
            movieId,
            watchedAt: new Date()
          }
        }
      });
    }
    
    await movie.save();
    
    res.json({
      message: 'Movie rated successfully',
      interaction,
      movieRating: movie.rating
    });
  } catch (error) {
    console.error('Rate movie error:', error);
    res.status(500).json({ error: 'Failed to rate movie' });
  }
});

// GET /api/movies/user/ratings - Get user's ratings
router.get('/user/ratings', auth, async (req, res) => {
  try {
    const interactions = await Interaction.find({ userId: req.userId })
      .populate('movieId')
      .sort({ createdAt: -1 });
    
    res.json({ ratings: interactions });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch user ratings' });
  }
});

// GET /api/movies/genres/list - Get all available genres
router.get('/genres/list', async (req, res) => {
  try {
    const genres = await Movie.distinct('genre');
    res.json({ genres: genres.sort() });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

module.exports = router;
