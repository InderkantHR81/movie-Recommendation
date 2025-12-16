import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, showsAPI } from '../api';
import Navbar from '../components/Navbar';
import './MovieDetails.css';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        loadMovieDetails();
    }, [id]);

    const loadMovieDetails = async () => {
        try {
            setLoading(true);
            const [movieRes, showsRes] = await Promise.all([
                moviesAPI.getMovie(id),
                showsAPI.getShowsByMovie(id)
            ]);

            setMovie(movieRes.data.movie);
            setShows(showsRes.data.shows);

            // Set default date to today
            if (showsRes.data.shows.length > 0) {
                setSelectedDate(new Date(showsRes.data.shows[0].date).toISOString().split('T')[0]);
            }
        } catch (error) {
            console.error('Load movie details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchMovie = (showId) => {
        navigate(`/seat-selection/${showId}`);
    };

    const getShowsByDate = () => {
        if (!selectedDate) return [];
        return shows.filter(show => {
            const showDate = new Date(show.date).toISOString().split('T')[0];
            return showDate === selectedDate;
        });
    };

    const getUniqueDates = () => {
        const dates = [...new Set(shows.map(show =>
            new Date(show.date).toISOString().split('T')[0]
        ))];
        return dates.sort();
    };

    if (loading) {
        return (
            <div className="movie-details">
                <Navbar />
                <div className="loading">Loading movie details...</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-details">
                <Navbar />
                <div className="error">Movie not found</div>
            </div>
        );
    }

    return (
        <div className="movie-details">
            <Navbar />

            <div className="movie-details-container">
                <div className="movie-hero">
                    <div className="movie-poster-large">
                        <img src={movie.poster} alt={movie.title} />
                    </div>

                    <div className="movie-info-section">
                        <h1>{movie.title}</h1>
                        <p className="movie-year">{movie.year}</p>
                        <div className="movie-rating">
                            ⭐ {movie.rating.toFixed(1)}/10
                            <span className="rating-count">({movie.ratingCount} ratings)</span>
                        </div>

                        <div className="movie-meta">
                            <span className="genre-tags">
                                {movie.genre.map((g, i) => (
                                    <span key={i} className="genre-tag">{g}</span>
                                ))}
                            </span>
                        </div>

                        <div className="movie-crew">
                            <p><strong>Director:</strong> {movie.director}</p>
                            {movie.cast && movie.cast.length > 0 && (
                                <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
                            )}
                        </div>

                        <div className="movie-description">
                            <h3>About the Movie</h3>
                            <p>{movie.description}</p>
                        </div>
                    </div>
                </div>

                <div className="showtimes-section">
                    <h2>Book Tickets</h2>

                    {shows.length === 0 ? (
                        <div className="no-shows">
                            <p>No shows available for this movie at the moment.</p>
                        </div>
                    ) : (
                        <>
                            <div className="date-selector">
                                <h3>Select Date</h3>
                                <div className="date-buttons">
                                    {getUniqueDates().map((date) => (
                                        <button
                                            key={date}
                                            className={selectedDate === date ? 'date-btn active' : 'date-btn'}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            {new Date(date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="showtimes-grid">
                                <h3>Available Shows - {new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</h3>

                                <div className="shows-list">
                                    {getShowsByDate().map((show) => (
                                        <div key={show._id} className="show-card">
                                            <div className="show-info">
                                                <h4>{show.theaterName}</h4>
                                                <p className="show-time">{show.time}</p>
                                                <p className="show-seats">
                                                    {show.availableSeats} / {show.totalSeats} seats available
                                                </p>
                                                <p className="show-price">₹{show.pricePerSeat} per seat</p>
                                            </div>
                                            <button
                                                className="btn-watch"
                                                onClick={() => handleWatchMovie(show._id)}
                                                disabled={show.availableSeats === 0}
                                            >
                                                {show.availableSeats === 0 ? 'SOLD OUT' : 'Watch Movie'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
