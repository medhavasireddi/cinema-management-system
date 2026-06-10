import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_movies():
    response = client.get("/movies")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_shows():
    response = client.get("/shows")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_tickets():
    response = client.get("/tickets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_users():
    response = client.get("/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_screens():
    response = client.get("/screens")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_seats():
    response = client.get("/seats")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_showseats():
    # Test with a non‑existent show_id – should return empty list, not error
    response = client.get("/showseats/999999")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_bookings():
    response = client.get("/bookings")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_fooditems():
    response = client.get("/fooditems")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_fooditemsizes():
    response = client.get("/fooditemsizes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)