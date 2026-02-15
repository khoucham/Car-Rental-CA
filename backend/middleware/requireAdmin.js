export default function requireAdmin(req, res, next) {
  // req.user comes from JWT middleware
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}
