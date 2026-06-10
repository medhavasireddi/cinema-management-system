import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/movies')
      .then(response => {
        setMovies(response.data);
        setError('');
      })
      .catch(err => {
        setError('Cannot connect to backend. Make sure FastAPI is running on port 8000.');
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎬 Cinema Management System</h1>
      <h2>Movies from Database</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {movies.length === 0 && !error && <p>Loading movies...</p>}
      <ul>
        {movies.map((movie, idx) => (
          <li key={idx}>
            <strong>{movie.title || movie.name || 'Untitled'}</strong> – ID: {movie.id || idx}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;