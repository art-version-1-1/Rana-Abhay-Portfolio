import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, visitStatsTable } from "@workspace/db";
import { RecordVisitResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/visits", async (_req, res): Promise<void> => {
  try {
    const [stats] = await db
      .insert(visitStatsTable)
      .values({ id: 1, totalVisits: 1 })
      .onConflictDoUpdate({
        target: visitStatsTable.id,
        set: {
          totalVisits: sql`${visitStatsTable.totalVisits} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ totalVisits: visitStatsTable.totalVisits });

    res.json(RecordVisitResponse.parse(stats ?? { totalVisits: 0 }));
  } catch (error) {
    console.error("Visit counter failed", error);
    res.status(200).json({ totalVisits: 0 });
  }
});

export default router;