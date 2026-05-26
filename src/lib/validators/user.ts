import { z } from "zod";

export const userSyncSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
});

export type UserSyncInput = z.infer<typeof userSyncSchema>;
