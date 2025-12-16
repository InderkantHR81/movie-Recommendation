import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import './BookingSummary.css';

const BookingSummary = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    useEffect(() => {
        if (!booking || booking.status !== 'pending') return;

        const timer = setInterval(() => {
            const now = new Date();
            const expiresAt = new Date(booking.expiresAt);
            const secondsLeft = Math.floor((expiresAt - now) / 1000);

            if (secondsLeft <= 0) {
                clearInterval(timer);
                alert('Booking expired! Please book again.');
                navigate('/dashboard');
            } else {
                setTimeLeft(secondsLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [booking]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingsAPI.getBooking(bookingId);
            setBooking(response.data.booking);
        } catch (error) {
            console.error('Load booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProceedToPayment = () => {
        navigate(`/payment/${bookingId}`);
    };

    const handleCancelBooking = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
            return;
        }

        try {
            setLoading(true);
            await bookingsAPI.cancelBooking(bookingId);
            alert('Booking cancelled successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Cancel booking error:', error);
            alert(error.response?.data?.error || 'Failed to cancel booking');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="booking-summary">
                <Navbar />
                <div className="loading">Loading booking details...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="booking-summary">
                <Navbar />
                <div className="error">Booking not found</div>
            </div>
        );
    }

    return (
        <div className="booking-summary">
            <Navbar />

            <div className="booking-summary-container">
                <div className="summary-card">
                    <h1>Booking Summary</h1>

                    {booking.status === 'pending' && (
                        <div className="timer-alert">
                            <span className="timer-icon">⏰</span>
                            <span>Complete payment in: <strong>{formatTime(timeLeft)}</strong></span>
                        </div>
                    )}

                    <div className="booking-details">
                        <div className="movie-poster">
                            <img src={booking.movieId.poster} alt={booking.movieId.title} />
                        </div>

                        <div className="booking-info">
                            <h2>{booking.movieId.title}</h2>

                            <div className="info-row">
                                <span className="label">Booking ID:</span>
                                <span className="value">{booking.bookingId}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Theater:</span>
                                <span className="value">{booking.theaterName}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Date:</span>
                                <span className="value">
                                    {new Date(booking.showTime.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="info-row">
                                <span className="label">Time:</span>
                                <span className="value">{booking.showTime.time}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Selected Seats:</span>
                                <span className="value">
                                    <div className="seats-display">
                                        {booking.seats.map((seat, index) => (
                                            <span key={index} className="seat-badge">
                                                {seat.seatNumber}
                                            </span>
                                        ))}
                                    </div>
                                </span>
                            </div>

                            <div className="price-breakdown">
                                <h3>Price Details</h3>
                                <div className="price-row">
                                    <span>Price per seat</span>
                                    <span>₹{booking.pricePerSeat}</span>
                                </div>
                                <div className="price-row">
                                    <span>Number of seats</span>
                                    <span>{booking.seats.length}</span>
                                </div>
                                <div className="price-row subtotal">
                                    <span>Subtotal</span>
                                    <span>₹{booking.price}</span>
                                </div>
                                <div className="price-row total">
                                    <strong>Total Amount</strong>
                                    <strong>₹{booking.price}</strong>
                                </div>
                            </div>

                            <div className="status-info">
                                <div className="status-badge">
                                    Booking Status: <span className={`status ${booking.status}`}>
                                        {booking.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="status-badge">
                                    Payment Status: <span className={`status ${booking.paymentStatus}`}>
                                        {booking.paymentStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {booking.status === 'pending' && (
                                <div className="action-buttons">
                                    <button
                                        className="btn-proceed-payment"
                                        onClick={handleProceedToPayment}
                                    >
                                        Proceed to Payment
                                    </button>
                                    <button
                                        className="btn-cancel-booking"
                                        onClick={handleCancelBooking}
                                        style={{
                                            marginTop: '10px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            padding: '12px 24px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            width: '100%'
                                        }}
                                    >
                                        Cancel Booking
                                    </button>
                                </div>
                            )}

                            {booking.status === 'confirmed' && (
                                <div className="confirmed-message">
                                    <span className="check-icon">✓</span>
                                    <p>Your booking is confirmed! Check your booking history to download the ticket.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
