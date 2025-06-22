import type { Express } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { adminUsers, articles, categories, videos, breakingNews } from "@shared/schema";
import bcrypt from "bcrypt";

// Simple admin auth middleware
export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function setupAdminPanel(app: Express) {
  // Create default admin user
  try {
    const existingAdmin = await db.select().from(adminUsers).limit(1);
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await db.insert(adminUsers).values({
        username: "admin",
        email: "admin@odnews.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date()
      });
      console.log("Default admin user created: admin/admin123");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }

  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username))
        .limit(1);

      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      req.session.adminUser = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      };

      res.json({ 
        message: "Login successful",
        user: req.session.adminUser
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Get current admin
  app.get('/api/admin/me', isAdmin, (req, res) => {
    res.json(req.session.adminUser);
  });

  // Dashboard stats
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const [articlesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles);

      const [videosCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(videos);

      const [categoriesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

      const [breakingCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(breakingNews);

      res.json({
        articles: articlesCount.count || 0,
        videos: videosCount.count || 0,
        categories: categoriesCount.count || 0,
        breaking: breakingCount.count || 0
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Articles management
  app.get('/api/admin/articles', isAdmin, async (req, res) => {
    try {
      const articlesList = await db
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt));
      res.json(articlesList);
    } catch (error) {
      console.error("Articles error:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Categories management
  app.get('/api/admin/categories', isAdmin, async (req, res) => {
    try {
      const categoriesList = await db
        .select()
        .from(categories)
        .orderBy(categories.name);
      res.json(categoriesList);
    } catch (error) {
      console.error("Categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
}