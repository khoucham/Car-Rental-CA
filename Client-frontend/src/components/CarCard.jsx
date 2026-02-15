import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Badge from "react-bootstrap/Badge";
import { Link } from "react-router-dom";

function CarCard({ car }) {
  if (!car) return null;

  const brand = car.brand || "Unknown";
  const model = car.model || "";
  const image =
    car.image ||
    "https://via.placeholder.com/600x400?text=No+Image";

  const price = car.price_per_day ?? "--";
  const transmission = car.transmission || "Manual";
  const fuel = car.fuel || "Petrol";
  const seats = car.seats || 5;

  const isAuto = transmission.toLowerCase() === "automatic";
  const BRAND_LOGOS = {
  bmw: "/images/brands/bmw.png",
  tesla: "/images/brands/tesla.png",
  toyota: "/images/brands/toyota.png",
  hyundai: "/images/brands/hyundai.png",
  volkswagen: "/images/brands/volkswagen.png",
  audi: "/images/brands/audi.png",
  mercedes: "/images/brands/mercedes.png",
  kia: "/images/brands/kia.png",
  ford: "/images/brands/ford.png",
  nissan: "/images/brands/nissan.png",
  peugeot: "/images/brands/peugeot.png",
  renault: "/images/brands/renault.png",
  
};

const brandKey = brand?.toLowerCase().split(" ")[0];

  return (
    <Card className="h-100 shadow-sm">
      {/* IMAGE */}
      <Card.Img
        variant="top"
        src={image}
        alt={`${brand} ${model}`}
        style={{ height: 220, objectFit: "cover" }}
      />

      <Card.Body className="d-flex flex-column">
        {/* TITLE */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Card.Title className="mb-0">
            {brand} {model}
          </Card.Title>

          {/* BRAND LOGO (optional) */}
          <Image
            src={BRAND_LOGOS[brandKey]}
            alt={brand}
            onError={(e) => (e.target.style.display = "none")}
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
        </div>

        {/* PRICE */}
        <Card.Text className="text-muted mb-2">
          €{price} / day
        </Card.Text>

        {/* SPECS */}
       <div className="d-flex align-items-center text-muted small mb-3 gap-3">
        <span>👤 {seats}</span>
        <span>{isAuto ? "⚙️ Auto" : "🕹 Manual"}</span>
        <span>⛽ {fuel}</span>
       </div>

        {/* BUTTON */}
        <Button
          as={Link}
          to={`/cars/${car.id}`}
          variant="warning"
          className="mt-auto w-100"
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
}

export default CarCard;
