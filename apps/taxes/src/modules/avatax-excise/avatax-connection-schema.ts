import { z } from "zod";

const avataxCredentialsSchema = z.object({
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
});

// All that is needed to create AvaTax configuration.
export const baseAvataxConfigSchema = z.object({
  isSandbox: z.boolean(),
  credentials: avataxCredentialsSchema,
});

export type BaseAvataxConfig = z.infer<typeof baseAvataxConfigSchema>;

export const avataxConfigSchema = z
  .object({
    name: z.string().min(1, { message: "Name requires at least one character." }),
    companyCode: z.string().min(1, { message: "Company code requires at least one character." }),
    isAutocommit: z.boolean(),
    shippingTaxCode: z.string().optional(),
    isDocumentRecordingEnabled: z.boolean().default(true),
  })
  .merge(baseAvataxConfigSchema);

export type AvataxConfig = z.infer<typeof avataxConfigSchema>;

export const defaultAvataxConfig: AvataxConfig = {
  name: "",
  companyCode: "DEFAULT",
  isSandbox: false,
  isAutocommit: false,
  isDocumentRecordingEnabled: true,
  shippingTaxCode: "",
  credentials: {
    username: "",
    password: "",
  },
};

export const avataxConnectionSchema = z.object({
  id: z.string(),
  provider: z.literal("avataxExcise"),
  config: avataxConfigSchema,
});

export type AvataxConnection = z.infer<typeof avataxConnectionSchema>;
