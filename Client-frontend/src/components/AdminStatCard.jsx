import Card from "react-bootstrap/Card";

export default function AdminStatCard({ title, value, icon }) {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted">{title}</h6>
            <h3 className="fw-bold">{value}</h3>
          </div>
          <div style={{ fontSize: 28 }}>{icon}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
