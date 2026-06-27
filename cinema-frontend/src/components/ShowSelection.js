import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net';

function ShowSelection() {
  const { movieId } = useParams();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/shows`);
        // Filter shows for this movie (movie_id is a string, convert both to numbers)
        const filtered = res.data.filter(s => s.movie_id === parseInt(movieId));
        setShows(filtered);
      } catch (err) {
        setError('Failed to load shows.');
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [movieId]);

  const handleSelectShow = (showId) => {
    navigate(`/seats/${showId}`);
  };

  if (loading) return <p>Loading shows...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Select a Show</h2>
      {shows.length === 0 ? (
        <p>No shows available for this movie.</p>
      ) : (
        <ul style={{ listStyle: 'none' }}>
          {shows.map(s => (
            <li key={s.show_id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>Show #{s.show_id}</strong> – Screen {s.screen_id} – {s.show_datetime}
              <button onClick={() => handleSelectShow(s.show_id)}
                      style={{ marginLeft: '15px', padding: '4px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Select Seats
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShowSelection;