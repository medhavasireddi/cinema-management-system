from pydantic import BaseModel
from typing import List
from datetime import datetime

class BookingRequest(BaseModel):
    user_id: int
    show_id: int
    selected_seat_ids: List[int]  # list of show_seat_id

@app.post("/bookings/create")
def create_booking(booking_req: BookingRequest):
    db = SessionLocal()
    price_per_seat = 150  # Fixed price per seat – you can make this dynamic later
    
    # Calculate total cost
    total_cost = len(booking_req.selected_seat_ids) * price_per_seat
    
    # Create booking record
    new_booking = Booking(
        user_id=booking_req.user_id,
        show_id=booking_req.show_id,
        booking_datetime=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        total_cost=total_cost
    )
    db.add(new_booking)
    db.flush()  # Get the new booking_id
    
    # Update showseat availability and create tickets
    for show_seat_id in booking_req.selected_seat_ids:
        show_seat = db.query(ShowSeat).filter(ShowSeat.show_seat_id == show_seat_id).first()
        if show_seat and show_seat.is_available == "True":
            show_seat.is_available = "False"
            # Create ticket record
            ticket = Ticket(
                booking_id=new_booking.booking_id,
                show_seat_id=show_seat_id,
                qr_code=f"TICKET-{new_booking.booking_id}-{show_seat_id}",
                delivery_method="email",
                is_downloaded="False",
                scanned_at=None
            )
            db.add(ticket)
        else:
            db.rollback()
            db.close()
            return {"error": f"Seat {show_seat_id} is already booked or invalid"}
    
    db.commit()
    db.close()
    return {
        "message": "Booking successful",
        "booking_id": new_booking.booking_id,
        "total_cost": total_cost,
        "seats_booked": len(booking_req.selected_seat_ids)
    }