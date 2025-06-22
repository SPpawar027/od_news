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
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type BreakingNews = typeof breakingNews.$inferSelect;
export type InsertBreakingNews = z.infer<typeof insertBreakingNewsSchema>;