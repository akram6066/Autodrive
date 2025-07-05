import { z } from "zod";

export const productEditSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a number > 0",
  }),
  discountPrice: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Discount must be a number",
  }),
  isOffer: z.boolean(),
});
