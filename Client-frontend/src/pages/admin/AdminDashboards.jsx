import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import AdminStatCard from "../../components/AdminStatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setError("Failed to load admin stats"));
  }, []);

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <>
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row className="g-3">
  <Col md={3}>
    <AdminStatCard title="Users" value={stats.users} icon="👤" />
  </Col>

  <Col md={3}>
    <AdminStatCard title="Cars" value={stats.cars} icon="🚗" />
  </Col>

  <Col md={3}>
    <AdminStatCard title="Active Bookings" value={stats.bookings} icon="📦" />
  </Col>

  <Col md={3}>
    <AdminStatCard title="Revenue" value={`€${stats.revenue}`} icon="💶" />
  </Col>

  {/* ✅ NEW ROW */}
  <Col md={3}>
    <AdminStatCard
      title="Cancelled"
      value={stats.cancelled}
      icon="❌"
      variant="danger"
    />
  </Col>
</Row>

    </>
  );
}
