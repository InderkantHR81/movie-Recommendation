const express = require('express');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to generate seat layout
function generateSeats(rows = 10, seatsPerRow = 10) {
  const seats = [];
  const rowLabels = 'ABCDEFGHIJ'.split('');
  
  for (let i = 0; i < rows; i++) {
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        seatNumber: `${rowLabels[i]}${j}`,
        row: rowLabels[i],
        column: j,
        status: 'available'
      });
    }
  }
  
  return seats;
}

// POST /api/shows/create - Create a new show
router.post('/create', auth, async (req, res) => {
  try {
    const { movieId, date, time, theaterName, pricePerSeat } = req.body;

    // Check if show already exists
    const existingShow = await Show.findOne({ movieId, date, time });
    if (existingShow) {
      return res.status(400).json({ error: 'Show already exists for this date and time' });
    }

    // Generate seat layout
    const seats = generateSeats();

    const show = new Show({
      movieId,
      date,
      time,
      theaterName: theaterName || 'CineMax Theater',
      totalSeats: seats.length,
      availableSeats: seats.length,
      seats,
      pricePerSeat: pricePerSeat || 150
    });

    await show.save();

    res.status(201).json({
      message: 'Show created successfully',
      show
    });
  } catch (error) {
    console.error('Create show error:', error);
    res.status(500).json({ error: 'Failed to create show' });
  }
});

// GET /api/shows/movie/:movieId - Get all shows for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    let query = { movieId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // Only show future shows
      query.date = { $gte: new Date() };
    }

    const shows = await Show.find(query)
      .populate('movieId')
      .sort({ date: 1, time: 1 });

    res.json({ shows });
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// GET /api/shows/:id - Get show details with seat layout
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movieId');

    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    // Release expired holds
    const now = new Date();
    let updated = false;
    
    show.seats.forEach(seat => {
      if (seat.status === 'held' && seat.heldUntil < now) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.heldUntil = null;
        updated = true;
      }
    });

    if (updated) {
      show.availableSeats = show.seats.filter(s => s.status === 'available').length;
      await show.save();
    }

    res.json({ show });
  } catch (error) {
    console.error('Get show error:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

// POST /api/shows/seed - Create default shows for all movies
router.post('/seed', async (req, res) => {
  try {
    const movies = await Movie.find();
    const showsCreated = [];

    // Create shows for next 7 days
    const today = new Date();
    const times = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'];

    for (const movie of movies) {
      for (let day = 0; day < 7; day++) {
        const showDate = new Date(today);
        showDate.setDate(today.getDate() + day);
        showDate.setHours(0, 0, 0, 0);

        for (const time of times) {
          // Check if show already exists
          const exists = await Show.findOne({
            movieId: movie._id,
            date: showDate,
            time
          });

          if (!exists) {
            const seats = generateSeats();
            
            const show = new Show({
              movieId: movie._id,
              date: showDate,
              time,
              theaterName: 'CineMax Theater',
              totalSeats: seats.length,
              availableSeats: seats.length,
              seats,
              pricePerSeat: 150
            });

            await show.save();
            showsCreated.push(show);
          }
        }
      }
    }

    res.json({
      message: `Created ${showsCreated.length} shows`,
      showsCreated: showsCreated.length
    });
  } catch (error) {
    console.error('Seed shows error:', error);
    res.status(500).json({ error: 'Failed to seed shows' });
  }
});

module.exports = router;
