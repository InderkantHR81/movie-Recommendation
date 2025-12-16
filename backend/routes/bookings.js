const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const router = express.Router();

// Generate unique booking ID
function generateBookingId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `BK${timestamp}${random}`.toUpperCase();
}

// POST /api/bookings/hold - Temporarily hold seats
router.post('/hold', auth, async (req, res) => {
  try {
    const { movieId, showId, seats, showTime } = req.body;

    console.log('Hold seats request:', { movieId, showId, seatsCount: seats?.length });

    if (!seats || seats.length === 0) {
      return res.status(400).json({ error: 'Please select at least one seat' });
    }

    // Validate showId format
    if (!showId || !showId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid showId format:', showId);
      return res.status(400).json({ error: 'Invalid show ID format' });
    }

    // Find the show
    let show = await Show.findById(showId).populate('movieId');
    
    if (!show) {
      console.error('Show not found:', showId);
      return res.status(404).json({ error: 'Show not found' });
    }

    console.log('Show found:', { showId: show._id, movieTitle: show.movieId?.title, totalSeats: show.seats?.length });

    const now = new Date();
    const seatNumbers = seats.map(s => s.seatNumber);

    // First, release any expired holds
    let releasedSeats = 0;
    show.seats.forEach(seat => {
      if (seat.status === 'held' && seat.heldUntil && seat.heldUntil < now) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.heldUntil = null;
        releasedSeats++;
      }
    });

    if (releasedSeats > 0) {
      await show.save();
      console.log(`✓ Released ${releasedSeats} expired held seats`);
    }

    // Now check if requested seats are available
    const unavailableSeats = [];
    seatNumbers.forEach(seatNumber => {
      const seat = show.seats.find(s => s.seatNumber === seatNumber);
      if (!seat) {
        unavailableSeats.push({ seatNumber, reason: 'Seat not found' });
      } else if (seat.status === 'booked') {
        unavailableSeats.push({ seatNumber, reason: 'Already booked' });
      } else if (seat.status === 'held' && seat.heldUntil > now) {
        // Check if it's held by someone else
        if (seat.heldBy && seat.heldBy.toString() !== req.userId) {
          unavailableSeats.push({ seatNumber, reason: 'Currently on hold by another user' });
        }
      }
    });

    if (unavailableSeats.length > 0) {
      console.log('Unavailable seats:', unavailableSeats);
      return res.status(400).json({ 
        error: 'Some seats are not available. Please select different seats.',
        unavailableSeats
      });
    }

    // Hold the seats for 5 minutes
    const holdUntil = new Date(Date.now() + 5 * 60 * 1000);
    
    seats.forEach(seat => {
      const showSeat = show.seats.find(s => s.seatNumber === seat.seatNumber);
      if (showSeat && showSeat.status === 'available') {
        showSeat.status = 'held';
        showSeat.heldBy = req.userId;
        showSeat.heldUntil = holdUntil;
      }
    });

    await show.save();

    console.log(`✓ Successfully held ${seats.length} seats until ${holdUntil.toLocaleTimeString()}`);

    res.json({
      message: 'Seats held successfully',
      heldUntil: holdUntil,
      seats: seatNumbers
    });
  } catch (error) {
    console.error('❌ Hold seats error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to hold seats. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/bookings/create - Create a booking
router.post('/create', auth, async (req, res) => {
  try {
    const { movieId, showId, seats, showTime } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ error: 'Please select at least one seat' });
    }

    // Get show details
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    // Calculate total price
    const pricePerSeat = show.pricePerSeat || 150;
    const totalPrice = seats.length * pricePerSeat;

    // Create booking
    const booking = new Booking({
      userId: req.userId,
      movieId,
      seats,
      showTime,
      theaterName: show.theaterName,
      price: totalPrice,
      pricePerSeat,
      status: 'pending',
      paymentStatus: 'pending',
      bookingId: generateBookingId()
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        seats: booking.seats,
        price: booking.price,
        expiresAt: booking.expiresAt
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// POST /api/bookings/confirm - Confirm booking after payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { bookingId, paymentId } = req.body;

    const booking = await Booking.findOne({ 
      bookingId,
      userId: req.userId 
    }).populate('movieId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({ error: 'Booking already confirmed' });
    }

    // Check if booking expired
    if (booking.expiresAt < new Date()) {
      booking.status = 'expired';
      await booking.save();
      return res.status(400).json({ error: 'Booking expired. Please book again.' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentStatus = 'completed';
    booking.paymentId = paymentId;
    await booking.save();

    // Update show seats to booked
    const showDate = new Date(booking.showTime.date);
    showDate.setHours(0, 0, 0, 0);
    
    const show = await Show.findOne({
      movieId: booking.movieId._id,
      date: showDate,
      time: booking.showTime.time
    });

    if (show) {
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      show.seats.forEach(seat => {
        if (seatNumbers.includes(seat.seatNumber)) {
          seat.status = 'booked';
          seat.bookedBy = req.userId;
          seat.bookingId = bookingId;
          seat.heldBy = null;
          seat.heldUntil = null;
        }
      });
      show.availableSeats = show.seats.filter(s => s.status === 'available').length;
      await show.save();
    }

    res.json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// POST /api/bookings/cancel/:id - Cancel a booking
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('movieId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify user owns this booking
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Cannot cancel already cancelled bookings
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Cannot cancel expired bookings
    if (booking.status === 'expired') {
      return res.status(400).json({ error: 'Cannot cancel expired booking' });
    }

    // Update booking status to cancelled
    const previousStatus = booking.status;
    booking.status = 'cancelled';
    
    // If payment was completed, mark for refund
    if (booking.paymentStatus === 'completed') {
      booking.paymentStatus = 'refunded';
    }
    
    await booking.save();

    // Release the seats back to available
    const showDate = new Date(booking.showTime.date);
    showDate.setHours(0, 0, 0, 0);
    
    const show = await Show.findOne({
      movieId: booking.movieId._id,
      date: showDate,
      time: booking.showTime.time
    });

    if (show) {
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      show.seats.forEach(seat => {
        if (seatNumbers.includes(seat.seatNumber)) {
          seat.status = 'available';
          seat.bookedBy = null;
          seat.bookingId = null;
          seat.heldBy = null;
          seat.heldUntil = null;
        }
      });
      show.availableSeats = show.seats.filter(s => s.status === 'available').length;
      await show.save();
      console.log(`✓ Released ${seatNumbers.length} seats for cancelled booking ${booking.bookingId}`);
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking,
      refundAmount: booking.paymentStatus === 'refunded' ? booking.price : 0
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// GET /api/bookings/user/:userId - Get user's booking history
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own bookings
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const bookings = await Booking.find({ userId })
      .populate('movieId')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify user owns this booking
    if (booking.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// GET /api/bookings/ticket/pdf/:id - Download PDF ticket
router.get('/ticket/pdf/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking not confirmed' });
    }

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      movieId: booking.movieId._id,
      seats: booking.seats.map(s => s.seatNumber),
      userId: booking.userId._id
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(25).text('MOVIE TICKET', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(20).text(booking.movieId.title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Booking ID: ${booking.bookingId}`);
    doc.text(`Theater: ${booking.theaterName}`);
    doc.text(`Date: ${new Date(booking.showTime.date).toLocaleDateString()}`);
    doc.text(`Time: ${booking.showTime.time}`);
    doc.moveDown();

    doc.text(`Passenger Name: ${booking.userId.name}`);
    doc.text(`Seats: ${booking.seats.map(s => s.seatNumber).join(', ')}`);
    doc.moveDown();

    doc.text(`Price per Seat: ₹${booking.pricePerSeat}`);
    doc.text(`Total Seats: ${booking.seats.length}`);
    doc.fontSize(14).text(`Total Amount: ₹${booking.price}`, { bold: true });
    doc.fontSize(12);
    doc.moveDown();

    doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`);
    doc.text(`Booking Status: ${booking.status.toUpperCase()}`);
    doc.moveDown();

    // Add QR Code
    doc.text('Scan QR Code:', { underline: true });
    doc.image(qrCodeDataUrl, { width: 150, height: 150 });

    doc.moveDown();
    doc.fontSize(10).text('Thank you for booking with us!', { align: 'center' });
    doc.text('Enjoy your movie!', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

// GET /api/bookings/ticket/json/:id - Download JSON ticket
router.get('/ticket/json/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking not confirmed' });
    }

    const ticket = {
      bookingId: booking.bookingId,
      movieDetails: {
        title: booking.movieId.title,
        genre: booking.movieId.genre,
        director: booking.movieId.director,
        cast: booking.movieId.cast,
        language: booking.movieId.language,
        duration: booking.movieId.duration,
        releaseDate: booking.movieId.releaseDate,
        rating: booking.movieId.rating,
        description: booking.movieId.description
      },
      theater: booking.theaterName,
      showTime: {
        date: new Date(booking.showTime.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: booking.showTime.time
      },
      passengerDetails: {
        name: booking.userId.name,
        email: booking.userId.email
      },
      seats: booking.seats.map(s => s.seatNumber),
      pricing: {
        pricePerSeat: booking.pricePerSeat,
        totalSeats: booking.seats.length,
        totalPrice: booking.price,
        currency: 'INR'
      },
      status: {
        payment: booking.paymentStatus,
        booking: booking.status
      },
      bookingDate: new Date(booking.createdAt).toLocaleString('en-US'),
      qrCode: {
        data: JSON.stringify({
          bookingId: booking.bookingId,
          movieId: booking.movieId._id,
          seats: booking.seats.map(s => s.seatNumber),
          userId: booking.userId._id
        })
      },
      instructions: [
        'Please arrive at the theater 15 minutes before showtime',
        'Carry a valid ID proof along with your ticket',
        'Outside food and beverages are not allowed',
        'Show this ticket at the entrance for verification'
      ]
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingId}.json`);
    res.json(ticket);
  } catch (error) {
    console.error('Generate JSON ticket error:', error);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

// DELETE /api/bookings/release-expired - Release expired seat holds (cron job)
router.post('/release-expired', async (req, res) => {
  try {
    const now = new Date();
    
    // Find all shows with held seats
    const shows = await Show.find({
      'seats.status': 'held'
    });

    let releasedCount = 0;

    for (const show of shows) {
      let updated = false;
      
      show.seats.forEach(seat => {
        if (seat.status === 'held' && seat.heldUntil < now) {
          seat.status = 'available';
          seat.heldBy = null;
          seat.heldUntil = null;
          releasedCount++;
          updated = true;
        }
      });

      if (updated) {
        show.availableSeats = show.seats.filter(s => s.status === 'available').length;
        await show.save();
      }
    }

    // Expire old pending bookings
    await Booking.updateMany(
      { 
        status: 'pending',
        expiresAt: { $lt: now }
      },
      { 
        $set: { status: 'expired' }
      }
    );

    res.json({ 
      message: `Released ${releasedCount} expired seat holds`,
      releasedSeats: releasedCount
    });
  } catch (error) {
    console.error('Release expired seats error:', error);
    res.status(500).json({ error: 'Failed to release expired seats' });
  }
});

module.exports = router;
