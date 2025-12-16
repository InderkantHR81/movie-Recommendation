const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

const sampleMovies = [
  {
    movieId: 'mov001',
    title: 'Inception',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    year: 2010,
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    rating: 8.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page', 'Tom Hardy'],
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    totalRatings: 440,
    ratingCount: 50,
    language: 'English',
    duration: '148 min',
    releaseDate: new Date('2010-07-16')
  },
  {
    movieId: 'mov002',
    title: 'The Shawshank Redemption',
    genre: ['Drama'],
    year: 1994,
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: 9.3,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
    totalRatings: 465,
    ratingCount: 50,
    language: 'English',
    duration: '142 min',
    releaseDate: new Date('1994-09-23')
  },
  {
    movieId: 'mov003',
    title: 'The Dark Knight',
    genre: ['Action', 'Crime', 'Drama'],
    year: 2008,
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    rating: 9.0,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    totalRatings: 450,
    ratingCount: 50,
    language: 'English',
    duration: '152 min',
    releaseDate: new Date('2008-07-18')
  },
  {
    movieId: 'mov004',
    title: 'Pulp Fiction',
    genre: ['Crime', 'Drama'],
    year: 1994,
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    rating: 8.9,
    poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    trailerUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
    totalRatings: 445,
    ratingCount: 50,
    language: 'English',
    duration: '154 min',
    releaseDate: new Date('1994-10-14')
  },
  {
    movieId: 'mov005',
    title: 'Forrest Gump',
    genre: ['Drama', 'Romance'],
    year: 1994,
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    rating: 8.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg',
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    trailerUrl: 'https://www.youtube.com/watch?v=bLvqoHBptjg',
    totalRatings: 440,
    ratingCount: 50,
    language: 'English',
    duration: '142 min',
    releaseDate: new Date('1994-07-06')
  },
  {
    movieId: 'mov006',
    title: 'The Matrix',
    genre: ['Sci-Fi', 'Action'],
    year: 1999,
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    rating: 8.7,
    poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
    totalRatings: 435,
    ratingCount: 50,
    language: 'English',
    duration: '136 min',
    releaseDate: new Date('1999-03-31')
  },
  {
    movieId: 'mov007',
    title: 'Interstellar',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    year: 2014,
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.6,
    poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    totalRatings: 430,
    ratingCount: 50,
    language: 'English',
    duration: '169 min',
    releaseDate: new Date('2014-11-07')
  },
  {
    movieId: 'mov008',
    title: 'The Godfather',
    genre: ['Crime', 'Drama'],
    year: 1972,
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    rating: 9.2,
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
    totalRatings: 460,
    ratingCount: 50,
    language: 'English',
    duration: '175 min',
    releaseDate: new Date('1972-03-24')
  },
  {
    movieId: 'mov009',
    title: 'Avengers: Endgame',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    year: 2019,
    description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.",
    rating: 8.4,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
    director: 'Anthony Russo, Joe Russo',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    totalRatings: 420,
    ratingCount: 50,
    language: 'English',
    duration: '181 min',
    releaseDate: new Date('2019-04-26')
  },
  {
    movieId: 'mov010',
    title: 'Titanic',
    genre: ['Romance', 'Drama'],
    year: 1997,
    description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    rating: 7.9,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg',
    director: 'James Cameron',
    cast: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane'],
    trailerUrl: 'https://www.youtube.com/watch?v=kVrqfYjkTdQ',
    totalRatings: 395,
    ratingCount: 50,
    language: 'English',
    duration: '194 min',
    releaseDate: new Date('1997-12-19')
  },
  {
    movieId: 'mov011',
    title: 'The Lion King',
    genre: ['Animation', 'Adventure', 'Drama'],
    year: 1994,
    description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
    rating: 8.5,
    poster: 'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg',
    director: 'Roger Allers, Rob Minkoff',
    cast: ['Matthew Broderick', 'Jeremy Irons', 'James Earl Jones'],
    trailerUrl: 'https://www.youtube.com/watch?v=4sj1MT05lAA',
    totalRatings: 425,
    ratingCount: 50,
    language: 'English',
    duration: '88 min',
    releaseDate: new Date('1994-06-24')
  },
  {
    movieId: 'mov012',
    title: 'Parasite',
    genre: ['Thriller', 'Drama', 'Comedy'],
    year: 2019,
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    rating: 8.6,
    poster: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
    totalRatings: 430,
    ratingCount: 50,
    language: 'Korean',
    duration: '132 min',
    releaseDate: new Date('2019-05-30')
  },
  {
    movieId: 'mov013',
    title: 'Gladiator',
    genre: ['Action', 'Drama', 'Adventure'],
    year: 2000,
    description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
    rating: 8.5,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    director: 'Ridley Scott',
    cast: ['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen'],
    trailerUrl: 'https://www.youtube.com/watch?v=owK1qxDselE',
    totalRatings: 425,
    ratingCount: 50,
    language: 'English',
    duration: '155 min',
    releaseDate: new Date('2000-05-05')
  },
  {
    movieId: 'mov014',
    title: 'The Notebook',
    genre: ['Romance', 'Drama'],
    year: 2004,
    description: 'A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.',
    rating: 7.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTk3OTM5Njg5M15BMl5BanBnXkFtZTYwMzA0ODI3._V1_.jpg',
    director: 'Nick Cassavetes',
    cast: ['Ryan Gosling', 'Rachel McAdams', 'James Garner'],
    trailerUrl: 'https://www.youtube.com/watch?v=yDibIWsJAd4',
    totalRatings: 390,
    ratingCount: 50,
    language: 'English',
    duration: '123 min',
    releaseDate: new Date('2004-06-25')
  },
  {
    movieId: 'mov015',
    title: 'Joker',
    genre: ['Crime', 'Drama', 'Thriller'],
    year: 2019,
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
    rating: 8.4,
    poster: 'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg',
    director: 'Todd Phillips',
    cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz'],
    trailerUrl: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
    totalRatings: 420,
    ratingCount: 50,
    language: 'English',
    duration: '122 min',
    releaseDate: new Date('2019-10-04')
  },
  {
    movieId: 'mov016',
    title: 'Avatar',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    year: 2009,
    description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
    rating: 7.9,
    poster: 'https://m.media-amazon.com/images/M/MV5BZDA0OGQxNTItMDZkMC00N2UyLTg3MzMtYTJmNjg3Nzk5MzRiXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg',
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    trailerUrl: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
    totalRatings: 415,
    ratingCount: 50,
    language: 'English',
    duration: '162 min',
    releaseDate: new Date('2009-12-18')
  },
  {
    movieId: 'mov017',
    title: 'The Avengers',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    year: 2012,
    description: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
    rating: 8.0,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDYxNjQyMjAtNTdiOS00NGYwLWFmNTAtNThmYjU5ZGI2YTI1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    director: 'Joss Whedon',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson', 'Mark Ruffalo'],
    trailerUrl: 'https://www.youtube.com/watch?v=eOrNdBpGMv8',
    totalRatings: 410,
    ratingCount: 50,
    language: 'English',
    duration: '143 min',
    releaseDate: new Date('2012-05-04')
  },
  {
    movieId: 'mov018',
    title: 'Spider-Man: No Way Home',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    year: 2021,
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
    rating: 8.2,
    poster: 'https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg',
    director: 'Jon Watts',
    cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Tobey Maguire'],
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    totalRatings: 410,
    ratingCount: 50,
    language: 'English',
    duration: '148 min',
    releaseDate: new Date('2021-12-17')
  },
  {
    movieId: 'mov019',
    title: 'Top Gun: Maverick',
    genre: ['Action', 'Drama'],
    year: 2022,
    description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission.',
    rating: 8.3,
    poster: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg',
    director: 'Joseph Kosinski',
    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Val Kilmer'],
    trailerUrl: 'https://www.youtube.com/watch?v=giXco2jaZ_4',
    totalRatings: 415,
    ratingCount: 50,
    language: 'English',
    duration: '130 min',
    releaseDate: new Date('2022-05-27')
  },
  {
    movieId: 'mov020',
    title: 'Oppenheimer',
    genre: ['Biography', 'Drama', 'History'],
    year: 2023,
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    rating: 8.4,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Matt Damon'],
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    totalRatings: 420,
    ratingCount: 50,
    language: 'English',
    duration: '180 min',
    releaseDate: new Date('2023-07-21')
  },
  {
    movieId: 'mov021',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    genre: ['Adventure', 'Drama', 'Fantasy'],
    year: 2001,
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    rating: 8.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg',
    director: 'Peter Jackson',
    cast: ['Elijah Wood', 'Ian McKellen', 'Orlando Bloom', 'Viggo Mortensen'],
    trailerUrl: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
    totalRatings: 455,
    ratingCount: 50,
    language: 'English',
    duration: '178 min',
    releaseDate: new Date('2001-12-19')
  },
  {
    movieId: 'mov022',
    title: 'Star Wars: Episode V - The Empire Strikes Back',
    genre: ['Action', 'Adventure', 'Fantasy'],
    year: 1980,
    description: 'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda.',
    rating: 8.7,
    poster: 'https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    director: 'Irvin Kershner',
    cast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher'],
    trailerUrl: 'https://www.youtube.com/watch?v=JNwNXF9Y6kY',
    totalRatings: 440,
    ratingCount: 50,
    language: 'English',
    duration: '124 min',
    releaseDate: new Date('1980-05-21')
  },
  {
    movieId: 'mov023',
    title: 'Jurassic Park',
    genre: ['Adventure', 'Sci-Fi', 'Thriller'],
    year: 1993,
    description: 'A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure causes the park\'s cloned dinosaurs to run loose.',
    rating: 8.2,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_.jpg',
    director: 'Steven Spielberg',
    cast: ['Sam Neill', 'Laura Dern', 'Jeff Goldblum'],
    trailerUrl: 'https://www.youtube.com/watch?v=lc0UehYemQA',
    totalRatings: 425,
    ratingCount: 50,
    language: 'English',
    duration: '127 min',
    releaseDate: new Date('1993-06-11')
  },
  {
    movieId: 'mov024',
    title: 'The Silence of the Lambs',
    genre: ['Crime', 'Drama', 'Thriller'],
    year: 1991,
    description: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
    rating: 8.6,
    poster: 'https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    director: 'Jonathan Demme',
    cast: ['Jodie Foster', 'Anthony Hopkins', 'Lawrence A. Bonney'],
    trailerUrl: 'https://www.youtube.com/watch?v=W6Mm8Sbe__o',
    totalRatings: 435,
    ratingCount: 50,
    language: 'English',
    duration: '118 min',
    releaseDate: new Date('1991-02-14')
  },
  {
    movieId: 'mov025',
    title: 'Fight Club',
    genre: ['Drama'],
    year: 1999,
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    rating: 8.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg',
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    trailerUrl: 'https://www.youtube.com/watch?v=BdJKm16Co6M',
    totalRatings: 445,
    ratingCount: 50,
    language: 'English',
    duration: '139 min',
    releaseDate: new Date('1999-10-15')
  },
  {
    movieId: 'mov026',
    title: 'Dune',
    genre: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
    year: 2021,
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    rating: 8.0,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDQ0NjgyN2YtNWViNS00YjA3LTkxNDktYzFkZTExZGMxZDkxXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Oscar Isaac'],
    trailerUrl: 'https://www.youtube.com/watch?v=8g18jFHCLXk',
    totalRatings: 410,
    ratingCount: 50,
    language: 'English',
    duration: '155 min',
    releaseDate: new Date('2021-10-22')
  },
  {
    movieId: 'mov027',
    title: 'The Batman',
    genre: ['Action', 'Crime', 'Drama'],
    year: 2022,
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
    rating: 7.8,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_.jpg',
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Colin Farrell'],
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    totalRatings: 390,
    ratingCount: 50,
    language: 'English',
    duration: '176 min',
    releaseDate: new Date('2022-03-04')
  },
  {
    movieId: 'mov028',
    title: 'Guardians of the Galaxy',
    genre: ['Action', 'Adventure', 'Comedy'],
    year: 2014,
    description: 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
    rating: 8.0,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDIzMTk4NDYtMjg5OS00ZGI0LWJhZDYtMzdmZGY1YWU5ZGNkXkEyXkFqcGdeQXVyMTI5NzUyMTIz._V1_.jpg',
    director: 'James Gunn',
    cast: ['Chris Pratt', 'Vin Diesel', 'Bradley Cooper', 'Zoe Saldana'],
    trailerUrl: 'https://www.youtube.com/watch?v=d96cjJhvlMA',
    totalRatings: 425,
    ratingCount: 50,
    language: 'English',
    duration: '121 min',
    releaseDate: new Date('2014-08-01')
  },
  {
    movieId: 'mov029',
    title: 'Black Panther',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    year: 2018,
    description: 'T\'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future.',
    rating: 7.3,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMTc4NTMwNDI@._V1_.jpg',
    director: 'Ryan Coogler',
    cast: ['Chadwick Boseman', 'Michael B. Jordan', 'Lupita Nyong\'o'],
    trailerUrl: 'https://www.youtube.com/watch?v=xjDjIWPwcPU',
    totalRatings: 395,
    ratingCount: 50,
    language: 'English',
    duration: '134 min',
    releaseDate: new Date('2018-02-16')
  },
  {
    movieId: 'mov030',
    title: 'Deadpool',
    genre: ['Action', 'Adventure', 'Comedy'],
    year: 2016,
    description: 'A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.',
    rating: 8.0,
    poster: 'https://m.media-amazon.com/images/M/MV5BYzE5MjY1ZDgtMTkyNC00MTMyLThhMjAtZGI5OTE1NzFlZGJjXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    director: 'Tim Miller',
    cast: ['Ryan Reynolds', 'Morena Baccarin', 'T.J. Miller'],
    trailerUrl: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
    totalRatings: 420,
    ratingCount: 50,
    language: 'English',
    duration: '108 min',
    releaseDate: new Date('2016-02-12')
  }
];

