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
        .orderBy(categories.title);
      res.json(categoriesList);
    } catch (error) {
      console.error("Categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Article CRUD operations
  app.post('/api/admin/articles', isAdmin, async (req, res) => {
    try {
      const { title, titleHindi, content, contentHindi, excerpt, excerptHindi, categoryId, imageUrl, authorName, isBreaking, isTrending } = req.body;

      const [newArticle] = await db.insert(articles).values({
        title,
        titleHindi,
        content,
        contentHindi,
        excerpt,
        excerptHindi,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
        authorName: authorName || null,
        isBreaking: isBreaking || false,
        isTrending: isTrending || false,
        publishedAt: new Date(),
        createdAt: new Date()
      }).returning();

      res.json(newArticle);
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/admin/articles/:id', isAdmin, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const { title, titleHindi, content, contentHindi, excerpt, excerptHindi, categoryId, imageUrl, authorName, isBreaking, isTrending } = req.body;

      const [updatedArticle] = await db.update(articles)
        .set({
          title,
          titleHindi,
          content,
          contentHindi,
          excerpt,
          excerptHindi,
          categoryId: categoryId || null,
          imageUrl: imageUrl || null,
          authorName: authorName || null,
          isBreaking: isBreaking || false,
          isTrending: isTrending || false,
        })
        .where(eq(articles.id, articleId))
        .returning();

      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(updatedArticle);
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/admin/articles/:id', isAdmin, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);

      const [deletedArticle] = await db.delete(articles)
        .where(eq(articles.id, articleId))
        .returning();

      if (!deletedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Delete article error:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Category CRUD operations
  app.post('/api/admin/categories', isAdmin, async (req, res) => {
    try {
      const { title, titleHindi } = req.body;

      const [newCategory] = await db.insert(categories).values({
        title,
        titleHindi,
        createdAt: new Date()
      }).returning();

      res.json(newCategory);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/admin/categories/:id', isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { title, titleHindi } = req.body;

      const [updatedCategory] = await db.update(categories)
        .set({ title, titleHindi })
        .where(eq(categories.id, categoryId))
        .returning();

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);

      const [deletedCategory] = await db.delete(categories)
        .where(eq(categories.id, categoryId))
        .returning();

      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Breaking news CRUD operations
  app.get('/api/admin/breaking-news', isAdmin, async (req, res) => {
    try {
      const breakingNewsList = await db
        .select()
        .from(breakingNews)
        .orderBy(desc(breakingNews.createdAt));
      res.json(breakingNewsList);
    } catch (error) {
      console.error("Breaking news error:", error);
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  app.post('/api/admin/breaking-news', isAdmin, async (req, res) => {
    try {
      const { title, titleHindi } = req.body;

      const [newBreakingNews] = await db.insert(breakingNews).values({
        title,
        titleHindi,
        isActive: true,
        createdAt: new Date()
      }).returning();

      res.json(newBreakingNews);
    } catch (error) {
      console.error("Create breaking news error:", error);
      res.status(500).json({ message: "Failed to create breaking news" });
    }
  });

  app.put('/api/admin/breaking-news/:id', isAdmin, async (req, res) => {
    try {
      const breakingId = parseInt(req.params.id);
      const { title, titleHindi, isActive } = req.body;

      const [updatedBreaking] = await db.update(breakingNews)
        .set({ title, titleHindi, isActive })
        .where(eq(breakingNews.id, breakingId))
        .returning();

      if (!updatedBreaking) {
        return res.status(404).json({ message: "Breaking news not found" });
      }

      res.json(updatedBreaking);
    } catch (error) {
      console.error("Update breaking news error:", error);
      res.status(500).json({ message: "Failed to update breaking news" });
    }
  });

  app.delete('/api/admin/breaking-news/:id', isAdmin, async (req, res) => {
    try {
      const breakingId = parseInt(req.params.id);

      const [deletedBreaking] = await db.delete(breakingNews)
        .where(eq(breakingNews.id, breakingId))
        .returning();

      if (!deletedBreaking) {
        return res.status(404).json({ message: "Breaking news not found" });
      }

      res.json({ message: "Breaking news deleted successfully" });
    } catch (error) {
      console.error("Delete breaking news error:", error);
      res.status(500).json({ message: "Failed to delete breaking news" });
    }
  });
}