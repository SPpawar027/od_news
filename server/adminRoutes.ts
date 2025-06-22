import type { Express } from "express";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import { adminUsers, articles, categories, videos, liveTv, rssFeeds, contentEnhancements, subtitles, breakingNews } from "@shared/schema";
import { insertAdminUserSchema, insertVideoSchema, insertLiveTvSchema, insertRssFeedSchema, insertContentEnhancementSchema, insertSubtitleSchema, UserRole } from "@shared/schema";
import { isAdminAuthenticated, hasPermission, verifyPassword, hashPassword, createDefaultAdminUser } from "./adminAuth";

export async function setupAdminRoutes(app: Express) {
  // Create default admin user on startup
  await createDefaultAdminUser();

  // Admin Authentication
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    try {
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(and(eq(adminUsers.username, username), eq(adminUsers.isActive, true)))
        .limit(1);

      if (!user) {
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

      // Set session
      req.session.adminUser = { ...user, password: undefined } as any;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/logout', isAdminAuthenticated, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/admin/me', isAdminAuthenticated, (req, res) => {
    const user = req.session.adminUser!;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  });

  // User Management (Manager only)
  app.get('/api/admin/users', isAdminAuthenticated, hasPermission([UserRole.MANAGER]), async (req, res) => {
    try {
      const users = await db
        .select({
          id: adminUsers.id,
          username: adminUsers.username,
          email: adminUsers.email,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          lastLogin: adminUsers.lastLogin,
          createdAt: adminUsers.createdAt,
        })
        .from(adminUsers)
        .orderBy(desc(adminUsers.createdAt));

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAdminAuthenticated, hasPermission([UserRole.MANAGER]), async (req, res) => {
    try {
      const userData = insertAdminUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(userData.password);

      const [newUser] = await db
        .insert(adminUsers)
        .values({
          ...userData,
          password: hashedPassword,
        })
        .returning({
          id: adminUsers.id,
          username: adminUsers.username,
          email: adminUsers.email,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt,
        });

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      const [updatedUser] = await db
        .update(adminUsers)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(adminUsers.id, parseInt(id)))
        .returning({
          id: adminUsers.id,
          username: adminUsers.username,
          email: adminUsers.email,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          updatedAt: adminUsers.updatedAt,
        });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAdminAuthenticated, hasPermission([UserRole.MANAGER]), async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.session.adminUser!.id;

      if (parseInt(id) === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await db.delete(adminUsers).where(eq(adminUsers.id, parseInt(id)));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Dashboard Statistics
  app.get('/api/admin/dashboard-stats', isAdminAuthenticated, async (req, res) => {
    try {
      const articlesCount = await db.select({ count: sql`count(*)`.as('count') }).from(articles);
      const videosCount = await db.select({ count: sql`count(*)`.as('count') }).from(videos);
      const categoriesCount = await db.select({ count: sql`count(*)`.as('count') }).from(categories);
      const usersCount = await db.select({ count: sql`count(*)`.as('count') }).from(adminUsers);

      res.json({
        articles: parseInt(articlesCount[0]?.count as string || '0'),
        videos: parseInt(videosCount[0]?.count as string || '0'),
        categories: parseInt(categoriesCount[0]?.count as string || '0'),
        users: parseInt(usersCount[0]?.count as string || '0'),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Video Management
  app.get('/api/admin/videos', isAdminAuthenticated, async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const whereClause = search 
        ? or(
            like(videos.title, `%${search}%`),
            like(videos.titleHindi, `%${search}%`)
          )
        : undefined;

      const videosList = await db
        .select()
        .from(videos)
        .where(whereClause)
        .orderBy(desc(videos.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json(videosList);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post('/api/admin/videos', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const currentUserId = req.session.adminUser!.id;

      const [newVideo] = await db
        .insert(videos)
        .values({
          ...videoData,
          createdBy: currentUserId,
        })
        .returning();

      res.status(201).json(newVideo);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // Live TV Management
  app.get('/api/admin/live-tv', isAdminAuthenticated, async (req, res) => {
    try {
      const channels = await db
        .select()
        .from(liveTv)
        .orderBy(liveTv.sortOrder, desc(liveTv.createdAt));

      res.json(channels);
    } catch (error) {
      console.error('Error fetching live TV channels:', error);
      res.status(500).json({ message: "Failed to fetch live TV channels" });
    }
  });

  app.post('/api/admin/live-tv', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const channelData = insertLiveTvSchema.parse(req.body);
      const currentUserId = req.session.adminUser!.id;

      const [newChannel] = await db
        .insert(liveTv)
        .values({
          ...channelData,
          createdBy: currentUserId,
        })
        .returning();

      res.status(201).json(newChannel);
    } catch (error) {
      console.error('Error creating live TV channel:', error);
      res.status(500).json({ message: "Failed to create live TV channel" });
    }
  });

  // RSS Feed Management
  app.get('/api/admin/rss-feeds', isAdminAuthenticated, async (req, res) => {
    try {
      const feeds = await db
        .select()
        .from(rssFeeds)
        .orderBy(desc(rssFeeds.createdAt));

      res.json(feeds);
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      res.status(500).json({ message: "Failed to fetch RSS feeds" });
    }
  });

  app.post('/api/admin/rss-feeds', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const feedData = insertRssFeedSchema.parse(req.body);
      const currentUserId = req.session.adminUser!.id;

      const [newFeed] = await db
        .insert(rssFeeds)
        .values({
          ...feedData,
          createdBy: currentUserId,
        })
        .returning();

      res.status(201).json(newFeed);
    } catch (error) {
      console.error('Error creating RSS feed:', error);
      res.status(500).json({ message: "Failed to create RSS feed" });
    }
  });

  // Content Enhancement with AI
  app.post('/api/admin/enhance-content', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR]), async (req, res) => {
    try {
      const { articleId, videoId, content } = req.body;
      const currentUserId = req.session.adminUser!.id;

      // Simple AI-like hashtag generation (in real implementation, integrate with OpenAI/other AI service)
      const generateHashtags = (text: string): string[] => {
        const keywords = ['news', 'breaking', 'india', 'politics', 'sports', 'technology', 'entertainment'];
        const words = text.toLowerCase().split(/\s+/);
        const tags = keywords.filter(keyword => 
          words.some(word => word.includes(keyword) || keyword.includes(word))
        );
        return tags.map(tag => `#${tag}`);
      };

      const aiGeneratedTags = generateHashtags(content);
      const enhancedContent = `${content}\n\nSuggested improvements: Better SEO optimization, enhanced readability.`;

      const [enhancement] = await db
        .insert(contentEnhancements)
        .values({
          articleId: articleId || null,
          videoId: videoId || null,
          aiGeneratedTags: JSON.stringify(aiGeneratedTags),
          enhancedContent,
          enhancedContentHindi: enhancedContent, // In real implementation, translate
          seoKeywords: JSON.stringify(aiGeneratedTags),
          createdBy: currentUserId,
        })
        .returning();

      res.status(201).json({
        ...enhancement,
        aiGeneratedTags: JSON.parse(enhancement.aiGeneratedTags || '[]'),
        seoKeywords: JSON.parse(enhancement.seoKeywords || '[]'),
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      res.status(500).json({ message: "Failed to enhance content" });
    }
  });

  // Subtitle Management (for Subtitle Editors)
  app.get('/api/admin/subtitles/:videoId', isAdminAuthenticated, async (req, res) => {
    try {
      const { videoId } = req.params;
      const subtitlesList = await db
        .select()
        .from(subtitles)
        .where(eq(subtitles.videoId, parseInt(videoId)));

      res.json(subtitlesList);
    } catch (error) {
      console.error('Error fetching subtitles:', error);
      res.status(500).json({ message: "Failed to fetch subtitles" });
    }
  });

  app.post('/api/admin/subtitles', isAdminAuthenticated, hasPermission([UserRole.MANAGER, UserRole.EDITOR, UserRole.SUBTITLE_EDITOR]), async (req, res) => {
    try {
      const subtitleData = insertSubtitleSchema.parse(req.body);
      const currentUserId = req.session.adminUser!.id;

      const [newSubtitle] = await db
        .insert(subtitles)
        .values({
          ...subtitleData,
          createdBy: currentUserId,
        })
        .returning();

      res.status(201).json(newSubtitle);
    } catch (error) {
      console.error('Error creating subtitle:', error);
      res.status(500).json({ message: "Failed to create subtitle" });
    }
  });
}