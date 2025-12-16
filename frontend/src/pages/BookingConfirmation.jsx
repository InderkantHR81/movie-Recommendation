import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

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

    const handleDownloadPDF = async () => {
        try {
            const response = await bookingsAPI.downloadPDFTicket(bookingId);

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${booking.bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download PDF error:', error);
            alert('Failed to download PDF ticket');
        }
    };

    const handleDownloadJSON = async () => {
        try {
            const response = await bookingsAPI.downloadJSONTicket(bookingId);

            // Create JSON file and download
            const dataStr = JSON.stringify(response.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${booking.bookingId}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download JSON error:', error);
            alert('Failed to download JSON ticket');
        }
    };

    if (loading) {
        return (
            <div className="booking-confirmation">
                <Navbar />
                <div className="loading">Loading confirmation...</div>
            </div>
        );
    }

    if (!booking || booking.status !== 'confirmed') {
        return (
            <div className="booking-confirmation">
                <Navbar />
                <div className="error">Booking not confirmed</div>
            </div>
        );
    }

    return (
        <div className="booking-confirmation">
            <Navbar />

            <div className="confirmation-container">
                <div className="confirmation-card">
                    <div className="success-icon">✓</div>
                    <h1>Booking Confirmed!</h1>
                    <p className="success-message">Your movie tickets have been booked successfully</p>

                    <div className="ticket-display">
                        <div className="ticket-header">
                            <h2>{booking.movieId.title}</h2>
                            <span className="booking-id-badge">ID: {booking.bookingId}</span>
                        </div>

                        <div className="ticket-details">
                            <div className="detail-row">
                                <span className="icon">🎬</span>
                                <div>
                                    <strong>Theater</strong>
                                    <p>{booking.theaterName}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <span className="icon">📅</span>
                                <div>
                                    <strong>Date & Time</strong>
                                    <p>
                                        {new Date(booking.showTime.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })} • {booking.showTime.time}
                                    </p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <span className="icon">🎫</span>
                                <div>
                                    <strong>Seats</strong>
                                    <div className="seats-list">
                                        {booking.seats.map((seat, index) => (
                                            <span key={index} className="seat-badge">{seat.seatNumber}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-row">
                                <span className="icon">👤</span>
                                <div>
                                    <strong>Passenger Name</strong>
                                    <p>{booking.userId.name}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <span className="icon">💰</span>
                                <div>
                                    <strong>Total Amount Paid</strong>
                                    <p className="amount">₹{booking.price}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <span className="icon">✓</span>
                                <div>
                                    <strong>Payment Status</strong>
                                    <p className="status-confirmed">{booking.paymentStatus.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="download-section">
                        <h3>Download Your Ticket</h3>
                        <p>Save your ticket for entry at the theater</p>
                        <div className="download-buttons">
                            <button className="btn-download pdf" onClick={handleDownloadPDF}>
                                📄 Download PDF
                            </button>
                            <button className="btn-download json" onClick={handleDownloadJSON}>
                                📋 Download JSON
                            </button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/booking-history')}
                        >
                            View Booking History
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Home
                        </button>
                    </div>

                    <div className="important-note">
                        <h4>Important Information</h4>
                        <ul>
                            <li>Please arrive at the theater 15 minutes before showtime</li>
                            <li>Carry a valid ID proof along with your ticket</li>
                            <li>Outside food and beverages are not allowed</li>
                            <li>Your ticket has been sent to your registered email</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
