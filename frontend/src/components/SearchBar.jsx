import { useState } from 'react';
import { moviesAPI } from '../api';
import MovieCard from './MovieCard';
import './SearchBar.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!query.trim()) return;

        setSearching(true);
        try {
            const response = await moviesAPI.searchMovies(query);
            setResults(response.data.movies);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearch} className="search-bar">
                <input
                    type="text"
                    placeholder="Search for movies, actors, directors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button" disabled={searching}>
                    {searching ? '🔍 Searching...' : '🔍 Search'}
                </button>
                {showResults && (
                    <button type="button" onClick={handleClear} className="clear-button">
                        ✕ Clear
                    </button>
                )}
            </form>

            {showResults && (
                <div className="search-results">
                    <h3>Search Results ({results.length})</h3>
                    {results.length > 0 ? (
                        <div className="search-results-grid">
                            {results.map(movie => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <p className="no-results">No movies found for "{query}"</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
