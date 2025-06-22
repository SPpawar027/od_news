import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { adminUsers, type AdminUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  admin?: AdminUser;
}

export const generateToken = (admin: AdminUser): string => {
  return jwt.sign(
    { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role 
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get fresh admin data from database
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, decoded.id));
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid token or user inactive." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    next();
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};