import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load bookings");

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });

    // Remove booking from list after action
    setBookings(b => b.filter(x => x.id !== id));
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h2 className="mb-3">Pending Bookings</h2>

      {bookings.length === 0 ? (
        <Alert variant="info">No pending bookings</Alert>
      ) : (
        <Table responsive bordered hover>
          <thead className="table-light">
            <tr>
              <th>User</th>
              <th>Car</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Status</th>
              <th width="180">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.email}</td>
                <td>{b.brand} {b.model}</td>
                <td>
                  {new Date(b.start_date).toLocaleDateString()} →{" "}
                  {new Date(b.end_date).toLocaleDateString()}
                </td>
                <td>€{b.total}</td>
                <td>
                  <Badge bg="warning">Pending</Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => updateStatus(b.id, "confirmed")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => updateStatus(b.id, "Rejected")}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
