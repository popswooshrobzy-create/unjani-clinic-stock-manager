import { eq, and, or, desc, asc, sql, lt, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  dispensaries, 
  categories, 
  stockItems, 
  stockTransactions, 
  stockAlerts,
  userPreferences,
  InsertDispensary,
  InsertCategory,
  InsertStockItem,
  InsertStockTransaction,
  InsertStockAlert,
  InsertUserPreference
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// User operations
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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}

// Dispensary operations
export async function getAllDispensaries() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dispensaries).where(eq(dispensaries.isActive, true));
}

export async function getDispensaryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dispensaries).where(eq(dispensaries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDispensary(data: InsertDispensary) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(dispensaries).values(data);
  return result;
}

// Category operations
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(categories).values(data);
}

// Stock item operations
export async function getStockItemsByDispensary(dispensaryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockItems.id,
    dispensaryId: stockItems.dispensaryId,
    categoryId: stockItems.categoryId,
    name: stockItems.name,
    quantity: stockItems.quantity,
    unitPrice: stockItems.unitPrice,
    batchNumber: stockItems.batchNumber,
    expirationDate: stockItems.expirationDate,
    source: stockItems.source,
    lowStockThreshold: stockItems.lowStockThreshold,
    notes: stockItems.notes,
    createdAt: stockItems.createdAt,
    updatedAt: stockItems.updatedAt,
    createdBy: stockItems.createdBy,
    categoryName: categories.name,
  })
  .from(stockItems)
  .leftJoin(categories, eq(stockItems.categoryId, categories.id))
  .where(eq(stockItems.dispensaryId, dispensaryId))
  .orderBy(asc(stockItems.name));
}

export async function getStockItemsByCategory(dispensaryId: number, categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockItems.id,
    dispensaryId: stockItems.dispensaryId,
    categoryId: stockItems.categoryId,
    name: stockItems.name,
    quantity: stockItems.quantity,
    unitPrice: stockItems.unitPrice,
    batchNumber: stockItems.batchNumber,
    expirationDate: stockItems.expirationDate,
    source: stockItems.source,
    lowStockThreshold: stockItems.lowStockThreshold,
    notes: stockItems.notes,
    createdAt: stockItems.createdAt,
    updatedAt: stockItems.updatedAt,
    createdBy: stockItems.createdBy,
    categoryName: categories.name,
  })
  .from(stockItems)
  .leftJoin(categories, eq(stockItems.categoryId, categories.id))
  .where(and(
    eq(stockItems.dispensaryId, dispensaryId),
    eq(stockItems.categoryId, categoryId)
  ))
  .orderBy(asc(stockItems.name));
}

export async function getStockItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stockItems).where(eq(stockItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStockItem(data: InsertStockItem) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(stockItems).values(data);
  return result;
}

export async function updateStockItem(id: number, data: Partial<InsertStockItem>) {
  const db = await getDb();
  if (!db) return;
  return await db.update(stockItems).set(data).where(eq(stockItems.id, id));
}

export async function deleteStockItem(id: number) {
  const db = await getDb();
  if (!db) return;
  return await db.delete(stockItems).where(eq(stockItems.id, id));
}

export async function getLowStockItems(dispensaryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockItems.id,
    dispensaryId: stockItems.dispensaryId,
    categoryId: stockItems.categoryId,
    name: stockItems.name,
    quantity: stockItems.quantity,
    unitPrice: stockItems.unitPrice,
    batchNumber: stockItems.batchNumber,
    expirationDate: stockItems.expirationDate,
    source: stockItems.source,
    lowStockThreshold: stockItems.lowStockThreshold,
    notes: stockItems.notes,
    createdAt: stockItems.createdAt,
    updatedAt: stockItems.updatedAt,
    createdBy: stockItems.createdBy,
    categoryName: categories.name,
  })
  .from(stockItems)
  .leftJoin(categories, eq(stockItems.categoryId, categories.id))
  .where(and(
    eq(stockItems.dispensaryId, dispensaryId),
    lte(stockItems.quantity, stockItems.lowStockThreshold)
  ))
  .orderBy(asc(stockItems.quantity));
}

export async function getExpiringItems(dispensaryId: number) {
  const db = await getDb();
  if (!db) return [];
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  return await db.select({
    id: stockItems.id,
    dispensaryId: stockItems.dispensaryId,
    categoryId: stockItems.categoryId,
    name: stockItems.name,
    quantity: stockItems.quantity,
    unitPrice: stockItems.unitPrice,
    batchNumber: stockItems.batchNumber,
    expirationDate: stockItems.expirationDate,
    source: stockItems.source,
    lowStockThreshold: stockItems.lowStockThreshold,
    notes: stockItems.notes,
    createdAt: stockItems.createdAt,
    updatedAt: stockItems.updatedAt,
    createdBy: stockItems.createdBy,
    categoryName: categories.name,
  })
  .from(stockItems)
  .leftJoin(categories, eq(stockItems.categoryId, categories.id))
  .where(and(
    eq(stockItems.dispensaryId, dispensaryId),
    lte(stockItems.expirationDate, threeMonthsFromNow)
  ))
  .orderBy(asc(stockItems.expirationDate));
}

