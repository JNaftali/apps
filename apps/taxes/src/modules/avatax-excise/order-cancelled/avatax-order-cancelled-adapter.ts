import { Logger, createLogger } from "../../../lib/logger";
import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { ClientLogger } from "../../logs/client-logger";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxExciseClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<OrderCancelledPayload, void> {
  private logger: Logger;
  private readonly clientLogger: ClientLogger;
  private readonly config: AvataxConfig;

  constructor({ config, clientLogger }: { config: AvataxConfig; clientLogger: ClientLogger }) {
    this.logger = createLogger({ name: "AvataxOrderCancelledAdapter" });
    this.config = config;
    this.clientLogger = clientLogger;
  }

  async send(payload: OrderCancelledPayload) {
    this.logger.debug("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const payloadTransformer = new AvataxOrderCancelledPayloadTransformer(this.config);
    const target = payloadTransformer.transform({ ...payload });

    this.logger.debug("Calling AvaTax voidTransaction with transformed payload...");

    const client = new AvataxExciseClient(this.config);

    try {
      await client.voidTransaction(target);

      this.logger.debug(`Successfully voided the transaction of id: ${target.transactionCode}`);
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      this.clientLogger.push({
        event: "[OrderCancelled] voidTransaction",
        status: "error",
        payload: {
          input: target,
          output: error.message,
        },
      });

      throw error;
    }
  }
}
