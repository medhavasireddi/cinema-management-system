from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import csv
import os

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

class Movie(Base):
    __tablename__ = "movies"
    movie_id = Column(Integer, primary_key=True)
    title = Column(String)
    genre = Column(String)
    rating = Column(Float)
    status = Column(String)
    poster_image_url = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def import_movies():
    db = SessionLocal()
    if db.query(Movie).count() == 0:
        print("Importing movies from movie.csv...")
        if not os.path.exists("movie.csv"):
            print("movie.csv not found!")
            db.close()
            return
        with open("movie.csv", "r", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            header = next(reader)
            print("CSV header:", header)
            count = 0
            for row in reader:
                if len(row) < 6:
                    continue
                try:
                    movie = Movie(
                        movie_id=int(row[0].strip()),
                        title=row[1].strip(),
                        genre=row[2].strip(),
                        rating=float(row[3].strip()),
                        status=row[4].strip(),
                        poster_image_url=row[5].strip()
                    )
                    db.add(movie)
                    count += 1
                except Exception as e:
                    print(f"Skipping row: {e} - {row}")
                    continue
            db.commit()
            print(f"Imported {count} movies.")
    db.close()

import_movies()

@app.get("/")
def home():
    return {"message": "Cinema Management API with SQLite"}

@app.get("/movies")
def get_movies():
    db = SessionLocal()
    movies = db.query(Movie).all()
    db.close()
    return [{"movie_id": m.movie_id, "title": m.title, "genre": m.genre, "rating": m.rating, "status": m.status} for m in movies]