// Stock transaction operations
export async function createStockTransaction(data: InsertStockTransaction) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(stockTransactions).values(data);
}

export async function getStockTransactionsByItem(stockItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockTransactions.id,
    stockItemId: stockTransactions.stockItemId,
    dispensaryId: stockTransactions.dispensaryId,
    transactionType: stockTransactions.transactionType,
    quantity: stockTransactions.quantity,
    previousQuantity: stockTransactions.previousQuantity,
    newQuantity: stockTransactions.newQuantity,
    reason: stockTransactions.reason,
    notes: stockTransactions.notes,
    userId: stockTransactions.userId,
    createdAt: stockTransactions.createdAt,
    userName: users.name,
  })
  .from(stockTransactions)
  .leftJoin(users, eq(stockTransactions.userId, users.id))
  .where(eq(stockTransactions.stockItemId, stockItemId))
  .orderBy(desc(stockTransactions.createdAt));
}

export async function getStockTransactionsByDispensary(dispensaryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockTransactions.id,
    stockItemId: stockTransactions.stockItemId,
    dispensaryId: stockTransactions.dispensaryId,
    transactionType: stockTransactions.transactionType,
    quantity: stockTransactions.quantity,
    previousQuantity: stockTransactions.previousQuantity,
    newQuantity: stockTransactions.newQuantity,
    reason: stockTransactions.reason,
    notes: stockTransactions.notes,
    userId: stockTransactions.userId,
    createdAt: stockTransactions.createdAt,
    userName: users.name,
    itemName: stockItems.name,
  })
  .from(stockTransactions)
  .leftJoin(users, eq(stockTransactions.userId, users.id))
  .leftJoin(stockItems, eq(stockTransactions.stockItemId, stockItems.id))
  .where(eq(stockTransactions.dispensaryId, dispensaryId))
  .orderBy(desc(stockTransactions.createdAt));
}

// User preferences
export async function getUserPreference(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreference(data: InsertUserPreference) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(userPreferences).values(data).onDuplicateKeyUpdate({
    set: {
      lastSelectedDispensaryId: data.lastSelectedDispensaryId,
      emailNotifications: data.emailNotifications,
      smsNotifications: data.smsNotifications,
      updatedAt: new Date(),
    },
  });
}


// Stock controllers and notifications
export async function getStockControllers(dispensaryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    phoneNumber: users.phoneNumber,
    role: users.role,
  }).from(users).where(
    or(
      eq(users.role, "stock_controller"),
      eq(users.role, "manager"),
      eq(users.role, "founder")
    )
  );
  
  return await query;
}

export async function checkAndAlertLowStock(stockItemId: number, dispensaryId: number) {
  const db = await getDb();
  if (!db) return;
  
  const item = await getStockItemById(stockItemId);
  if (!item) return;
  
  // Check if stock is critically low (at or below threshold)
  if (item.quantity <= item.lowStockThreshold) {
    const dispensary = await db.select().from(dispensaries).where(eq(dispensaries.id, dispensaryId)).limit(1);
    const dispensaryName = dispensary.length > 0 ? dispensary[0].name : "Unknown Dispensary";
    
    // Get stock controllers
    const controllers = await getStockControllers(dispensaryId);
    
    // Send notifications
    const { sendLowStockAlert } = await import("./notifications");
    await sendLowStockAlert(
      controllers.map(c => ({
        name: c.name || "Stock Controller",
        email: c.email || "",
        phoneNumber: c.phoneNumber || undefined,
      })),
      item.name,
      item.quantity,
      item.lowStockThreshold,
      dispensaryName
    );
  }
}

export async function checkAndAlertExpiringSoon(stockItemId: number, dispensaryId: number) {
  const db = await getDb();
  if (!db) return;
  
  const item = await getStockItemById(stockItemId);
  if (!item || !item.expirationDate) return;
  
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  // Check if expiring within 3 months
  if (item.expirationDate <= threeMonthsFromNow) {
    const dispensary = await db.select().from(dispensaries).where(eq(dispensaries.id, dispensaryId)).limit(1);
    const dispensaryName = dispensary.length > 0 ? dispensary[0].name : "Unknown Dispensary";
    
    // Get stock controllers
    const controllers = await getStockControllers(dispensaryId);
    
    // Send notifications
    const { sendExpirationAlert } = await import("./notifications");
    await sendExpirationAlert(
      controllers.map(c => ({
        name: c.name || "Stock Controller",
        email: c.email || "",
        phoneNumber: c.phoneNumber || undefined,
      })),
      item.name,
      item.expirationDate,
      dispensaryName
    );
  }
}
