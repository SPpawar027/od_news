import type { Express } from "express";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import { adminUsers, articles, categories, videos, liveTv, rssFeeds, subtitles, breakingNews } from "@shared/schema";
import { insertAdminUserSchema, insertVideoSchema, insertLiveTvSchema, insertRssFeedSchema, insertSubtitleSchema, insertBreakingNewsSchema, insertArticleSchema, UserRole } from "@shared/schema";
import { isAdminAuthenticated, hasPermission, verifyPassword, hashPassword, createDefaultAdminUser } from "./adminAuth";

export async function setupAdminRoutes(app: Express) {
  // Create default admin user on startup
  await createDefaultAdminUser();

  // Auth routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username))
        .limit(1);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await db
        .update(adminUsers)
        .set({ lastLogin: new Date() })
        .where(eq(adminUsers.id, user.id));

      // Store user in session
      req.session.adminUser = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/admin/me', isAdminAuthenticated, (req, res) => {
    res.json(req.session.adminUser);
  });

  // Dashboard Stats
  app.get('/api/admin/dashboard-stats', isAdminAuthenticated, async (req, res) => {
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

      const [usersCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminUsers);

      res.json({
        articles: articlesCount.count || 0,
        videos: videosCount.count || 0,
        categories: categoriesCount.count || 0,
        users: usersCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Article Management
  app.get('/api/admin/articles', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const articlesList = await db
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt));

      res.json(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.post('/api/admin/articles', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      
      const [newArticle] = await db
        .insert(articles)
        .values({
          ...validatedData,
          publishedAt: new Date(),
          createdAt: new Date()
        })
        .returning();

      res.json(newArticle);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/admin/articles/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertArticleSchema.parse(req.body);
      
      const [updatedArticle] = await db
        .update(articles)
        .set(validatedData)
        .where(eq(articles.id, id))
        .returning();

      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(updatedArticle);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/admin/articles/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedArticle] = await db
        .delete(articles)
        .where(eq(articles.id, id))
        .returning();

      if (!deletedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Breaking News Management
  app.get('/api/admin/breaking-news', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const breakingNewsList = await db
        .select()
        .from(breakingNews)
        .orderBy(desc(breakingNews.priority), desc(breakingNews.createdAt));

      res.json(breakingNewsList);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  app.post('/api/admin/breaking-news', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const validatedData = insertBreakingNewsSchema.parse(req.body);
      
      const [newBreakingNews] = await db
        .insert(breakingNews)
        .values({
          ...validatedData,
          createdAt: new Date()
        })
        .returning();

      res.json(newBreakingNews);
    } catch (error) {
      console.error('Error creating breaking news:', error);
      res.status(500).json({ message: "Failed to create breaking news" });
    }
  });

  app.put('/api/admin/breaking-news/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBreakingNewsSchema.parse(req.body);
      
      const [updatedNews] = await db
        .update(breakingNews)
        .set(validatedData)
        .where(eq(breakingNews.id, id))
        .returning();

      if (!updatedNews) {
        return res.status(404).json({ message: "Breaking news not found" });
      }

      res.json(updatedNews);
    } catch (error) {
      console.error('Error updating breaking news:', error);
      res.status(500).json({ message: "Failed to update breaking news" });
    }
  });

  app.delete('/api/admin/breaking-news/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedNews] = await db
        .delete(breakingNews)
        .where(eq(breakingNews.id, id))
        .returning();

      if (!deletedNews) {
        return res.status(404).json({ message: "Breaking news not found" });
      }

      res.json({ message: "Breaking news deleted successfully" });
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      res.status(500).json({ message: "Failed to delete breaking news" });
    }
  });

  // Videos Management
  app.get('/api/admin/videos', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR, UserRole.SUBTITLE_EDITOR]), async (req, res) => {
    try {
      const videosList = await db
        .select()
        .from(videos)
        .orderBy(desc(videos.createdAt));

      res.json(videosList);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post('/api/admin/videos', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      
      const [newVideo] = await db
        .insert(videos)
        .values({
          ...validatedData,
          createdAt: new Date()
        })
        .returning();

      res.json(newVideo);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.put('/api/admin/videos/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.LIMITED_EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVideoSchema.parse(req.body);
      
      const [updatedVideo] = await db
        .update(videos)
        .set(validatedData)
        .where(eq(videos.id, id))
        .returning();

      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json(updatedVideo);
    } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete('/api/admin/videos/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedVideo] = await db
        .delete(videos)
        .where(eq(videos.id, id))
        .returning();

      if (!deletedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Live TV Management
  app.get('/api/admin/live-tv', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const liveTvChannels = await db
        .select()
        .from(liveTv)
        .orderBy(desc(liveTv.createdAt));

      res.json(liveTvChannels);
    } catch (error) {
      console.error('Error fetching live TV channels:', error);
      res.status(500).json({ message: "Failed to fetch live TV channels" });
    }
  });

  app.post('/api/admin/live-tv', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const validatedData = insertLiveTvSchema.parse(req.body);
      
      const [newChannel] = await db
        .insert(liveTv)
        .values({
          ...validatedData,
          createdAt: new Date()
        })
        .returning();

      res.json(newChannel);
    } catch (error) {
      console.error('Error creating live TV channel:', error);
      res.status(500).json({ message: "Failed to create live TV channel" });
    }
  });

  app.put('/api/admin/live-tv/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLiveTvSchema.parse(req.body);
      
      const [updatedChannel] = await db
        .update(liveTv)
        .set(validatedData)
        .where(eq(liveTv.id, id))
        .returning();

      if (!updatedChannel) {
        return res.status(404).json({ message: "Live TV channel not found" });
      }

      res.json(updatedChannel);
    } catch (error) {
      console.error('Error updating live TV channel:', error);
      res.status(500).json({ message: "Failed to update live TV channel" });
    }
  });

  app.delete('/api/admin/live-tv/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedChannel] = await db
        .delete(liveTv)
        .where(eq(liveTv.id, id))
        .returning();

      if (!deletedChannel) {
        return res.status(404).json({ message: "Live TV channel not found" });
      }

      res.json({ message: "Live TV channel deleted successfully" });
    } catch (error) {
      console.error('Error deleting live TV channel:', error);
      res.status(500).json({ message: "Failed to delete live TV channel" });
    }
  });

  // RSS Feeds Management
  app.get('/api/admin/rss-feeds', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const rssFeedsList = await db
        .select()
        .from(rssFeeds)
        .orderBy(desc(rssFeeds.createdAt));

      res.json(rssFeedsList);
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      res.status(500).json({ message: "Failed to fetch RSS feeds" });
    }
  });

  app.post('/api/admin/rss-feeds', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const validatedData = insertRssFeedSchema.parse(req.body);
      
      const [newFeed] = await db
        .insert(rssFeeds)
        .values({
          ...validatedData,
          createdAt: new Date()
        })
        .returning();

      res.json(newFeed);
    } catch (error) {
      console.error('Error creating RSS feed:', error);
      res.status(500).json({ message: "Failed to create RSS feed" });
    }
  });

  app.put('/api/admin/rss-feeds/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRssFeedSchema.parse(req.body);
      
      const [updatedFeed] = await db
        .update(rssFeeds)
        .set(validatedData)
        .where(eq(rssFeeds.id, id))
        .returning();

      if (!updatedFeed) {
        return res.status(404).json({ message: "RSS feed not found" });
      }

      res.json(updatedFeed);
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      res.status(500).json({ message: "Failed to update RSS feed" });
    }
  });

  app.delete('/api/admin/rss-feeds/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedFeed] = await db
        .delete(rssFeeds)
        .where(eq(rssFeeds.id, id))
        .returning();

      if (!deletedFeed) {
        return res.status(404).json({ message: "RSS feed not found" });
      }

      res.json({ message: "RSS feed deleted successfully" });
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      res.status(500).json({ message: "Failed to delete RSS feed" });
    }
  });

  app.post('/api/admin/rss-feeds/:id/refresh', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Update lastFetched timestamp
      const [updatedFeed] = await db
        .update(rssFeeds)
        .set({ lastFetched: new Date() })
        .where(eq(rssFeeds.id, id))
        .returning();

      if (!updatedFeed) {
        return res.status(404).json({ message: "RSS feed not found" });
      }

      res.json({ message: "RSS feed refreshed successfully", feed: updatedFeed });
    } catch (error) {
      console.error('Error refreshing RSS feed:', error);
      res.status(500).json({ message: "Failed to refresh RSS feed" });
    }
  });

  // Categories
  app.get('/api/admin/categories', isAdminAuthenticated, async (req, res) => {
    try {
      const categoriesList = await db
        .select()
        .from(categories)
        .orderBy(categories.name);

      res.json(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
}