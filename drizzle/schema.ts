import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Registrations table for audition participants
 */
export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  registrationNumber: varchar("registrationNumber", { length: 50 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: text("address").notNull(),
  birthPlace: varchar("birthPlace", { length: 255 }).notNull(),
  birthDate: varchar("birthDate", { length: 20 }).notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }).notNull(),
  gender: mysqlEnum("gender", ["Laki-laki", "Perempuan"]).notNull(),
  profession: varchar("profession", { length: 255 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  category: mysqlEnum("category", ["Acting", "Vocal", "Model"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "pending_verification", "verified", "rejected"]).default("pending").notNull(),
  paymentProofUrl: text("paymentProofUrl"),
  saweriaLink: text("saweriaLink"),
  saweriaTransactionId: varchar("saweriaTransactionId", { length: 255 }),
  photoLink: text("photoLink"),
  nik: varchar("nik", { length: 16 }),
  invoiceId: varchar("invoiceId", { length: 20 }),
  invoiceAmount: int("invoiceAmount"),
  kiaNumber: varchar("kiaNumber", { length: 16 }),
  parentalConsentUrl: text("parentalConsentUrl"),
  isMinor: int("isMinor").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

/**
 * Contestants table for voting system
 */
export const contestants = mysqlTable("contestants", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["Acting", "Vocal", "Model"]).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  photoUrl: text("photoUrl"),
  bio: text("bio"),
  voteCount: int("voteCount").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  contestantNumber: varchar("contestantNumber", { length: 10 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contestant = typeof contestants.$inferSelect;
export type InsertContestant = typeof contestants.$inferInsert;

/**
 * Votes table for tracking individual votes
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  receiptNumber: varchar("receiptNumber", { length: 20 }),
  contestantId: int("contestantId").notNull(),
  voterName: varchar("voterName", { length: 255 }),
  voterEmail: varchar("voterEmail", { length: 320 }),
  amount: int("amount").notNull(),
  voteQuantity: int("voteQuantity").notNull(),
  saweriaTransactionId: varchar("saweriaTransactionId", { length: 255 }).notNull().unique(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;