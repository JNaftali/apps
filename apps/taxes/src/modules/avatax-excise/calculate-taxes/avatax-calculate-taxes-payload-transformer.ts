import { CalculateTaxesPayload } from "../../../pages/api/webhooks/checkout-calculate-taxes";
import { AvataxExciseClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxCustomerCodeResolver } from "../avatax-customer-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";
import { TransactionCreateRequestData } from "../ate-types";

/**
 * Adapted from https://github.com/saleor/saleor/blob/3.8.45/saleor/plugins/avatax_excise/utils.py#L401-L432
 */
export class AvataxCalculateTaxesPayloadTransformer {
  async transform(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
  ): Promise<TransactionCreateRequestData> {
    const payloadLinesTransformer = new AvataxCalculateTaxesPayloadLinesTransformer();
    const avataxClient = new AvataxExciseClient(avataxConfig);
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });
    const customerCodeResolver = new AvataxCustomerCodeResolver();

    const entityUseCode = await entityTypeMatcher.match(
      payload.taxBase.sourceObject.avataxEntityCode,
    );

    const customerCode = customerCodeResolver.resolveCalculateTaxesCustomerCode(payload);
    const today = new Date().toString();

    return {
      EffectiveDate: today,
      InvoiceDate: today,
      InvoiceNumber:
        payload.taxBase.sourceObject.__typename === "Order"
          ? payload.taxBase.sourceObject.number
          : undefined,
      TitleTransferCode: "DEST",
      TransactionType: "DIRECT",
      TransactionLines: payloadLinesTransformer.transform(payload.taxBase, avataxConfig),
      Discount: payload.taxBase.discounts.reduce(
        (total, discount) => total + discount.amount.amount,
        0,
      ),
    };
  }
}
