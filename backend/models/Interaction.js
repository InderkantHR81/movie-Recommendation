const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    trim: true
  },
  interactionType: {
    type: String,
    enum: ['rating', 'view', 'like', 'dislike'],
    default: 'rating'
  }
}, {
  timestamps: true
});

// Compound index for querying user interactions with movies
interactionSchema.index({ userId: 1, movieId: 1 });
interactionSchema.index({ userId: 1 });
interactionSchema.index({ movieId: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);
