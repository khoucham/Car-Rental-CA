import express from "express";
import db from "../db.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

/* =====================================================
   ADMIN: UPDATE BOOKING STATUS (approve / reject)
===================================================== */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["confirmed", "cancelled", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const [result] = await db.query(
        "UPDATE bookings SET status = ? WHERE id = ?",
        [status, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json({ message: "Booking updated" });
    } catch (err) {
      console.error("ADMIN UPDATE BOOKING ERROR:", err);
      res.status(500).json({ error: "Failed to update booking" });
    }
  }
);

/* =====================================================
   USER: CANCEL OWN BOOKING (SOFT CANCEL)
===================================================== */
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  try {
    // Only allow cancel if booking is PENDING and belongs to user
    const [result] = await db.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ?
        AND user_id = ?
        AND status = 'pending'
      `,
      [bookingId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error: "Only pending bookings can be cancelled",
      });
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});


/* =====================================================
   CREATE BOOKING (JWT USER)
===================================================== */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { carId, startDate, endDate, total } = req.body;
    const userId = req.user.id;

    if (!carId || !startDate || !endDate || total == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check overlapping confirmed bookings
    const [conflicts] = await db.query(
      `
      SELECT id FROM bookings
      WHERE car_id = ?
        AND status = 'confirmed'
        AND start_date <= ?
        AND end_date >= ?
      `,
      [carId, endDate, startDate]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ error: "Car not available" });
    }

    // Create booking
    const [result] = await db.query(
      `
      INSERT INTO bookings
        (user_id, car_id, start_date, end_date, total, status)
      VALUES
        (?, ?, ?, ?, ?, 'pending')
      `,
      [userId, carId, startDate, endDate, total]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/* =====================================================
   GET BOOKED DATES FOR A CAR (PUBLIC)
===================================================== */
router.get("/car/:carId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT start_date, end_date
      FROM bookings
      WHERE car_id = ?
        AND status IN ('pending', 'confirmed')
      `,
      [req.params.carId]
    );

    res.json(rows);
  } catch (err) {
    console.error("FETCH BOOKED DATES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


/* =====================================================
   GET BOOKINGS FOR LOGGED-IN USER
===================================================== */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.total,
        b.status,
        b.created_at,
        c.brand,
        c.model
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
