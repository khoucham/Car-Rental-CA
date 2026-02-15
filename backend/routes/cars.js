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
      const { brand, model, type, price_per_day, transmission, fuel } = req.body;

      if (!brand || !model || !type || !price_per_day) {
        return res.status(400).json({ error: "Missing fields" });
      }

      await db.query(
        `
        INSERT INTO cars 
          (brand, model, type, transmission, fuel, price_per_day)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [brand, model, type, transmission, fuel, price_per_day]
      );

      res.json({ message: "Car added successfully" });
    } catch (err) {
      console.error("ADD CAR ERROR:", err);
      res.status(500).json({ error: "Failed to add car" });
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
    console.error("GET /cars error:", err);
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

/**
 * =========================
 * GET CAR SPECS (NHTSA API)
 * =========================
 */
router.get("/:id/specs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT brand, model FROM cars WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Car not found" });
    }

    const { brand, model } = rows[0];

    const apiRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(
        brand
      )}?format=json`
    );

    const apiData = await apiRes.json();

    const match = apiData.Results.find(
      (m) => m.Model_Name.toLowerCase() === model.toLowerCase()
    );

    if (!match) {
      return res.json(null);
    }

    res.json({
      Make_Name: match.Make_Name,
      Model_Name: match.Model_Name,
      Model_ID: match.Model_ID,
      Manufacturer: brand,
    });
  } catch (err) {
    console.error("CAR SPECS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch car specs" });
  }
});

export default router;
