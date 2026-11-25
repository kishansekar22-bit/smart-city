import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { verifyToken, optionalAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Helper to map civic categories to appropriate departments
function getDefaultDepartment(category: string): string | null {
  const cat = category.toLowerCase();
  if (cat.includes("road") || cat.includes("pothole")) return "dept-roads";
  if (cat.includes("light") || cat.includes("electr")) return "dept-power";
  if (cat.includes("water") || cat.includes("drain")) return "dept-water";
  if (cat.includes("traffic") || cat.includes("transport") || cat.includes("bus")) return "dept-traffic";
  if (cat.includes("garbage") || cat.includes("waste") || cat.includes("sanitation")) return "dept-waste";
  if (cat.includes("park") || cat.includes("tree") || cat.includes("space") || cat.includes("pollut")) return "dept-parks";
  return "dept-roads";
}

// POST /api/complaints
router.post("/", verifyToken, upload.single("image"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, description, priority, address, landmark, latitude, longitude, department_id, image_url: directImageUrl } = req.body;
    const citizenId = req.user!.userId;

    if (!title || !category || !description || !address) {
      return res.status(400).json({ message: "Title, category, description, and address are required." });
    }

    const complaintId = `cmp-${uuidv4().substring(0, 8)}`;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `SC-2026-${randomSuffix}`;

    const assignedDeptId = department_id || getDefaultDepartment(category);
    const validPriority = ["Low", "Medium", "High", "Critical"].includes(priority) ? priority : "Medium";
    const validStatus = "Submitted";
    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;

    await db.query(
      `INSERT INTO complaints 
        (id, ticket_id, citizen_id, department_id, title, category, description, priority, status, latitude, longitude, address, landmark, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [complaintId, ticketId, citizenId, assignedDeptId, title, category, description, validPriority, validStatus, lat, lng, address, landmark || null]
    );

    // Save image if uploaded
    let savedImageUrl = directImageUrl || null;
    if (req.file) {
      savedImageUrl = `/uploads/${req.file.filename}`;
      await db.query(
        `INSERT INTO complaint_images (id, complaint_id, image_url, file_name, file_size, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [`img-${uuidv4().substring(0, 8)}`, complaintId, savedImageUrl, req.file.originalname, req.file.size]
      );
    } else if (directImageUrl) {
      await db.query(
        `INSERT INTO complaint_images (id, complaint_id, image_url, file_name, file_size, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [`img-${uuidv4().substring(0, 8)}`, complaintId, directImageUrl, "complaint-photo.jpg", 102400]
      );
    }

    // Add initial status history
    await db.query(
      `INSERT INTO complaint_status_history (id, complaint_id, changed_by, status, note, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [`hist-${uuidv4().substring(0, 8)}`, complaintId, citizenId, "Submitted", "Grievance lodged by citizen."]
    );

    // Fetch and return full created complaint
    const fetchRes = await db.query(
      `SELECT c.*, d.name as department_name, u.full_name as citizen_name
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN users u ON c.citizen_id = u.id
       WHERE c.id = $1`,
      [complaintId]
    );

    const created = fetchRes.rows[0];
    created.image_url = savedImageUrl;

    return res.status(201).json({
      message: "Civic issue reported successfully",
      ticket_id: ticketId,
      complaint: created,
    });
  } catch (err: any) {
    console.error("Create complaint error:", err);
    return res.status(500).json({ message: "Failed to create complaint", error: err.message });
  }
});

// GET /api/complaints
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status, priority, department_id, citizen_id, search, limit = "50", offset = "0" } = req.query;

    let conditions: string[] = [];
    let params: any[] = [];
    let pIdx = 1;

    if (category) {
      conditions.push(`c.category = $${pIdx++}`);
      params.push(category);
    }
    if (status) {
      conditions.push(`c.status = $${pIdx++}`);
      params.push(status);
    }
    if (priority) {
      conditions.push(`c.priority = $${pIdx++}`);
      params.push(priority);
    }
    if (department_id) {
      conditions.push(`c.department_id = $${pIdx++}`);
      params.push(department_id);
    }
    if (citizen_id) {
      conditions.push(`c.citizen_id = $${pIdx++}`);
      params.push(citizen_id);
    }
    if (search) {
      conditions.push(`(
        LOWER(c.title) LIKE $${pIdx} OR 
        LOWER(c.ticket_id) LIKE $${pIdx} OR 
        LOWER(c.address) LIKE $${pIdx} OR 
        LOWER(c.description) LIKE $${pIdx}
      )`);
      params.push(`%${String(search).toLowerCase()}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const listQuery = `
      SELECT 
        c.*, 
        d.name as department_name, 
        d.code as department_code,
        u.full_name as citizen_name, 
        u.email as citizen_email
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.citizen_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;

    const listRes = await db.query(listQuery, params);
    const complaints = listRes.rows;

    // Attach primary image and comment count
    if (complaints.length > 0) {
      const imagesRes = await db.query("SELECT complaint_id, image_url FROM complaint_images");
      const imgMap: Record<string, string> = {};
      for (const img of imagesRes.rows) {
        if (!imgMap[img.complaint_id]) {
          imgMap[img.complaint_id] = img.image_url;
        }
      }

      const commentsRes = await db.query("SELECT complaint_id, COUNT(*) as count FROM complaint_comments GROUP BY complaint_id");
      const commentCountMap: Record<string, number> = {};
      for (const cm of commentsRes.rows) {
        commentCountMap[cm.complaint_id] = parseInt(cm.count, 10);
      }

      for (const c of complaints) {
        c.image_url = imgMap[c.id] || null;
        c.comment_count = commentCountMap[c.id] || 0;
      }
    }

    const pageLimit = parseInt(String(limit), 10) || 50;
    const pageOffset = parseInt(String(offset), 10) || 0;
    const pagedComplaints = complaints.slice(pageOffset, pageOffset + pageLimit);

    return res.json({
      total: complaints.length,
      complaints: pagedComplaints,
    });
  } catch (err: any) {
    console.error("Get complaints error:", err);
    return res.status(500).json({ message: "Failed to fetch complaints", error: err.message });
  }
});

