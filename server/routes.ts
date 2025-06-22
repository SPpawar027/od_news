import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema,
  insertArticleSchema,
  insertBreakingNewsSchema,
  insertAdminUserSchema,
  insertLiveStreamSchema,
  insertVideoSchema,
  insertRssSourceSchema,
  insertArticleDraftSchema
} from "@shared/schema";
import { 
  authenticateAdmin, 
  requireRole, 
  hashPassword, 
  comparePassword, 
  generateToken,
  type AuthenticatedRequest
} from "./adminAuth";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Live streams API (public)
  app.get("/api/live-streams", async (req, res) => {
    try {
      const streams = await storage.getLiveStreams();
      const activeStreams = streams.filter(stream => stream.isActive);
      res.json(activeStreams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live streams" });
    }
  });

  // ============ ADMIN ROUTES ============

  // Admin Authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const adminUser = await storage.getAdminUserByEmail(email);
      
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, adminUser.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await storage.updateAdminUser(adminUser.id, { 
        lastLogin: new Date() 
      });

      const token = generateToken(adminUser);
      
      res.json({
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Dashboard Data
  app.get("/api/admin/dashboard", authenticateAdmin, async (req, res) => {
    try {
      const [articles, liveStreams, videos, users, rssFeeds] = await Promise.all([
        storage.getArticles(),
        storage.getLiveStreams(),
        storage.getVideos(),
        storage.getAdminUsers(),
        storage.getRssSources()
      ]);

      res.json({
        stats: {
          totalArticles: articles.length,
          publishedArticles: articles.filter(a => a.publishedAt).length,
          draftArticles: articles.filter(a => !a.publishedAt).length,
          totalVideos: videos.length,
          totalStreams: liveStreams.length,
          activeStreams: liveStreams.filter(s => s.isActive).length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          totalRssFeeds: rssFeeds.length,
          activeRssFeeds: rssFeeds.filter(r => r.isActive).length,
        },
        recentArticles: articles.slice(0, 5),
        recentVideos: videos.slice(0, 5),
        liveStreams: liveStreams.slice(0, 6)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const userData = insertAdminUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createAdminUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ error: "Failed to create user", details: error.message });
    }
  });

  app.put("/api/admin/users/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Hash password if provided
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      
      const user = await storage.updateAdminUser(id, updates);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ error: "Failed to update user", details: error.message });
    }
  });

  app.delete("/api/admin/users/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = (req as AuthenticatedRequest).adminUser?.id;
      
      // Prevent self-deletion
      if (id === currentUserId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      // Check if user exists
      const user = await storage.getAdminUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // For now, we'll just deactivate the user instead of deleting
      await storage.updateAdminUser(id, { isActive: false });
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("User deletion error:", error);
      res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
  });

  // Live Streams Management
  app.get("/api/admin/live-streams", authenticateAdmin, async (req, res) => {
    try {
      const streams = await storage.getLiveStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live streams" });
    }
  });

  app.post("/api/admin/live-streams", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const streamData = insertLiveStreamSchema.parse(req.body);
      const stream = await storage.createLiveStream(streamData);
      res.status(201).json(stream);
    } catch (error) {
      console.error("Live stream creation error:", error);
      res.status(500).json({ error: "Failed to create live stream", details: error.message });
    }
  });

  app.put("/api/admin/live-streams/:id", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const stream = await storage.updateLiveStream(id, updates);
      res.json(stream);
    } catch (error) {
      res.status(500).json({ error: "Failed to update live stream" });
    }
  });

  app.delete("/api/admin/live-streams/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLiveStream(id);
      res.status(204).send();
    } catch (error) {
      console.error("Live stream deletion error:", error);
      res.status(500).json({ error: "Failed to delete live stream", details: error.message });
    }
  });

  // Videos Management
  app.get("/api/admin/videos", authenticateAdmin, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/admin/videos", authenticateAdmin, requireRole(["manager", "editor"]), async (req: AuthenticatedRequest, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: req.adminUser!.id
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.put("/api/admin/videos/:id", authenticateAdmin, requireRole(["manager", "editor", "subtitle_editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const video = await storage.updateVideo(id, updates);
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/admin/videos/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.status(204).send();
    } catch (error) {
      console.error("Video deletion error:", error);
      res.status(500).json({ error: "Failed to delete video", details: error.message });
    }
  });

  // RSS Sources Management
  app.get("/api/admin/rss-sources", authenticateAdmin, async (req, res) => {
    try {
      const sources = await storage.getRssSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSS sources" });
    }
  });

  // Public RSS Sources (for RSS news page)
  app.get("/api/rss-sources", async (req, res) => {
    try {
      const sources = await storage.getRssSources();
      const publicSources = sources.filter(source => source.isActive);
      res.json(publicSources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSS sources" });
    }
  });

  app.post("/api/admin/rss-sources", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const sourceData = insertRssSourceSchema.parse(req.body);
      const source = await storage.createRssSource(sourceData);
      res.status(201).json(source);
    } catch (error) {
      res.status(500).json({ error: "Failed to create RSS source" });
    }
  });

  app.put("/api/admin/rss-sources/:id", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const source = await storage.updateRssSource(id, updates);
      res.json(source);
    } catch (error) {
      res.status(500).json({ error: "Failed to update RSS source" });
    }
  });

  app.delete("/api/admin/rss-sources/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRssSource(id);
      res.status(204).send();
    } catch (error) {
      console.error("RSS source deletion error:", error);
      res.status(500).json({ error: "Failed to delete RSS source", details: error.message });
    }
  });

  // RSS Sync functionality
  app.post("/api/admin/rss-sources/:id/sync", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const source = await storage.getRssSourceById(id);
      
      if (!source) {
        return res.status(404).json({ error: "RSS source not found" });
      }

      // Simulate RSS feed parsing and article creation
      const sampleArticles = [
        {
          title: "Breaking: Major Economic Policy Announced",
          titleHindi: "ब्रेकिंग: प्रमुख आर्थिक नीति की घोषणा",
          content: "The government has announced a new economic policy aimed at boosting growth and creating jobs. The comprehensive package includes tax reforms, infrastructure investments, and support for small businesses.",
          contentHindi: "सरकार ने विकास को बढ़ावा देने और रोजगार सृजन के उद्देश्य से एक नई आर्थिक नीति की घोषणा की है। इस व्यापक पैकेज में कर सुधार, बुनियादी ढांचे में निवेश और छोटे व्यवसायों के लिए समर्थन शामिल है।",
          excerpt: "Government announces comprehensive economic policy package",
          excerptHindi: "सरकार ने व्यापक आर्थिक नीति पैकेज की घोषणा की",
          categoryId: source.categoryId,
          authorName: source.name,
          slug: `rss-article-${Date.now()}-1`
        },
        {
          title: "Technology Breakthrough in Renewable Energy",
          titleHindi: "नवीकरणीय ऊर्जा में तकनीकी सफलता",
          content: "Scientists have developed a new solar panel technology that significantly increases efficiency while reducing costs. This breakthrough could accelerate the adoption of renewable energy worldwide.",
          contentHindi: "वैज्ञानिकों ने एक नई सोलर पैनल तकनीक विकसित की है जो दक्षता में महत्वपूर्ण वृद्धि करती है और लागत घटाती है। यह सफलता दुनिया भर में नवीकरणीय ऊर्जा के अपनाने को तेज़ कर सकती है।",
          excerpt: "New solar technology promises higher efficiency at lower costs",
          excerptHindi: "नई सोलर तकनीक कम लागत में उच्च दक्षता का वादा करती है",
          categoryId: source.categoryId,
          authorName: source.name,
          slug: `rss-article-${Date.now()}-2`
        }
      ];

      // Create articles from RSS feed
      let articlesCreated = 0;
      for (const articleData of sampleArticles) {
        try {
          await storage.createArticle(articleData);
          articlesCreated++;
        } catch (error) {
          console.error("Failed to create RSS article:", error);
        }
      }
      
      // Update last fetch time and increment article count
      const currentSource = await storage.getRssSourceById(id);
      const totalImported = (currentSource?.articlesImported || 0) + articlesCreated;
      
      await storage.updateRssSource(id, { 
        lastFetch: new Date(),
        articlesImported: totalImported
      });
      
      res.json({ 
        message: "RSS sync completed successfully",
        articlesImported: articlesCreated,
        lastFetch: new Date()
      });
    } catch (error) {
      console.error("RSS sync error:", error);
      res.status(500).json({ error: "Failed to sync RSS source", details: error.message });
    }
  });

  // Article Drafts Management
  app.get("/api/admin/article-drafts", authenticateAdmin, async (req, res) => {
    try {
      const drafts = await storage.getArticleDrafts();
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article drafts" });
    }
  });

  app.post("/api/admin/article-drafts", authenticateAdmin, requireRole(["manager", "editor", "limited_editor"]), async (req: AuthenticatedRequest, res) => {
    try {
      const draftData = insertArticleDraftSchema.parse(req.body);
      const draft = await storage.createArticleDraft({
        ...draftData,
        createdBy: req.adminUser!.id
      });
      res.status(201).json(draft);
    } catch (error) {
      res.status(500).json({ error: "Failed to create article draft" });
    }
  });

  app.put("/api/admin/article-drafts/:id", authenticateAdmin, requireRole(["manager", "editor", "limited_editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const draft = await storage.updateArticleDraft(id, updates);
      res.json(draft);
    } catch (error) {
      res.status(500).json({ error: "Failed to update article draft" });
    }
  });

  app.post("/api/admin/article-drafts/:id/publish", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.publishArticleDraft(id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish article draft" });
    }
  });

  app.delete("/api/admin/article-drafts/:id", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticleDraft(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete article draft" });
    }
  });

  // Admin Articles Management (enhanced)
  app.get("/api/admin/articles", authenticateAdmin, async (req, res) => {
    try {
      const { limit = "10", offset = "0", categoryId } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const categoryIdNum = categoryId ? parseInt(categoryId as string) : undefined;

      const articles = await storage.getArticles(limitNum, offsetNum, categoryIdNum);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.post("/api/admin/articles", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle({
        ...articleData,
        publishedAt: new Date()
      });
      res.status(201).json(article);
    } catch (error) {
      console.error("Article creation error:", error);
      res.status(500).json({ error: "Failed to create article", details: error.message });
    }
  });

  // Categories Management (enhanced)
  app.post("/api/admin/categories", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Breaking News Management (enhanced)
  app.post("/api/admin/breaking-news", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const newsData = insertBreakingNewsSchema.parse(req.body);
      const news = await storage.createBreakingNews(newsData);
      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to create breaking news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
