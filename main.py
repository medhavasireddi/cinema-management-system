from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./cinema.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== MODELS ====================
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
    email = Column(String)
    phone = Column(String)

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

Base.metadata.create_all(bind=engine)

# ==================== IMPORT FUNCTION ====================
def import_csv_if_empty(model, csv_file, column_count, row_mapper):
    db = SessionLocal()
    if db.query(model).count() == 0:
        print(f"Importing {csv_file}...")
        # Try latin-1 first (never fails) or utf-8-sig
        for encoding in ['latin-1', 'utf-8-sig', 'cp1252']:
            try:
                with open(csv_file, "r", encoding=encoding) as f:
                    reader = csv.reader(f)
                    next(reader)  # skip header
                    count = 0
                    for row in reader:
                        if len(row) >= column_count:
                            db.add(row_mapper(row))
                            count += 1
                    db.commit()
                    print(f"Imported {count} records from {csv_file} using {encoding}.")
                    break
            except (UnicodeDecodeError, UnicodeError):
                continue
        else:
            print(f"Failed to import {csv_file} – unsupported encoding.")
    db.close()

# ==================== ROW MAPPERS ====================
def movie_mapper(row):
    return Movie(
        movie_id=int(row[0]), title=row[1], genre=row[2],
        rating=float(row[3]), status=row[4], poster_image_url=row[5]
    )

def show_mapper(row):
    return Show(
        show_id=int(row[0]), screen_id=int(row[1]),
        movie_id=int(row[2]), show_datetime=row[3]
    )

def ticket_mapper(row):
    return Ticket(
        ticket_id=int(row[0]), booking_id=int(row[1]),
        show_seat_id=int(row[2]), qr_code=row[3],
        delivery_method=row[4], is_downloaded=row[5],
        scanned_at=row[6] if len(row) > 6 and row[6] else None
    )

def user_mapper(row):
    return User(user_id=int(row[0]), name=row[1], email=row[2], phone=row[3])

def screen_mapper(row):
    return Screen(
        screen_id=int(row[0]), name=row[1],
        class_type=row[2], capacity=int(row[3])
    )

def seat_mapper(row):
    return Seat(seat_id=int(row[0]), screen_id=int(row[1]), seat_number=row[2])

def showseat_mapper(row):
    return ShowSeat(
        show_seat_id=int(row[0]), show_id=int(row[1]),
        seat_id=int(row[2]), is_available=row[3]
    )

def booking_mapper(row):
    return Booking(
        booking_id=int(row[0]), user_id=int(row[1]),
        show_id=int(row[2]), booking_datetime=row[3],
        total_cost=float(row[4])
    )

def fooditem_mapper(row):
    return FoodItem(
        item_id=int(row[0]), name=row[1], description=row[2], is_combo=row[3]
    )

def fooditemsize_mapper(row):
    return FoodItemSize(
        size_id=int(row[0]), item_id=int(row[1]),
        size_name=row[2], rate=float(row[3])
    )

# ==================== RUN IMPORTS ====================
import_csv_if_empty(Movie, "movie.csv", 6, movie_mapper)
import_csv_if_empty(Show, "show.csv", 4, show_mapper)
import_csv_if_empty(Ticket, "ticket.csv", 7, ticket_mapper)
import_csv_if_empty(User, "user.csv", 4, user_mapper)
import_csv_if_empty(Screen, "screen.csv", 4, screen_mapper)
import_csv_if_empty(Seat, "seat.csv", 3, seat_mapper)
import_csv_if_empty(ShowSeat, "showseat.csv", 4, showseat_mapper)
import_csv_if_empty(Booking, "booking.csv", 5, booking_mapper)
import_csv_if_empty(FoodItem, "fooditem.csv", 4, fooditem_mapper)
import_csv_if_empty(FoodItemSize, "fooditemsize.csv", 4, fooditemsize_mapper)

# ==================== API ENDPOINTS ====================
@app.get("/")
def home():
    return {"message": "Cinema API with 10 datasets"}

@app.get("/movies")
def get_movies():
    db = SessionLocal()
    data = db.query(Movie).all()
    db.close()
    return [{"movie_id": m.movie_id, "title": m.title, "genre": m.genre, "rating": m.rating, "status": m.status} for m in data]

@app.get("/shows")
def get_shows():
    db = SessionLocal()
    data = db.query(Show).all()
    db.close()
    return [{"show_id": s.show_id, "screen_id": s.screen_id, "movie_id": s.movie_id, "show_datetime": s.show_datetime} for s in data]

@app.get("/tickets")
def get_tickets():
    db = SessionLocal()
    data = db.query(Ticket).all()
    db.close()
    return [{"ticket_id": t.ticket_id, "booking_id": t.booking_id, "delivery_method": t.delivery_method} for t in data]

@app.get("/users")
def get_users():
    db = SessionLocal()
    data = db.query(User).all()
    db.close()
    return [{"user_id": u.user_id, "name": u.name, "email": u.email} for u in data]

@app.get("/screens")
def get_screens():
    db = SessionLocal()
    data = db.query(Screen).all()
    db.close()
    return [{"screen_id": s.screen_id, "name": s.name, "class_type": s.class_type, "capacity": s.capacity} for s in data]

@app.get("/seats")
def get_seats():
    db = SessionLocal()
    data = db.query(Seat).all()
    db.close()
    return [{"seat_id": s.seat_id, "screen_id": s.screen_id, "seat_number": s.seat_number} for s in data]

@app.get("/showseats/{show_id}")
def get_show_seats(show_id: int):
    db = SessionLocal()
    results = db.query(ShowSeat, Seat).join(Seat, ShowSeat.seat_id == Seat.seat_id).filter(ShowSeat.show_id == show_id).all()
    db.close()
    return [{"show_seat_id": ss.show_seat_id, "seat_id": ss.seat_id, "seat_number": seat.seat_number, "is_available": ss.is_available} for ss, seat in results]

@app.get("/bookings")
def get_bookings():
    db = SessionLocal()
    data = db.query(Booking).all()
    db.close()
    return [{"booking_id": b.booking_id, "user_id": b.user_id, "show_id": b.show_id, "booking_datetime": b.booking_datetime, "total_cost": b.total_cost} for b in data]

@app.get("/fooditems")
def get_fooditems():
    db = SessionLocal()
    data = db.query(FoodItem).all()
    db.close()
    return [{"item_id": f.item_id, "name": f.name, "description": f.description, "is_combo": f.is_combo} for f in data]

@app.get("/fooditemsizes")
def get_fooditemsizes():
    db = SessionLocal()
    data = db.query(FoodItemSize).all()
    db.close()
    return [{"size_id": fs.size_id, "item_id": fs.item_id, "size_name": fs.size_name, "rate": fs.rate} for fs in data]