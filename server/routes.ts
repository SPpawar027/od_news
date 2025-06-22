import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAdminSession } from "./adminAuth";
import { setupAdminRoutes } from "./adminRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin session middleware
  app.use(getAdminSession());

  // Setup admin routes
  await setupAdminRoutes(app);

  // Seed database on startup
  const { seedDatabase } = await import('./seedData');
  await seedDatabase();

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Articles API
  app.get("/api/articles", async (req, res) => {
    try {
      const { limit = "10", offset = "0", categoryId } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const categoryIdNum = categoryId ? parseInt(categoryId as string) : undefined;

      const articles = await storage.getArticles(limitNum, offsetNum, categoryIdNum);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Single article API
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Trending articles API
  app.get("/api/trending-articles", async (req, res) => {
    try {
      const { limit = "5" } = req.query;
      const limitNum = parseInt(limit as string);
      
      const articles = await storage.getTrendingArticles(limitNum);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending articles" });
    }
  });

  // Breaking news API
  app.get("/api/breaking-news", async (req, res) => {
    try {
      const breakingNews = await storage.getBreakingNews();
      res.json(breakingNews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
