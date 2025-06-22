import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = "7d";

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(adminUser: AdminUser): string {
  return jwt.sign(
    { 
      id: adminUser.id, 
      email: adminUser.email, 
      role: adminUser.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function authenticateAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const adminUser = await storage.getAdminUserById(decoded.id);
    
    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

export const rolePermissions = {
  manager: ["create", "read", "update", "delete", "manage_users"],
  editor: ["create", "read", "update"],
  limited_editor: ["create", "read", "update"],
  subtitle_editor: ["read", "update_subtitles"],
  viewer: ["read"]
};