const OpenAI = require('openai');
const Movie = require('../models/Movie');
const User = require('../models/User');
const recommendationEngine = require('./recommendationEngine');

class ChatbotService {
  constructor() {
    // Only initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.useOpenAI = true;
    } else {
      this.useOpenAI = false;
      console.log('ℹ️  Running chatbot in offline mode (no OpenAI API key)');
    }
  }

  // Main chatbot handler
  async handleMessage(userId, message) {
    try {
      // Analyze the intent of the message
      const intent = await this.analyzeIntent(message);
      
      let response;
      
      switch(intent.type) {
        case 'recommend_similar':
          response = await this.handleSimilarMovieRequest(intent.movieTitle);
          break;
        case 'actor_query':
          response = await this.handleActorQuery(intent.movieTitle);
          break;
        case 'genre_recommendation':
          response = await this.handleGenreRecommendation(intent.genre, intent.limit);
          break;
        case 'personalized_recommendation':
          response = await this.handlePersonalizedRecommendation(userId, intent.limit);
          break;
        case 'movie_info':
          response = await this.handleMovieInfo(intent.movieTitle);
          break;
        case 'general_query':
        default:
          response = await this.handleGeneralQuery(userId, message);
      }
      
      return response;
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        message: "I'm sorry, I encountered an error processing your request. Please try again.",
        error: true
      };
    }
  }

  // Analyze user intent using OpenAI or simple pattern matching
  async analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Simple pattern matching for offline mode
    if (!this.useOpenAI) {
      // Check for similar movie requests
      if (lowerMsg.includes('similar') || lowerMsg.includes('like')) {
        const movieMatch = message.match(/like\s+([^?]+)|similar\s+to\s+([^?]+)/i);
        return {
          type: 'recommend_similar',
          movieTitle: movieMatch ? (movieMatch[1] || movieMatch[2]).trim() : null,
          limit: 5
        };
      }
      
      // Check for actor queries
      if (lowerMsg.includes('actor') || lowerMsg.includes('cast') || lowerMsg.includes('who acted')) {
        const movieMatch = message.match(/in\s+([^?]+)|about\s+([^?]+)/i);
        return {
          type: 'actor_query',
          movieTitle: movieMatch ? (movieMatch[1] || movieMatch[2]).trim() : null
        };
      }
      
      // Check for genre recommendations
      const genres = ['action', 'romance', 'romantic', 'sci-fi', 'scifi', 'drama', 'comedy', 'thriller', 'crime', 'adventure', 'animation'];
      const foundGenre = genres.find(g => lowerMsg.includes(g));
      if (foundGenre || lowerMsg.includes('genre') || lowerMsg.includes('show me')) {
        return {
          type: 'genre_recommendation',
          genre: foundGenre || null,
          limit: parseInt(message.match(/\d+/)?.[0]) || 5
        };
      }
      
      // Check for movie info
      if (lowerMsg.includes('about') || lowerMsg.includes('tell me') || lowerMsg.includes('what is')) {
        const movieMatch = message.match(/about\s+([^?]+)|tell.*about\s+([^?]+)/i);
        return {
          type: 'movie_info',
          movieTitle: movieMatch ? (movieMatch[1] || movieMatch[2]).trim() : null
        };
      }
      
      // Check for personalized recommendations
      if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest')) {
        return {
          type: 'personalized_recommendation',
          limit: 5
        };
      }
      
      return { type: 'general_query' };
    }
    
    // Use OpenAI if available
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an intent classifier for a movie recommendation chatbot. 
            Analyze the user's message and return a JSON object with the intent type and extracted entities.
            
            Intent types:
            - recommend_similar: User wants movies similar to a specific movie
            - actor_query: User asks about actors in a movie
            - genre_recommendation: User wants movies of a specific genre
            - personalized_recommendation: User wants personalized recommendations
            - movie_info: User wants information about a specific movie
            - general_query: General conversation or unclear intent
            
            Return JSON format:
            {
              "type": "intent_type",
              "movieTitle": "extracted movie title if any",
              "genre": "extracted genre if any",
              "limit": number (default 5)
            }`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const intent = JSON.parse(completion.choices[0].message.content);
      return intent;
    } catch (error) {
      console.error('Intent analysis error:', error);
      return { type: 'general_query' };
    }
  }

  // Handle similar movie recommendations
  async handleSimilarMovieRequest(movieTitle) {
    try {
      if (!movieTitle) {
        return { message: "Please specify which movie you'd like similar recommendations for." };
      }

      // Find the movie
      const movie = await Movie.findOne({
        title: { $regex: movieTitle, $options: 'i' }
      });

      if (!movie) {
        return {
          message: `I couldn't find a movie called "${movieTitle}". Could you check the spelling or try another title?`
        };
      }

      // Get similar movies
      const similar = await recommendationEngine.findSimilarMovies(movie._id, 5);

      const movieList = similar.map((m, i) => 
        `${i + 1}. ${m.title} (${m.year}) - Rating: ${m.rating.toFixed(1)}/10`
      ).join('\n');

      return {
        message: `Based on "${movie.title}", here are some similar movies you might enjoy:\n\n${movieList}`,
        movies: similar
      };
    } catch (error) {
      console.error('Similar movie request error:', error);
      return { message: "I had trouble finding similar movies. Please try again." };
    }
  }

  // Handle actor/cast queries
  async handleActorQuery(movieTitle) {
    try {
      if (!movieTitle) {
        return { message: "Which movie would you like to know about?" };
      }

      const movie = await Movie.findOne({
        title: { $regex: movieTitle, $options: 'i' }
      });

      if (!movie) {
        return { message: `I couldn't find a movie called "${movieTitle}".` };
      }

      const castList = movie.cast && movie.cast.length > 0 
        ? movie.cast.join(', ')
        : 'Cast information not available';

      return {
        message: `"${movie.title}" (${movie.year})

Director: ${movie.director}

Cast: ${castList}`,
        movie
      };
    } catch (error) {
      console.error('Actor query error:', error);
      return { message: "I had trouble retrieving cast information." };
    }
  }

  // Handle genre-based recommendations
  async handleGenreRecommendation(genre, limit = 5) {
    try {
      if (!genre) {
        const genres = await Movie.distinct('genre');
        return {
          message: `Please specify a genre. Available genres include: ${genres.slice(0, 10).join(', ')}`
        };
      }

      const movies = await Movie.find({
        genre: { $regex: genre, $options: 'i' }
      })
        .sort({ rating: -1 })
        .limit(limit);

      if (movies.length === 0) {
        return { message: `I couldn't find any ${genre} movies. Try another genre?` };
      }

      const movieList = movies.map((m, i) => 
        `${i + 1}. ${m.title} (${m.year}) - Rating: ${m.rating.toFixed(1)}/10`
      ).join('\n');

      return {
        message: `Here are the top ${movies.length} ${genre} movies:\n\n${movieList}`,
        movies
      };
    } catch (error) {
      console.error('Genre recommendation error:', error);
      return { message: "I had trouble finding movies in that genre." };
    }
  }

  // Handle personalized recommendations
  async handlePersonalizedRecommendation(userId, limit = 5) {
    try {
      const recommendations = await recommendationEngine.hybridRecommendation(userId, limit);

      if (recommendations.length === 0) {
        return {
          message: "I don't have enough information about your preferences yet. Try rating some movies first!"
        };
      }

      const movieList = recommendations.map((m, i) => 
        `${i + 1}. ${m.title} (${m.year}) - ${m.genre.join(', ')} - Rating: ${m.rating.toFixed(1)}/10`
      ).join('\n');

      return {
        message: `Based on your preferences, here are my personalized recommendations:\n\n${movieList}`,
        movies: recommendations
      };
    } catch (error) {
      console.error('Personalized recommendation error:', error);
      return { message: "I had trouble generating personalized recommendations." };
    }
  }

  // Handle movie information requests
  async handleMovieInfo(movieTitle) {
    try {
      if (!movieTitle) {
        return { message: "Which movie would you like to know about?" };
      }

      const movie = await Movie.findOne({
        title: { $regex: movieTitle, $options: 'i' }
      });

      if (!movie) {
        return { message: `I couldn't find a movie called "${movieTitle}".` };
      }

      const info = `**${movie.title}** (${movie.year})

📊 Rating: ${movie.rating.toFixed(1)}/10 (${movie.ratingCount} ratings)
🎬 Director: ${movie.director}
🎭 Genre: ${movie.genre.join(', ')}

📝 Description:
${movie.description}

${movie.cast && movie.cast.length > 0 ? `⭐ Cast: ${movie.cast.join(', ')}` : ''}`;

      return {
        message: info,
        movie
      };
    } catch (error) {
      console.error('Movie info error:', error);
      return { message: "I had trouble retrieving movie information." };
    }
  }

  // Handle general queries using OpenAI or offline responses
  async handleGeneralQuery(userId, message) {
    // Offline mode response
    if (!this.useOpenAI) {
      return {
        message: "Hi! I'm your movie assistant. I can help you with:\n\n" +
                 "• Find movies similar to ones you love (try: 'movies like Inception')\n" +
                 "• Get actor information (try: 'who acted in The Dark Knight?')\n" +
                 "• Recommend movies by genre (try: 'show me action movies')\n" +
                 "• Get movie details (try: 'tell me about Titanic')\n" +
                 "• Personalized recommendations (try: 'recommend me something')\n\n" +
                 "What would you like to know?"
      };
    }
    
    // OpenAI mode
    try {
      // Get user's watch history for context
      const user = await User.findById(userId).populate('watchHistory.movieId');
      const watchedMovies = user?.watchHistory
        ?.slice(0, 5)
        .map(w => w.movieId?.title)
        .filter(Boolean) || [];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a friendly movie recommendation assistant. You help users discover movies they'll love.
            You can recommend movies, answer questions about films, actors, directors, and genres.
            Be conversational, enthusiastic, and helpful.
            
            User's recently watched movies: ${watchedMovies.join(', ') || 'None yet'}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return {
        message: completion.choices[0].message.content
      };
    } catch (error) {
      console.error('General query error:', error);
      return {
        message: "I'm here to help you find great movies! You can ask me to recommend movies, tell you about actors, or suggest films by genre. What would you like to know?"
      };
    }
  }
}

module.exports = new ChatbotService();
