import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function PaymentSuccess() {
  const { bookingId } = useParams(); // ✅ FIXED
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentIntent = searchParams.get("payment_intent");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking reference.");
      setLoading(false);
      return;
    }

    const confirmAndFetch = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔔 Notify backend payment was received
        await fetch("http://localhost:5000/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        });

        // 📄 Fetch booking for receipt
        const res = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load booking");

        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    confirmAndFetch();
  }, [bookingId]);

  /* =====================
     STATES
  ===================== */
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Finalising payment…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate("/bookings")}>
          Go to My Bookings
        </Button>
      </Container>
    );
  }

  /* =====================
     SUCCESS / RECEIPT
  ===================== */
  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <h3 className="text-success mb-3 text-center">
          ✅ Payment Received
        </h3>

        <p className="text-muted text-center mb-4">
          Thank you for your payment. Your booking is currently
          <strong> under review</strong>.  
          Once the payment is verified, we will confirm your booking.
        </p>

        <Card className="mb-4">
          <Card.Body>
            <h6 className="mb-3">Payment Summary</h6>

            <div className="d-flex justify-content-between mb-2">
              <span>Booking ID</span>
              <strong>#{booking.id}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Car</span>
              <strong>
                {booking.brand} {booking.model}
              </strong>
            </div>

                  <div className="d-flex justify-content-between mb-2">
                  <span>Rental Dates</span>
                  <strong>
                    {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                  </strong>
                    </div>


            <div className="d-flex justify-content-between mb-2">
              <span>Total Paid</span>
              <strong>€{booking.total}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Status</span>
              <strong className="text-warning">
                Pending confirmation
              </strong>
            </div>

            <div className="mt-3 text-muted small">
              Payment reference: {paymentIntent}
            </div>
          </Card.Body>
        </Card>

        <div className="text-center">
          <Button onClick={() => navigate("/bookings")}>
            Go to My Bookings
          </Button>
        </div>
      </Card>
    </Container>
  );
}
