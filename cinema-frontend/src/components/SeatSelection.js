import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net';

function SeatSelection() {
  const { showId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/showseats/${showId}`);
        setSeats(res.data);
      } catch (err) {
        setError('Failed to load seats.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showId]);

  const toggleSeat = (seat) => {
    if (seat.is_available !== 'True') return; // booked seats cannot be selected
    setSelectedSeats(prev => {
      if (prev.find(s => s.show_seat_id === seat.show_seat_id)) {
        return prev.filter(s => s.show_seat_id !== seat.show_seat_id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }
    // Navigate to confirmation with selected seat IDs
    navigate('/booking/confirm', { state: { showId, selectedSeatIds: selectedSeats.map(s => s.show_seat_id) } });
  };

  if (loading) return <p>Loading seats...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Select Your Seats</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '5px', maxHeight: '400px', overflowY: 'auto' }}>
        {seats.map(seat => {
          const isSelected = selectedSeats.find(s => s.show_seat_id === seat.show_seat_id);
          const isBooked = seat.is_available !== 'True';
          return (
            <div key={seat.show_seat_id}
                 onClick={() => toggleSeat(seat)}
                 style={{
                   width: '40px', height: '40px',
                   backgroundColor: isBooked ? '#dc3545' : (isSelected ? '#ffc107' : '#28a745'),
                   color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   fontSize: '12px', borderRadius: '4px', cursor: isBooked ? 'not-allowed' : 'pointer',
                   border: isSelected ? '2px solid #007bff' : 'none'
                 }}
                 title={`Seat ${seat.seat_number} - ${isBooked ? 'Booked' : (isSelected ? 'Selected' : 'Available')}`}>
              {seat.seat_number}
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: '10px' }}>
        🟢 Available &nbsp;|&nbsp; 🟡 Selected &nbsp;|&nbsp; 🔴 Booked
      </p>
      <p>Selected seats: {selectedSeats.length}</p>
      <button onClick={handleConfirm} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Confirm Booking
      </button>
    </div>
  );
}

export default SeatSelection;