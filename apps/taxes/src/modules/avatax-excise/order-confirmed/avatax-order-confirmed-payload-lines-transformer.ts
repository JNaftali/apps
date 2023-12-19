import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadLinesTransformer {
  transform(order: OrderConfirmedSubscriptionFragment, config: AvataxConfig): LineItemModel[] {
    const productLines: LineItemModel[] = order.lines.map((line) => {
      return {
        // taxes are included because we treat what is passed in payload as the source of truth
        taxIncluded: true,
        amount: numbers.roundFloatToTwoDecimals(
          line.totalPrice.net.amount + line.totalPrice.tax.amount,
        ),
        quantity: line.quantity,
        description: line.productName,
        itemCode: line.productSku ?? "",
        discounted: order.discounts.length > 0,
      };
    });

    if (order.shippingPrice.net.amount !== 0) {
      // * In AvaTax, shipping is a regular line
      const shippingLine: LineItemModel = {
        amount: order.shippingPrice.gross.amount,
        taxIncluded: true,
        itemCode: SHIPPING_ITEM_CODE,
        /**
         * * Different shipping methods can have different tax codes.
         * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/\
         */
        taxCode: config.shippingTaxCode,
        quantity: 1,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
