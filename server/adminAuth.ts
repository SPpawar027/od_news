import bcrypt from 'bcrypt';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from "express";
import type { AdminUser, UserRoleType } from "@shared/schema";
import { db } from "./db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

declare module 'express-session' {
  interface SessionData {
    adminUser?: AdminUser;
  }
}

export function getAdminSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'admin-secret-key-change-this',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const hasPermission = (requiredRoles: UserRoleType[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.session.adminUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!requiredRoles.includes(req.session.adminUser.role as UserRoleType)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }
    
    next();
  };
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createDefaultAdminUser(): Promise<void> {
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, 'admin'))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword('admin123');
      
      await db.insert(adminUsers).values({
        username: 'admin',
        email: 'admin@odnews.com',
        password: hashedPassword,
        role: 'manager',
        isActive: true,
      });
      
      console.log('Default admin user created: admin/admin123');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
}