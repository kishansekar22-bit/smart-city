import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { verifyToken, optionalAuth, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/feedback
router.get("/", optionalAuth, async (_req, res: Response) => {
  try {
    const result = await db.query(`
      SELECT f.*, u.full_name as user_name, u.avatar_url, c.ticket_id, c.title as complaint_title
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN complaints c ON f.complaint_id = c.id
      ORDER BY f.created_at DESC
    `);
    return res.json({ feedback: result.rows });
  } catch (err: any) {
    console.error("Get feedback error:", err);
    return res.status(500).json({ message: "Failed to fetch feedback", error: err.message });
  }
});

// POST /api/feedback
router.post("/", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complaint_id, rating, comments } = req.body;
    const userId = req.user!.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
    }

    const id = `fb-${uuidv4().substring(0, 8)}`;
    await db.query(
      `INSERT INTO feedback (id, complaint_id, user_id, rating, comments, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [id, complaint_id || null, userId, parseInt(rating, 10), comments || null]
    );

    return res.status(201).json({ message: "Thank you for your feedback!", feedbackId: id });
  } catch (err: any) {
    console.error("Submit feedback error:", err);
    return res.status(500).json({ message: "Failed to submit feedback", error: err.message });
  }
});

export default router;