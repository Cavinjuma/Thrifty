import { COOKIE_NAME } from "@shared/types/const";
import { getSessionCookieOptions } from "../config/cookies";
import { systemRouter } from "./systemRouter";
import { publicProcedure, protectedProcedure, router } from "../config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../models/db";
import { storagePut } from "../models/storage";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

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

  // Products router
  products: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),

    getAvailable: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAvailableProducts(input.limit);
      }),

    search: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        size: z.string().optional(),
        condition: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.searchProducts(input);
      }),

    getByOwner: adminProcedure.query(async ({ ctx }) => {
      return db.getProductsByOwner(ctx.user.id);
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        category: z.string(),
        size: z.string().optional(),
        condition: z.enum(["excellent", "good", "fair", "poor"]),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createProduct({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          size: input.size,
          condition: input.condition,
          imageUrl: input.imageUrl,
          imageKey: input.imageKey,
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        size: z.string().optional(),
        condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        isSold: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product || product.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...updates } = input;
        return db.updateProduct(id, updates);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product || product.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.deleteProduct(input.id);
      }),

    markAsSold: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product || product.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.updateProduct(input.id, { isSold: true });
      }),
  }),

  // Cart router
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartItems(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.productId);
        if (!product || product.isSold) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not available" });
        }
        return db.addToCart(ctx.user.id, input.productId, input.quantity);
      }),

    updateItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.updateCartItem(input.id, input.quantity);
      }),

    removeItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.removeFromCart(input.id);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return db.clearCart(ctx.user.id);
    }),
  }),

  // Wishlist router
  wishlist: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return db.getWishlist(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.addToWishlist(ctx.user.id, input.productId);
      }),

    removeItem: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.removeFromWishlist(ctx.user.id, input.productId);
      }),
  }),

  // Orders router
  orders: router({
    create: protectedProcedure
      .input(z.object({
        shippingAddress: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
          }
          const price = parseFloat(product.price.toString());
          totalAmount += price * item.quantity;
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: product.price,
          });
        }

        const orderResult = await db.createOrder({
          userId: ctx.user.id,
          totalAmount: totalAmount.toString(),
          status: "pending",
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        });

        // Get the created order
        const orders = await db.getUserOrders(ctx.user.id);
        const newOrder = orders[0];

        // Create order items
        if (newOrder) {
          await db.createOrderItems(
            orderItems.map(item => ({
              orderId: newOrder.id,
              ...item,
            }))
          );
        }

        // Clear cart
        await db.clearCart(ctx.user.id);

        return newOrder;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || (order.userId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),

    getAllOrders: adminProcedure.query(async ({ ctx }) => {
      return db.getAllOrders();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.updateOrderStatus(input.id, input.status);
      }),
  }),
});

export type AppRouter = typeof appRouter;
