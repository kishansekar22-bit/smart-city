import { Router, Response } from "express";
import { db } from "../db/db.js";
import { verifyToken, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/users (Admin only)
router.get("/", verifyToken, requireRole("admin"), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.role_id, r.name as role_name, u.department_id, d.name as department_name, u.avatar_url, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.created_at DESC
    `);
    return res.json({ users: result.rows });
  } catch (err: any) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// PUT /api/users/:id/role (Admin only)
router.put("/:id/role", verifyToken, requireRole("admin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role_id, department_id } = req.body;

    await db.query(
      `UPDATE users
       SET role_id = COALESCE($1, role_id),
           department_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [role_id, department_id || null, id]
    );

    return res.json({ message: "User role & department updated successfully." });
  } catch (err: any) {
    console.error("Update user role error:", err);
    return res.status(500).json({ message: "Failed to update user role", error: err.message });
  }
});

export default router;