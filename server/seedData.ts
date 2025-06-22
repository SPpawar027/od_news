import { db } from "./db";
import { 
  categories, 
  articles, 
  breakingNews
} from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Seed categories
    const categoryData = [
      { id: 1, title: "Top News", titleHindi: "टॉप न्यूज़", slug: "top-news", icon: "📰", color: "#FF6B6B" },
      { id: 2, title: "Local", titleHindi: "स्थानीय", slug: "local", icon: "🏘️", color: "#4ECDC4" },
      { id: 3, title: "National", titleHindi: "राष्ट्रीय", slug: "national", icon: "🇮🇳", color: "#45B7D1" },
      { id: 4, title: "Cricket", titleHindi: "क्रिकेट", slug: "cricket", icon: "🏏", color: "#96CEB4" },
      { id: 5, title: "Business", titleHindi: "व्यापार", slug: "business", icon: "💼", color: "#FFEAA7" },
      { id: 6, title: "Originals", titleHindi: "ओरिजिनल्स", slug: "originals", icon: "⭐", color: "#DDA0DD" },
      { id: 7, title: "International", titleHindi: "अंतर्राष्ट्रीय", slug: "international", icon: "🌍", color: "#74B9FF" },
      { id: 8, title: "Technology & Science", titleHindi: "तकनीकी व विज्ञान", slug: "tech-science", icon: "🔬", color: "#A29BFE" },
      { id: 9, title: "Entertainment", titleHindi: "मनोरंजन", slug: "entertainment", icon: "🎬", color: "#FD79A8" },
      { id: 10, title: "Lifestyle", titleHindi: "जीवनशैली", slug: "lifestyle", icon: "🌟", color: "#FDCB6E" },
      { id: 11, title: "Sports", titleHindi: "खेल", slug: "sports", icon: "⚽", color: "#6C5CE7" },
      { id: 12, title: "Utility", titleHindi: "उपयोगिता", slug: "utility", icon: "🔧", color: "#A8E6CF" },
      { id: 13, title: "Career", titleHindi: "कैरियर", slug: "career", icon: "💼", color: "#FFB3BA" }
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();

    // Seed articles
    const articleData = [
      {
        id: 1,
        title: "Parliament Winter Session: Key Bills to be Discussed",
        titleHindi: "संसद शीतकालीन सत्र: मुख्य विधेयकों पर होगी चर्चा",
        content: "The winter session of Parliament is set to begin with several important bills on the agenda. Key legislative proposals include amendments to existing laws and new frameworks for digital governance. The session is expected to be crucial for the government's policy agenda in the coming year.",
        contentHindi: "संसद का शीतकालीन सत्र कई महत्वपूर्ण विधेयकों के साथ शुरू होने वाला है। मुख्य विधायी प्रस्तावों में मौजूदा कानूनों में संशोधन और डिजिटल गवर्नेंस के लिए नए ढांचे शामिल हैं।",
        excerpt: "Winter session agenda includes key legislative proposals",
        excerptHindi: "शीतकालीन सत्र के एजेंडे में मुख्य विधायी प्रस्ताव शामिल",
        categoryId: 3,
        imageUrl: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800",
        authorName: "Political Correspondent",
        isBreaking: true,
        isTrending: true
      },
      {
        id: 2,
        title: "India Wins Cricket World Cup Semi-Final",
        titleHindi: "भारत ने क्रिकेट विश्व कप सेमीफाइनल जीता",
        content: "In a thrilling match that went till the last over, India secured victory in the Cricket World Cup semi-final. The team displayed exceptional skill and determination, setting up a highly anticipated final match.",
        contentHindi: "एक रोमांचक मैच में जो अंतिम ओवर तक चला, भारत ने क्रिकेट विश्व कप सेमीफाइनल में जीत हासिल की। टीम ने असाधारण कौशल और दृढ़ता का प्रदर्शन किया।",
        excerpt: "Thrilling victory secures World Cup final spot",
        excerptHindi: "रोमांचक जीत से विश्व कप फाइनल में जगह मिली",
        categoryId: 4,
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        authorName: "Sports Reporter",
        isBreaking: false,
        isTrending: true
      },
      {
        id: 3,
        title: "Tech Giants Report Strong Q4 Earnings",
        titleHindi: "तकनीकी दिग्गजों ने मजबूत Q4 आय की रिपोर्ट दी",
        content: "Major technology companies have reported strong quarterly earnings driven by AI investments and cloud computing growth. The results exceed analyst expectations and show robust demand for technology services.",
        contentHindi: "प्रमुख तकनीकी कंपनियों ने कृत्रिम बुद्धिमत्ता निवेश और क्लाउड कंप्यूटिंग वृद्धि के कारण मजबूत तिमाही आय दर्ज की है।",
        excerpt: "AI drives tech earnings growth",
        excerptHindi: "AI ने तकनीकी कमाई में वृद्धि लाई",
        categoryId: 8,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        authorName: "Business Analyst",
        isBreaking: false,
        isTrending: false
      }
    ];

    await db.insert(articles).values(articleData).onConflictDoNothing();

    // Seed breaking news
    const breakingNewsData = [
      {
        id: 1,
        title: "PM announces major economic reforms package",
        titleHindi: "PM ने प्रमुख आर्थिक सुधार पैकेज की घोषणा की",
        isActive: true,
        priority: 1
      },
      {
        id: 2,
        title: "LIVE: Cricket World Cup Final in progress",
        titleHindi: "लाइव: क्रिकेट विश्व कप फाइनल जारी",
        isActive: true,
        priority: 2
      }
    ];

    await db.insert(breakingNews).values(breakingNewsData).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}