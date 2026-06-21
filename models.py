from sqlalchemy import Column, Integer, String, Float
from database import Base

class Movie(Base):
    __tablename__ = "movies"
    movie_id = Column(Integer, primary_key=True)
    title = Column(String)
    genre = Column(String)
    rating = Column(Float)
    status = Column(String)
    poster_image_url = Column(String)

class Show(Base):
    __tablename__ = "shows"
    show_id = Column(Integer, primary_key=True)
    screen_id = Column(Integer)
    movie_id = Column(Integer)
    show_datetime = Column(String)

class Ticket(Base):
    __tablename__ = "tickets"
    ticket_id = Column(Integer, primary_key=True)
    booking_id = Column(Integer)
    show_seat_id = Column(Integer)
    qr_code = Column(String)
    delivery_method = Column(String)
    is_downloaded = Column(String)
    scanned_at = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password_hash = Column(String, nullable=True)
    is_admin = Column(Integer, default=0)

class Screen(Base):
    __tablename__ = "screens"
    screen_id = Column(Integer, primary_key=True)
    name = Column(String)
    class_type = Column(String)
    capacity = Column(Integer)

class Seat(Base):
    __tablename__ = "seats"
    seat_id = Column(Integer, primary_key=True)
    screen_id = Column(Integer)
    seat_number = Column(String)

class ShowSeat(Base):
    __tablename__ = "showseats"
    show_seat_id = Column(Integer, primary_key=True)
    show_id = Column(Integer)
    seat_id = Column(Integer)
    is_available = Column(String)

class Booking(Base):
    __tablename__ = "bookings"
    booking_id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    show_id = Column(Integer)
    booking_datetime = Column(String)
    total_cost = Column(Float)

class FoodItem(Base):
    __tablename__ = "fooditems"
    item_id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    is_combo = Column(String)

class FoodItemSize(Base):
    __tablename__ = "fooditemsizes"
    size_id = Column(Integer, primary_key=True)
    item_id = Column(Integer)
    size_name = Column(String)
    rate = Column(Float)