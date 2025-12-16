import api from './axios';

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences)
};

export const moviesAPI = {
  getMovies: (params) => api.get('/movies', { params }),
  searchMovies: (query) => api.get('/movies/search', { params: { q: query } }),
  getMovie: (id) => api.get(`/movies/${id}`),
  getRecommendations: (userId, params) => api.get(`/movies/recommend/${userId}`, { params }),
  getTrending: (limit) => api.get('/movies/trending', { params: { limit } }),
  getSimilar: (id, limit) => api.get(`/movies/${id}/similar`, { params: { limit } }),
  rateMovie: (data) => api.post('/movies/rate', data),
  getUserRatings: () => api.get('/movies/user/ratings'),
  getGenres: () => api.get('/movies/genres/list')
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
  sendQuery: (query) => api.get('/chatbot/message', { params: { query } })
};

export const showsAPI = {
  getShowsByMovie: (movieId, date) => api.get(`/shows/movie/${movieId}`, { params: { date } }),
  getShow: (id) => api.get(`/shows/${id}`),
  seedShows: () => api.post('/shows/seed')
};

export const bookingsAPI = {
  holdSeats: (data) => api.post('/bookings/hold', data),
  createBooking: (data) => api.post('/bookings/create', data),
  confirmBooking: (data) => api.post('/bookings/confirm', data),
  cancelBooking: (id) => api.post(`/bookings/cancel/${id}`),
  getBooking: (id) => api.get(`/bookings/${id}`),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  downloadPDFTicket: (id) => api.get(`/bookings/ticket/pdf/${id}`, { responseType: 'blob' }),
  downloadJSONTicket: (id) => api.get(`/bookings/ticket/json/${id}`)
};
