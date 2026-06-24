import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ShowSelection() {
  const { movieId } = useParams();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/shows')
      .then(res => {
        const movieShows = res.data.filter(s => s.movie_id == movieId);
        setShows(movieShows);
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  const selectShow = (showId) => {
    navigate(`/seats/${showId}`);
  };

  if (loading) return <p>Loading shows...</p>;
  if (shows.length === 0) return <p>No shows available for this movie.</p>;

  return (
    <div>
      <h2>Select Showtime</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shows.map(show => (
          <li key={show.show_id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
            Screen {show.screen_id} – {show.show_datetime}
            <button onClick={() => selectShow(show.show_id)} style={{ marginLeft: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowSelection;