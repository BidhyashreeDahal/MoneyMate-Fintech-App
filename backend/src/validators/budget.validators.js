import { z } from "zod";

export const createBudgetSchema = z.object({
  category: z.string().min(1),
  limitAmount: z.coerce.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  alertThreshold: z.coerce.number().min(0).max(100).optional(), // percentage
});
