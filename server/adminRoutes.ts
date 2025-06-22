import express from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";
import {
  adminUsers,
  articles,
  categories,
  breakingNews,
  liveStreams,
  rssFeeds,
  rssItems,
  videos,
  subtitles,
  articleVersions,
  insertAdminUserSchema,
  insertArticleSchema,
  insertBreakingNewsSchema,
  insertLiveStreamSchema,
  insertRssFeedSchema,
  insertVideoSchema,
  insertSubtitleSchema,
  type AdminUser,
  type Article,
  type LiveStream,
  type RssFeed,
  type Video
} from "@shared/schema";
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  PERMISSIONS,
  generateToken,
  comparePassword,
  hashPassword,
  type AuthRequest
} from "./auth";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin user
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Generate token
    const token = generateToken(admin);

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      message: "Login successful",
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current admin profile
router.get("/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, req.admin!.id));

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { password: _, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard statistics
router.get("/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [articleCount] = await db.select({ count: count() }).from(articles);
    const [videoCount] = await db.select({ count: count() }).from(videos);
    const [streamCount] = await db.select({ count: count() }).from(liveStreams);
    const [rssCount] = await db.select({ count: count() }).from(rssFeeds);
    const [userCount] = await db.select({ count: count() }).from(adminUsers);

    // Get recent activity (last 10 articles)
    const recentArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        status: articles.status,
        createdAt: articles.createdAt,
        createdBy: articles.createdBy
      })
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(10);

    res.json({
      totalArticles: articleCount.count,
      totalVideos: videoCount.count,
      totalStreams: streamCount.count,
      totalRssFeeds: rssCount.count,
      totalUsers: userCount.count,
      recentArticles
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Management Routes
router.get("/users", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const users = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        lastLogin: adminUsers.lastLogin,
        createdAt: adminUsers.createdAt
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));

    res.json(users);
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/users", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertAdminUserSchema.parse(req.body);
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    const [newUser] = await db
      .insert(adminUsers)
      .values({
        ...validatedData,
        password: hashedPassword
      })
      .returning();

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("User creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Article Management Routes
router.get("/articles", authenticateToken, requirePermission(PERMISSIONS.VIEW_ONLY), async (req: AuthRequest, res) => {
  try {
    const { page = "1", limit = "10", status, category } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = db.select().from(articles);
    
    // Add filters
    const conditions = [];
    if (status) {
      conditions.push(eq(articles.status, status as string));
    }
    if (category) {
      conditions.push(eq(articles.categoryId, parseInt(category as string)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const articlesData = await query
      .orderBy(desc(articles.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    res.json(articlesData);
  } catch (error) {
    console.error("Articles fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/articles", authenticateToken, requirePermission(PERMISSIONS.CREATE_CONTENT), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertArticleSchema.parse(req.body);
    
    const [newArticle] = await db
      .insert(articles)
      .values({
        ...validatedData,
        createdBy: req.admin!.id,
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Article creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/articles/:id", authenticateToken, requirePermission(PERMISSIONS.EDIT_CONTENT), async (req: AuthRequest, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const validatedData = insertArticleSchema.partial().parse(req.body);

    const [updatedArticle] = await db
      .update(articles)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(articles.id, articleId))
      .returning();

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updatedArticle);
  } catch (error) {
    console.error("Article update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/articles/:id", authenticateToken, requirePermission(PERMISSIONS.DELETE_CONTENT), async (req: AuthRequest, res) => {
  try {
    const articleId = parseInt(req.params.id);

    const [deletedArticle] = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning();

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Article deletion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Live Stream Management Routes
router.get("/streams", authenticateToken, requirePermission(PERMISSIONS.MANAGE_LIVE_STREAMS), async (req: AuthRequest, res) => {
  try {
    const streams = await db
      .select()
      .from(liveStreams)
      .orderBy(liveStreams.sortOrder, desc(liveStreams.createdAt));

    res.json(streams);
  } catch (error) {
    console.error("Streams fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/streams", authenticateToken, requirePermission(PERMISSIONS.MANAGE_LIVE_STREAMS), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertLiveStreamSchema.parse(req.body);
    
    const [newStream] = await db
      .insert(liveStreams)
      .values({
        ...validatedData,
        createdBy: req.admin!.id
      })
      .returning();

    res.status(201).json(newStream);
  } catch (error) {
    console.error("Stream creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// RSS Feed Management Routes
router.get("/rss-feeds", authenticateToken, requirePermission(PERMISSIONS.MANAGE_RSS_FEEDS), async (req: AuthRequest, res) => {
  try {
    const feeds = await db
      .select()
      .from(rssFeeds)
      .orderBy(desc(rssFeeds.createdAt));

    res.json(feeds);
  } catch (error) {
    console.error("RSS feeds fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/rss-feeds", authenticateToken, requirePermission(PERMISSIONS.MANAGE_RSS_FEEDS), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertRssFeedSchema.parse(req.body);
    
    const [newFeed] = await db
      .insert(rssFeeds)
      .values({
        ...validatedData,
        createdBy: req.admin!.id
      })
      .returning();

    res.status(201).json(newFeed);
  } catch (error) {
    console.error("RSS feed creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Video Management Routes
router.get("/videos", authenticateToken, requirePermission(PERMISSIONS.VIEW_ONLY), async (req: AuthRequest, res) => {
  try {
    const { showRevenue } = req.query;
    const userRole = req.admin!.role;
    
    // Check if user can view revenue data
    const canViewRevenue = PERMISSIONS.VIEW_REVENUE.includes(userRole);
    
    let selectFields: any = {
      id: videos.id,
      title: videos.title,
      titleHindi: videos.titleHindi,
      description: videos.description,
      videoUrl: videos.videoUrl,
      thumbnailUrl: videos.thumbnailUrl,
      duration: videos.duration,
      tags: videos.tags,
      categoryId: videos.categoryId,
      isVertical: videos.isVertical,
      viewCount: videos.viewCount,
      uploadDate: videos.uploadDate,
      createdAt: videos.createdAt
    };

    // Only include revenue if user has permission
    if (canViewRevenue) {
      selectFields.revenue = videos.revenue;
    }

    const videosData = await db
      .select(selectFields)
      .from(videos)
      .orderBy(desc(videos.createdAt));

    res.json(videosData);
  } catch (error) {
    console.error("Videos fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/videos", authenticateToken, requirePermission(PERMISSIONS.CREATE_CONTENT), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertVideoSchema.parse(req.body);
    
    const [newVideo] = await db
      .insert(videos)
      .values({
        ...validatedData,
        createdBy: req.admin!.id
      })
      .returning();

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Video creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Subtitle Management Routes (for Subtitle Editors)
router.get("/subtitles/:videoId", authenticateToken, requirePermission(PERMISSIONS.MANAGE_SUBTITLES), async (req: AuthRequest, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    
    const videoSubtitles = await db
      .select()
      .from(subtitles)
      .where(eq(subtitles.videoId, videoId));

    res.json(videoSubtitles);
  } catch (error) {
    console.error("Subtitles fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/subtitles", authenticateToken, requirePermission(PERMISSIONS.MANAGE_SUBTITLES), async (req: AuthRequest, res) => {
  try {
    const validatedData = insertSubtitleSchema.parse(req.body);
    
    const [newSubtitle] = await db
      .insert(subtitles)
      .values({
        ...validatedData,
        createdBy: req.admin!.id
      })
      .returning();

    res.status(201).json(newSubtitle);
  } catch (error) {
    console.error("Subtitle creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Global search endpoint
router.get("/search", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q, type } = req.query;
    const searchTerm = q as string;
    
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const results: any = {};

    // Search articles
    if (!type || type === "articles") {
      results.articles = await db
        .select({
          id: articles.id,
          title: articles.title,
          type: "article" as const
        })
        .from(articles)
        .where(
          or(
            like(articles.title, `%${searchTerm}%`),
            like(articles.content, `%${searchTerm}%`)
          )
        )
        .limit(5);
    }

    // Search videos
    if (!type || type === "videos") {
      results.videos = await db
        .select({
          id: videos.id,
          title: videos.title,
          type: "video" as const
        })
        .from(videos)
        .where(like(videos.title, `%${searchTerm}%`))
        .limit(5);
    }

    // Search users (managers only)
    if ((!type || type === "users") && req.admin!.role === "manager") {
      results.users = await db
        .select({
          id: adminUsers.id,
          title: adminUsers.name,
          type: "user" as const
        })
        .from(adminUsers)
        .where(
          or(
            like(adminUsers.name, `%${searchTerm}%`),
            like(adminUsers.email, `%${searchTerm}%`)
          )
        )
        .limit(5);
    }

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;