import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadService {
  constructor(private authData: AuthData) {}

  async getPayload(
    order: OrderConfirmedSubscriptionFragment,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const payloadTransformer = new AvataxOrderConfirmedPayloadTransformer();

    return payloadTransformer.transform(order, avataxConfig);
  }
}
