import { Router } from "express";
import { db } from "../db/db.js";

const router = Router();

// GET /api/departments
router.get("/", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM departments ORDER BY name ASC"
    );
    return res.json({ departments: result.rows });
  } catch (err: any) {
    console.error("Get departments error:", err);
    return res.status(500).json({ message: "Failed to fetch departments", error: err.message });
  }
});

export default router;