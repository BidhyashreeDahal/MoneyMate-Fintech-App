import { z } from "zod";

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.coerce.number().positive("amount must be > 0"),
  note: z.string().optional(),
  date: z.string().datetime().optional(),
});
