import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BookingConfirmation() {
  const { state } = useLocation();
  const { showId, selectedSeats, totalSeats } = state || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const navigate = useNavigate();

  if (!state) {
    return <p>No booking data. Please start over.</p>;
  }

  const pricePerSeat = 150;
  const totalCost = totalSeats * pricePerSeat;

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net/bookings/create', {
        user_id: user.user_id,
        show_id: showId,
        selected_seat_ids: selectedSeats
      });
      setBookingId(res.data.booking_id);
      setMessage(`✅ Booking successful! Booking ID: ${res.data.booking_id}, Total: ₹${res.data.total_cost}`);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMessage('❌ Booking failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Booking Summary</h2>
      <p><strong>Show ID:</strong> {showId}</p>
      <p><strong>Number of seats:</strong> {totalSeats}</p>
      <p><strong>Price per seat:</strong> ₹{pricePerSeat}</p>
      <p><strong>Total:</strong> ₹{totalCost}</p>
      <button onClick={confirmBooking} disabled={loading} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
        {loading ? 'Processing...' : 'Confirm & Pay'}
      </button>
      {message && <p style={{ marginTop: '20px', padding: '10px', background: bookingId ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>{message}</p>}
    </div>
  );
}

export default BookingConfirmation;