// GET /api/complaints/:id
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const compRes = await db.query(
      `SELECT 
        c.*, 
        d.name as department_name, 
        d.code as department_code,
        d.contact_email as department_email,
        d.contact_phone as department_phone,
        u.full_name as citizen_name, 
        u.email as citizen_email,
        u.phone as citizen_phone,
        u.avatar_url as citizen_avatar
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN users u ON c.citizen_id = u.id
       WHERE c.id = $1 OR c.ticket_id = $1`,
      [id]
    );

    if (compRes.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found with provided ID or Ticket ID." });
    }

    const complaint = compRes.rows[0];

    // Fetch images
    const imagesRes = await db.query(
      "SELECT id, image_url, file_name, file_size, created_at FROM complaint_images WHERE complaint_id = $1 ORDER BY created_at ASC",
      [complaint.id]
    );

    // Fetch status history
    const historyRes = await db.query(
      `SELECT h.*, u.full_name as changed_by_name, r.name as role_name
       FROM complaint_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE h.complaint_id = $1
       ORDER BY h.created_at ASC`,
      [complaint.id]
    );

    // Fetch comments
    // Hide internal comments from regular citizens
    const isStaff = currentUser && (currentUser.role.includes("official") || currentUser.role.includes("admin"));
    const commentsQuery = isStaff
      ? `SELECT cc.*, u.full_name as user_name, r.name as user_role, u.avatar_url
         FROM complaint_comments cc
         LEFT JOIN users u ON cc.user_id = u.id
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE cc.complaint_id = $1
         ORDER BY cc.created_at ASC`
      : `SELECT cc.*, u.full_name as user_name, r.name as user_role, u.avatar_url
         FROM complaint_comments cc
         LEFT JOIN users u ON cc.user_id = u.id
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE cc.complaint_id = $1 AND cc.is_internal = false
         ORDER BY cc.created_at ASC`;

    const commentsRes = await db.query(commentsQuery, [complaint.id]);

    // Fetch feedback if any
    const feedbackRes = await db.query(
      "SELECT * FROM feedback WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1",
      [complaint.id]
    );

    complaint.images = imagesRes.rows;
    complaint.status_history = historyRes.rows;
    complaint.comments = commentsRes.rows;
    complaint.feedback = feedbackRes.rows[0] || null;

    return res.json({ complaint });
  } catch (err: any) {
    console.error("Get complaint by ID error:", err);
    return res.status(500).json({ message: "Failed to fetch complaint details", error: err.message });
  }
});

