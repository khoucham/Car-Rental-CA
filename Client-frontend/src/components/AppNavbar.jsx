import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

import { useAuth } from "../context/AuthContext";

/* ======================
   WEATHER ICON MAPPING
====================== */
function getWeatherIcon(code) {
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([45, 48].includes(code)) return "🌫";
  if ([2, 3].includes(code)) return "☁️";
  if (code === 1) return "🌤";
  return "☀️";
}

const CITIES = ["London", "Dublin", "Paris", "Berlin", "Madrid"];

function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🌦 Weather
  const [city, setCity] = useState(localStorage.getItem("city") || "London");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  /* ======================
     CITY → WEATHER
  ====================== */
  useEffect(() => {
    const fetchWeatherByCity = async () => {
      setWeatherLoading(true);
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=1`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.length) return;

        const { latitude, longitude } = geoData.results[0];

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const weatherData = await weatherRes.json();

        setWeather({
          temp: Math.round(weatherData.current_weather.temperature),
          code: weatherData.current_weather.weathercode,
        });

        localStorage.setItem("city", city);
      } catch (err) {
        console.error("Weather error:", err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherByCity();
  }, [city]);

  /* ======================
     LOGOUT
  ====================== */
  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      <Navbar expand="lg" bg="light" fixed="top" className="border-bottom shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            🚗 Quick Rent
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            {/* LEFT LINKS */}
            {/* LEFT LINKS */}
<Nav className="me-auto gap-2">

  {/* NORMAL USER NAV */}
  {(!user || user.role !== "admin") && (
    <>
      <Nav.Link as={NavLink} to="/">Home</Nav.Link>
      <Nav.Link as={NavLink} to="/cars">Cars</Nav.Link>

      {user && (
        <Nav.Link as={NavLink} to="/bookings">
          My Bookings
        </Nav.Link>
      )}
    </>
  )}

  {/* ADMIN NAV */}
  {user?.role === "admin" && (
    <Nav.Link
      as={NavLink}
      to="/admin"
      className="fw-bold text-danger"
    >
      🛠 Admin Dashboard
    </Nav.Link>
  )}

</Nav>


            {/* CITY + WEATHER */}
            <div className="d-flex align-items-center gap-2 me-3 small text-muted">
              <NavDropdown title={`📍 ${city}`} align="end">
                {CITIES.map((c) => (
                  <NavDropdown.Item
                    key={c}
                    active={c === city}
                    onClick={() => setCity(c)}
                  >
                    {c}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>

              {weatherLoading ? (
                <Spinner size="sm" />
              ) : weather ? (
                <>
                  <span>{getWeatherIcon(weather.code)}</span>
                  <span>{weather.temp}°C</span>
                </>
              ) : null}
            </div>

            {/* USER AREA */}
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Badge bg="primary" className="rounded-circle px-3 py-2">
                  {user.email.charAt(0).toUpperCase()}
                </Badge>

                <span className="fw-semibold small">
                  {user.email}
                </span>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => setShowLogoutModal(true)}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="outline-primary" size="sm">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Register
                </Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* LOGOUT MODAL */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogoutConfirm}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AppNavbar;
