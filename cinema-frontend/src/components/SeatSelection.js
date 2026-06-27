import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SeatSelection() {
  const { showId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net/showseats/${showId}`)
      .then(res => setSeats(res.data))
      .finally(() => setLoading(false));
  }, [showId]);

  const toggleSeat = (seat) => {
    if (seat.is_available !== 'True') return;
    if (selectedSeats.find(s => s.show_seat_id === seat.show_seat_id)) {
      setSelectedSeats(selectedSeats.filter(s => s.show_seat_id !== seat.show_seat_id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const proceedToBooking = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    const seatIds = selectedSeats.map(s => s.show_seat_id);
    navigate('/booking/confirm', { state: { showId, selectedSeats: seatIds, totalSeats: selectedSeats.length } });
  };

  if (loading) return <p>Loading seat map...</p>;

  return (
    <div>
      <h2>Select Seats for Show #{showId}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '5px' }}>
        {seats.map(seat => (
          <div
            key={seat.show_seat_id}
            onClick={() => toggleSeat(seat)}
            style={{
              width: '40px', height: '40px',
              backgroundColor: seat.is_available !== 'True' ? 'red' :
                (selectedSeats.find(s => s.show_seat_id === seat.show_seat_id) ? 'blue' : 'green'),
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', 
              cursor: seat.is_available === 'True' ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {seat.seat_number}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '10px' }}>
        <span style={{ color: 'green' }}>■</span> Available &nbsp;
        <span style={{ color: 'blue' }}>■</span> Selected &nbsp;
        <span style={{ color: 'red' }}>■</span> Booked
      </p>
      <button onClick={proceedToBooking} style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Book Selected Seats ({selectedSeats.length})
      </button>
    </div>
  );
}

export default SeatSelection;
