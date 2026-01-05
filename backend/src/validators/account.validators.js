import {z} from "zod";
export const createAccountSchema = z.object({
    name:z.string().min(1,"name is required"),
    type: z.enum(["checking","savings","cash","credit_card","investment","wallet"]).optional(),
   currency: z.string().min(3).max(3).optional(), // "CAD"
    balance: z.coerce.number().min(0).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    goalAmount: z.coerce.number().min(0).optional(),

});

export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
 type: z.enum(["checking","savings","cash","credit_card","investment","wallet"]).optional(),
  currency: z.string().min(3).max(3).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  goalAmount: z.coerce.number().min(0).optional(),
  archived: z.boolean().optional(),
});