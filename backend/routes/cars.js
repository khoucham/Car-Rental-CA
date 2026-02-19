import express from "express";
import db from "../db.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

/**
 * ======================
 * ADMIN: ADD CAR
 * ======================
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        brand,
        model,
        category,
        type,
        fuel,
        transmission,
        seats,
        doors,
        price_per_day,
        image,
      } = req.body;

      if (!brand || !model || !type || !price_per_day) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await db.query(
        `
        INSERT INTO cars
        (brand, model, category, type, fuel, transmission, seats, doors, price_per_day, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          brand,
          model,
          category,
          type,
          fuel,
          transmission,
          seats,
          doors,
          price_per_day,
          image,
        ]
      );

      res.status(201).json({ message: "Car added successfully" });
    } catch (err) {
      console.error("ADD CAR ERROR:", err);
      res.status(500).json({ error: "Failed to add car" });
    }
  }
);

/**
 * ======================
 * ADMIN: UPDATE CAR
 * ======================
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        brand,
        model,
        category,
        type,
        fuel,
        transmission,
        seats,
        doors,
        price_per_day,
        image,
      } = req.body;

      const [result] = await db.query(
        `
        UPDATE cars SET
          brand = ?,
          model = ?,
          category = ?,
          type = ?,
          fuel = ?,
          transmission = ?,
          seats = ?,
          doors = ?,
          price_per_day = ?,
          image = ?
        WHERE id = ?
        `,
        [
          brand,
          model,
          category,
          type,
          fuel,
          transmission,
          seats,
          doors,
          price_per_day,
          image,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Car not found" });
      }

      res.json({ message: "Car updated successfully" });
    } catch (err) {
      console.error("UPDATE CAR ERROR:", err);
      res.status(500).json({ error: "Failed to update car" });
    }
  }
);

/**
 * ======================
 * ADMIN: DELETE CAR
 * ======================
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      await db.query("DELETE FROM cars WHERE id = ?", [id]);

      res.json({ message: "Car deleted successfully" });

    } catch (err) {
      console.error("DELETE CAR ERROR:", err);

      //  FOREIGN KEY CONSTRAINT
      if (err.errno === 1451) {
        return res.status(409).json({
          error: "This car cannot be deleted because it has active or past bookings.",
        });
      }

      res.status(500).json({
        error: "Failed to delete car",
      });
    }
  }
);


/**
 * ==========================================
 * GET ALL CARS (FILTERS + AVAILABILITY + LIMIT)
 * ==========================================
 */
router.get("/", async (req, res) => {
  try {
    const {
      type,
      transmission,
      fuel,
      maxPrice,
      startDate,
      endDate,
      availableOnly,
      limit,
    } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (type) {
      where += " AND c.type = ?";
      params.push(type);
    }

    if (transmission) {
      where += " AND c.transmission = ?";
      params.push(transmission);
    }

    if (fuel) {
      where += " AND c.fuel = ?";
      params.push(fuel);
    }

    if (maxPrice) {
      where += " AND c.price_per_day <= ?";
      params.push(maxPrice);
    }

    if (availableOnly && startDate && endDate) {
      where += `
        AND c.id NOT IN (
          SELECT car_id
          FROM bookings
          WHERE status = 'confirmed'
            AND start_date <= ?
            AND end_date >= ?
        )
      `;
      params.push(endDate, startDate);
    }

    let limitSql = "";
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      limitSql = `LIMIT ${limitNum}`;
    }

    const [cars] = await db.query(
      `
      SELECT c.*
      FROM cars c
      ${where}
      ORDER BY c.price_per_day ASC
      ${limitSql}
      `,
      params
    );

    res.json(cars);
  } catch (err) {
    console.error("GET /cars ERROR:", err);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

/**
 * ==========================
 * GET SINGLE CAR BY ID
 * ==========================
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM cars WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
