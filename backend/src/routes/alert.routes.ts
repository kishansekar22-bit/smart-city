import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { verifyToken, optionalAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/alerts
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { active_only, severity } = req.query;
    let conditions: string[] = [];
    let params: any[] = [];
    let pIdx = 1;

    if (active_only === "true") {
      conditions.push(`a.is_active = true`);
    }
    if (severity) {
      conditions.push(`a.severity = $${pIdx++}`);
      params.push(severity);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT a.*, u.full_name as author_name
      FROM emergency_alerts a
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE a.severity 
          WHEN 'Critical' THEN 1 
          WHEN 'Warning' THEN 2 
          ELSE 3 
        END,
        a.created_at DESC
    `;

    const result = await db.query(sql, params);
    return res.json({ alerts: result.rows });
  } catch (err: any) {
    console.error("Get alerts error:", err);
    return res.status(500).json({ message: "Failed to fetch emergency alerts", error: err.message });
  }
});

// POST /api/alerts
router.post("/", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, severity = "Warning", area } = req.body;
    const userId = req.user!.userId;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const id = `alt-${uuidv4().substring(0, 8)}`;
    await db.query(
      `INSERT INTO emergency_alerts (id, title, description, severity, area, is_active, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, title, description, severity, area || null, userId]
    );

    const alertRes = await db.query("SELECT * FROM emergency_alerts WHERE id = $1", [id]);
    return res.status(201).json({ message: "Emergency alert published successfully", alert: alertRes.rows[0] });
  } catch (err: any) {
    console.error("Create alert error:", err);
    return res.status(500).json({ message: "Failed to create emergency alert", error: err.message });
  }
});

// PUT /api/alerts/:id
router.put("/:id", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, severity, area, is_active } = req.body;

    await db.query(
      `UPDATE emergency_alerts
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           severity = COALESCE($3, severity),
           area = COALESCE($4, area),
           is_active = COALESCE($5, is_active),
           resolved_at = CASE WHEN $5 = false THEN CURRENT_TIMESTAMP ELSE resolved_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [title, description, severity, area, is_active, id]
    );

    const alertRes = await db.query("SELECT * FROM emergency_alerts WHERE id = $1", [id]);
    return res.json({ message: "Alert updated successfully", alert: alertRes.rows[0] });
  } catch (err: any) {
    console.error("Update alert error:", err);
    return res.status(500).json({ message: "Failed to update alert", error: err.message });
  }
});

// DELETE /api/alerts/:id
router.delete("/:id", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM emergency_alerts WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Alert not found" });
    }
    return res.json({ message: "Emergency alert deleted successfully" });
  } catch (err: any) {
    console.error("Delete alert error:", err);
    return res.status(500).json({ message: "Failed to delete alert", error: err.message });
  }
});

export default router;