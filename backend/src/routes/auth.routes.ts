import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { config } from "../config/index.js";
import { verifyToken, AuthenticatedRequest } from "../middleware/auth.js";
import { AuthTokenPayload } from "../types/index.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check existing email
    const existing = await db.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-${uuidv4().substring(0, 8)}`;
    const roleId = "role-citizen";

    await db.query(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, full_name, email.toLowerCase(), phone || null, hashedPassword, roleId]
    );

    const payload: AuthTokenPayload = {
      userId,
      role: "citizen",
      email: email.toLowerCase(),
      fullName: full_name,
      departmentId: null,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: userId,
        full_name,
        email: email.toLowerCase(),
        phone: phone || null,
        role: "citizen",
        department_id: null,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Failed to register user", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const userRes = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role_id, r.name as role_name, u.department_id, d.name as department_name, u.avatar_url
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const roleName = user.role_name || user.role_id.replace("role-", "");

    const payload: AuthTokenPayload = {
      userId: user.id,
      role: roleName,
      email: user.email,
      fullName: user.full_name,
      departmentId: user.department_id,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: roleName,
        role_id: user.role_id,
        department_id: user.department_id,
        department_name: user.department_name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Failed to authenticate", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRes = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role_id, r.name as role_name, u.department_id, d.name as department_name, u.avatar_url, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRes.rows[0];
    const roleName = user.role_name || user.role_id.replace("role-", "");

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: roleName,
        role_id: user.role_id,
        department_id: user.department_id,
        department_name: user.department_name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error("Auth Me error:", err);
    return res.status(500).json({ message: "Failed to fetch user profile", error: err.message });
  }
});

export default router;