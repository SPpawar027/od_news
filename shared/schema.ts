import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  authorName: text("author_name"),
  categoryId: integer("category_id").references(() => categories.id),
  isBreaking: boolean("is_breaking").default(false),
  isTrending: boolean("is_trending").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const breakingNews = pgTable("breaking_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  content: text("content"),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("editor"), // manager, editor, limited_editor, subtitle_editor, viewer
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live TV Streams table
export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi").notNull(),
  description: text("description"),
  type: text("type").notNull(), // m3u8, youtube, custom
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  viewerCount: integer("viewer_count").default(0),
  category: text("category").default("news"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RSS Sources table
export const rssSources = pgTable("rss_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  lastFetch: timestamp("last_fetch"),
  fetchInterval: integer("fetch_interval").default(30), // minutes
  articlesImported: integer("articles_imported").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos table for entertainment section
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  videoFile: text("video_file"), // Internal file path for uploaded videos
  thumbnailUrl: text("thumbnail_url"),
  subtitleUrl: text("subtitle_url"), // VTT format
  duration: text("duration"), // format: "HH:MM:SS"
  tags: text("tags").array().default([]),
  isVertical: boolean("is_vertical").default(true), // 9:16 format
  visibility: text("visibility").default("public"), // public, private
  viewCount: integer("view_count").default(0),
  uploadedBy: integer("uploaded_by").references(() => adminUsers.id),
  publishedAt: timestamp("published_at"),
  slug: text("slug").unique(), // Unique URL slug for video access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advertisements table for Google Ads and other advertisements
export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  position: text("position").notNull(), // 'sidebar', 'header', 'footer', 'content'
  isActive: boolean("is_active").default(true),
  width: integer("width").default(300),
  height: integer("height").default(250),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Article drafts and status
export const articleDrafts = pgTable("article_drafts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  content: text("content").notNull(),
  contentHindi: text("content_hindi").notNull(),
  excerpt: text("excerpt").notNull(),
  excerptHindi: text("excerpt_hindi").notNull(),
  imageUrl: text("image_url"),
  authorName: text("author_name"),
  categoryId: integer("category_id").references(() => categories.id),
  tags: text("tags").array().default([]),
  slug: text("slug"),
  status: text("status").default("draft"), // draft, scheduled, published
  scheduledAt: timestamp("scheduled_at"),
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertBreakingNewsSchema = createInsertSchema(breakingNews).omit({
  id: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRssSourceSchema = createInsertSchema(rssSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastFetch: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArticleDraftSchema = createInsertSchema(articleDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type BreakingNews = typeof breakingNews.$inferSelect;
export type InsertBreakingNews = z.infer<typeof insertBreakingNewsSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type RssSource = typeof rssSources.$inferSelect;
export type InsertRssSource = z.infer<typeof insertRssSourceSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type ArticleDraft = typeof articleDrafts.$inferSelect;
export type InsertArticleDraft = z.infer<typeof insertArticleDraftSchema>;