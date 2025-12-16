import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { moviesAPI } from '../api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import Chatbot from '../components/Chatbot';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [trending, setTrending] = useState([]);
    const [allMovies, setAllMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadMovies();
    }, [user]);

    const loadMovies = async () => {
        try {
            setLoading(true);

            const [allMoviesResponse, recResponse, trendingResponse] = await Promise.all([
                moviesAPI.getMovies({ limit: 100 }),
                moviesAPI.getRecommendations(user.id, { limit: 12 }),
                moviesAPI.getTrending(10)
            ]);

            setAllMovies(allMoviesResponse.data.movies);
            setRecommendations(recResponse.data.recommendations);
            setTrending(trendingResponse.data.movies);
        } catch (error) {
            console.error('Load movies error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMovieRated = () => {
        loadMovies();
    };

    return (
        <div className="dashboard">
            <Navbar />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Welcome back, {user?.name}! 👋</h1>
                    <p>Discover your next favorite movie</p>
                </div>

                <SearchBar />

                <div className="tabs">
                    <button
                        className={activeTab === 'all' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('all')}
                    >
                        🎬 All Movies
                    </button>
                    <button
                        className={activeTab === 'recommendations' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('recommendations')}
                    >
                        🎯 For You
                    </button>
                    <button
                        className={activeTab === 'trending' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('trending')}
                    >
                        🔥 Trending
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Loading movies...</div>
                ) : (
                    <div className="movies-grid">
                        {activeTab === 'all' ? (
                            allMovies.length > 0 ? (
                                allMovies.map(movie => (
                                    <MovieCard
                                        key={movie._id}
                                        movie={movie}
                                        onRated={handleMovieRated}
                                    />
                                ))
                            ) : (
                                <div className="no-movies">
                                    <p>No movies available</p>
                                </div>
                            )
                        ) : activeTab === 'recommendations' ? (
                            recommendations.length > 0 ? (
                                recommendations.map(movie => (
                                    <MovieCard
                                        key={movie._id}
                                        movie={movie}
                                        onRated={handleMovieRated}
                                    />
                                ))
                            ) : (
                                <div className="no-movies">
                                    <p>No recommendations yet. Rate some movies to get personalized suggestions!</p>
                                </div>
                            )
                        ) : (
                            trending.map(movie => (
                                <MovieCard
                                    key={movie._id}
                                    movie={movie}
                                    onRated={handleMovieRated}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            <Chatbot />
        </div>
    );
};

export default Dashboard;
