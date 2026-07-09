import { PlanName } from '@/shared/constants/Plan.enum';
import z from 'zod';

export const userResponseDto = z
  .object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    plan: z
      .object({
        name: z.enum(PlanName),
        monthlyLinkLimit: z.number(),
        monthlyQrCodeLimit: z.number(),
      })
      .loose(),
  })
  .loose();
