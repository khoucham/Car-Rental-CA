import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

/* =====================
   Utils
===================== */
function diffDays(start, end) {
  if (!start || !end) return 0;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [pickupLocation, setPickupLocation] = useState({
    lat: 53.4264,
    lng: -6.2499,
  });

  /* =====================
     Fetch car
  ===================== */
  useEffect(() => {
    fetch(`http://localhost:5000/api/cars/${id}`)
      .then(res => res.json())
      .then(data => {
        setCar(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load car");
        setLoading(false);
      });
  }, [id]);

  /* =====================
     Fetch booked dates
  ===================== */
  useEffect(() => {
    fetch(`http://localhost:5000/api/bookings/car/${id}`)
      .then(res => res.json())
      .then(data => {
        const intervals = data.map(b => ({
          start: normalizeDate(b.start_date),
          end: normalizeDate(b.end_date),
        }));
        setBookedIntervals(intervals);
      });
  }, [id]);

  /* =====================
     Date blocking logic
  ===================== */
  const isDateBooked = (date) => {
    const d = normalizeDate(date);
    return bookedIntervals.some(i => d >= i.start && d <= i.end);
  };

  const days = useMemo(
    () => diffDays(startDate, endDate),
    [startDate, endDate]
  );

  const total = useMemo(() => {
    if (!car) return 0;
    return days * Number(car.price_per_day);
  }, [days, car]);

  /* =====================
     Guards
  ===================== */
  if (!user) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          You must login first.{" "}
          <Alert.Link as={Link} to="/login">Login</Alert.Link>
        </Alert>
      </Container>
    );
  }

  if (loading || !car) {
    return (
      <Container className="my-5 text-center">
        <h5>Loading booking...</h5>
      </Container>
    );
  }

  /* =====================
     Submit booking
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car.id,
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          total,
          pickupLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      navigate("/bookings");
    } catch (err) {
      setError(err.message);
    }
  };

  /* =====================
     UI
  ===================== */
  return (
    <Container className="my-5">
      <Row className="g-4">
        {/* LEFT – BOOKING FORM */}
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Booking Details</h5>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                <Form.Label className="mb-1"> Start Date: </Form.Label>

                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setEndDate(null);
                  }}
                  minDate={new Date()}
                  filterDate={(date) => !isDateBooked(date)}
                  className="form-control mt-1"
                  dateFormat="dd/MM/yy"
                  placeholderText="DD/MM/YY"
                />
              </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="mb-1">
                    End Date :
                  </Form.Label>

                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    minDate={startDate || new Date()}
                    filterDate={(date) => !isDateBooked(date)}
                    className="form-control mt-1"
                    dateFormat="dd/MM/yy"
                    placeholderText="DD/MM/YY"
                  />
                </Form.Group>


                <Form.Group className="mb-4">
                  <Form.Label className="mb-1">Email</Form.Label>
                  <Form.Control value={user.email} disabled />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={days <= 0}
                >
                  Continue
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT – SUMMARY + MAP */}
        <Col lg={5}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h6 className="mb-3">Summary</h6>
              <div className="d-flex justify-content-between">
                <span>Days</span>
                <strong>{days}</strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span>Total</span>
                <strong>€{total}</strong>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Pick-up Location (Dublin Airport)</h6>

              <div
                style={{
                  height: "260px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <LocationPicker
                  center={pickupLocation}
                  onChange={setPickupLocation}
                />
              </div>

              <small className="text-muted">
                Lat: {pickupLocation.lat.toFixed(5)} | Lng:{" "}
                {pickupLocation.lng.toFixed(5)}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Booking;
