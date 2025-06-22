import { db } from "./db";
import { 
  categories, 
  articles, 
  breakingNews,
  adminUsers,
  liveStreams,
  rssFeeds,
  videos,
  subtitles
} from "@shared/schema";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Seed admin users with the default Manager
    const hashedPassword = await hashPassword("Admin@123");
    const adminData = [
      {
        id: 1,
        username: "admin",
        email: "admin@jwt.com",
        password: hashedPassword,
        name: "System Administrator",
        role: "manager",
        isActive: true,
      },
      {
        id: 2,
        username: "editor1",
        email: "editor@justicewaveNews.com",
        password: await hashPassword("Editor@123"),
        name: "Chief Editor",
        role: "editor",
        isActive: true,
      }
    ];

    await db.insert(adminUsers).values(adminData).onConflictDoNothing();

    // Seed categories
    const categoryData = [
      { id: 1, title: "Breaking News", titleHindi: "ब्रेकिंग न्यूज़", slug: "breaking-news", icon: "🚨", color: "#FF4444" },
      { id: 2, title: "Politics", titleHindi: "राजनीति", slug: "politics", icon: "🏛️", color: "#4ECDC4" },
      { id: 3, title: "National", titleHindi: "राष्ट्रीय", slug: "national", icon: "🇮🇳", color: "#45B7D1" },
      { id: 4, title: "Sports", titleHindi: "खेल", slug: "sports", icon: "⚽", color: "#96CEB4" },
      { id: 5, title: "Business", titleHindi: "व्यापार", slug: "business", icon: "💼", color: "#FFEAA7" },
      { id: 6, title: "Technology", titleHindi: "तकनीकी", slug: "technology", icon: "💻", color: "#A29BFE" },
      { id: 7, title: "International", titleHindi: "अंतर्राष्ट्रीय", slug: "international", icon: "🌍", color: "#74B9FF" },
      { id: 8, title: "Entertainment", titleHindi: "मनोरंजन", slug: "entertainment", icon: "🎬", color: "#FD79A8" },
      { id: 9, title: "Health", titleHindi: "स्वास्थ्य", slug: "health", icon: "🏥", color: "#55A3FF" },
      { id: 10, title: "Education", titleHindi: "शिक्षा", slug: "education", icon: "📚", color: "#26C6DA" }
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();

    // Seed articles with complete data
    const articleData = [
      {
        id: 1,
        title: "Supreme Court Delivers Landmark Judgment on Digital Privacy Rights",
        titleHindi: "सुप्रीम कोर्ट ने डिजिटल प्राइवेसी अधिकारों पर ऐतिहासिक फैसला दिया",
        content: "In a groundbreaking decision that will reshape India's digital landscape, the Supreme Court has delivered a comprehensive judgment on digital privacy rights. The court emphasized that privacy is a fundamental right that extends to digital spaces, setting new precedents for data protection and online surveillance. The judgment addresses concerns about government overreach and corporate data misuse, establishing clear guidelines for digital rights protection.",
        contentHindi: "भारत के डिजिटल परिदृश्य को बदलने वाले एक ऐतिहासिक फैसले में, सुप्रीम कोर्ट ने डिजिटल प्राइवेसी अधिकारों पर एक व्यापक निर्णय दिया है। न्यायालय ने जोर देकर कहा कि गोपनीता एक मौलिक अधिकार है जो डिजिटल स्थानों तक विस्तृत है।",
        excerpt: "Supreme Court sets new precedents for digital privacy rights in landmark judgment",
        excerptHindi: "सुप्रीम कोर्ट ने ऐतिहासिक फैसले में डिजिटल प्राइवेसी के नए मानदंड स्थापित किए",
        categoryId: 2,
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        authorName: "Legal Correspondent",
        isBreaking: true,
        isTrending: true,
        status: "published",
        hashtags: ["supreme-court", "digital-privacy", "landmark-judgment"],
        version: 1,
        createdBy: 1,
        publishedAt: new Date()
      },
      {
        id: 2,
        title: "India's Green Energy Revolution: Solar Capacity Crosses 75 GW Milestone",
        titleHindi: "भारत की हरित ऊर्जा क्रांति: सौर क्षमता 75 GW के मील के पत्थर को पार कर गई",
        content: "India has achieved a significant milestone in its renewable energy journey as solar power capacity crosses the 75 GW mark. This achievement puts the country firmly on track to meet its ambitious target of 500 GW renewable energy capacity by 2030. The growth has been driven by government policies, decreasing solar panel costs, and increasing private sector participation.",
        contentHindi: "भारत ने अपनी नवीकरणीय ऊर्जा यात्रा में एक महत्वपूर्ण मील का पत्थर हासिल किया है क्योंकि सौर ऊर्जा क्षमता 75 GW के आंकड़े को पार कर गई है।",
        excerpt: "Solar power capacity milestone achieved as India advances renewable energy goals",
        excerptHindi: "भारत नवीकरणीय ऊर्जा लक्ष्यों की दिशा में आगे बढ़ते हुए सौर ऊर्जा क्षमता का मील का पत्थर हासिल किया",
        categoryId: 6,
        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
        authorName: "Environment Reporter",
        isBreaking: false,
        isTrending: true,
        status: "published",
        hashtags: ["renewable-energy", "solar-power", "green-revolution"],
        version: 1,
        createdBy: 2,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: "Cricket World Cup 2024: India Reaches Final After Thrilling Semi-Final Victory",
        titleHindi: "क्रिकेट विश्व कप 2024: रोमांचक सेमीफाइनल जीत के बाद भारत फाइनल में पहुंचा",
        content: "Team India secured their place in the Cricket World Cup final with a nail-biting 3-wicket victory over Australia in the semi-final. Chasing a target of 328, India completed the chase with 2 balls to spare, thanks to brilliant partnerships and composed finishing. The victory sets up a highly anticipated final match that has captured the nation's attention.",
        contentHindi: "टीम इंडिया ने सेमीफाइनल में ऑस्ट्रेलिया के खिलाफ 3 विकेट से रोमांचक जीत के साथ क्रिकेट विश्व कप फाइनल में अपनी जगह पक्की की।",
        excerpt: "India reaches World Cup final after thrilling semi-final chase against Australia",
        excerptHindi: "ऑस्ट्रेलिया के खिलाफ रोमांचक सेमीफाइनल चेज के बाद भारत विश्व कप फाइनल में पहुंचा",
        categoryId: 4,
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        authorName: "Sports Correspondent",
        isBreaking: true,
        isTrending: true,
        status: "published",
        hashtags: ["cricket", "world-cup", "india", "final"],
        version: 1,
        createdBy: 1,
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    await db.insert(articles).values(articleData).onConflictDoNothing();

    // Seed breaking news
    const breakingNewsData = [
      {
        id: 1,
        title: "LIVE: Cricket World Cup Final - India vs England",
        titleHindi: "लाइव: क्रिकेट विश्व कप फाइनल - भारत बनाम इंग्लैंड",
        isActive: true,
        priority: 1,
        createdBy: 1
      },
      {
        id: 2,
        title: "Supreme Court to announce digital privacy verdict today",
        titleHindi: "सुप्रीम कोर्ट आज डिजिटल प्राइवेसी पर फैसला सुनाएगा",
        isActive: true,
        priority: 2,
        createdBy: 1
      }
    ];

    await db.insert(breakingNews).values(breakingNewsData).onConflictDoNothing();

    // Seed live streams
    const liveStreamData = [
      {
        id: 1,
        name: "Justice Wave News Live",
        nameHindi: "जस्टिस वेव न्यूज़ लाइव",
        streamType: "m3u8",
        streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        thumbnailUrl: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400",
        description: "24/7 Live News Coverage",
        isActive: true,
        sortOrder: 1,
        viewerCount: 1250,
        createdBy: 1
      },
      {
        id: 2,
        name: "Parliament Live Session",
        nameHindi: "संसद लाइव सत्र",
        streamType: "youtube",
        streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400",
        description: "Live Parliament Proceedings",
        isActive: true,
        sortOrder: 2,
        viewerCount: 890,
        createdBy: 1
      }
    ];

    await db.insert(liveStreams).values(liveStreamData).onConflictDoNothing();

    // Seed RSS feeds
    const rssFeedData = [
      {
        id: 1,
        name: "BBC News India",
        url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
        categoryId: 3,
        isActive: true,
        fetchFrequency: 30,
        itemCount: 25,
        createdBy: 1
      },
      {
        id: 2,
        name: "Reuters Technology",
        url: "https://www.reuters.com/technology/rss",
        categoryId: 6,
        isActive: true,
        fetchFrequency: 60,
        itemCount: 18,
        createdBy: 2
      }
    ];

    await db.insert(rssFeeds).values(rssFeedData).onConflictDoNothing();

    // Seed entertainment videos
    const videoData = [
      {
        id: 1,
        title: "Bollywood News Roundup: Latest Updates",
        titleHindi: "बॉलीवुड न्यूज़ राउंडअप: नवीनतम अपडेट",
        description: "Weekly roundup of Bollywood news and entertainment updates",
        descriptionHindi: "बॉलीवुड न्यूज़ और मनोरंजन अपडेट का साप्ताहिक राउंडअप",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1489599751382-83cd29d2e2bb?w=400",
        duration: 180,
        tags: ["bollywood", "entertainment", "news"],
        categoryId: 8,
        isVertical: true,
        viewCount: 5420,
        revenue: 125.50,
        createdBy: 2
      },
      {
        id: 2,
        title: "Tech Innovation Showcase 2024",
        titleHindi: "टेक इनोवेशन शोकेस 2024",
        description: "Highlighting the latest technological innovations and startup stories",
        descriptionHindi: "नवीनतम तकनीकी नवाचारों और स्टार्टअप कहानियों को उजागर करना",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        duration: 240,
        tags: ["technology", "innovation", "startups"],
        categoryId: 6,
        isVertical: false,
        viewCount: 3280,
        revenue: 89.25,
        createdBy: 1
      }
    ];

    await db.insert(videos).values(videoData).onConflictDoNothing();

    // Seed subtitles
    const subtitleData = [
      {
        id: 1,
        videoId: 1,
        language: "english",
        subtitleData: `WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to Bollywood News Roundup

00:00:03.000 --> 00:00:06.000
Your weekly source for entertainment updates`,
        fileName: "bollywood_roundup_en.vtt",
        isActive: true,
        createdBy: 1
      },
      {
        id: 2,
        videoId: 1,
        language: "hindi",
        subtitleData: `WEBVTT

00:00:00.000 --> 00:00:03.000
बॉलीवुड न्यूज़ राउंडअप में आपका स्वागत है

00:00:03.000 --> 00:00:06.000
मनोरंजन अपडेट का आपका साप्ताहिक स्रोत`,
        fileName: "bollywood_roundup_hi.vtt",
        isActive: true,
        createdBy: 1
      }
    ];

    await db.insert(subtitles).values(subtitleData).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}