const Movie = require('../models/Movie');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

class RecommendationEngine {
  
  // Content-Based Filtering: Recommend based on movie genres and description
  async contentBasedRecommendation(userId, limit = 10) {
    try {
      const user = await User.findById(userId).populate('watchHistory.movieId');
      const interactions = await Interaction.find({ userId }).populate('movieId');

      // Get user's favorite genres from preferences and watch history
      let favoriteGenres = [...(user.preferences?.favoriteGenres || [])];
      
      // Extract genres from highly rated movies
      interactions.forEach(interaction => {
        if (interaction.rating >= 7 && interaction.movieId) {
          favoriteGenres = [...favoriteGenres, ...interaction.movieId.genre];
        }
      });

      // Remove duplicates and count frequency
      const genreFrequency = {};
      favoriteGenres.forEach(genre => {
        genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
      });

      // Sort genres by frequency
      const topGenres = Object.keys(genreFrequency)
        .sort((a, b) => genreFrequency[b] - genreFrequency[a])
        .slice(0, 5);

      if (topGenres.length === 0) {
        // If no preferences, return popular movies
        return await this.popularityBasedRecommendation(limit);
      }

      // Get movies with similar genres (excluding already watched)
      const watchedMovieIds = interactions.map(i => i.movieId?._id).filter(Boolean);
      
      const recommendations = await Movie.find({
        genre: { $in: topGenres },
        _id: { $nin: watchedMovieIds }
      })
        .sort({ rating: -1 })
        .limit(limit);

      return recommendations;
    } catch (error) {
      console.error('Content-based recommendation error:', error);
      throw error;
    }
  }

  // Collaborative Filtering: Recommend based on similar users' preferences
  async collaborativeFiltering(userId, limit = 10) {
    try {
      // Get current user's interactions
      const userInteractions = await Interaction.find({ userId }).populate('movieId');
      
      if (userInteractions.length === 0) {
        return await this.popularityBasedRecommendation(limit);
      }

      // Get movies user has rated highly (>= 7)
      const likedMovies = userInteractions
        .filter(i => i.rating >= 7)
        .map(i => i.movieId?._id)
        .filter(Boolean);

      if (likedMovies.length === 0) {
        return await this.contentBasedRecommendation(userId, limit);
      }

      // Find other users who also liked these movies
      const similarUserInteractions = await Interaction.find({
        movieId: { $in: likedMovies },
        userId: { $ne: userId },
        rating: { $gte: 7 }
      }).populate('movieId');

      // Count how many common movies each user has
      const userSimilarity = {};
      similarUserInteractions.forEach(interaction => {
        const otherUserId = interaction.userId.toString();
        userSimilarity[otherUserId] = (userSimilarity[otherUserId] || 0) + 1;
      });

      // Get top similar users
      const similarUsers = Object.keys(userSimilarity)
        .sort((a, b) => userSimilarity[b] - userSimilarity[a])
        .slice(0, 10);

      if (similarUsers.length === 0) {
        return await this.contentBasedRecommendation(userId, limit);
      }

      // Get movies that similar users liked but current user hasn't watched
      const watchedMovieIds = userInteractions.map(i => i.movieId?._id).filter(Boolean);
      
      const recommendedInteractions = await Interaction.find({
        userId: { $in: similarUsers },
        rating: { $gte: 7 },
        movieId: { $nin: watchedMovieIds }
      }).populate('movieId');

      // Count movie recommendations and score them
      const movieScores = {};
      recommendedInteractions.forEach(interaction => {
        if (interaction.movieId) {
          const movieId = interaction.movieId._id.toString();
          if (!movieScores[movieId]) {
            movieScores[movieId] = {
              movie: interaction.movieId,
              score: 0
            };
          }
          // Score based on rating and user similarity
          movieScores[movieId].score += interaction.rating * (userSimilarity[interaction.userId.toString()] || 1);
        }
      });

      // Sort by score and return top recommendations
      const recommendations = Object.values(movieScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.movie);

      return recommendations;
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      throw error;
    }
  }

  // Hybrid Recommendation: Combine content-based and collaborative filtering
  async hybridRecommendation(userId, limit = 10) {
    try {
      const interactions = await Interaction.find({ userId });
      
      // If new user (no interactions), use popularity-based
      if (interactions.length === 0) {
        return await this.popularityBasedRecommendation(limit);
      }

      // Get recommendations from both methods
      const contentBased = await this.contentBasedRecommendation(userId, Math.ceil(limit * 0.6));
      const collaborative = await this.collaborativeFiltering(userId, Math.ceil(limit * 0.4));

      // Combine and remove duplicates
      const combined = [...contentBased, ...collaborative];
      const uniqueMovies = [];
      const seenIds = new Set();

      combined.forEach(movie => {
        if (movie && !seenIds.has(movie._id.toString())) {
          seenIds.add(movie._id.toString());
          uniqueMovies.push(movie);
        }
      });

      return uniqueMovies.slice(0, limit);
    } catch (error) {
      console.error('Hybrid recommendation error:', error);
      throw error;
    }
  }

  // Popularity-Based: For new users without preferences
  async popularityBasedRecommendation(limit = 10) {
    try {
      const movies = await Movie.find()
        .sort({ rating: -1, ratingCount: -1 })
        .limit(limit);
      
      return movies;
    } catch (error) {
      console.error('Popularity-based recommendation error:', error);
      throw error;
    }
  }

  // Calculate cosine similarity between two movies based on genres
  calculateCosineSimilarity(movie1, movie2) {
    const genres1 = new Set(movie1.genre);
    const genres2 = new Set(movie2.genre);
    
    const intersection = [...genres1].filter(g => genres2.has(g)).length;
    const magnitude1 = Math.sqrt(genres1.size);
    const magnitude2 = Math.sqrt(genres2.size);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return intersection / (magnitude1 * magnitude2);
  }

  // Find similar movies based on genres and metadata
  async findSimilarMovies(movieId, limit = 5) {
    try {
      const targetMovie = await Movie.findById(movieId);
      if (!targetMovie) {
        throw new Error('Movie not found');
      }

      const allMovies = await Movie.find({ _id: { $ne: movieId } });
      
      // Calculate similarity scores
      const similarities = allMovies.map(movie => ({
        movie,
        similarity: this.calculateCosineSimilarity(targetMovie, movie)
      }));

      // Sort by similarity and return top results
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      return similarities.slice(0, limit).map(item => item.movie);
    } catch (error) {
      console.error('Find similar movies error:', error);
      throw error;
    }
  }

  // Get trending movies (highest rated in recent time)
  async getTrendingMovies(limit = 10) {
    try {
      const movies = await Movie.find()
        .sort({ ratingCount: -1, rating: -1 })
        .limit(limit);
      
      return movies;
    } catch (error) {
      console.error('Get trending movies error:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationEngine();
