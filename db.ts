import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, registrations, InsertRegistration, Registration, contestants, InsertContestant, Contestant, votes, InsertVote, Vote } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Registration helpers

/**
 * Generate unique registration number with format: MWB-YYYYMMDD-XXXX
 * Example: MWB-20250121-0001
 */
export async function generateRegistrationNumber(): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `MWB-${dateStr}-`;

  // Get count of registrations today
  const todayRegistrations = await db
    .select()
    .from(registrations)
    .where(sql`${registrations.registrationNumber} LIKE ${prefix + '%'}`);

  const nextNumber = (todayRegistrations.length + 1).toString().padStart(4, '0');
  return `${prefix}${nextNumber}`;
}

export async function createRegistration(data: InsertRegistration): Promise<Registration> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(registrations).values(data);
  const insertedId = Number(result[0].insertId);
  
  const newRegistration = await db.select().from(registrations).where(eq(registrations.id, insertedId)).limit(1);
  
  if (!newRegistration[0]) {
    throw new Error("Failed to retrieve created registration");
  }
  
  return newRegistration[0];
}

export async function getRegistrationById(id: number): Promise<Registration | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
  return result[0];
}

export async function updateRegistrationPaymentStatus(
  id: number,
  status: "pending" | "paid" | "failed",
  transactionId?: string
): Promise<void> {