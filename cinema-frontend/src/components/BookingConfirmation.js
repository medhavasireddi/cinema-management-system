import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { showId, selectedSeatIds } = location.state || {};

  const handleConfirm = async () => {
    if (!showId || !selectedSeatIds || selectedSeatIds.length === 0) {
      setError('Invalid booking data.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/bookings/create`, {
        user_id: user.user_id,
        show_id: showId,
        selected_seat_ids: selectedSeatIds
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(`Booking confirmed! Booking ID: ${res.data.booking_id}, Total: ₹${res.data.total_cost}`);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showId || !selectedSeatIds) {
    return <p>Invalid booking data. Please go back and try again.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Confirm Booking</h2>
      <p><strong>Show ID:</strong> {showId}</p>
      <p><strong>Selected seats:</strong> {selectedSeatIds.length}</p>
      <p><strong>Total price:</strong> ₹{selectedSeatIds.length * 150}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={handleConfirm} disabled={loading}
              style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {loading ? 'Processing...' : 'Confirm Booking'}
      </button>
    </div>
  );
}

export default BookingConfirmation;