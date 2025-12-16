const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  theaterName: {
    type: String,
    default: 'CineMax Theater'
  },
  totalSeats: {
    type: Number,
    default: 100
  },
  availableSeats: {
    type: Number,
    default: 100
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    row: String,
    column: Number,
    status: {
      type: String,
      enum: ['available', 'booked', 'held'],
      default: 'available'
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    heldUntil: Date,
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookingId: String
  }],
  pricePerSeat: {
    type: Number,
    default: 150
  }
}, {
  timestamps: true
});

showSchema.index({ movieId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Show', showSchema);
