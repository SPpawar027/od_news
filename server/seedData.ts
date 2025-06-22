import { db } from "./db";
import { categories, articles, breakingNews } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Seed categories
    const categoryData = [
      { id: 1, title: "Top News", titleHindi: "टॉप न्यूज़", slug: "top-news", icon: "star", color: "#ef4444" },
      { id: 2, title: "Local", titleHindi: "स्थानीय", slug: "local", icon: "map-pin", color: "#3b82f6" },
      { id: 3, title: "National", titleHindi: "राष्ट्रीय", slug: "national", icon: "flag", color: "#f59e0b" },
      { id: 4, title: "Cricket", titleHindi: "क्रिकेट", slug: "cricket", icon: "ball", color: "#10b981" },
      { id: 5, title: "Business", titleHindi: "व्यापार", slug: "business", icon: "briefcase", color: "#8b5cf6" },
      { id: 6, title: "Originals", titleHindi: "ओरिजिनल्स", slug: "originals", icon: "sparkles", color: "#f43f5e" },
      { id: 7, title: "International", titleHindi: "अंतर्जातीय", slug: "international", icon: "globe", color: "#06b6d4" },
      { id: 8, title: "Tech & Science", titleHindi: "तकनीक व विज्ञान", slug: "tech-science", icon: "cpu", color: "#84cc16" },
      { id: 9, title: "Entertainment", titleHindi: "मनोरंजन", slug: "entertainment", icon: "music", color: "#ec4899" },
      { id: 10, title: "Lifestyle", titleHindi: "जीवनशैली", slug: "lifestyle", icon: "heart", color: "#f97316" },
      { id: 11, title: "Sports", titleHindi: "खेल", slug: "sports", icon: "trophy", color: "#22c55e" },
      { id: 12, title: "Utility", titleHindi: "उपयोगिता", slug: "utility", icon: "tool", color: "#64748b" },
      { id: 13, title: "Career", titleHindi: "करियर", slug: "career", icon: "graduation-cap", color: "#a855f7" },
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();

    // Seed articles
    const articleData = [
      {
        id: 1,
        title: "Parliament Winter Session: Important Bills Under Discussion",
        titleHindi: "संसद शीतकालीन सत्र: महत्वपूर्ण विधेयकों पर चर्चा",
        content: "The Parliament winter session is witnessing heated debates on several crucial bills that could reshape India's legislative landscape...",
        contentHindi: "संसद का शीतकालीन सत्र कई महत्वपूर्ण विधेयकों पर गर्मागर्म बहसों का गवाह बन रहा है...",
        excerpt: "Parliament debates crucial legislative reforms",
        excerptHindi: "संसद में महत्वपूर्ण कानूनी सुधारों पर बहस",
        categoryId: 3,
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(),
      },
      {
        id: 2,
        title: "India vs Australia: Border-Gavaskar Trophy Continues",
        titleHindi: "भारत बनाम ऑस्ट्रेलिया: बॉर्डर-गावस्कर ट्रॉफी जारी",
        content: "The cricket series between India and Australia intensifies as both teams battle for supremacy...",
        contentHindi: "भारत और ऑस्ट्रेलिया के बीच क्रिकेट श्रृंखला तेज होती जा रही है...",
        excerpt: "Cricket fever grips as India faces Australia",
        excerptHindi: "भारत-ऑस्ट्रेलिया मुकाबले में क्रिकेट का जुनून",
        categoryId: 4,
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(),
      },
      {
        id: 3,
        title: "Tech Giants Report Q4 Earnings: AI Investments Surge",
        titleHindi: "टेक कंपनियों की Q4 कमाई: AI निवेश में उछाल",
        content: "Major technology companies report strong quarterly earnings driven by artificial intelligence investments...",
        contentHindi: "प्रमुख तकनीकी कंपनियों ने कृत्रिम बुद्धिमत्ता निवेश के कारण मजबूत तिमाही आय दर्ज की...",
        excerpt: "AI drives tech earnings growth",
        excerptHindi: "AI ने तकनीकी कमाई में वृद्धि लाई",
        categoryId: 8,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(),
      },
    ];

    await db.insert(articles).values(articleData).onConflictDoNothing();

    // Seed breaking news
    const breakingNewsData = [
      {
        id: 1,
        title: "PM announces major economic reforms package",
        titleHindi: "PM ने प्रमुख आर्थिक सुधार पैकेज की घोषणा की",
        isActive: true,
      },
      {
        id: 2,
        title: "Supreme Court delivers landmark judgment on environmental protection",
        titleHindi: "सुप्रीम कोर्ट ने पर्यावरण संरक्षण पर ऐतिहासिक फैसला सुनाया",
        isActive: true,
      },
    ];

    await db.insert(breakingNews).values(breakingNewsData).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}