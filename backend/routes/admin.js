import express from "express";
import db from "../db.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

/* =====================================================
   ADMIN: DASHBOARD STATS
===================================================== */
/* =====================================================
   ADMIN: DASHBOARD STATS
===================================================== */
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [[users]] = await db.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [[cars]] = await db.query(
      "SELECT COUNT(*) AS total FROM cars"
    );

    const [[activeBookings]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE status IN ('pending', 'confirmed')
    `);

    const [[cancelledBookings]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE status = 'cancelled'
    `);

    const [[revenue]] = await db.query(`
      SELECT IFNULL(SUM(total), 0) AS total
      FROM bookings
      WHERE status = 'confirmed'
    `);

    res.json({
      users: users.total,
      cars: cars.total,
      bookings: activeBookings.total,
      cancelled: cancelledBookings.total,
      revenue: revenue.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});


/* =====================================================
   ADMIN: GET ALL USERS
===================================================== */
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, email, firstName, lastName, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* =====================================================
   ADMIN: DELETE USER (OPTIONAL)
===================================================== */
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* =====================================================
   ADMIN: GET ALL BOOKINGS
===================================================== */
/* =====================================================
   ADMIN: GET PENDING BOOKINGS ONLY
===================================================== */
router.get("/bookings", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.total,
        b.status,
        u.email,
        c.brand,
        c.model
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'pending'
      ORDER BY b.start_date ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("ADMIN BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* =====================================================
   ADMIN: UPDATE BOOKING STATUS
===================================================== */
router.patch("/bookings/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Booking updated" });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});


export default router;