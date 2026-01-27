import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "stock_controller", "manager", "founder"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Dispensaries table - Main Clinic and POD Mobile Clinic
 */
export const dispensaries = mysqlTable("dispensaries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["main_clinic", "pod_mobile"]).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dispensary = typeof dispensaries.$inferSelect;
export type InsertDispensary = typeof dispensaries.$inferInsert;

/**
 * Medication categories (17 categories)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Stock items table
 */
export const stockItems = mysqlTable("stockItems", {
  id: int("id").autoincrement().primaryKey(),
  dispensaryId: int("dispensaryId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  batchNumber: varchar("batchNumber", { length: 100 }),
  expirationDate: timestamp("expirationDate"),
  source: varchar("source", { length: 255 }),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
});

export type StockItem = typeof stockItems.$inferSelect;
export type InsertStockItem = typeof stockItems.$inferInsert;

/**
 * Stock transactions/movements table
 */
export const stockTransactions = mysqlTable("stockTransactions", {
  id: int("id").autoincrement().primaryKey(),
  stockItemId: int("stockItemId").notNull(),
  dispensaryId: int("dispensaryId").notNull(),
  transactionType: mysqlEnum("transactionType", ["issued", "received", "lost", "adjustment"]).notNull(),
  quantity: int("quantity").notNull(),
  previousQuantity: int("previousQuantity").notNull(),
  newQuantity: int("newQuantity").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockTransaction = typeof stockTransactions.$inferSelect;
export type InsertStockTransaction = typeof stockTransactions.$inferInsert;

/**
 * Stock alerts configuration
 */
export const stockAlerts = mysqlTable("stockAlerts", {
  id: int("id").autoincrement().primaryKey(),
  stockItemId: int("stockItemId").notNull(),
  alertType: mysqlEnum("alertType", ["low_stock", "out_of_stock", "expiring_soon", "expired"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = typeof stockAlerts.$inferInsert;

/**
 * User preferences for dispensary selection
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  lastSelectedDispensaryId: int("lastSelectedDispensaryId"),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  smsNotifications: boolean("smsNotifications").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
