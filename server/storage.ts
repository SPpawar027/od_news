import {
  categories,
  articles,
  breakingNews,
  adminUsers,
  liveStreams,
  videos,
  rssSources,
  articleDrafts,
  advertisements,
  type Category,
  type InsertCategory,
  type Article,
  type InsertArticle,
  type BreakingNews,
  type InsertBreakingNews,
  type AdminUser,
  type InsertAdminUser,
  type LiveStream,
  type InsertLiveStream,
  type Video,
  type InsertVideo,
  type RssSource,
  type InsertRssSource,
  type ArticleDraft,
  type InsertArticleDraft,
  type Advertisement,
  type InsertAdvertisement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  getArticles(limit?: number, offset?: number, categoryId?: number): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getTrendingArticles(limit?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  getBreakingNews(): Promise<BreakingNews[]>;
  createBreakingNews(news: InsertBreakingNews): Promise<BreakingNews>;

  // Admin User Management
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUserById(id: number): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  getAdminUsers(): Promise<AdminUser[]>;
  updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser>;

  // Live Stream Management
  getLiveStreams(): Promise<LiveStream[]>;
  getLiveStreamById(id: number): Promise<LiveStream | undefined>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  updateLiveStream(id: number, updates: Partial<LiveStream>): Promise<LiveStream>;
  deleteLiveStream(id: number): Promise<void>;

  // Video Management
  getVideos(): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, updates: Partial<Video>): Promise<Video>;
  deleteVideo(id: number): Promise<void>;

  // RSS Source Management
  getRssSources(): Promise<RssSource[]>;
  getRssSourceById(id: number): Promise<RssSource | undefined>;
  createRssSource(source: InsertRssSource): Promise<RssSource>;
  updateRssSource(id: number, updates: Partial<RssSource>): Promise<RssSource>;
  deleteRssSource(id: number): Promise<void>;

  // Article Draft Management
  getArticleDrafts(): Promise<ArticleDraft[]>;
  getArticleDraftById(id: number): Promise<ArticleDraft | undefined>;
  createArticleDraft(draft: InsertArticleDraft): Promise<ArticleDraft>;
  updateArticleDraft(id: number, updates: Partial<ArticleDraft>): Promise<ArticleDraft>;
  deleteArticleDraft(id: number): Promise<void>;
  publishArticleDraft(id: number): Promise<Article>;

  // Advertisement Management
  getAdvertisements(): Promise<Advertisement[]>;
  getAdvertisementById(id: number): Promise<Advertisement | undefined>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: number, updates: Partial<Advertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private breakingNewsItems: Map<number, BreakingNews>;
  private currentCategoryId: number;
  private currentArticleId: number;
  private currentBreakingNewsId: number;

  constructor() {
    this.categories = new Map();
    this.articles = new Map();
    this.breakingNewsItems = new Map();
    this.currentCategoryId = 1;
    this.currentArticleId = 1;
    this.currentBreakingNewsId = 1;
    this.seedData();
  }

  private seedData() {
    // Categories
    const categoriesData = [
      { id: 1, title: "Top News", titleHindi: "टॉप न्यूज़", slug: "top-news", icon: "📰", color: "#dc2626", createdAt: new Date() },
      { id: 2, title: "Politics", titleHindi: "राजनीति", slug: "politics", icon: "🏛️", color: "#059669", createdAt: new Date() },
      { id: 3, title: "National", titleHindi: "राष्ट्रीय", slug: "national", icon: "🇮🇳", color: "#45B7D1", createdAt: new Date() },
      { id: 4, title: "Cricket", titleHindi: "क्रिकेट", slug: "cricket", icon: "🏏", color: "#96CEB4", createdAt: new Date() },
      { id: 5, title: "Business", titleHindi: "व्यापार", slug: "business", icon: "💼", color: "#FFEAA7", createdAt: new Date() },
      { id: 6, title: "Originals", titleHindi: "ओरिजिनल्स", slug: "originals", icon: "⭐", color: "#DDA0DD", createdAt: new Date() },
      { id: 7, title: "International", titleHindi: "अंतर्राष्ट्रीय", slug: "international", icon: "🌍", color: "#74B9FF", createdAt: new Date() },
      { id: 8, title: "Technology & Science", titleHindi: "तकनीकी व विज्ञान", slug: "tech-science", icon: "🔬", color: "#A29BFE", createdAt: new Date() },
      { id: 9, title: "Entertainment", titleHindi: "मनोरंजन", slug: "entertainment", icon: "🎬", color: "#FD79A8", createdAt: new Date() },
      { id: 10, title: "Lifestyle", titleHindi: "जीवनशैली", slug: "lifestyle", icon: "🌟", color: "#FDCB6E", createdAt: new Date() },
      { id: 11, title: "Sports", titleHindi: "खेल", slug: "sports", icon: "⚽", color: "#6C5CE7", createdAt: new Date() },
      { id: 12, title: "Utility", titleHindi: "उपयोगिता", slug: "utility", icon: "🔧", color: "#A8E6CF", createdAt: new Date() },
      { id: 13, title: "Career", titleHindi: "कैरियर", slug: "career", icon: "💼", color: "#FFB3BA", createdAt: new Date() }
    ];

    categoriesData.forEach(cat => {
      const category: Category = { ...cat, createdAt: cat.createdAt || new Date() };
      this.categories.set(cat.id, category);
    });

    this.currentCategoryId = Math.max(...categoriesData.map(c => c.id)) + 1;

    // Breaking news
    const breakingNewsData = [
      { id: 1, title: "Breaking: Major development in national politics", titleHindi: "ब्रेकिंग: राष्ट्रीय राजनीति में बड़ा विकास", priority: 1, isActive: true, createdAt: new Date() },
      { id: 2, title: "LIVE: Cricket match updates", titleHindi: "लाइव: क्रिकेट मैच अपडेट", priority: 2, isActive: true, createdAt: new Date() }
    ];

    breakingNewsData.forEach(news => {
      const breakingNews: BreakingNews = { 
        ...news, 
        createdAt: news.createdAt || new Date(),
        content: null,
        priority: news.priority || 1,
        isActive: news.isActive || true,
        expiresAt: null
      };
      this.breakingNewsItems.set(news.id, breakingNews);
    });

    this.currentBreakingNewsId = Math.max(...breakingNewsData.map(n => n.id)) + 1;

    // Articles
    const articlesData = [
      {
        id: 1,
        title: "Major Political Development Shakes Nation",
        titleHindi: "राष्ट्र को हिलाने वाला बड़ा राजनीतिक विकास",
        content: "In a significant turn of events, major political developments have emerged that are set to reshape the national landscape. The implications of these changes are far-reaching and will impact various sectors of the economy and society.",
        contentHindi: "एक महत्वपूर्ण मोड़ में, बड़े राजनीतिक विकास सामने आए हैं जो राष्ट्रीय परिदृश्य को नया आकार देने के लिए तैयार हैं। इन बदलावों के निहितार्थ दूरगामी हैं और अर्थव्यवस्था और समाज के विभिन्न क्षेत्रों को प्रभावित करेंगे।",
        excerpt: "Major political developments emerge with far-reaching implications",
        excerptHindi: "दूरगामी निहितार्थों के साथ बड़े राजनीतिक विकास सामने आते हैं",
        categoryId: 3,
        imageUrl: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=400&fit=crop",
        authorName: "राहुल शर्मा",
        isBreaking: true,
        isTrending: true,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Cricket World Cup: India's Spectacular Victory",
        titleHindi: "क्रिकेट विश्व कप: भारत की शानदार जीत",
        content: "India's cricket team has achieved a spectacular victory in the recent World Cup match, demonstrating exceptional skill and teamwork. The match was filled with thrilling moments that kept fans on the edge of their seats.",
        contentHindi: "भारत की क्रिकेट टीम ने हाल के विश्व कप मैच में शानदार जीत हासिल की है, असाधारण कौशल और टीम वर्क का प्रदर्शन किया है। मैच रोमांचक क्षणों से भरा था जिसने प्रशंसकों को अपनी सीटों के किनारे पर रखा।",
        excerpt: "India achieves spectacular World Cup victory with exceptional teamwork",
        excerptHindi: "भारत असाधारण टीम वर्क के साथ शानदार विश्व कप जीत हासिल करता है",
        categoryId: 4,
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop",
        authorName: "अमित कुमार",
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Technology Revolution: AI Breakthrough",
        titleHindi: "प्रौद्योगिकी क्रांति: AI की सफलता",
        content: "A groundbreaking advancement in artificial intelligence has been announced, promising to revolutionize how we interact with technology. This breakthrough has potential applications across multiple industries.",
        contentHindi: "कृत्रिम बुद्धिमत्ता में एक अभूतपूर्व प्रगति की घोषणा की गई है, जो प्रौद्योगिकी के साथ हमारी बातचीत में क्रांति लाने का वादा करती है। इस सफलता के कई उद्योगों में संभावित अनुप्रयोग हैं।",
        excerpt: "Groundbreaking AI advancement promises to revolutionize technology interaction",
        excerptHindi: "अभूतपूर्व AI प्रगति प्रौद्योगिकी बातचीत में क्रांति लाने का वादा करती है",
        categoryId: 8,
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop",
        authorName: "प्रिया पटेल",
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 4,
        title: "Business Markets Show Strong Growth",
        titleHindi: "व्यापारिक बाजार मजबूत विकास दिखाते हैं",
        content: "The stock markets have shown remarkable resilience and growth in recent weeks, with several sectors leading the charge. Analysts predict continued positive trends in the coming months.",
        contentHindi: "स्टॉक मार्केट ने हाल के सप्ताहों में उल्लेखनीय लचीलापन और विकास दिखाया है, कई क्षेत्रों ने आगे बढ़कर नेतृत्व किया है। विश्लेषक आने वाले महीनों में निरंतर सकारात्मक रुझान की भविष्यवाणी करते हैं।",
        excerpt: "Stock markets demonstrate remarkable resilience with strong sectoral performance",
        excerptHindi: "स्टॉक मार्केट मजबूत क्षेत्रीय प्रदर्शन के साथ उल्लेखनीय लचीलापन दिखाते हैं",
        categoryId: 5,
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
        authorName: "संजय गुप्ता",
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 5,
        title: "Entertainment Industry Buzzing with New Releases",
        titleHindi: "मनोरंजन उद्योग नई रिलीज़ से गूंज रहा है",
        content: "The entertainment industry is experiencing a wave of excitement with several highly anticipated releases. From blockbuster movies to streaming series, audiences have plenty to look forward to.",
        contentHindi: "मनोरंजन उद्योग कई बहुप्रतीक्षित रिलीज़ के साथ उत्साह की लहर का अनुभव कर रहा है। ब्लॉकबस्टर फिल्मों से लेकर स्ट्रीमिंग सीरीज़ तक, दर्शकों के पास देखने के लिए बहुत कुछ है।",
        excerpt: "Entertainment industry sees wave of excitement with anticipated releases",
        excerptHindi: "मनोरंजन उद्योग प्रत्याशित रिलीज़ के साथ उत्साह की लहर देखता है",
        categoryId: 9,
        imageUrl: "https://images.unsplash.com/photo-1489599904472-84978628ae4e?w=800&h=400&fit=crop",
        authorName: "नेहा शर्मा",
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(),
        createdAt: new Date()
      }
    ];

    articlesData.forEach(article => {
      const fullArticle: Article = { 
        ...article, 
        createdAt: article.createdAt || new Date(),
        publishedAt: article.publishedAt || new Date(),
        categoryId: article.categoryId || null,
        imageUrl: article.imageUrl || null,
        authorName: article.authorName || null,
        isBreaking: article.isBreaking || false,
        isTrending: article.isTrending || false
      };
      this.articles.set(article.id, fullArticle);
    });

    this.currentArticleId = Math.max(...articlesData.map(a => a.id)) + 1;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id, createdAt: new Date() };
    this.categories.set(id, category);
    return category;
  }

  async getArticles(limit = 10, offset = 0, categoryId?: number): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (categoryId) {
      articles = articles.filter(article => article.categoryId === categoryId);
    }
    
    articles.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    
    return articles.slice(offset, offset + limit);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getTrendingArticles(limit = 5): Promise<Article[]> {
    const trendingArticles = Array.from(this.articles.values())
      .filter(article => article.isTrending)
      .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    
    return trendingArticles.slice(0, limit);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const article: Article = { 
      ...insertArticle, 
      id, 
      createdAt: new Date(),
      publishedAt: new Date(),
      categoryId: insertArticle.categoryId || null,
      imageUrl: insertArticle.imageUrl || null,
      authorName: insertArticle.authorName || null,
      isBreaking: insertArticle.isBreaking || false,
      isTrending: insertArticle.isTrending || false
    };
    this.articles.set(id, article);
    return article;
  }

  async getBreakingNews(): Promise<BreakingNews[]> {
    return Array.from(this.breakingNewsItems.values())
      .filter(news => news.isActive)
      .sort((a, b) => (a.priority || 1) - (b.priority || 1));
  }

  async createBreakingNews(insertBreakingNews: InsertBreakingNews): Promise<BreakingNews> {
    const id = this.currentBreakingNewsId++;
    const news: BreakingNews = { 
      ...insertBreakingNews, 
      id, 
      createdAt: new Date(),
      content: insertBreakingNews.content ?? null,
      priority: insertBreakingNews.priority ?? 1,
      isActive: insertBreakingNews.isActive ?? true,
      expiresAt: insertBreakingNews.expiresAt ?? null
    };
    this.breakingNewsItems.set(id, news);
    return news;
  }
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getArticles(limit = 10, offset = 0, categoryId?: number): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (categoryId) {
      query = query.where(eq(articles.categoryId, categoryId));
    }
    
    return await query.orderBy(desc(articles.createdAt)).limit(limit).offset(offset) as Article[];
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getTrendingArticles(limit = 5): Promise<Article[]> {
    return await db.select().from(articles)
      .where(eq(articles.isTrending, true))
      .limit(limit);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async getBreakingNews(): Promise<BreakingNews[]> {
    return await db.select().from(breakingNews)
      .where(eq(breakingNews.isActive, true));
  }

  async createBreakingNews(insertBreakingNews: InsertBreakingNews): Promise<BreakingNews> {
    const [news] = await db
      .insert(breakingNews)
      .values({
        title: insertBreakingNews.title,
        titleHindi: insertBreakingNews.titleHindi,
        content: insertBreakingNews.content || null,
        priority: insertBreakingNews.priority || 1,
        isActive: insertBreakingNews.isActive ?? true,
        expiresAt: insertBreakingNews.expiresAt || null
      })
      .returning();
    return news;
  }

  // Admin User Management
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async getAdminUserById(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(insertUser).returning();
    return user;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  async updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser> {
    const [user] = await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id)).returning();
    return user;
  }

  // Live Stream Management
  async getLiveStreams(): Promise<LiveStream[]> {
    return await db.select().from(liveStreams);
  }

  async getLiveStreamById(id: number): Promise<LiveStream | undefined> {
    const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, id));
    return stream;
  }

  async createLiveStream(insertStream: InsertLiveStream): Promise<LiveStream> {
    const [stream] = await db.insert(liveStreams).values(insertStream).returning();
    return stream;
  }

  async updateLiveStream(id: number, updates: Partial<LiveStream>): Promise<LiveStream> {
    const [stream] = await db.update(liveStreams).set(updates).where(eq(liveStreams.id, id)).returning();
    return stream;
  }

  async deleteLiveStream(id: number): Promise<void> {
    await db.delete(liveStreams).where(eq(liveStreams.id, id));
  }

  // Video Management
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(insertVideo).returning();
    return video;
  }

  async updateVideo(id: number, updates: Partial<Video>): Promise<Video> {
    const [video] = await db.update(videos).set(updates).where(eq(videos.id, id)).returning();
    return video;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // RSS Source Management
  async getRssSources(): Promise<RssSource[]> {
    return await db.select().from(rssSources);
  }

  async getRssSourceById(id: number): Promise<RssSource | undefined> {
    const [source] = await db.select().from(rssSources).where(eq(rssSources.id, id));
    return source;
  }

  async createRssSource(insertSource: InsertRssSource): Promise<RssSource> {
    const [source] = await db.insert(rssSources).values(insertSource).returning();
    return source;
  }

  async updateRssSource(id: number, updates: Partial<RssSource>): Promise<RssSource> {
    const [source] = await db.update(rssSources).set(updates).where(eq(rssSources.id, id)).returning();
    return source;
  }

  async deleteRssSource(id: number): Promise<void> {
    await db.delete(rssSources).where(eq(rssSources.id, id));
  }

  // Article Draft Management
  async getArticleDrafts(): Promise<ArticleDraft[]> {
    return await db.select().from(articleDrafts);
  }

  async getArticleDraftById(id: number): Promise<ArticleDraft | undefined> {
    const [draft] = await db.select().from(articleDrafts).where(eq(articleDrafts.id, id));
    return draft;
  }

  async createArticleDraft(insertDraft: InsertArticleDraft): Promise<ArticleDraft> {
    const [draft] = await db.insert(articleDrafts).values(insertDraft).returning();
    return draft;
  }

  async updateArticleDraft(id: number, updates: Partial<ArticleDraft>): Promise<ArticleDraft> {
    const [draft] = await db.update(articleDrafts).set(updates).where(eq(articleDrafts.id, id)).returning();
    return draft;
  }

  async deleteArticleDraft(id: number): Promise<void> {
    await db.delete(articleDrafts).where(eq(articleDrafts.id, id));
  }

  async publishArticleDraft(id: number): Promise<Article> {
    const draft = await this.getArticleDraftById(id);
    if (!draft) {
      throw new Error("Draft not found");
    }

    const articleData: InsertArticle = {
      title: draft.title,
      titleHindi: draft.titleHindi,
      content: draft.content,
      contentHindi: draft.contentHindi,
      excerpt: draft.excerpt,
      excerptHindi: draft.excerptHindi,
      imageUrl: draft.imageUrl,
      authorName: draft.authorName,
      categoryId: draft.categoryId,
      publishedAt: new Date(),
    };

    const article = await this.createArticle(articleData);
    await this.deleteArticleDraft(id);
    return article;
  }

  // Advertisement Management
  async getAdvertisements(): Promise<Advertisement[]> {
    return await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
  }

  async getAdvertisementById(id: number): Promise<Advertisement | undefined> {
    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return ad || undefined;
  }

  async createAdvertisement(insertAd: InsertAdvertisement): Promise<Advertisement> {
    const [ad] = await db.insert(advertisements).values(insertAd).returning();
    return ad;
  }

  async updateAdvertisement(id: number, updates: Partial<Advertisement>): Promise<Advertisement> {
    const [ad] = await db.update(advertisements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(advertisements.id, id))
      .returning();
    return ad;
  }

  async deleteAdvertisement(id: number): Promise<void> {
    await db.delete(advertisements).where(eq(advertisements.id, id));
  }
}

export const storage = new DatabaseStorage();