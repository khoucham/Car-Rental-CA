import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import CarCard from "../components/CarCard";

/* =====================
   BRAND LOGOS
===================== */
const BRANDS = [
  { name: "Toyota", logo: "/images/brands/toyota.png" },
  { name: "Ford", logo: "/images/brands/ford.png" },
  { name: "Tesla", logo: "/images/brands/tesla.png" },
  { name: "Volkswagen", logo: "/images/brands/volkswagen.png" },
  { name: "BMW", logo: "/images/brands/bmw.png" },
  { name: "Mercedes-Benz", logo: "/images/brands/mercedes.png" },
  { name: "Hyundai", logo: "/images/brands/hyundai.png" },
  { name: "Audi", logo: "/images/brands/audi.png" },
];

const BODY_TYPES = ["SUV", "Wagon", "Sedan", "Convertible", "Coupe"];

const BODY_TYPE_ICONS = {
  SUV: "/images/body-types/suv.png",
  Wagon: "/images/body-types/wagon.png",
  Sedan: "/images/body-types/sedan.png",
  Convertible: "/images/body-types/convertible.png",
  Coupe: "/images/body-types/coupe.png",
};

function Home() {
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* =====================
     FETCH FEATURED (MySQL)
  ===================== */
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/cars?limit=3"
        );
        const data = await res.json();
        setFeatured(data);
      } catch (err) {
        console.error("Failed to load featured cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    navigate(`/cars?${params.toString()}`);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <h5 className="fw-bold">Loading...</h5>
      </Container>
    );
  }

  return (
    <>
      {/* HERO */}
      <div
        className="py-5"
        style={{
          background: "linear-gradient(120deg, #f8f9fa 60%, #f5a400 40%)",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="fw-bold display-5">
                Unlock Your <span className="text-warning">Adventure</span>
              </h1>
              <p className="fs-5 text-muted">
                Choose your car, pick your dates, and drive your dreams.
              </p>

              <Card className="shadow-sm mt-4 p-3">
                <Form onSubmit={handleSearch}>
                  <Row className="g-2 align-items-end">
                    
                    <Col md={3}>
                      <Form.Label className="small">Pick Up</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </Col>

                    <Col md={3}>
                      <Form.Label className="small">Return</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </Col>

                    <Col md={3}>
                      <Form.Label className="small">Car Type</Form.Label>
                      <Form.Select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="">Any</option>
                        {BODY_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col md={2}>
                      <Form.Label className="small">Max €</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>€</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </InputGroup>
                    </Col>

                    <Col md={1}>
                      <Button
                        type="submit"
                        className="w-100 d-flex align-items-center justify-content-center btn btn-warning"
                      >
                        <img
                          src="http://localhost:5000/images/icons/search.png"
                          alt="Search"
                          style={{ width: 18, height: 18 }}
                        />
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>

            <Col md={6} className="text-center">
              <img
                src="http://localhost:5000/images/hero-car.png"
                alt="Car"
                className="img-fluid"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* RENT BY BRAND */}
      <Container className="my-5">
        <h4 className="fw-bold mb-3">Rent by Brand</h4>

        <Row className="g-3">
          {BRANDS.map((brand) => (
            <Col md={3} sm={6} key={brand.name}>
              <Card
                className="text-center p-3 shadow-sm h-100 brand-card bg-light "
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/cars?brand=${brand.name}`)
                }
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxHeight: 60,
                    objectFit: "contain",
                    marginBottom: 10,
                  }}
                />
                <small className="fw-semibold">{brand.name}</small>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* RENT BY BODY TYPE */}
      <Container className="my-5">
        <h4 className="fw-bold mb-3">Rent by Body Type</h4>

        <Row className="g-3">
          {BODY_TYPES.map((t) => (
            <Col md={2} sm={4} key={t}>
              <Card
                className="text-center p-3 hover-card h-100 bg-light hover-yellow"
                onClick={() => navigate(`/cars?type=${t}`)}
              >
                <img
                  src={`http://localhost:5000${BODY_TYPE_ICONS[t]}`}
                  alt={t}
                  style={{
                    height: 42,
                    marginBottom: 8,
                    objectFit: "contain",
                  }}
                />
                <span className="fw-semibold">{t}</span>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* MOST SEARCHED */}
      <div className="bg-dark text-light py-5">
        <Container>
          <h3 className="fw-bold mb-4">Most Searched Vehicles</h3>
          <Row>
            {featured.map((car) => (
              <Col md={4} key={car.id}>
                <CarCard car={car} dark />
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Home;
