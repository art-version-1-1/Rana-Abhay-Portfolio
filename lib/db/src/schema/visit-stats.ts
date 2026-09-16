import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const visitStatsTable = pgTable("visit_stats", {
  id: integer("id").primaryKey(),
  totalVisits: integer("total_visits").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertVisitStatsSchema = createInsertSchema(visitStatsTable);
export type InsertVisitStats = z.infer<typeof insertVisitStatsSchema>;
export type VisitStats = typeof visitStatsTable.$inferSelect;