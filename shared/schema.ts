import { pgTable, text, serial, integer, timestamp, boolean, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles and permissions
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // manager, editor, limited_editor, subtitle_editor, viewer
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  content: text("content").notNull(),
  contentHindi: text("content_hindi").notNull(),
  excerpt: text("excerpt").notNull(),
  excerptHindi: text("excerpt_hindi").notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  isBreaking: boolean("is_breaking").default(false),
  isTrending: boolean("is_trending").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const breakingNews = pgTable("breaking_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video Management System
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  description: text("description"),
  descriptionHindi: text("description_hindi"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  isVertical: boolean("is_vertical").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  tags: text("tags"), // JSON string of hashtags
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live TV Management
export const liveTv = pgTable("live_tv", {
  id: serial("id").primaryKey(),
  channelName: text("channel_name").notNull(),
  channelNameHindi: text("channel_name_hindi").notNull(),
  streamUrl: text("stream_url").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  descriptionHindi: text("description_hindi"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RSS Feed Management
export const rssFeeds = pgTable("rss_feeds", {
  id: serial("id").primaryKey(),
  feedName: text("feed_name").notNull(),
  feedUrl: text("feed_url").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  lastFetched: timestamp("last_fetched"),
  fetchFrequency: integer("fetch_frequency").default(60), // in minutes
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content enhancements and AI generated hashtags
export const contentEnhancements = pgTable("content_enhancements", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => articles.id),
  videoId: integer("video_id").references(() => videos.id),
  aiGeneratedTags: text("ai_generated_tags"), // JSON string
  enhancedContent: text("enhanced_content"),
  enhancedContentHindi: text("enhanced_content_hindi"),
  seoKeywords: text("seo_keywords"), // JSON string
  isApplied: boolean("is_applied").default(false),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subtitle management
export const subtitles = pgTable("subtitles", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  language: text("language").notNull(), // 'hindi', 'english'
  subtitleData: text("subtitle_data").notNull(), // VTT or SRT format
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertBreakingNewsSchema = createInsertSchema(breakingNews).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertLiveTvSchema = createInsertSchema(liveTv).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastFetched: true,
});

export const insertContentEnhancementSchema = createInsertSchema(contentEnhancements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubtitleSchema = createInsertSchema(subtitles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type BreakingNews = typeof breakingNews.$inferSelect;
export type InsertBreakingNews = z.infer<typeof insertBreakingNewsSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type LiveTv = typeof liveTv.$inferSelect;
export type InsertLiveTv = z.infer<typeof insertLiveTvSchema>;
export type RssFeed = typeof rssFeeds.$inferSelect;
export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;
export type ContentEnhancement = typeof contentEnhancements.$inferSelect;
export type InsertContentEnhancement = z.infer<typeof insertContentEnhancementSchema>;
export type Subtitle = typeof subtitles.$inferSelect;
export type InsertSubtitle = z.infer<typeof insertSubtitleSchema>;

// User role enum for type safety
export const UserRole = {
  MANAGER: 'manager',
  EDITOR: 'editor',
  LIMITED_EDITOR: 'limited_editor',
  SUBTITLE_EDITOR: 'subtitle_editor',
  VIEWER: 'viewer'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
