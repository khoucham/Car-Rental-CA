import express from "express";
import db from "../db.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

/* =====================
   ADMIN: DELETE USER
===================== */
router.delete(
  "/:id",
  requireAdmin,
  requireAuth,
  async (req, res) => {
    try {
      await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ message: "User deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
