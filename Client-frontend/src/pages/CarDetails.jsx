import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

function CarDetails() {
  const { id } = useParams(); // MySQL car ID

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================
     FETCH CAR (REST / MySQL)
  ===================== */
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cars/${id}`);

        if (!res.ok) {
          setCar(null);
          return;
        }

        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error("Failed to load car:", err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!car) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Car not found.{" "}
          <Alert.Link as={Link} to="/cars">
            Back to cars
          </Alert.Link>
        </Alert>
      </Container>
    );
  }

  const isAuto = car.transmission?.toLowerCase() === "automatic";

  return (
    <Container className="my-4">
      {/* ================= IMAGE + BOOKING CARD ================= */}
      <Row className="g-4">
        {/* IMAGE */}
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              style={{ maxHeight: 450, objectFit: "cover" }}
            />
          </Card>
        </Col>

        {/* BOOKING INFO */}
        <Col md={5}>
          <Card className="shadow-sm sticky-top" style={{ top: 90 }}>
            <Card.Body>
              <h2 className="fw-bold mb-1">
                {car.brand} {car.model}
              </h2>

              <div className="mb-3">
                {car.type && (
                  <Badge bg="dark" className="me-2">
                    {car.type}
                  </Badge>
                )}
                {car.transmission && (
                  <Badge bg="info" className="me-2">
                    {car.transmission}
                  </Badge>
                )}
                {car.fuel && (
                  <Badge bg="secondary">{car.fuel}</Badge>
                )}
              </div>

              {/* SPECS */}
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>👤 {car.seats || 5} seats</span>
                <span>{isAuto ? "⚙️ Automatic" : "🕹 Manual"}</span>
                <span>⛽ {car.fuel}</span>
              </div>

              <h4 className="fw-bold mb-3">
                €{car.price_per_day} / day
              </h4>

              <Button
                as={Link}
                to={`/book/${car.id}`}
                variant="primary"
                className="w-100 mb-2"
              >
                Book Now
              </Button>

              <Button
                as={Link}
                to="/cars"
                variant="outline-secondary"
                className="w-100"
              >
                Back to Cars
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ================= WHY CHOOSE ================= */}
      <Card className="shadow-sm mt-4 border-start border-3 border-warning">
        <Card.Body>
          <h5 className="fw-bold mb-2">Why choose this car?</h5>
          <p className="mb-0 text-muted">
            The {car.brand} {car.model} is ideal for both city driving and longer
            journeys. It offers a comfortable interior, smooth{" "}
            {car.transmission?.toLowerCase()} transmission, and reliable{" "}
            {car.fuel?.toLowerCase()} performance — making it a great rental
            choice for any trip.
          </p>
        </Card.Body>
      </Card>

      {/* ================= INCLUDED ================= */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Included in your rental</h5>
          <Row>
            <Col md={6} className="text-muted">
              ✔ Unlimited mileage
              <br />
              ✔ Free cancellation
            </Col>
            <Col md={6} className="text-muted">
              ✔ Basic insurance included
              <br />
              ✔ 24/7 roadside assistance
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= RENTAL INFO ================= */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Rental information</h5>
          <ListGroup variant="flush">
            <ListGroup.Item>
              Minimum driver age: <strong>21 years</strong>
            </ListGroup.Item>
            <ListGroup.Item>
              Valid driving license required
            </ListGroup.Item>
            <ListGroup.Item>
              Security deposit may apply
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CarDetails;
