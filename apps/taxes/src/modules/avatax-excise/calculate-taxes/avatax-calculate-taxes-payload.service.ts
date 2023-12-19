import { AuthData } from "@saleor/app-sdk/APL";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";
import { CalculateTaxesPayload } from "../../../pages/api/webhooks/checkout-calculate-taxes";

export class AvataxCalculateTaxesPayloadService {
  constructor() {}

  async getPayload(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const payloadTransformer = new AvataxCalculateTaxesPayloadTransformer();

    return payloadTransformer.transform(payload, avataxConfig);
  }
}
