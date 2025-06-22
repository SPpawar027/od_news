import { 
  users, 
  categories, 
  articles, 
  breakingNews,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Article,
  type InsertArticle,
  type BreakingNews,
  type InsertBreakingNews
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getArticles(limit?: number, offset?: number, categoryId?: number): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getTrendingArticles(limit?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  getBreakingNews(): Promise<BreakingNews[]>;
  createBreakingNews(news: InsertBreakingNews): Promise<BreakingNews>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private breakingNewsItems: Map<number, BreakingNews>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentArticleId: number;
  private currentBreakingNewsId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.breakingNewsItems = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentArticleId = 1;
    this.currentBreakingNewsId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoriesData: InsertCategory[] = [
      { name: "Top News", nameHindi: "टॉप न्यूज़", slug: "top-news", icon: "📰", color: "blue" },
      { name: "Local", nameHindi: "स्थानीय", slug: "local", icon: "🏠", color: "green" },
      { name: "National", nameHindi: "राष्ट्रीय", slug: "national", icon: "🇮🇳", color: "orange" },
      { name: "Cricket", nameHindi: "क्रिकेट", slug: "cricket", icon: "🏏", color: "red" },
      { name: "Business", nameHindi: "व्यापार", slug: "business", icon: "💼", color: "purple" },
      { name: "Originals", nameHindi: "ओरिजिनल्स", slug: "originals", icon: "⭐", color: "yellow" },
      { name: "International", nameHindi: "अंतरराष्ट्रीय", slug: "international", icon: "🌍", color: "teal" },
      { name: "Tech & Science", nameHindi: "तकनीक और विज्ञान", slug: "tech-science", icon: "⚛️", color: "indigo" },
      { name: "Entertainment", nameHindi: "मनोरंजन", slug: "entertainment", icon: "🎬", color: "pink" },
      { name: "Lifestyle", nameHindi: "जीवनशैली", slug: "lifestyle", icon: "💖", color: "rose" },
      { name: "Sports", nameHindi: "खेल", slug: "sports", icon: "⚽", color: "cyan" },
      { name: "Utility", nameHindi: "उपयोगिता", slug: "utility", icon: "🔧", color: "gray" },
      { name: "Career", nameHindi: "करियर", slug: "career", icon: "🏆", color: "emerald" }
    ];

    categoriesData.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });

    // Seed breaking news
    const breakingNewsData: InsertBreakingNews[] = [
      { 
        title: "PM announces major economic reforms", 
        titleHindi: "मुख्यमंत्री की आज की महत्वपूर्ण घोषणा", 
        isActive: true 
      },
      { 
        title: "Cricket team wins final match", 
        titleHindi: "क्रिकेट टीम ने जीता फाइनल मैच", 
        isActive: true 
      },
      { 
        title: "Stock market continues bullish trend", 
        titleHindi: "शेयर बाजार में तेजी का दौर जारी", 
        isActive: true 
      },
      { 
        title: "New policy benefits farmers", 
        titleHindi: "नई नीति से किसानों को मिलेगा फायदा", 
        isActive: true 
      },
      { 
        title: "Weather department issues heavy rain warning", 
        titleHindi: "मौसम विभाग की चेतावनी आज रात बारिश की संभावना", 
        isActive: true 
      }
    ];

    breakingNewsData.forEach(news => {
      const id = this.currentBreakingNewsId++;
      this.breakingNewsItems.set(id, { ...news, id, createdAt: new Date() });
    });

    // Seed articles
    const articlesData: InsertArticle[] = [
      {
        title: "Parliament Winter Session: Important Bill Discussion Today",
        titleHindi: "संसद के शीतकालीन सत्र में आज महत्वपूर्ण विधेयक पर चर्चा, विपक्ष ने की अपनी तैयारी",
        content: "New Delhi witnesses second day of Parliament winter session...",
        contentHindi: "नई दिल्ली में आज संसद के शीतकालीन सत्र का दूसरा दिन है। सरकार आज एक महत्वपूर्ण विधेयक पर चर्चा कराने की तैयारी कर रही है।",
        excerpt: "Parliament prepares for crucial bill discussion...",
        excerptHindi: "नई दिल्ली में आज संसद के शीतकालीन सत्र का दूसरा दिन है। सरकार आज एक महत्वपूर्ण विधेयक पर चर्चा कराने की तैयारी कर रही है, जबकि विपक्ष ने भी अपनी रणनीति तैयार की है।",
        imageUrl: "https://images.unsplash.com/photo-1555992336-03a23c37245f?ixlib=rb-4.0.3&auto=format&fit=crop&w=654&h=300",
        categoryId: 3,
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: "Rising Inflation Concerns Citizens",
        titleHindi: "शहर में बढ़ती महंगाई से परेशान लोग, सब्जियों के दाम आसमान छू रहे",
        content: "Local markets witness unprecedented price rise...",
        contentHindi: "स्थानीय बाजारों में सब्जियों की कीमतें लगातार बढ़ रही हैं। टमाटर, प्याज और अन्य जरूरी सब्जियों के दाम दोगुने हो गए हैं।",
        excerpt: "Vegetable prices skyrocket in local markets...",
        excerptHindi: "स्थानीय बाजारों में सब्जियों की कीमतें लगातार बढ़ रही हैं। टमाटर, प्याज और अन्य जरूरी सब्जियों के दाम दोगुने हो गए हैं।",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 2,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        title: "Indian Team Creates History with 3-0 Series Win",
        titleHindi: "भारतीय टीम ने रचा इतिहास, सीरीज में 3-0 से मिली जीत",
        content: "Under captain Virat Kohli's brilliant leadership...",
        contentHindi: "कप्तान विराट कोहली की शानदार कप्तानी में भारतीय क्रिकेट टीम ने विदेशी धरती पर ऐतिहासिक जीत दर्ज की है।",
        excerpt: "Historic victory on foreign soil...",
        excerptHindi: "कप्तान विराट कोहली की शानदार कप्तानी में भारतीय क्रिकेट टीम ने विदेशी धरती पर ऐतिहासिक जीत दर्ज की है।",
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 4,
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        title: "5G Technology Transforms Digital India",
        titleHindi: "नई 5G तकनीक से बदलेगी डिजिटल इंडिया की तस्वीर",
        content: "5G network expansion accelerates across the country...",
        contentHindi: "देश भर में 5G नेटवर्क का विस्तार तेजी से हो रहा है। इससे इंटरनेट की रफ्तार में काफी सुधार देखने को मिल रहा है।",
        excerpt: "Internet speed improvements nationwide...",
        excerptHindi: "देश भर में 5G नेटवर्क का विस्तार तेजी से हो रहा है। इससे इंटरनेट की रफ्तार में काफी सुधार देखने को मिल रहा है।",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 8,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        title: "Stock Market Surges 200 Points",
        titleHindi: "शेयर बाजार में तेजी जारी, सेंसेक्स 200 अंक उछला",
        content: "Market opens with bullish momentum...",
        contentHindi: "आज बाजार की शुरुआत तेजी से हुई। बैंकिंग और IT शेयरों में खासी खरीदारी देखी गई है।",
        excerpt: "Banking and IT stocks see heavy buying...",
        excerptHindi: "आज बाजार की शुरुआत तेजी से हुई। बैंकिंग और IT शेयरों में खासी खरीदारी देखी गई है।",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 5,
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) // 10 hours ago
      },
      {
        title: "Bollywood Star's New Film Trailer Released",
        titleHindi: "बॉलीवुड स्टार की नई फिल्म का ट्रेलर रिलीज, फैंस में उत्साह",
        content: "Most awaited film trailer of the year...",
        contentHindi: "साल की सबसे प्रतीक्षित फिल्म का ट्रेलर आज रिलीज हुआ। सोशल मीडिया पर इसे लेकर जबरदस्त बजज है।",
        excerpt: "Social media buzzes with excitement...",
        excerptHindi: "साल की सबसे प्रतीक्षित फिल्म का ट्रेलर आज रिलीज हुआ। सोशल मीडिया पर इसे लेकर जबरदस्त बजज है।",
        imageUrl: "https://images.unsplash.com/photo-1489599797989-340a36f2b89f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 9,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        title: "Weather Department Issues Heavy Rain Warning",
        titleHindi: "मौसम विभाग ने जारी की चेतावनी, आज रात भारी बारिश की संभावना",
        content: "Northern states expected to receive heavy rainfall...",
        contentHindi: "उत्तर भारत के कई राज्यों में आज रात से भारी बारिश होने की संभावना है। लोगों को सावधान रहने की सलाह दी गई है।",
        excerpt: "People advised to stay cautious...",
        excerptHindi: "उत्तर भारत के कई राज्यों में आज रात से भारी बारिश होने की संभावना है। लोगों को सावधान रहने की सलाह दी गई है।",
        imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 2,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: "New Education Policy Changes Exam Pattern",
        titleHindi: "नई शिक्षा नीति के तहत बदलेगा परीक्षा पैटर्न, छात्रों को मिलेगा फायदा",
        content: "Education ministry prepares new exam policy draft...",
        contentHindi: "शिक्षा मंत्रालय ने नई परीक्षा नीति का मसौदा तैयार किया है। इससे छात्रों पर पढ़ाई का बोझ कम होगा।",
        excerpt: "Reduces academic burden on students...",
        excerptHindi: "शिक्षा मंत्रालय ने नई परीक्षा नीति का मसौदा तैयार किया है। इससे छात्रों पर पढ़ाई का बोझ कम होगा।",
        imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
        categoryId: 13,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    articlesData.forEach(article => {
      const id = this.currentArticleId++;
      this.articles.set(id, { ...article, id, createdAt: new Date() });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getArticles(limit = 10, offset = 0, categoryId?: number): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (categoryId) {
      articles = articles.filter(article => article.categoryId === categoryId);
    }
    
    // Sort by published date, newest first
    articles.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
    
    return articles.slice(offset, offset + limit);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getTrendingArticles(limit = 5): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.isTrending)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
    
    return articles.slice(0, limit);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const article: Article = { 
      ...insertArticle, 
      id, 
      createdAt: new Date(),
      publishedAt: new Date()
    };
    this.articles.set(id, article);
    return article;
  }

  async getBreakingNews(): Promise<BreakingNews[]> {
    return Array.from(this.breakingNewsItems.values())
      .filter(news => news.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createBreakingNews(insertBreakingNews: InsertBreakingNews): Promise<BreakingNews> {
    const id = this.currentBreakingNewsId++;
    const news: BreakingNews = { 
      ...insertBreakingNews, 
      id, 
      createdAt: new Date()
    };
    this.breakingNewsItems.set(id, news);
    return news;
  }
}

export const storage = new MemStorage();
