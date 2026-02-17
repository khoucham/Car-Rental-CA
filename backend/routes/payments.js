import express from "express";
import Stripe from "stripe";
import requireAuth from "../middleware/requireAuth.js";
import db from "../db.js";


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
/* ======================================
   CREATE PAYMENT INTENT
====================================== */
router.post("/create-intent", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const [[booking]] = await db.query(`
      SELECT total, status
      FROM bookings
      WHERE id = ? AND user_id = ?
    `, [bookingId, req.user.id]);

    if (!booking || booking.status !== "pending") {
      return res.status(400).json({ error: "Invalid booking" });
    }

    const intent = await stripe.paymentIntents.create({
  amount: Math.round(booking.total * 100),
  currency: "eur",
  payment_method_types: ["card"],
});

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});
router.post("/confirm", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    await db.query(`
      UPDATE bookings
      SET status = 'pending'
      WHERE id = ? AND user_id = ?
    `, [bookingId, req.user.id]);

    res.json({ message: "Booking confirmed" });
  } catch (err) {
    res.status(500).json({ error: "Confirmation failed" });
  }
});

export default router;
