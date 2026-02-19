import "./env.js";
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import bookingsRoutes from "./routes/bookings.js";
import carsRoutes from "./routes/cars.js";
import adminRoutes from "./routes/admin.js"; // ADMIN ROUTES
import paymentRoutes from "./routes/payments.js";








const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// STATIC FILES (IMAGES)
// =====================
// Example: http://localhost:5000/images/hero-car.png
app.use("/images", express.static(path.join(process.cwd(), "images")));
//console.log("JWT SECRET:", process.env.JWT_SECRET);

///payement//
app.use("/api/payments", paymentRoutes);
// =====================
// API ROUTES
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/cars", carsRoutes);

// 🔐 ADMIN (protected inside admin routes)
app.use("/api/admin", adminRoutes);

/* =========================
   STRIPE WEBHOOK
========================= */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const bookingId = intent.metadata.bookingId;

      await db.query(
        "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
        [bookingId]
      );
    }

    res.json({ received: true });
  }
);

// =====================
// TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("API running");
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
console.log(process.env.DB_PASSWORD);
});
