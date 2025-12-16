import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import './BookingHistory.css';

const BookingHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadBookings();
        }
    }, [user]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingsAPI.getUserBookings(user.id);
            setBookings(response.data.bookings);
        } catch (error) {
            console.error('Load bookings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'expired': return 'status-expired';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const handleViewDetails = (bookingId) => {
        navigate(`/booking-confirmation/${bookingId}`);
    };

    const handleCancelBooking = async (bookingId, movieTitle) => {
        if (!window.confirm(`Are you sure you want to cancel the booking for "${movieTitle}"?`)) {
            return;
        }

        try {
            await bookingsAPI.cancelBooking(bookingId);
            alert('Booking cancelled successfully! Refund will be processed.');
            loadBookings(); // Reload the list
        } catch (error) {
            console.error('Cancel booking error:', error);
            alert(error.response?.data?.error || 'Failed to cancel booking');
        }
    };

    if (loading) {
        return (
            <div className="booking-history">
                <Navbar />
                <div className="loading">Loading booking history...</div>
            </div>
        );
    }

    return (
        <div className="booking-history">
            <Navbar />

            <div className="history-container">
                <h1>My Booking History</h1>

                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <p>You haven't made any bookings yet</p>
                        <button
                            className="btn-browse"
                            onClick={() => navigate('/dashboard')}
                        >
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-poster">
                                    <img src={booking.movieId.poster} alt={booking.movieId.title} />
                                </div>

                                <div className="booking-info">
                                    <h3>{booking.movieId.title}</h3>
                                    <div className="booking-meta">
                                        <span className="booking-id">ID: {booking.bookingId}</span>
                                        <span className={`booking-status ${getStatusColor(booking.status)}`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="booking-details-list">
                                        <div className="detail-item">
                                            <span className="label">Date:</span>
                                            <span>{new Date(booking.showTime.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Time:</span>
                                            <span>{booking.showTime.time}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Theater:</span>
                                            <span>{booking.theaterName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Seats:</span>
                                            <span>{booking.seats.map(s => s.seatNumber).join(', ')}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Amount:</span>
                                            <span className="amount">₹{booking.price}</span>
                                        </div>
                                    </div>

                                    <div className="booking-actions">
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <button
                                                    className="btn-view-ticket"
                                                    onClick={() => handleViewDetails(booking._id)}
                                                >
                                                    View Ticket
                                                </button>
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => handleCancelBooking(booking._id, booking.movieId.title)}
                                                    style={{
                                                        marginTop: '8px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    }}
                                                >
                                                    Cancel Booking
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'pending' && (
                                            <button
                                                className="btn-cancel"
                                                onClick={() => handleCancelBooking(booking._id, booking.movieId.title)}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    width: '100%'
                                                }}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
