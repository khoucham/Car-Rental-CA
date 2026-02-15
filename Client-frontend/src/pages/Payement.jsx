import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";



/* ======================
   STRIPE INIT
====================== */
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

/* ======================
   CHECKOUT FORM
====================== */
function CheckoutForm({ bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/bookings",
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    }
    // ✅ success → Stripe redirects automatically
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <PaymentElement />

      <Button
        className="mt-3 w-100"
        onClick={handlePay}
        disabled={!stripe || loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </>
  );
}

/* ======================
   PAYMENT PAGE
====================== */
export default function Payment() {
  const { bookingId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/payments/create-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ bookingId }),
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Payment failed");

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [bookingId]);

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <p>Loading payment...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">Complete Payment</h4>

        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutForm bookingId={bookingId} />
        </Elements>
      </Card>
    </Container>
  );
}
