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
      {
        id: 1,
        title: "Top News",
        titleHindi: "टॉप न्यूज़",
        slug: "top-news",
        icon: "📰",
        color: "#dc2626"
      },
      {
        id: 2,
        title: "Politics",
        titleHindi: "राजनीति",
        slug: "politics",
        icon: "🏛️",
        color: "#059669"
      },
      {
        id: 3,
        title: "Sports",
        titleHindi: "खेल",
        slug: "sports",
        icon: "⚽",
        color: "#2563eb"
      },
      {
        id: 4,
        title: "Entertainment",
        titleHindi: "मनोरंजन",
        slug: "entertainment",
        icon: "🎬",
        color: "#7c3aed"
      },
      {
        id: 5,
        title: "Technology",
        titleHindi: "तकनीक",
        slug: "technology",
        icon: "💻",
        color: "#ea580c"
      },
      {
        id: 6,
        title: "Business",
        titleHindi: "व्यापार",
        slug: "business",
        icon: "💼",
        color: "#0891b2"
      }
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();

    // Seed articles
    const articleData = [
      {
        id: 1,
        title: "Parliament Winter Session: Key Bills to be Discussed",
        titleHindi: "संसद शीतकालीन सत्र: मुख्य विधेयकों पर होगी चर्चा",
        content: "The Parliament's winter session is set to begin with several important bills on the agenda. The government has listed key legislative measures including amendments to existing laws and new policy frameworks.",
        contentHindi: "संसद का शीतकालीन सत्र कई महत्वपूर्ण विधेयकों के साथ शुरू होने वाला है। सरकार ने मौजूदा कानूनों में संशोधन और नई नीतिगत रूपरेखा सहित मुख्य विधायी उपायों को सूचीबद्ध किया है।",
        excerpt: "Parliament's winter session to focus on key legislative measures and policy reforms.",
        excerptHindi: "संसद का शीतकालीन सत्र मुख्य विधायी उपायों और नीतिगत सुधारों पर केंद्रित होगा।",
        imageUrl: "https://images.unsplash.com/photo-1586765669224-68c13bc1ba04?w=800&h=600&fit=crop",
        authorName: "Priya Sharma",
        categoryId: 2,
        isBreaking: false,
        isTrending: true,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Cricket World Cup Final: India vs Australia Tonight",
        titleHindi: "क्रिकेट विश्व कप फाइनल: आज रात भारत बनाम ऑस्ट्रेलिया",
        content: "The most anticipated cricket match of the year is here. India faces Australia in the Cricket World Cup final at the iconic MCG stadium. Both teams have shown exceptional performance throughout the tournament.",
        contentHindi: "साल का सबसे प्रतीक्षित क्रिकेट मैच यहाँ है। भारत प्रतिष्ठित MCG स्टेडियम में क्रिकेट विश्व कप फाइनल में ऑस्ट्रेलिया का सामना करता है। दोनों टीमों ने पूरे टूर्नामेंट में असाधारण प्रदर्शन दिखाया है।",
        excerpt: "India takes on Australia in tonight's Cricket World Cup final at MCG.",
        excerptHindi: "भारत आज रात MCG में क्रिकेट विश्व कप फाइनल में ऑस्ट्रेलिया से भिड़ेगा।",
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop",
        authorName: "Rajesh Kumar",
        categoryId: 3,
        isBreaking: true,
        isTrending: true,
        publishedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Bollywood Star Announces New Film Project",
        titleHindi: "बॉलीवुड स्टार ने नई फिल्म प्रोजेक्ट की घोषणा की",
        content: "Leading Bollywood actor announced their upcoming film project in collaboration with a renowned director. The movie is expected to be a high-budget production with cutting-edge visual effects.",
        contentHindi: "प्रमुख बॉलीवुड अभिनेता ने एक प्रसिद्ध निर्देशक के साथ सहयोग में अपनी आगामी फिल्म परियोजना की घोषणा की। फिल्म अत्याधुनिक विजुअल इफेक्ट्स के साथ एक बड़े बजट का निर्माण होने की उम्मीद है।",
        excerpt: "Major Bollywood announcement reveals exciting new film collaboration.",
        excerptHindi: "मुख्य बॉलीवुड घोषणा में रोमांचक नई फिल्म सहयोग का खुलासा।",
        imageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=600&fit=crop",
        authorName: "Anita Verma",
        categoryId: 4,
        isBreaking: false,
        isTrending: false,
        publishedAt: new Date(),
        createdAt: new Date()
      }
    ];

    await db.insert(articles).values(articleData).onConflictDoNothing();

    // Seed breaking news
    const breakingNewsData = [
      {
        id: 1,
        title: "PM announces major economic reforms package",
        titleHindi: "प्रधानमंत्री ने प्रमुख आर्थिक सुधार पैकेज की घोषणा की",
        isActive: true,
        priority: 1
      },
      {
        id: 2,
        title: "Supreme Court to announce digital privacy verdict today",
        titleHindi: "सुप्रीम कोर्ट आज डिजिटल प्राइवेसी पर फैसला सुनाएगा",
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