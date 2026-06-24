import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import MovieList from './components/MovieList';
import ShowSelection from './components/ShowSelection';
import SeatSelection from './components/SeatSelection';
import BookingConfirmation from './components/BookingConfirmation';
import FoodOrdering from './components/FoodOrdering';

function CinemaTabs() {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [users, setUsers] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
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
          const res = await axios.get('http://127.0.0.1:8000/movies');
          setMovies(res.data);
        } else if (activeTab === 'shows') {
          const res = await axios.get('http://127.0.0.1:8000/shows');
          setShows(res.data);
        } else if (activeTab === 'users') {
          const res = await axios.get('http://127.0.0.1:8000/users');
          setUsers(res.data);
        } else if (activeTab === 'seats') {
          const res = await axios.get('http://127.0.0.1:8000/screens');
          setScreens(res.data);
          if (shows.length === 0) {
            const showsRes = await axios.get('http://127.0.0.1:8000/shows');
            setShows(showsRes.data);
          }
        } else if (activeTab === 'bookings') {
          const res = await axios.get('http://127.0.0.1:8000/bookings');
          setBookings(res.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, shows.length]);

  useEffect(() => {
    if (activeTab === 'seats' && selectedShowId) {
      const fetchSeats = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://127.0.0.1:8000/showseats/${selectedShowId}`);
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
          <h2>Movies ({movies.length})</h2>
          <ul style={{ columns: '2', columnGap: '30px' }}>
            {movies.map(m => (
              <li key={m.movie_id}><strong>{m.title}</strong> – {m.genre} (⭐{m.rating})</li>
            ))}
          </ul>
        </>
      );
    }
    if (activeTab === 'shows') {
      return (
        <>
          <h2>Shows ({shows.length})</h2>
          <ul style={{ columns: '2', columnGap: '30px' }}>
            {shows.map(s => (
              <li key={s.show_id}>Show #{s.show_id} | Screen {s.screen_id} | Movie {s.movie_id} | {s.show_datetime}</li>
            ))}
          </ul>
        </>
      );
    }
    if (activeTab === 'users') {
      return (
        <>
          <h2>Users ({users.length})</h2>
          <ul style={{ columns: '2', columnGap: '30px' }}>
            {users.map(u => (
              <li key={u.user_id}><strong>{u.name}</strong> – {u.email}</li>
            ))}
          </ul>
        </>
      );
    }
    if (activeTab === 'seats') {
      return (
        <div>
          <h3>Select a Show</h3>
          <select value={selectedShowId} onChange={e => setSelectedShowId(e.target.value)} style={{ marginBottom: '20px', padding: '8px' }}>
            <option value="">-- Choose a show --</option>
            {shows.map(show => (
              <option key={show.show_id} value={show.show_id}>
                Show #{show.show_id} (Movie ID {show.movie_id}) – {show.show_datetime}
              </option>
            ))}
          </select>
          {selectedShowId && (
            <>
              <h3>Seat Availability for Show #{selectedShowId}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '5px', maxHeight: '400px', overflowY: 'auto' }}>
                {seats.map(seat => (
                  <div key={seat.show_seat_id}
                       style={{
                         width: '40px', height: '40px',
                         backgroundColor: seat.is_available === 'True' ? 'green' : 'red',
                         color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: '12px', borderRadius: '4px'
                       }}
                       title={`Seat ${seat.seat_number} - ${seat.is_available === 'True' ? 'Available' : 'Booked'}`}>
                    {seat.seat_number}
                  </div>
                ))}
              </div>
              <p>Green = Available, Red = Booked</p>
            </>
          )}
        </div>
      );
    }
    if (activeTab === 'bookings') {
      return (
        <>
          <h2>Bookings ({bookings.length})</h2>
          <ul>
            {bookings.slice(0, 100).map(b => (
              <li key={b.booking_id}>Booking #{b.booking_id} | User {b.user_id} | Show {b.show_id} | ₹{b.total_cost} | {b.booking_datetime}</li>
            ))}
            {bookings.length > 100 && <li>... and {bookings.length - 100} more</li>}
          </ul>
        </>
      );
    }
    if (activeTab === 'food') {
      return <FoodOrdering />;
    }
    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎬 Cinema Management System</h1>
        <div>
          {user ? (
            <>
              <span>Welcome, {user.name} ({user.is_admin ? 'Admin' : 'Customer'})</span>
              <button onClick={logout} style={{ marginLeft: '10px', padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login / Register</button>
          )}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/"><button style={{ marginRight: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Home</button></Link>
        {['shows', 'users', 'seats', 'bookings', 'food'].map(tab => (
          <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    marginRight: '10px', padding: '8px 16px',
                    backgroundColor: activeTab === tab ? '#007bff' : '#e0e0e0',
                    color: activeTab === tab ? 'white' : 'black',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px'
                  }}>
            {tab.toUpperCase()}
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
  if (!user) {
    return <Navigate to="/login" replace />;
  }
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