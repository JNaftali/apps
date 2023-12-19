import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE } from "./avatax-calculate-taxes-adapter";

export class AvataxCalculateTaxesPayloadLinesTransformer {
  transform(taxBase: TaxBaseFragment, config: AvataxConfig): LineItemModel[] {
    const isDiscounted = taxBase.discounts.length > 0;
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      return {
        amount: line.totalPrice.amount,
        taxIncluded: taxBase.pricesEnteredWithTax,
        quantity: line.quantity,
        discounted: isDiscounted,
      };
    });

    if (taxBase.shippingPrice.amount !== 0) {
      // * In AvaTax, shipping is a regular line
      const shippingLine: LineItemModel = {
        amount: taxBase.shippingPrice.amount,
        itemCode: SHIPPING_ITEM_CODE,
        quantity: 1,
        taxIncluded: taxBase.pricesEnteredWithTax,
        discounted: isDiscounted,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
