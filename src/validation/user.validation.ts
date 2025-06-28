import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().min(5),
  location: z.string().optional(),
});

// export const adminSchema = baseUserSchema.extend({
//   role: z.literal("admin"),
// });

// export const partnerSchema = baseUserSchema.extend({
//   role: z.literal("partner"),
// });

// export const managerSchema = baseUserSchema.extend({
//   role: z.literal("manager"),
// });