async function seedMovies() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing movies
    await Movie.deleteMany({});
    console.log('🗑️  Cleared existing movies');

    // Insert sample movies
    await Movie.insertMany(sampleMovies);
    console.log(`✅ Inserted ${sampleMovies.length} sample movies`);

    console.log('\n📊 Sample Movies Added:');
    sampleMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - ${movie.genre.join(', ')}`);
    });

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Export for use in server.js
async function seedInMemory() {
  try {
    const Movie = require('../models/Movie');
    const Show = require('../models/Show');
    
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      await Movie.insertMany(sampleMovies);
      console.log(`✅ Seeded ${sampleMovies.length} movies into in-memory database`);
      
      // Seed shows for the next 7 days
      const movies = await Movie.find();
      const times = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'];
      const today = new Date();
      let showsCreated = 0;
      
      for (const movie of movies) {
        for (let day = 0; day < 7; day++) {
          const showDate = new Date(today);
          showDate.setDate(today.getDate() + day);
          showDate.setHours(0, 0, 0, 0);
          
          for (const time of times) {
            // Generate seat layout
            const seats = [];
            const rowLabels = 'ABCDEFGHIJ'.split('');
            for (let i = 0; i < 10; i++) {
              for (let j = 1; j <= 10; j++) {
                seats.push({
                  seatNumber: `${rowLabels[i]}${j}`,
                  row: rowLabels[i],
                  column: j,
                  status: 'available'
                });
              }
            }
            
            const show = new Show({
              movieId: movie._id,
              date: showDate,
              time,
              theaterName: 'CineMax Theater',
              totalSeats: seats.length,
              availableSeats: seats.length,
              seats,
              pricePerSeat: 150
            });
            
            await show.save();
            showsCreated++;
          }
        }
      }
      
      console.log(`✅ Seeded ${showsCreated} shows for the next 7 days`);
    }
  } catch (error) {
    console.error('❌ Error seeding in-memory database:', error);
  }
}

module.exports = { seedMovies, seedInMemory, sampleMovies };

// Run seed if called directly
if (require.main === module) {
  seedMovies();
}
