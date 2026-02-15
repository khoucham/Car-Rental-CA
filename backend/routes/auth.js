import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

/* REGISTER */
/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `
      INSERT INTO users (firstName, lastName, email, password, phone, role)
      VALUES (?, ?, ?, ?, ?, 'user')
      `,
      [firstName, lastName, email, hash, phone]
    );

    const user = {
      id: result.insertId,
      email,
      role: "user",
      firstName,
      lastName,
    };

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});



/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [[user]] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
       firstName: user.firstName,
    lastName: user.lastName,
    },
  });
});


export default router;
