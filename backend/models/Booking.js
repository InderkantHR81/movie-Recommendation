const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    row: String,
    column: Number
  }],
  showTime: {
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  theaterName: {
    type: String,
    default: 'CineMax Theater'
  },
  price: {
    type: Number,
    required: true
  },
  pricePerSeat: {
    type: Number,
    default: 150
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  bookingId: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ expiresAt: 1 });

// Auto-expire pending bookings after 5 minutes
bookingSchema.pre('save', function(next) {
  if (this.status === 'pending' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
