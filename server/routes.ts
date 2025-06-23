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
  insertArticleDraftSchema,
  insertAdvertisementSchema
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

  // RSS Auto-sync - Run every 5 minutes for testing, then 15 minutes
  const RSS_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds for immediate testing
  
  async function autoSyncRssFeeds() {
    try {
      console.log("Starting automatic RSS sync...");
      const sources = await storage.getRssSources();
      const activeSources = sources.filter(source => source.isActive);
      
      for (const source of activeSources) {
        try {
          const { default: Parser } = await import('rss-parser');
          const parser = new Parser();
          const feed = await parser.parseURL(source.url);
          
          let articlesImported = 0;
          for (const item of feed.items.slice(0, 3)) { // Import latest 3 articles per source
            const existingArticle = await storage.getArticles(100, 0).then(articles => 
              articles.find(a => a.title === item.title || a.titleHindi === item.title)
            );
            
            if (!existingArticle) {
              // Enhanced image extraction with multiple fallbacks
              let imageUrl = null;
              
              // Try multiple image sources in order of preference
              if (item.enclosure?.url && item.enclosure.type?.includes('image')) {
                imageUrl = item.enclosure.url;
              } else if (item.image?.url) {
                imageUrl = item.image.url;
              } else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
                imageUrl = item['media:content']['$'].url;
              } else if (item.content || item.contentSnippet) {
                const content = item.content || item.contentSnippet || '';
                // Multiple image extraction patterns
                const imgPatterns = [
                  /<img[^>]+src="([^">]+)"/i,
                  /<img[^>]+src='([^'>]+)'/i,
                  /src="([^"]*\.(jpg|jpeg|png|gif|webp)[^"]*)"/gi,
                  /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp)/gi
                ];
                
                for (const pattern of imgPatterns) {
                  const match = content.match(pattern);
                  if (match && match[1]) {
                    imageUrl = match[1];
                    break;
                  }
                }
              }
              
              // Keep imageUrl as null if no authentic image found
              if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = null; // Ensure only valid URLs
              }

              // Generate hashtags from article content
              const generateHashtags = (title: string, content: string): string[] => {
                const text = `${title} ${content}`.toLowerCase();
                const hashtags: string[] = [];
                
                // News-related keywords in both English and Hindi
                const keywords = {
                  'politics': 'राजनीति',
                  'economy': 'अर्थव्यवस्था',
                  'business': 'व्यापार',
                  'technology': 'तकनीक',
                  'sports': 'खेल',
                  'cricket': 'क्रिकेट',
                  'bollywood': 'बॉलीवुड',
                  'health': 'स्वास्थ्य',
                  'education': 'शिक्षा',
                  'weather': 'मौसम',
                  'breaking': 'ब्रेकिंग',
                  'news': 'समाचार'
                };

                // Check for keyword matches
                Object.entries(keywords).forEach(([eng, hindi]) => {
                  if (text.includes(eng) || text.includes(hindi)) {
                    hashtags.push(hindi);
                  }
                });

                // Add source-specific hashtags
                if (source.name.includes('NDTV')) hashtags.push('NDTV');
                if (source.name.includes('Times')) hashtags.push('टाइम्स');
                if (source.name.includes('Economic')) hashtags.push('आर्थिक');

                const uniqueHashtags = hashtags.filter((tag, index) => hashtags.indexOf(tag) === index);
                return uniqueHashtags.slice(0, 5); // Limit to 5 unique hashtags
              };
              
              const articleData = {
                title: item.title || 'Untitled',
                titleHindi: item.title || 'शीर्षक नहीं',
                content: item.content || item.contentSnippet || item.summary || 'No content available',
                contentHindi: item.content || item.contentSnippet || item.summary || 'सामग्री उपलब्ध नहीं',
                excerpt: (item.contentSnippet || item.content || '').substring(0, 200) || 'No excerpt',
                excerptHindi: (item.contentSnippet || item.content || '').substring(0, 200) || 'कोई सारांश नहीं',
                imageUrl: imageUrl,
                authorName: item.creator || source.name || 'RSS Feed',
                categoryId: source.categoryId || 1,
                hashtags: generateHashtags(item.title || '', item.content || item.contentSnippet || ''),
                isBreaking: false,
                isTrending: false,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
              };
              
              await storage.createArticle(articleData);
              articlesImported++;
            }
          }
          
          await storage.updateRssSource(source.id, { 
            lastFetch: new Date(),
            articlesImported: (source.articlesImported || 0) + articlesImported
          });
          
          if (articlesImported > 0) {
            console.log(`Auto-sync: Imported ${articlesImported} articles from ${source.name}`);
          }
        } catch (error) {
          console.error(`Auto-sync error for ${source.name}:`, error);
        }
      }
      console.log("Automatic RSS sync completed");
    } catch (error) {
      console.error("Auto-sync error:", error);
    }
  }
  
  // Start auto-sync immediately and then every 15 minutes
  autoSyncRssFeeds();
  setInterval(autoSyncRssFeeds, RSS_SYNC_INTERVAL);



  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin Category Management
  app.get("/api/admin/categories", authenticateAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateCategory(id, updates);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateAdmin, requireRole(["manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // RSS Articles API (public) - Articles imported from RSS feeds
  app.get("/api/rss-articles", async (req, res) => {
    try {
      const { categoryId, limit = 20, offset = 0 } = req.query;
      const allArticles = await storage.getArticles(100, 0, categoryId ? Number(categoryId) : undefined);
      
      // Filter articles that were imported from RSS (identify by characteristics)
      const rssArticles = allArticles.filter(article => 
        // Articles with RSS-like characteristics
        article.authorName === 'National' ||
        article.authorName === 'RSS Feed' ||
        article.title.length > 50 ||
        article.title.includes(':') ||
        article.content.includes('\n') ||
        article.content.includes('\r') ||
        // Articles created in the last 30 days (broader range for testing)
        (article.createdAt && new Date(article.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000))
      );

      const paginatedArticles = rssArticles
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(Number(offset), Number(offset) + Number(limit));
        
      res.json(paginatedArticles);
    } catch (error) {
      console.error("RSS articles fetch error:", error);
      res.status(500).json({ error: "Failed to fetch RSS articles" });
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

  // RSS Sync functionality - Real RSS feed parsing
  app.post("/api/admin/rss-sources/:id/sync", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const source = await storage.getRssSourceById(id);
      
      if (!source) {
        return res.status(404).json({ error: "RSS source not found" });
      }

      const { default: Parser } = await import('rss-parser');
      const parser = new Parser();
      
      let articlesImported = 0;
      
      try {
        const feed = await parser.parseURL(source.url);
        
        for (const item of feed.items.slice(0, 5)) { // Import latest 5 articles
          const existingArticle = await storage.getArticles(100, 0).then(articles => 
            articles.find(a => a.title === item.title || a.titleHindi === item.title)
          );
          
          if (!existingArticle) {
            // Enhanced image extraction from RSS feeds
            let imageUrl = null;
            
            // Try multiple sources for images with enhanced extraction
            if (item.enclosure?.url && item.enclosure.type?.includes('image')) {
              imageUrl = item.enclosure.url;
            } else if (item.image?.url) {
              imageUrl = item.image.url;
            } else if (item['media:content']?.$ && item['media:content'].$.url) {
              imageUrl = item['media:content'].$.url;
            } else if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
              imageUrl = item['media:thumbnail'].$.url;
            } else if (item.content || item.contentSnippet) {
              // Extract image from content using multiple regex patterns
              const content = item.content || item.contentSnippet || '';
              
              // Try different image extraction patterns
              const imgPatterns = [
                /<img[^>]+src=["']([^"'>]+)["'][^>]*>/i,
                /<img[^>]*src=["']([^"'>]+)["'][^>]*>/i,
                /src=["']([^"'>]*\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i,
                /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp)/i
              ];
              
              for (const pattern of imgPatterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                  imageUrl = match[1];
                  break;
                }
              }
            } else if (item.itunes?.image) {
              imageUrl = item.itunes.image;
            } else if (item.guid && typeof item.guid === 'object' && (item.guid as any)._) {
              // Some feeds put image URLs in GUID
              const guidStr = (item.guid as any)._;
              if (guidStr.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                imageUrl = guidStr;
              }
            }
            
            // Clean up relative URLs and make them absolute
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl && imageUrl.startsWith('/')) {
              const baseUrl = new URL(source.url).origin;
              imageUrl = baseUrl + imageUrl;
            }
            
            // Generate hashtags from article content
            const generateHashtags = (title: string, content: string): string[] => {
              const text = `${title} ${content}`.toLowerCase();
              const hashtags: string[] = [];
              
              // News-related keywords in both English and Hindi
              const keywords = {
                'politics': 'राजनीति',
                'economy': 'अर्थव्यवस्था',
                'business': 'व्यापार',
                'technology': 'तकनीक',
                'sports': 'खेल',
                'cricket': 'क्रिकेट',
                'bollywood': 'बॉलीवुड',
                'health': 'स्वास्थ्य',
                'education': 'शिक्षा',
                'weather': 'मौसम',
                'breaking': 'ब्रेकिंग',
                'news': 'समाचार'
              };

              // Check for keyword matches
              Object.entries(keywords).forEach(([eng, hindi]) => {
                if (text.includes(eng) || text.includes(hindi)) {
                  hashtags.push(hindi);
                }
              });

              // Add source-specific hashtags
              if (source.name.includes('NDTV')) hashtags.push('NDTV');
              if (source.name.includes('Times')) hashtags.push('टाइम्स');
              if (source.name.includes('Economic')) hashtags.push('आर्थिक');

              const uniqueHashtags = hashtags.filter((tag, index) => hashtags.indexOf(tag) === index);
              return uniqueHashtags.slice(0, 5); // Limit to 5 unique hashtags
            };

            const articleData = {
              title: item.title || 'Untitled',
              titleHindi: item.title || 'शीर्षक नहीं',
              content: item.content || item.contentSnippet || item.summary || 'No content available',
              contentHindi: item.content || item.contentSnippet || item.summary || 'सामग्री उपलब्ध नहीं',
              excerpt: (item.contentSnippet || item.content || '').substring(0, 200) || 'No excerpt',
              excerptHindi: (item.contentSnippet || item.content || '').substring(0, 200) || 'कोई सारांश नहीं',
              imageUrl: imageUrl,
              authorName: item.creator || source.name || 'RSS Feed',
              categoryId: source.categoryId || 1,
              hashtags: generateHashtags(item.title || '', item.content || item.contentSnippet || ''),
              isBreaking: false,
              isTrending: false,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            };
            
            await storage.createArticle(articleData);
            articlesImported++;
          }
        }
      } catch (rssError) {
        console.error("RSS parsing error:", rssError);
        await storage.updateRssSource(id, { 
          lastFetch: new Date()
        });
        
        return res.json({ 
          message: "RSS sync completed - Unable to parse feed content",
          articlesImported: 0,
          lastFetch: new Date()
        });
      }

      // Update source with new fetch time and imported count
      await storage.updateRssSource(id, { 
        lastFetch: new Date(),
        articlesImported: (source.articlesImported || 0) + articlesImported
      });
      
      res.json({ 
        message: `RSS sync completed successfully`,
        articlesImported,
        lastFetch: new Date()
      });
    } catch (error) {
      console.error("RSS sync error:", error);
      res.status(500).json({ error: "Failed to sync RSS source", details: (error as Error).message });
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
    } catch (error: any) {
      console.error("Breaking news creation error:", error);
      res.status(500).json({ error: "Failed to create breaking news", details: error.message });
    }
  });

  // Advertisement Management
  app.get("/api/admin/advertisements", authenticateAdmin, async (req, res) => {
    try {
      const ads = await storage.getAdvertisements();
      res.json(ads);
    } catch (error: any) {
      console.error("Advertisement fetch error:", error);
      res.status(500).json({ error: "Failed to fetch advertisements", details: error.message });
    }
  });

  app.post("/api/admin/advertisements", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const adData = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(adData);
      res.status(201).json(ad);
    } catch (error: any) {
      console.error("Advertisement creation error:", error);
      res.status(500).json({ error: "Failed to create advertisement", details: error.message });
    }
  });

  app.put("/api/admin/advertisements/:id", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const ad = await storage.updateAdvertisement(id, updates);
      res.json(ad);
    } catch (error: any) {
      console.error("Advertisement update error:", error);
      res.status(500).json({ error: "Failed to update advertisement", details: error.message });
    }
  });

  app.delete("/api/admin/advertisements/:id", authenticateAdmin, requireRole(["manager", "editor"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdvertisement(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Advertisement deletion error:", error);
      res.status(500).json({ error: "Failed to delete advertisement", details: error.message });
    }
  });

  // Public Advertisement API
  app.get("/api/advertisements", async (req, res) => {
    try {
      const { position } = req.query;
      const advertisements = await storage.getAdvertisements();
      const activeAds = advertisements.filter(ad => ad.isActive);
      
      if (position) {
        const filteredAds = activeAds.filter(ad => ad.position === position);
        res.json(filteredAds);
      } else {
        res.json(activeAds);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });

  // File Upload API
  const { default: multer } = await import('multer');
  const { default: path } = await import('path');
  const { default: express } = await import('express');
  
  const uploadStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, 'uploads/');
    },
    filename: function (req: any, file: any, cb: any) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

  app.post("/api/upload", authenticateAdmin, upload.single('file'), (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Password Reset with Telegram OTP
  const { default: TelegramBot } = await import('node-telegram-bot-api');
  const otpStorage = new Map(); // Temporary OTP storage

  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getAdminUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (5 minutes)
      otpStorage.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        userId: user.id
      });

      // Send OTP via Telegram (requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
          await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, 
            `🔐 OD News Password Reset\n\nOTP for ${email}: ${otp}\n\nValid for 5 minutes only.`
          );
        } catch (telegramError) {
          console.error("Telegram error:", telegramError);
          return res.status(500).json({ error: "Failed to send OTP via Telegram" });
        }
      } else {
        console.log(`OTP for ${email}: ${otp}`); // Fallback for development
      }

      res.json({ message: "OTP sent to Telegram" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/admin/verify-otp", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required" });
      }

      const otpData = otpStorage.get(email);
      if (!otpData) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      if (Date.now() > otpData.expiresAt) {
        otpStorage.delete(email);
        return res.status(400).json({ error: "OTP has expired" });
      }

      if (otpData.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateAdminUser(otpData.userId, { password: hashedPassword });
      
      // Clear OTP
      otpStorage.delete(email);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
