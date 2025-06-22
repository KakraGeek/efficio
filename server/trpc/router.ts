import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createTRPCReact } from '@trpc/react-query';
import type { Context } from './context';
import { db } from '../../db/client';
import { clients, orders, inventory, payments } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // Example hello procedure
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),

  // Fetch all clients for the current user
  getClients: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Not authenticated');
    return db.select().from(clients).where(eq(clients.user_id, ctx.userId));
  }),

  // Fetch all orders for the current user
  getOrders: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Not authenticated');
    return db.select().from(orders).where(eq(orders.user_id, ctx.userId));
  }),

  // Fetch all inventory items for the current user
  getInventory: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Not authenticated');
    return db.select().from(inventory).where(eq(inventory.user_id, ctx.userId));
  }),

  // Fetch all payments for the current user
  getPayments: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Not authenticated');
    return db.select().from(payments).where(eq(payments.user_id, ctx.userId));
  }),

  addClient: t.procedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        neck: z.number().optional(),
        chest: z.number().optional(),
        waist: z.number().optional(),
        hips: z.number().optional(),
        thigh: z.number().optional(),
        inseam: z.number().optional(),
        arm_length: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return db.insert(clients).values({ ...input, user_id: ctx.userId });
    }),
  
  removeClient: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.delete(clients).where(eq(clients.id, input.id));
    }),

  bulkRemoveClients: t.procedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      if (input.ids.length === 0) return;
      return db.delete(clients).where(inArray(clients.id, input.ids));
    }),

  // Create a new order for the current user
  createOrder: t.procedure
    .input(z.object({
      client_id: z.number(),
      status: z.string(),
      description: z.string().nullable().optional(),
      due_date: z.string().nullable().optional(),
      total_price: z.number().nullable().optional(),
      image_url: z.string().nullable().optional(),
      // Measurements fields can be added here if you want to store them per order
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const [order] = await db
        .insert(orders)
        .values({
          user_id: ctx.userId,
          client_id: input.client_id,
          status: input.status,
          description: input.description ?? null,
          due_date: input.due_date ? new Date(input.due_date) : null,
          total_price: input.total_price ?? null,
          image_url: input.image_url ?? null,
        })
        .returning();
      return order;
    }),

  protectedHello: t.procedure.query(({ ctx }) => {
    if (!ctx.userId) {
      throw new Error('Not authenticated');
    }
    return { message: `Hello, user ${ctx.userId}!` };
  }),

  // Add update mutations for all tables
  updateClient: t.procedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      // Add all other client fields as needed
      notes: z.string().nullable().optional(),
      // ...measurement fields...
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const { id, ...updates } = input;
      const [client] = await db
        .update(clients)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(clients.id, id))
        .returning();
      return client;
    }),

  updateOrder: t.procedure
    .input(z.object({
      id: z.number(),
      status: z.string().optional(),
      description: z.string().nullable().optional(),
      due_date: z.string().nullable().optional(),
      total_price: z.number().nullable().optional(),
      image_url: z.string().nullable().optional(),
      // ...other order fields...
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const { id, due_date, ...updates } = input;
      const updateObj: any = { ...updates, updated_at: new Date() };
      if (typeof due_date === 'string') {
        updateObj.due_date = due_date ? new Date(due_date) : null;
      }
      // Debug log for status update
      if ('status' in updateObj) {
        console.log(`[updateOrder] Updating order ID ${id} to status:`, updateObj.status);
      }
      const [order] = await db
        .update(orders)
        .set(updateObj)
        .where(eq(orders.id, id))
        .returning();
      return order;
    }),

  updateInventory: t.procedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.string().nullable().optional(),
      quantity: z.number().optional(),
      unit: z.string().nullable().optional(),
      low_stock_alert: z.number().nullable().optional(),
      // ...other inventory fields...
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const { id, ...updates } = input;
      const [item] = await db
        .update(inventory)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(inventory.id, id))
        .returning();
      return item;
    }),

  updatePayment: t.procedure
    .input(z.object({
      id: z.number(),
      amount: z.number().optional(),
      method: z.string().optional(),
      status: z.string().nullable().optional(),
      transaction_ref: z.string().nullable().optional(),
      payment_type: z.string().optional(),
      payment_balance: z.number().optional(),
      // ...other payment fields...
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const { id, ...updates } = input;
      // payments table does not have updated_at
      const [payment] = await db
        .update(payments)
        .set(updates)
        .where(eq(payments.id, id))
        .returning();
      return payment;
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// This creates a tRPC React hook set for your API
export const trpc = createTRPCReact<AppRouter>(); 