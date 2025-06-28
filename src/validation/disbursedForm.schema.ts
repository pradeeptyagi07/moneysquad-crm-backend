// validators/disbursedForm.schema.ts
import { z } from "zod";

export const createDisbursedFormSchema = z.object({
  loanAmount: z.coerce.number().optional(),
  tenureMonths: z.coerce.number().optional(),
  interestRatePA: z.coerce.number().optional(),
  processingFee: z.coerce.number().optional(),
  insuranceCharges: z.coerce.number().optional(),
  loanScheme: z.coerce.string().optional(),
  lanNumber: z.coerce.string().optional(),
  actualDisbursedDate: z.string().optional(),
});