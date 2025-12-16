const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: [{
    type: String,
    required: true
  }],
  year: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  poster: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Poster'
  },
  director: {
    type: String,
    default: 'Unknown'
  },
  cast: [{
    type: String
  }],
  trailerUrl: {
    type: String
  },
  language: {
    type: String,
    default: 'English'
  },
  duration: {
    type: String,
    default: '120 min'
  },
  releaseDate: {
    type: Date
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
// movieSchema.index({ title: 'text', description: 'text' });  // Disabled due to Korean language issue
movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ rating: -1 });

module.exports = mongoose.model('Movie', movieSchema);