// PUT /api/complaints/:id/status
router.put("/:id/status", verifyToken, requireRole(["official", "admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, resolution_notes, department_id, priority } = req.body;
    const userId = req.user!.userId;

    const allowedStatuses = ["Submitted", "Acknowledged", "Assigned", "In Progress", "Resolved", "Closed"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
    }

    // Check complaint exists
    const checkRes = await db.query("SELECT id, status, department_id FROM complaints WHERE id = $1 OR ticket_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = checkRes.rows[0];
    const newStatus = status || complaint.status;
    const newDept = department_id !== undefined ? department_id : complaint.department_id;

    await db.query(
      `UPDATE complaints 
       SET status = $1, 
           department_id = $2, 
           resolution_notes = COALESCE($3, resolution_notes),
           priority = COALESCE($4, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [newStatus, newDept, resolution_notes || note || null, priority || null, complaint.id]
    );

    // Record history
    await db.query(
      `INSERT INTO complaint_status_history (id, complaint_id, changed_by, status, note, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [`hist-${uuidv4().substring(0, 8)}`, complaint.id, userId, newStatus, note || `Status transitioned to ${newStatus}`]
    );

    return res.json({
      message: "Complaint status updated successfully",
      complaintId: complaint.id,
      status: newStatus,
    });
  } catch (err: any) {
    console.error("Update complaint status error:", err);
    return res.status(500).json({ message: "Failed to update complaint status", error: err.message });
  }
});

// POST /api/complaints/:id/comments
router.post("/:id/comments", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment, is_internal = false } = req.body;
    const user = req.user!;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment text cannot be empty." });
    }

    // Check complaint
    const checkRes = await db.query("SELECT id FROM complaints WHERE id = $1 OR ticket_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaintId = checkRes.rows[0].id;
    const commentId = `comm-${uuidv4().substring(0, 8)}`;

    // Regular citizens cannot mark comments as internal notes
    const isInternalNote = is_internal && (user.role.includes("official") || user.role.includes("admin"));

    await db.query(
      `INSERT INTO complaint_comments (id, complaint_id, user_id, comment, is_internal, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [commentId, complaintId, user.userId, comment.trim(), isInternalNote]
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: commentId,
        complaint_id: complaintId,
        user_id: user.userId,
        user_name: user.fullName,
        comment: comment.trim(),
        is_internal: isInternalNote,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Add comment error:", err);
    return res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
});

// PUT /api/complaints/:id
router.put("/:id", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category, department_id, address, landmark } = req.body;

    const checkRes = await db.query("SELECT * FROM complaints WHERE id = $1 OR ticket_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const existing = checkRes.rows[0];
    const isOwner = req.user!.userId === existing.citizen_id;
    const isStaff = req.user!.role.includes("official") || req.user!.role.includes("admin");

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You do not have permission to modify this complaint." });
    }

    await db.query(
      `UPDATE complaints
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           category = COALESCE($4, category),
           department_id = COALESCE($5, department_id),
           address = COALESCE($6, address),
           landmark = COALESCE($7, landmark),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [title, description, priority, category, department_id, address, landmark, existing.id]
    );

    return res.json({ message: "Complaint updated successfully" });
  } catch (err: any) {
    console.error("Update complaint error:", err);
    return res.status(500).json({ message: "Failed to update complaint", error: err.message });
  }
});

// DELETE /api/complaints/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleteRes = await db.query("DELETE FROM complaints WHERE id = $1 OR ticket_id = $1", [id]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    return res.json({ message: "Complaint deleted successfully." });
  } catch (err: any) {
    console.error("Delete complaint error:", err);
    return res.status(500).json({ message: "Failed to delete complaint", error: err.message });
  }
});

export default router;