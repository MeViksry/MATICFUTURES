// backend/src/validators/admin.validator.ts
import { z } from 'zod'

export const adminSchemas = {
  updateRole: z.object({
    body: z.object({
      role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN'])
    })
  })
}