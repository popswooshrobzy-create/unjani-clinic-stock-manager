import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import * as analytics from "./analytics";
import * as exportUtils from "./export";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  dispensary: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDispensaries();
    }),
    
    getUserPreference: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPreference(ctx.user.id);
    }),
    
    savePreference: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserPreference({
          userId: ctx.user.id,
          lastSelectedDispensaryId: input.dispensaryId,
          emailNotifications: true,
          smsNotifications: false,
        });
        return { success: true };
      }),
  }),

  category: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    classifyMedication: protectedProcedure
      .input(z.object({
        medicationName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const categories = await db.getAllCategories();
        const categoryNames = categories.map(c => c.name).join(", ");
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a medical classification assistant. Given a medication name, classify it into one of these categories: ${categoryNames}. Respond with ONLY the category name, nothing else.`
            },
            {
              role: "user",
              content: `Classify this medication: ${input.medicationName}`
            }
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        const suggestedCategory = typeof content === 'string' ? content.trim() : "";
        const matchedCategory = categories.find(c => 
          c.name.toLowerCase() === suggestedCategory.toLowerCase()
        );
        
        return {
          categoryId: matchedCategory?.id || null,
          categoryName: matchedCategory?.name || suggestedCategory,
        };
      }),
  }),

  stock: router({
    list: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockItemsByDispensary(input.dispensaryId);
      }),
    
    byCategory: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
        categoryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockItemsByCategory(input.dispensaryId, input.categoryId);
      }),
    
    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockItemById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
        categoryId: z.number().optional(),
        name: z.string(),
        quantity: z.number().default(0),
        unitPrice: z.string().optional(),
        batchNumber: z.string().optional(),
        expirationDate: z.date().optional(),
        source: z.string().optional(),
        lowStockThreshold: z.number().default(10),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createStockItem({
          ...input,
          createdBy: ctx.user.id,
        });
        
        const insertId = (result as any)?.insertId || 0;
        
        // Create initial transaction
        if (input.quantity > 0 && insertId) {
          await db.createStockTransaction({
            stockItemId: Number(insertId),
            dispensaryId: input.dispensaryId,
            transactionType: "received",
            quantity: input.quantity,
            previousQuantity: 0,
            newQuantity: input.quantity,
            reason: "Initial stock",
            userId: ctx.user.id,
          });
        }
        
        // Check if stock is critically low and send alerts
        if (insertId) {
          await db.checkAndAlertLowStock(Number(insertId), input.dispensaryId);
          await db.checkAndAlertExpiringSoon(Number(insertId), input.dispensaryId);
        }
        
        return { success: true, id: insertId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        quantity: z.number().optional(),
        unitPrice: z.string().optional(),
        batchNumber: z.string().optional(),
        expirationDate: z.date().optional(),
        source: z.string().optional(),
        lowStockThreshold: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStockItem(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteStockItem(input.id);
        return { success: true };
      }),
    
    adjustQuantity: protectedProcedure
      .input(z.object({
        stockItemId: z.number(),
        dispensaryId: z.number(),
        transactionType: z.enum(["issued", "received", "lost", "adjustment"]),
        quantity: z.number(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const item = await db.getStockItemById(input.stockItemId);
        if (!item) {
          throw new Error("Stock item not found");
        }
        
        const previousQuantity = item.quantity;
        let newQuantity = previousQuantity;
        
        if (input.transactionType === "received") {
          newQuantity = previousQuantity + input.quantity;
        } else if (input.transactionType === "issued" || input.transactionType === "lost") {
          newQuantity = Math.max(0, previousQuantity - input.quantity);
        } else {
          newQuantity = input.quantity;
        }
        
        await db.updateStockItem(input.stockItemId, { quantity: newQuantity });
        
        await db.createStockTransaction({
          stockItemId: input.stockItemId,
          dispensaryId: input.dispensaryId,
          transactionType: input.transactionType,
          quantity: input.quantity,
          previousQuantity,
          newQuantity,
          reason: input.reason,
          notes: input.notes,
          userId: ctx.user.id,
        });
        
        return { success: true, newQuantity };
      }),
    
    lowStock: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getLowStockItems(input.dispensaryId);
      }),
    
    expiring: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getExpiringItems(input.dispensaryId);
      }),
  }),

  transaction: router({
    listByItem: protectedProcedure
      .input(z.object({
        stockItemId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockTransactionsByItem(input.stockItemId);
      }),
    
    listByDispensary: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockTransactionsByDispensary(input.dispensaryId);
      }),
  }),

  user: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.userId);
        return { success: true };
      }),
  }),

  analytics: router({
    getPredictiveAnalytics: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await analytics.getStockPredictiveAnalytics(input.dispensaryId);
      }),
    
    getItemAnalytics: protectedProcedure
      .input(z.object({
        stockItemId: z.number(),
      }))
      .query(async ({ input }) => {
        const item = await db.getStockItemById(input.stockItemId);
        if (!item) {
          throw new Error("Stock item not found");
        }
        
        const daysUntilDepletion = await analytics.predictDaysUntilDepletion(
          input.stockItemId,
          item.quantity
        );
        const reorderAnalytics = await analytics.calculateOptimalReorderQuantity(input.stockItemId);
        
        return {
          ...reorderAnalytics,
          daysUntilDepletion,
          needsReorder: item.quantity <= reorderAnalytics.reorderPoint,
        };
      }),
  }),

  export: router({
    stockInventoryCSV: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const csv = await exportUtils.generateStockInventoryCSV(input.dispensaryId);
        return { data: csv, filename: `stock-inventory-${Date.now()}.csv` };
      }),
    
    transactionHistoryCSV: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const csv = await exportUtils.generateTransactionHistoryCSV(input.dispensaryId);
        return { data: csv, filename: `transaction-history-${Date.now()}.csv` };
      }),
    
    lowStockCSV: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const csv = await exportUtils.generateLowStockCSV(input.dispensaryId);
        return { data: csv, filename: `low-stock-report-${Date.now()}.csv` };
      }),
    
    expirationReportCSV: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const csv = await exportUtils.generateExpirationReportCSV(input.dispensaryId);
        return { data: csv, filename: `expiration-report-${Date.now()}.csv` };
      }),
    
    stockInventoryHTML: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const stockItems = await db.getStockItemsByDispensary(input.dispensaryId);
        const data = stockItems.map(item => ({
          name: item.name,
          category: item.categoryName || 'Uncategorized',
          quantity: item.quantity,
          batchNumber: item.batchNumber || '-',
          expirationDate: item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-',
        }));
        const html = exportUtils.generateHTMLReport('Stock Inventory Report', data, ['name', 'category', 'quantity', 'batchNumber', 'expirationDate']);
        return { data: html, filename: `stock-inventory-${Date.now()}.html` };
      }),
    
    transactionHistoryHTML: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const transactions = await db.getStockTransactionsByDispensary(input.dispensaryId);
        const data = transactions.map(tx => ({
          itemName: tx.itemName || 'Unknown',
          type: tx.transactionType,
          quantity: tx.quantity,
          userName: tx.userName || 'System',
          date: new Date(tx.createdAt).toLocaleString(),
        }));
        const html = exportUtils.generateHTMLReport('Transaction History Report', data, ['itemName', 'type', 'quantity', 'userName', 'date']);
        return { data: html, filename: `transaction-history-${Date.now()}.html` };
      }),
    
    lowStockHTML: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const lowStockItems = await db.getLowStockItems(input.dispensaryId);
        const data = lowStockItems.map(item => ({
          name: item.name,
          category: item.categoryName || 'Uncategorized',
          quantity: item.quantity,
          threshold: item.lowStockThreshold,
          status: item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK',
        }));
        const html = exportUtils.generateHTMLReport('Low Stock Report', data, ['name', 'category', 'quantity', 'threshold', 'status']);
        return { data: html, filename: `low-stock-report-${Date.now()}.html` };
      }),
    
    expirationReportHTML: protectedProcedure
      .input(z.object({
        dispensaryId: z.number(),
      }))
      .query(async ({ input }) => {
        const expiringItems = await db.getExpiringItems(input.dispensaryId);
        const data = expiringItems.map(item => {
          const expDate = item.expirationDate ? new Date(item.expirationDate) : null;
          const daysUntilExpiry = expDate ? Math.floor((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
          return {
            name: item.name,
            category: item.categoryName || 'Uncategorized',
            quantity: item.quantity,
            expirationDate: expDate ? expDate.toLocaleDateString() : '-',
            daysUntilExpiry: daysUntilExpiry !== null ? daysUntilExpiry : '-',
          };
        });
        const html = exportUtils.generateHTMLReport('Expiration Report', data, ['name', 'category', 'quantity', 'expirationDate', 'daysUntilExpiry']);
        return { data: html, filename: `expiration-report-${Date.now()}.html` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
