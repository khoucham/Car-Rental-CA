import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import CarCard from "../components/CarCard";
import LocationPicker from "../components/LocationPicker";




function Cars() {
  const [searchParams] = useSearchParams();

  const [carsData, setCarsData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================
     DRAFT STATES
  ===================== */
  const [qDraft, setQDraft] = useState("");
  const [brandDraft, setBrandDraft] = useState("");
  const [modelDraft, setModelDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState("");
  const [transDraft, setTransDraft] = useState("");
  const [fuelDraft, setFuelDraft] = useState("");
  const [maxPriceDraft, setMaxPriceDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* =====================
     APPLIED FILTERS
  ===================== */
  const [filters, setFilters] = useState({
    q: "",
    brand: "",
    model: "",
    type: "",
    transmission: "",
    fuel: "",
    maxPrice: "",
    exactMatch: false,
  });

  /* =====================
     FETCH CARS (MySQL API)
  ===================== */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cars");
        const data = await res.json();
        setCarsData(data); // ✅ numeric IDs
      } catch (err) {
        console.error("Failed to load cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  /* =====================
     SYNC URL → FILTERS
  ===================== */
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const brand = searchParams.get("brand") || "";
    const model = searchParams.get("model") || "";
    const type = searchParams.get("type") || "";
    const transmission = searchParams.get("transmission") || "";
    const fuel = searchParams.get("fuel") || "";
    const maxPrice = searchParams.get("maxPrice") || "";

    setQDraft(q);
    setBrandDraft(brand);
    setModelDraft(model);
    setTypeDraft(type);
    setTransDraft(transmission);
    setFuelDraft(fuel);
    setMaxPriceDraft(maxPrice);

    setFilters({
      q,
      brand,
      model,
      type,
      transmission,
      fuel,
      maxPrice,
      exactMatch: false,
    });
  }, [searchParams]);

  /* =====================
     DROPDOWN OPTIONS
  ===================== */
  const brands = useMemo(
    () => [...new Set(carsData.map(c => c.brand))],
    [carsData]
  );

  const models = useMemo(() => {
    return carsData
      .filter(c => !brandDraft || c.brand === brandDraft)
      .map(c => c.model)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [carsData, brandDraft]);

  const types = [...new Set(carsData.map(c => c.type))];
  const fuels = [...new Set(carsData.map(c => c.fuel))];
  const transmissions = [...new Set(carsData.map(c => c.transmission))];

  /* =====================
     AUTOCOMPLETE
  ===================== */
  const suggestions = useMemo(() => {
    if (!qDraft.trim()) return [];
    const q = qDraft.toLowerCase();

    return carsData
      .filter(c =>
        `${c.brand} ${c.model}`.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [qDraft, carsData]);

  /* =====================
     APPLY FILTERS
  ===================== */
  const applyFilters = (exact = false) => {
    const params = new URLSearchParams();

    if (qDraft) params.set("q", qDraft);
    if (brandDraft) params.set("brand", brandDraft);
    if (modelDraft) params.set("model", modelDraft);
    if (typeDraft) params.set("type", typeDraft);
    if (transDraft) params.set("transmission", transDraft);
    if (fuelDraft) params.set("fuel", fuelDraft);
    if (maxPriceDraft) params.set("maxPrice", maxPriceDraft);

    setFilters({
      q: qDraft,
      brand: brandDraft,
      model: modelDraft,
      type: typeDraft,
      transmission: transDraft,
      fuel: fuelDraft,
      maxPrice: maxPriceDraft,
      exactMatch: exact,
    });

    window.history.replaceState(null, "", `/cars?${params.toString()}`);
    setShowSuggestions(false);
  };

  const resetFilters = () => {
    setQDraft("");
    setBrandDraft("");
    setModelDraft("");
    setTypeDraft("");
    setTransDraft("");
    setFuelDraft("");
    setMaxPriceDraft("");

    setFilters({
      q: "",
      brand: "",
      model: "",
      type: "",
      transmission: "",
      fuel: "",
      maxPrice: "",
      exactMatch: false,
    });

    window.history.replaceState(null, "", "/cars");
  };

  /* =====================
     FINAL FILTER
  ===================== */
  const filteredCars = useMemo(() => {
    const q = filters.q.toLowerCase();

    return carsData.filter(car => {
      const text = `${car.brand} ${car.model}`.toLowerCase();

      return (
        (!filters.q ||
          (filters.exactMatch ? text === q : text.includes(q))) &&
        (!filters.brand || car.brand === filters.brand) &&
        (!filters.model || car.model === filters.model) &&
        (!filters.type || car.type === filters.type) &&
        (!filters.transmission || car.transmission === filters.transmission) &&
        (!filters.fuel || car.fuel === filters.fuel) &&
        (!filters.maxPrice ||
          Number(car.price_per_day) <= Number(filters.maxPrice))
      );
    });
  }, [filters, carsData]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <h5>Loading cars...</h5>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-3">
        <Col>
          <h2 className="fw-bold">Cars</h2>
        </Col>
        <Col className="text-end">
          <Badge bg="dark">{filteredCars.length} results</Badge>
        </Col>
      </Row>

      {/* FILTER CARD */}
      <Card className="mb-4 shadow-sm ">
        <Card.Body>
          <Row className="g-3">
            <Col md={4} style={{ position: "relative" }}>
              <Form.Control
                placeholder="Search brand or model"
                value={qDraft}
                onChange={(e) => {
                  setQDraft(e.target.value);
                  setShowSuggestions(true);
                }}
              />

              {showSuggestions && suggestions.length > 0 && (
                <ListGroup
                  style={{
                    position: "absolute",
                    width: "100%",
                    zIndex: 10,
                  }}
                >
                  {suggestions.map(car => (
                    <ListGroup.Item
                      key={car.id}
                      action
                      onClick={() => {
                        const value = `${car.brand} ${car.model}`;
                        setQDraft(value);
                        setFilters({ ...filters, q: value, exactMatch: true });
                        setShowSuggestions(false);
                      }}
                    >
                      {car.brand} {car.model}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>

            <Col md={2}>
              <Form.Select value={brandDraft} onChange={e => setBrandDraft(e.target.value)}>
                <option value="">Any Brand</option>
                {brands.map(b => <option key={b}>{b}</option>)}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                value={modelDraft}
                onChange={e => setModelDraft(e.target.value)}
                disabled={!brandDraft}
              >
                <option value="">Any Model</option>
                {models.map(m => <option key={m}>{m}</option>)}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select value={typeDraft} onChange={e => setTypeDraft(e.target.value)}>
                <option value="">Any Type</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select value={transDraft} onChange={e => setTransDraft(e.target.value)}>
                <option value="">Any Transmission</option>
                {transmissions.map(t => <option key={t}>{t}</option>)}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select value={fuelDraft} onChange={e => setFuelDraft(e.target.value)}>
                <option value="">Any Fuel</option>
                {fuels.map(f => <option key={f}>{f}</option>)}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max €"
                value={maxPriceDraft}
                onChange={e => setMaxPriceDraft(e.target.value)}
              />
            </Col>

            <Col md={12} className="d-flex justify-content-end gap-2">
            
              <Button className="btn-warning" onClick={() => applyFilters(false)}>Search</Button>
              <Button variant="outline-secondary" onClick={resetFilters}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {filteredCars.map(car => (
          <Col md={4} key={car.id} className="mb-4">
            <CarCard car={car} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Cars;
