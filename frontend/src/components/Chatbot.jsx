import { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Hi ${user?.name || 'there'}! 👋 I'm your movie recommendation assistant. Ask me anything like:\n\n• "Suggest a movie like Inception"\n• "Who acted in Avengers: Endgame?"\n• "Show me top 5 romantic movies"\n• "Recommend me something good"`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await chatbotAPI.sendMessage(userMessage);

            setMessages(prev => [
                ...prev,
                {
                    role: 'bot',
                    content: response.data.botResponse,
                    movies: response.data.movies
                }
            ]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'bot',
                    content: "Sorry, I encountered an error. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>🤖 Movie Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                <div className="message-content">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>

                                    {msg.movies && msg.movies.length > 0 && (
                                        <div className="chatbot-movies">
                                            {msg.movies.map(movie => (
                                                <div key={movie._id} className="chatbot-movie-card">
                                                    <img src={movie.poster} alt={movie.title} />
                                                    <div className="chatbot-movie-info">
                                                        <strong>{movie.title}</strong>
                                                        <span>{movie.year} • ⭐ {movie.rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="message bot">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me about movies..."
                            rows="2"
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
