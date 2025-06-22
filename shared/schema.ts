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
  categoryId: integer("category_id").references(() => categories.id),
  authorName: text("author_name"),
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

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  description: text("description"),
  descriptionHindi: text("description_hindi"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  categoryId: integer("category_id").references(() => categories.id),
  isLive: boolean("is_live").default(false),
  viewCount: integer("view_count").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveTv = pgTable("live_tv", {
  id: serial("id").primaryKey(),
  channelName: text("channel_name").notNull(),
  channelNameHindi: text("channel_name_hindi").notNull(),
  streamUrl: text("stream_url").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rssFeeds = pgTable("rss_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  lastFetched: timestamp("last_fetched"),
  fetchFrequency: integer("fetch_frequency").default(60), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validations
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
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
  publishedAt: true,
});

export const insertLiveTvSchema = createInsertSchema(liveTv).omit({
  id: true,
  createdAt: true,
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
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