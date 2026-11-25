import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { verifyToken, optionalAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/announcements
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let conditions: string[] = [];
    let params: any[] = [];
    let pIdx = 1;

    if (category) {
      conditions.push(`category = $${pIdx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(LOWER(title) LIKE $${pIdx} OR LOWER(content) LIKE $${pIdx})`);
      params.push(`%${String(search).toLowerCase()}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT a.*, u.full_name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ${whereClause}
      ORDER BY a.is_pinned DESC, a.created_at DESC
    `;

    const result = await db.query(sql, params);
    return res.json({ announcements: result.rows });
  } catch (err: any) {
    console.error("Get announcements error:", err);
    return res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
  }
});

// POST /api/announcements
router.post("/", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, content, is_pinned = false, image_url } = req.body;
    const userId = req.user!.userId;

    if (!title || !category || !content) {
      return res.status(400).json({ message: "Title, category, and content are required." });
    }

    const id = `ann-${uuidv4().substring(0, 8)}`;
    await db.query(
      `INSERT INTO announcements (id, title, category, content, author_id, is_pinned, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, title, category, content, userId, is_pinned, image_url || null]
    );

    const result = await db.query("SELECT * FROM announcements WHERE id = $1", [id]);
    return res.status(201).json({ message: "Announcement published successfully", announcement: result.rows[0] });
  } catch (err: any) {
    console.error("Create announcement error:", err);
    return res.status(500).json({ message: "Failed to publish announcement", error: err.message });
  }
});

// PUT /api/announcements/:id
router.put("/:id", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, content, is_pinned, image_url } = req.body;

    await db.query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           content = COALESCE($3, content),
           is_pinned = COALESCE($4, is_pinned),
           image_url = COALESCE($5, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [title, category, content, is_pinned, image_url, id]
    );

    const result = await db.query("SELECT * FROM announcements WHERE id = $1", [id]);
    return res.json({ message: "Announcement updated successfully", announcement: result.rows[0] });
  } catch (err: any) {
    console.error("Update announcement error:", err);
    return res.status(500).json({ message: "Failed to update announcement", error: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete("/:id", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM announcements WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res.json({ message: "Announcement deleted successfully" });
  } catch (err: any) {
    console.error("Delete announcement error:", err);
    return res.status(500).json({ message: "Failed to delete announcement", error: err.message });
  }
});

export default router;