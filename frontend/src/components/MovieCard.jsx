import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './MovieCard.css';

const MovieCard = ({ movie, onRated }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCardClick = (e) => {
        // Don't navigate if clicking on buttons or form elements
        if (e.target.closest('.btn-rate') || e.target.closest('.rating-form')) {
            return;
        }
        navigate(`/movie/${movie._id}`);
    };

    const handleRate = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await moviesAPI.rateMovie({
                movieId: movie._id,
                rating,
                feedback
            });

            setShowRating(false);
            setRating(0);
            setFeedback('');

            if (onRated) onRated();

            alert('Rating submitted successfully!');
        } catch (error) {
            console.error('Rate error:', error);
            alert('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="movie-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="movie-poster">
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-rating-badge">
                    ⭐ {movie.rating.toFixed(1)}
                </div>
            </div>

            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-year">{movie.year}</p>
                <p className="movie-genres">{movie.genre.join(', ')}</p>

                {!showRating ? (
                    <button
                        className="btn-rate"
                        onClick={() => setShowRating(true)}
                    >
                        Rate this movie
                    </button>
                ) : (
                    <div className="rating-form">
                        <div className="stars">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <span
                                    key={star}
                                    className={star <= rating ? 'star active' : 'star'}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <p className="rating-value">{rating}/10</p>

                        <textarea
                            placeholder="Optional feedback..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="2"
                        />

                        <div className="rating-actions">
                            <button
                                onClick={handleRate}
                                disabled={submitting}
                                className="btn-submit"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRating(false);
                                    setRating(0);
                                    setFeedback('');
                                }}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;
