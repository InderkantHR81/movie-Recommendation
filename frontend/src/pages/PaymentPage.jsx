import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import './PaymentPage.css';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

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
            alert('Booking not found');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        setProcessing(true);

        // Simulate payment processing (2 seconds)
        setTimeout(async () => {
            try {
                // Generate mock payment ID
                const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

                // Confirm booking
                await bookingsAPI.confirmBooking({
                    bookingId: booking.bookingId,
                    paymentId
                });

                // Navigate to confirmation page
                navigate(`/booking-confirmation/${bookingId}`);
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed. Please try again.');
                setProcessing(false);
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="payment-page">
                <Navbar />
                <div className="loading">Loading payment details...</div>
            </div>
        );
    }

    if (!booking) {
        return null;
    }

    return (
        <div className="payment-page">
            <Navbar />

            <div className="payment-container">
                <div className="payment-card">
                    <h1>Complete Payment</h1>

                    <div className="booking-summary-mini">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Movie:</span>
                            <strong>{booking.movieId.title}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Seats:</span>
                            <strong>{booking.seats.map(s => s.seatNumber).join(', ')}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Date:</span>
                            <strong>{new Date(booking.showTime.date).toLocaleDateString()}</strong>
                        </div>
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <strong>₹{booking.price}</strong>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="payment-form">
                        <div className="payment-methods">
                            <h3>Select Payment Method</h3>
                            <div className="method-options">
                                <label className={paymentMethod === 'card' ? 'method-option active' : 'method-option'}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>💳 Credit/Debit Card</span>
                                </label>

                                <label className={paymentMethod === 'upi' ? 'method-option active' : 'method-option'}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>📱 UPI</span>
                                </label>

                                <label className={paymentMethod === 'wallet' ? 'method-option active' : 'method-option'}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="wallet"
                                        checked={paymentMethod === 'wallet'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>👛 Wallet</span>
                                </label>
                            </div>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="card-details">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength="5"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            maxLength="3"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Cardholder Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'upi' && (
                            <div className="upi-details">
                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'wallet' && (
                            <div className="wallet-details">
                                <div className="form-group">
                                    <label>Select Wallet</label>
                                    <select required>
                                        <option value="">Choose wallet</option>
                                        <option value="paytm">Paytm</option>
                                        <option value="phonepe">PhonePe</option>
                                        <option value="googlepay">Google Pay</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-pay"
                            disabled={processing}
                        >
                            {processing ? 'Processing Payment...' : `Pay ₹${booking.price}`}
                        </button>
                    </form>

                    <div className="payment-note">
                        <p>🔒 Your payment information is secure and encrypted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
