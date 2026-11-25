import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AuthTokenPayload } from "../types/index.js";

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Please provide a valid Bearer token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Role mapping can be 'role-admin' or 'admin'
    const userRole = req.user.role.replace("role-", "");
    const normalizedAllowed = roles.map(r => r.replace("role-", ""));

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have sufficient permissions. Required: ${roles.join(", ")}`,
      });
    }

    next();
  };
}