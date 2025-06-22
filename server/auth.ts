import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import type { AdminUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "justice_wave_news_secret_2025";
const JWT_EXPIRES_IN = "24h";

export interface AuthRequest extends Request {
  admin?: AdminUser;
}

// Generate JWT token
export function generateToken(admin: AdminUser): string {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      username: admin.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Middleware to authenticate JWT token
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.admin = decoded;
  next();
}

// Middleware to check user roles
export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(", ")}` 
      });
    }

    next();
  };
}

// Role-based permissions
export const PERMISSIONS = {
  MANAGE_USERS: ["manager"],
  MANAGE_ALL_CONTENT: ["manager", "editor"],
  CREATE_CONTENT: ["manager", "editor", "limited_editor"],
  EDIT_CONTENT: ["manager", "editor", "limited_editor"],
  DELETE_CONTENT: ["manager", "editor"],
  MANAGE_SUBTITLES: ["manager", "editor", "subtitle_editor"],
  VIEW_REVENUE: ["manager", "editor"],
  MANAGE_LIVE_STREAMS: ["manager", "editor"],
  MANAGE_RSS_FEEDS: ["manager", "editor"],
  VIEW_ONLY: ["manager", "editor", "limited_editor", "subtitle_editor", "viewer"],
};

// Check specific permission
export function hasPermission(userRole: string, permission: string[]): boolean {
  return permission.includes(userRole);
}

// Middleware for specific permissions
export function requirePermission(permission: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!hasPermission(req.admin.role, permission)) {
      return res.status(403).json({ 
        message: "Insufficient permissions for this action" 
      });
    }

    next();
  };
}