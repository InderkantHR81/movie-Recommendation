import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showsAPI, bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import './SeatSelection.css';

const SeatSelection = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadShowDetails();

        // Auto-refresh seat status every 10 seconds
        const refreshInterval = setInterval(() => {
            loadShowDetails();
        }, 10000);

        return () => clearInterval(refreshInterval);
    }, [showId]);

    const loadShowDetails = async () => {
        try {
            setLoading(true);
            const response = await showsAPI.getShow(showId);
            setShow(response.data.show);
        } catch (error) {
            console.error('Load show error:', error);
            setError('Failed to load show details');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seat) => {
        if (seat.status !== 'available') return;

        const seatNumber = seat.seatNumber;
        if (selectedSeats.find(s => s.seatNumber === seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, { seatNumber, row: seat.row, column: seat.column }]);
        }
    };

    const addMoreSeats = () => {
        // Just a visual indication - user can click more seats
        alert('Click on available seats to select them');
    };

    const getSeatClass = (seat) => {
        if (seat.status === 'booked') return 'seat booked';
        if (seat.status === 'held') return 'seat held';
        if (selectedSeats.find(s => s.seatNumber === seat.seatNumber)) return 'seat selected';
        return 'seat available';
    };

    const handleConfirmSelection = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        // Validate required data
        if (!show || !show._id || !show.movieId || !show.movieId._id) {
            setError('Show data is incomplete. Please refresh the page.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            console.log('Holding seats...', {
                movieId: show.movieId._id,
                showId: show._id,
                seats: selectedSeats
            });

            // Hold the seats
            await bookingsAPI.holdSeats({
                movieId: show.movieId._id,
                showId: show._id,
                seats: selectedSeats,
                showTime: {
                    date: show.date,
                    time: show.time
                }
            });

            console.log('Seats held successfully, creating booking...');

            // Create booking
            const bookingResponse = await bookingsAPI.createBooking({
                movieId: show.movieId._id,
                showId: show._id,
                seats: selectedSeats,
                showTime: {
                    date: show.date,
                    time: show.time
                }
            });

            console.log('Booking created:', bookingResponse.data);

            // Navigate to booking summary
            navigate(`/booking-summary/${bookingResponse.data.booking._id}`);
        } catch (error) {
            console.error('Confirm selection error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorData = error.response?.data;

            if (errorData?.unavailableSeats) {
                const unavailableList = errorData.unavailableSeats
                    .map(s => `${s.seatNumber} (${s.reason})`)
                    .join(', ');
                setError(`Seats unavailable: ${unavailableList}. Please refresh and select different seats.`);
            } else if (errorData?.details) {
                setError(`${errorData.error} - ${errorData.details}`);
            } else {
                setError(errorData?.error || 'Failed to hold seats. Please try again.');
            }

            // Refresh show data to get latest seat status
            await loadShowDetails();
            setSelectedSeats([]);
            setLoading(false);
        }
    };

    if (loading && !show) {
        return (
            <div className="seat-selection">
                <Navbar />
                <div className="loading">Loading seat layout...</div>
            </div>
        );
    }

    if (!show) {
        return (
            <div className="seat-selection">
                <Navbar />
                <div className="error">Show not found</div>
            </div>
        );
    }

    // Group seats by row
    const seatsByRow = {};
    show.seats.forEach(seat => {
        if (!seatsByRow[seat.row]) {
            seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
    });

    const totalPrice = selectedSeats.length * show.pricePerSeat;

    return (
        <div className="seat-selection">
            <Navbar />

            <div className="seat-selection-container">
                <div className="movie-header">
                    <h1>{show.movieId.title}</h1>
                    <p className="show-details">
                        {new Date(show.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })} • {show.time}
                    </p>
                    <p className="theater-name">{show.theaterName}</p>
                    <button
                        className="btn-refresh"
                        onClick={loadShowDetails}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🔄 Refresh Seats
                    </button>
                </div>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <div className="seat-layout-section">
                    <div className="screen">
                        <div className="screen-text">SCREEN</div>
                    </div>

                    <div className="seat-grid">
                        {Object.keys(seatsByRow).sort().map((row) => (
                            <div key={row} className="seat-row">
                                <span className="row-label">{row}</span>
                                <div className="seats-in-row">
                                    {seatsByRow[row].map((seat) => (
                                        <button
                                            key={seat.seatNumber}
                                            className={getSeatClass(seat)}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={seat.status !== 'available'}
                                            title={seat.seatNumber}
                                        >
                                            {seat.column}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="seat-legend">
                        <div className="legend-item">
                            <div className="seat available"></div>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat selected"></div>
                            <span>Selected</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat booked"></div>
                            <span>Booked</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat held"></div>
                            <span>On Hold</span>
                        </div>
                    </div>
                </div>

                <div className="selection-summary">
                    <div className="summary-info">
                        <h3>Selected Seats</h3>
                        {selectedSeats.length === 0 ? (
                            <p className="no-selection">No seats selected</p>
                        ) : (
                            <>
                                <div className="selected-seats-list">
                                    {selectedSeats.map((seat, index) => (
                                        <span key={index} className="selected-seat-badge">
                                            {seat.seatNumber}
                                        </span>
                                    ))}
                                </div>
                                <button className="btn-add-more" onClick={addMoreSeats}>
                                    + Add One More
                                </button>
                            </>
                        )}
                    </div>

                    <div className="price-summary">
                        <div className="price-detail">
                            <span>Seats: {selectedSeats.length}</span>
                            <span>₹{show.pricePerSeat} × {selectedSeats.length}</span>
                        </div>
                        <div className="price-total">
                            <strong>Total:</strong>
                            <strong>₹{totalPrice}</strong>
                        </div>
                    </div>

                    <button
                        className="btn-confirm"
                        onClick={handleConfirmSelection}
                        disabled={selectedSeats.length === 0 || loading}
                    >
                        {loading ? 'Processing...' : 'Confirm Selection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
