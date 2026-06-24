import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/movies')
      .then(res => setMovies(res.data))
      .catch(err => setError('Failed to load movies'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Now Showing</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {movies.map(movie => (
          <div key={movie.movie_id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
            <h3>{movie.title}</h3>
            <p>{movie.genre} | ⭐{movie.rating}</p>
            <Link to={`/book/${movie.movie_id}`}>
              <button style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Book Now
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;