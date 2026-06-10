import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Cinema Management API with SQLite"

def test_movies():
    response = client.get("/movies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "movie_id" in data[0]
        assert "title" in data[0]