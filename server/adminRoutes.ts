import { Router } from "express";
import { verifyToken, requireRole, generateToken, comparePassword, hashPassword, type AuthRequest } from "./auth";
import { db } from "./db";
import { 
  adminUsers, 
  articles, 
  categories, 
  videos, 
  liveTv, 
  rssFeeds, 
  subtitles, 
  articleVersions, 
  rssArticles,
  breakingNews 
} from "../shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import multer from "multer";
import { z } from "zod";

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await comparePassword(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await db.update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, admin.id));

    const token = generateToken(admin);
    
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current admin profile
router.get("/profile", verifyToken, (req: AuthRequest, res) => {
  res.json({
    id: req.admin!.id,
    email: req.admin!.email,
    name: req.admin!.name,
    role: req.admin!.role
  });
});

// ARTICLE MANAGEMENT (CMS with AI features)
router.get("/articles", verifyToken, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = db.select().from(articles).orderBy(desc(articles.createdAt));
    
    if (status) {
      query = query.where(eq(articles.status, status));
    }

    const articlesData = await query.limit(limit).offset(offset);
    
    res.json(articlesData);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

router.post("/articles", verifyToken, requireRole(["manager", "editor", "limited_editor"]), async (req: AuthRequest, res) => {
  try {
    const articleData = {
      ...req.body,
      createdBy: req.admin!.id,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [article] = await db.insert(articles).values(articleData).returning();
    
    // Create version history
    await db.insert(articleVersions).values({
      articleId: article.id,
      version: 1,
      title: article.title,
      titleHindi: article.titleHindi,
      content: article.content,
      contentHindi: article.contentHindi,
      changes: "Initial creation",
      createdBy: req.admin!.id
    });

    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Failed to create article" });
  }
});

router.put("/articles/:id", verifyToken, requireRole(["manager", "editor", "limited_editor"]), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      version: req.body.version + 1
    };

    const [article] = await db.update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    // Create version history
    await db.insert(articleVersions).values({
      articleId: id,
      version: updateData.version,
      title: article.title,
      titleHindi: article.titleHindi,
      content: article.content,
      contentHindi: article.contentHindi,
      changes: req.body.changes || "Content updated",
      createdBy: req.admin!.id
    });

    res.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ message: "Failed to update article" });
  }
});

router.delete("/articles/:id", verifyToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(articles).where(eq(articles.id, id));
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Failed to delete article" });
  }
});

// AI-powered content enhancement
router.post("/articles/ai-enhance", verifyToken, requireRole(["manager", "editor", "limited_editor"]), async (req: AuthRequest, res) => {
  try {
    const { content, type } = req.body; // type: 'hashtags', 'headline', 'enhance'
    
    // Mock AI enhancement - in real implementation, integrate with OpenAI API
    let result = {};
    
    switch (type) {
      case 'hashtags':
        result = {
          hashtags: ["#news", "#trending", "#politics", "#india"]
        };
        break;
      case 'headline':
        result = {
          suggestions: [
            "Breaking: " + content.slice(0, 50) + "...",
            "LIVE: " + content.slice(0, 50) + "...",
            "Exclusive: " + content.slice(0, 50) + "..."
          ]
        };
        break;
      case 'enhance':
        result = {
          enhanced: content + " [AI Enhanced for better readability and engagement]",
          improvements: ["Grammar corrected", "Tone improved", "Clarity enhanced"]
        };
        break;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in AI enhancement:", error);
    res.status(500).json({ message: "AI enhancement failed" });
  }
});

// VIDEO MANAGEMENT
router.get("/videos", verifyToken, async (req: AuthRequest, res) => {
  try {
    const videosData = await db.select().from(videos).orderBy(desc(videos.createdAt));
    res.json(videosData);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

router.post("/videos", verifyToken, requireRole(["manager", "editor"]), upload.single('video'), async (req: AuthRequest, res) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: req.admin!.id,
      videoUrl: req.file?.path || req.body.videoUrl,
      uploadDate: new Date(),
      createdAt: new Date()
    };

    const [video] = await db.insert(videos).values(videoData).returning();
    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ message: "Failed to create video" });
  }
});

// SUBTITLE MANAGEMENT
router.get("/videos/:videoId/subtitles", verifyToken, async (req: AuthRequest, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const subtitlesData = await db.select().from(subtitles).where(eq(subtitles.videoId, videoId));
    res.json(subtitlesData);
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    res.status(500).json({ message: "Failed to fetch subtitles" });
  }
});

router.post("/videos/:videoId/subtitles", verifyToken, requireRole(["manager", "editor", "subtitle_editor"]), upload.single('subtitle'), async (req: AuthRequest, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const subtitleData = {
      videoId,
      language: req.body.language,
      subtitleData: req.body.subtitleData || req.file?.path,
      createdBy: req.admin!.id,
      createdAt: new Date()
    };

    const [subtitle] = await db.insert(subtitles).values(subtitleData).returning();
    res.status(201).json(subtitle);
  } catch (error) {
    console.error("Error creating subtitle:", error);
    res.status(500).json({ message: "Failed to create subtitle" });
  }
});

