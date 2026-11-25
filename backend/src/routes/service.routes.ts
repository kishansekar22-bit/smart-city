import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { verifyToken, optionalAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/services
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let conditions: string[] = [];
    let params: any[] = [];
    let pIdx = 1;

    if (category && category !== "All") {
      conditions.push(`ps.category = $${pIdx++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(
        LOWER(ps.name) LIKE $${pIdx} OR 
        LOWER(ps.address) LIKE $${pIdx} OR 
        LOWER(ps.category) LIKE $${pIdx}
      )`);
      params.push(`%${String(search).toLowerCase()}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT ps.*, d.name as department_name, d.code as department_code
      FROM public_services ps
      LEFT JOIN departments d ON ps.department_id = d.id
      ${whereClause}
      ORDER BY ps.category ASC, ps.name ASC
    `;

    const result = await db.query(sql, params);
    return res.json({ services: result.rows });
  } catch (err: any) {
    console.error("Get public services error:", err);
    return res.status(500).json({ message: "Failed to fetch public services", error: err.message });
  }
});

// POST /api/services
router.post("/", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, address, phone, email, opening_hours, latitude, longitude, department_id } = req.body;

    if (!name || !category || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Name, category, address, latitude, and longitude are required." });
    }

    const id = `srv-${uuidv4().substring(0, 8)}`;
    await db.query(
      `INSERT INTO public_services (id, name, category, address, phone, email, opening_hours, latitude, longitude, department_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
      [id, name, category, address, phone || null, email || null, opening_hours || null, parseFloat(latitude), parseFloat(longitude), department_id || null]
    );

    const result = await db.query("SELECT * FROM public_services WHERE id = $1", [id]);
    return res.status(201).json({ message: "Public service facility added successfully", service: result.rows[0] });
  } catch (err: any) {
    console.error("Create service error:", err);
    return res.status(500).json({ message: "Failed to add public service", error: err.message });
  }
});

// PUT /api/services/:id
router.put("/:id", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, address, phone, email, opening_hours, latitude, longitude, department_id } = req.body;

    await db.query(
      `UPDATE public_services
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           address = COALESCE($3, address),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           opening_hours = COALESCE($6, opening_hours),
           latitude = COALESCE($7, latitude),
           longitude = COALESCE($8, longitude),
           department_id = COALESCE($9, department_id)
       WHERE id = $10`,
      [
        name,
        category,
        address,
        phone,
        email,
        opening_hours,
        latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude !== undefined ? parseFloat(longitude) : undefined,
        department_id,
        id,
      ]
    );

    const result = await db.query("SELECT * FROM public_services WHERE id = $1", [id]);
    return res.json({ message: "Service updated successfully", service: result.rows[0] });
  } catch (err: any) {
    console.error("Update service error:", err);
    return res.status(500).json({ message: "Failed to update public service", error: err.message });
  }
});

// DELETE /api/services/:id
router.delete("/:id", verifyToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM public_services WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.json({ message: "Public service removed successfully" });
  } catch (err: any) {
    console.error("Delete service error:", err);
    return res.status(500).json({ message: "Failed to delete public service", error: err.message });
  }
});

export default router;