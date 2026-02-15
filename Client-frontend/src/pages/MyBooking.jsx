import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";

import { useAuth } from "../context/AuthContext";

/* =====================
   Utils
===================== */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MyBookings() {
  const { user } = useAuth(); // ✅ JWT user
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  /* =====================
     Fetch bookings (JWT)
  ===================== */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  /* =====================
     Guards
  ===================== */
  if (!user && !loading) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Please login first to see your bookings.
        </Alert>
        <Button as={Link} to="/login">Go to Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-4">
        <Alert variant="info">Loading bookings...</Alert>
      </Container>
    );
  }

  /* =====================
     Cancel booking (SOFT CANCEL)
  ===================== */
  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/bookings/${selectedBookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Cancel failed");
      }

      // ✅ Update UI without reload
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBookingId
            ? { ...b, status: "cancelled" }
            : b
        )
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Something went wrong.");
    } finally {
      setShowConfirm(false);
      setSelectedBookingId(null);
    }
  };

  const statusBadge = (status) => {
    if (status === "confirmed") return <Badge bg="success">Confirmed</Badge>;
    if (status === "cancelled") return <Badge bg="secondary">Cancelled</Badge>;
    if (status === "rejected") return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="dark">{status}</Badge>;
  };

  /* =====================
     UI
  ===================== */
  return (
    <Container className="my-4">
      <h2 className="fw-bold mb-3">My Bookings</h2>

      {bookings.length === 0 ? (
        <Alert variant="info">
          No bookings yet.{" "}
          <Alert.Link as={Link} to="/cars">Book a car</Alert.Link>
        </Alert>
      ) : (
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Car</th>
              <th>Start</th>
              <th>End</th>
              <th>Total (€)</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.brand} {b.model}</td>
                <td>{formatDate(b.start_date)}</td>
                <td>{formatDate(b.end_date)}</td>
                <td>{b.total}</td>
                <td>{statusBadge(b.status)}</td>
                  <td className="text-end">
                  {b.status === "confirmed" ? (
                    <span title="Confirmed bookings cannot be cancelled">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled
                        style={{ pointerEvents: "none" }}
                      >
                        Cancel
                      </Button>
                    </span>
                  ) : b.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setShowConfirm(true);
                      }}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-secondary" disabled>
                      Cancelled
                    </Button>
                  )}
                </td>


              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* CONFIRM MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to cancel this booking?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            No
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Yes, cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyBookings;
