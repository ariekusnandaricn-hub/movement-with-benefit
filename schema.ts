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
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "pending_verification"]).default("pending").notNull(),
  /** Payment proof upload URL (for manual bank transfer) */
  paymentProofUrl: text("paymentProofUrl"),
  saweriaLink: text("saweriaLink"),
  saweriaTransactionId: varchar("saweriaTransactionId", { length: 255 }),
  /** Google Drive link for contestant photo */
  photoLink: text("photoLink"),
  /** NIK (Nomor Induk Kependudukan) - 16 digit ID card number */
  nik: varchar("nik", { length: 16 }),
  /** Unique invoice ID based on sequence + province code (e.g., 001001) */
  invoiceId: varchar("invoiceId", { length: 10 }),
  /** Dynamic invoice amount (250000 + invoiceId) */
  invoiceAmount: int("invoiceAmount"),
  /** KIA (Kartu Identitas Anak) number for minors - 16 digit */
  kiaNumber: varchar("kiaNumber", { length: 16 }),
  /** Parental consent letter file URL (for minors) */
  parentalConsentUrl: text("parentalConsentUrl"),
  /** Flag to indicate if participant is a minor (< 17 years old) */
  isMinor: int("isMinor").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

/**
 * Contestants table for voting system
 * Stores finalists/semi-finalists who are eligible for public voting
 */
export const contestants = mysqlTable("contestants", {
  id: int("id").autoincrement().primaryKey(),
  /** Link to registration table */
  registrationId: int("registrationId").notNull(),
  /** Contestant name (from registration) */
  name: varchar("name", { length: 255 }).notNull(),
  /** Category: Acting, Vocal, or Model */
  category: mysqlEnum("category", ["Acting", "Vocal", "Model"]).notNull(),
  /** Province */
  province: varchar("province", { length: 100 }).notNull(),
  /** Profile photo URL (uploaded to S3) */
  photoUrl: text("photoUrl"),
  /** Short bio/description */
  bio: text("bio"),
  /** Total vote count (updated by webhook) */
  voteCount: int("voteCount").default(0).notNull(),
  /** Status: active (can receive votes) or inactive */
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  /** Contestant number for display (e.g., 001, 002) */
  contestantNumber: varchar("contestantNumber", { length: 10 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contestant = typeof contestants.$inferSelect;
export type InsertContestant = typeof contestants.$inferInsert;

/**
 * Votes table for tracking individual votes
 * Each vote is linked to a Saweria payment
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  /** Receipt number for this vote (e.g., 1001, 1002, 1003...) */
  receiptNumber: varchar("receiptNumber", { length: 20 }),
  /** Link to contestant being voted for */
  contestantId: int("contestantId").notNull(),
  /** Voter name (from Saweria donator_name) */
  voterName: varchar("voterName", { length: 255 }),
  /** Voter email (from Saweria donator_email) */
  voterEmail: varchar("voterEmail", { length: 320 }),
  /** Vote amount in IDR */
  amount: int("amount").notNull(),
  /** Number of votes (1 vote = Rp 10.000) */
  voteQuantity: int("voteQuantity").notNull(),
  /** Saweria donation ID */
  saweriaTransactionId: varchar("saweriaTransactionId", { length: 255 }).notNull().unique(),
  /** Payment status */
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  /** Message from voter */
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Judges table for storing jury information
 */
export const judges = mysqlTable("judges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["Acting", "Vocal", "Model"]).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  photoUrl: text("photoUrl"),
  orderIndex: int("order_index").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Judge = typeof judges.$inferSelect;
export type InsertJudge = typeof judges.$inferInsert;
