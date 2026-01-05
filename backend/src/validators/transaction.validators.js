import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("amount must be > 0"),
  currency: z.string().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().datetime("date must be ISO datetime"),
  notes: z.string().optional(),
});
