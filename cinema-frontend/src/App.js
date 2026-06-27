import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ShowSelection from './components/ShowSelection';
import SeatSelection from './components/SeatSelection';
import BookingConfirmation from './components/BookingConfirmation';
import FoodOrdering from './components/FoodOrdering';

const API_BASE_URL = 'https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net';

function CinemaTabs() {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'movies') {
          const res = await axios.get(`${API_BASE_URL}/movies`);
          setMovies(res.data);
        } else if (activeTab === 'shows') {
          const res = await axios.get(`${API_BASE_URL}/shows`);
          setShows(res.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'seats' && selectedShowId) {
      const fetchSeats = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/showseats/${selectedShowId}`);
          setSeats(res.data);
        } catch (err) {
          setError('Could not load seats for this show.');
        } finally {
          setLoading(false);
        }
      };
      fetchSeats();
    }
  }, [selectedShowId, activeTab]);

  const renderContent = () => {
    if (activeTab === 'movies') {
      return (
        <>
          <h2>🎥 Now Showing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {movies.map(m => (
              <div key={m.movie_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3>{m.title}</h3>
                <p>{m.genre} – ⭐{m.rating}</p>
                <button onClick={() => navigate(`/book/${m.movie_id}`)}
                        style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'shows') {
      return (
        <>
          <h2>📅 Show Timings</h2>
          <ul style={{ listStyle: 'none' }}>
            {shows.map(s => (
              <li key={s.show_id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                Show #{s.show_id} – Screen {s.screen_id} – Movie ID {s.movie_id} – {s.show_datetime}
              </li>
            ))}
          </ul>
        </>
      );
    }
    if (activeTab === 'seats') {
      return (
        <div>
          <h3>💺 Select a Show to see Seat Availability</h3>
          <select value={selectedShowId} onChange={e => setSelectedShowId(e.target.value)}
                  style={{ marginBottom: '20px', padding: '8px', width: '100%', maxWidth: '300px' }}>
            <option value="">-- Choose a show --</option>
            {shows.map(show => (
              <option key={show.show_id} value={show.show_id}>
                Show #{show.show_id} – {show.show_datetime}
              </option>
            ))}
          </select>
          {selectedShowId && (
            <>
              <h4>Seat Layout</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '5px', maxHeight: '400px', overflowY: 'auto' }}>
                {seats.map(seat => (
                  <div key={seat.show_seat_id}
                       style={{
                         width: '40px', height: '40px',
                         backgroundColor: seat.is_available === 'True' ? '#28a745' : '#dc3545',
                         color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: '12px', borderRadius: '4px'
                       }}
                       title={`Seat ${seat.seat_number} - ${seat.is_available === 'True' ? 'Available' : 'Booked'}`}>
                    {seat.seat_number}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '10px' }}>🟢 Available &nbsp;|&nbsp; 🔴 Booked</p>
            </>
          )}
        </div>
      );
    }
    if (activeTab === 'food') {
      return <FoodOrdering />;
    }
    return null;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🎬 Cinema</h1>
        <div>
          {user ? (
            <>
              <span>Welcome, {user.name} 👋</span>
              <button onClick={logout} style={{ marginLeft: '10px', padding: '6px 14px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '6px 14px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login / Register</button>
          )}
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        {['movies', 'shows', 'seats', 'food'].map(tab => (
          <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    marginRight: '10px', padding: '8px 18px',
                    backgroundColor: activeTab === tab ? '#007bff' : '#f0f0f0',
                    color: activeTab === tab ? 'white' : '#333',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px'
                  }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && renderContent()}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CinemaTabs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book/:movieId" element={
        <ProtectedRoute>
          <ShowSelection />
        </ProtectedRoute>
      } />
      <Route path="/seats/:showId" element={
        <ProtectedRoute>
          <SeatSelection />
        </ProtectedRoute>
      } />
      <Route path="/booking/confirm" element={
        <ProtectedRoute>
          <BookingConfirmation />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}