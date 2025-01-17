import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { AvataxCalculationDateResolver } from "../avatax-calculation-date-resolver";
import { AvataxExciseClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxCustomerCodeResolver } from "../avatax-customer-code-resolver";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";

export const SHIPPING_ITEM_CODE = "Shipping";

export class AvataxOrderConfirmedPayloadTransformer {
  private matchDocumentType(config: AvataxConfig): DocumentType {
    if (!config.isDocumentRecordingEnabled) {
      // isDocumentRecordingEnabled = false changes all the DocTypes within your AvaTax requests to SalesOrder. This will stop any transaction from being recorded within AvaTax.
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  }
  async transform(
    order: OrderConfirmedSubscriptionFragment,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const avataxClient = new AvataxExciseClient(avataxConfig);

    const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });
    const dateResolver = new AvataxCalculationDateResolver();
    const documentCodeResolver = new AvataxDocumentCodeResolver();
    const customerCodeResolver = new AvataxCustomerCodeResolver();

    const entityUseCode = await entityTypeMatcher.match(order.avataxEntityCode);
    const date = dateResolver.resolve(order.avataxTaxCalculationDate, order.created);
    const code = documentCodeResolver.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });
    const customerCode = customerCodeResolver.resolveOrderCustomerCode(order);

    return {
      model: {
        code,
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode,
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromSaleorAddress(
            order.channel.warehouses.find((w) => w.address.isDefaultShippingAddress)?.address!,
          ),
          // billing or shipping address?
          shipTo: avataxAddressFactory.fromSaleorAddress(order.billingAddress!),
        },
        currencyCode: order.total.currency,
        // we can fall back to empty string because email is not a required field
        email: order.user?.email ?? order.userEmail ?? "",
        lines: linesTransformer.transform(order, avataxConfig),
        date,
        discount: discountUtils.sumDiscounts(
          order.discounts.map((discount) => discount.amount.amount),
        ),
      },
    };
  }
}