// LIVE TV MANAGEMENT
router.get("/live-tv", verifyToken, async (req: AuthRequest, res) => {
  try {
    const liveTvData = await db.select().from(liveTv).orderBy(asc(liveTv.sortOrder));
    res.json(liveTvData);
  } catch (error) {
    console.error("Error fetching live TV:", error);
    res.status(500).json({ message: "Failed to fetch live TV" });
  }
});

router.post("/live-tv", verifyToken, requireRole(["manager", "editor"]), async (req: AuthRequest, res) => {
  try {
    const [stream] = await db.insert(liveTv).values(req.body).returning();
    res.status(201).json(stream);
  } catch (error) {
    console.error("Error creating live TV stream:", error);
    res.status(500).json({ message: "Failed to create live TV stream" });
  }
});

router.put("/live-tv/:id", verifyToken, requireRole(["manager", "editor"]), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [stream] = await db.update(liveTv)
      .set(req.body)
      .where(eq(liveTv.id, id))
      .returning();
    res.json(stream);
  } catch (error) {
    console.error("Error updating live TV stream:", error);
    res.status(500).json({ message: "Failed to update live TV stream" });
  }
});

// RSS FEED MANAGEMENT
router.get("/rss-feeds", verifyToken, async (req: AuthRequest, res) => {
  try {
    const rssData = await db.select().from(rssFeeds).orderBy(desc(rssFeeds.createdAt));
    res.json(rssData);
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    res.status(500).json({ message: "Failed to fetch RSS feeds" });
  }
});

router.post("/rss-feeds", verifyToken, requireRole(["manager", "editor"]), async (req: AuthRequest, res) => {
  try {
    const feedData = {
      ...req.body,
      createdBy: req.admin!.id,
      createdAt: new Date()
    };

    const [feed] = await db.insert(rssFeeds).values(feedData).returning();
    res.status(201).json(feed);
  } catch (error) {
    console.error("Error creating RSS feed:", error);
    res.status(500).json({ message: "Failed to create RSS feed" });
  }
});

// RSS ARTICLES (imported from feeds)
router.get("/rss-articles", verifyToken, async (req: AuthRequest, res) => {
  try {
    const rssArticlesData = await db.select().from(rssArticles)
      .where(eq(rssArticles.isImported, false))
      .orderBy(desc(rssArticles.createdAt));
    res.json(rssArticlesData);
  } catch (error) {
    console.error("Error fetching RSS articles:", error);
    res.status(500).json({ message: "Failed to fetch RSS articles" });
  }
});

router.post("/rss-articles/:id/import", verifyToken, requireRole(["manager", "editor"]), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rssArticle] = await db.select().from(rssArticles).where(eq(rssArticles.id, id));
    
    if (!rssArticle) {
      return res.status(404).json({ message: "RSS article not found" });
    }

    // Convert RSS article to CMS article
    const articleData = {
      title: rssArticle.title,
      titleHindi: rssArticle.title, // In real implementation, use translation API
      content: rssArticle.content,
      contentHindi: rssArticle.content, // In real implementation, use translation API
      excerpt: rssArticle.content.slice(0, 200),
      excerptHindi: rssArticle.content.slice(0, 200),
      status: "draft",
      createdBy: req.admin!.id,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [article] = await db.insert(articles).values(articleData).returning();
    
    // Mark RSS article as imported
    await db.update(rssArticles)
      .set({ isImported: true, importedAt: new Date() })
      .where(eq(rssArticles.id, id));

    res.json(article);
  } catch (error) {
    console.error("Error importing RSS article:", error);
    res.status(500).json({ message: "Failed to import RSS article" });
  }
});

// USER MANAGEMENT (for managers only)
router.get("/users", verifyToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const users = await db.select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLogin: adminUsers.lastLogin,
      createdAt: adminUsers.createdAt
    }).from(adminUsers).orderBy(desc(adminUsers.createdAt));
    
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post("/users", verifyToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const { username, email, password, name, role } = req.body;
    
    const hashedPassword = await hashPassword(password);
    const userData = {
      username,
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      createdAt: new Date()
    };

    const [user] = await db.insert(adminUsers).values(userData).returning({
      id: adminUsers.id,
      username: adminUsers.username,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      createdAt: adminUsers.createdAt
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.put("/users/:id", verifyToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const [user] = await db.update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, id))
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        updatedAt: adminUsers.updatedAt
      });
    
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DASHBOARD ANALYTICS
router.get("/dashboard/stats", verifyToken, async (req: AuthRequest, res) => {
  try {
    const [articlesCount] = await db.select({ count: sql`count(*)` }).from(articles);
    const [videosCount] = await db.select({ count: sql`count(*)` }).from(videos);
    const [usersCount] = await db.select({ count: sql`count(*)` }).from(adminUsers);
    
    res.json({
      articles: articlesCount.count,
      videos: videosCount.count,
      users: usersCount.count,
      rssFeeds: await db.select({ count: sql`count(*)` }).from(rssFeeds).then(r => r[0].count)
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default router;