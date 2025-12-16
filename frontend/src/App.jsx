import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingSummary from './pages/BookingSummary';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/movie/:id"
                        element={
                            <PrivateRoute>
                                <MovieDetails />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/seat-selection/:showId"
                        element={
                            <PrivateRoute>
                                <SeatSelection />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/booking-summary/:bookingId"
                        element={
                            <PrivateRoute>
                                <BookingSummary />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/payment/:bookingId"
                        element={
                            <PrivateRoute>
                                <PaymentPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/booking-confirmation/:bookingId"
                        element={
                            <PrivateRoute>
                                <BookingConfirmation />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/booking-history"
                        element={
                            <PrivateRoute>
                                <BookingHistory />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
