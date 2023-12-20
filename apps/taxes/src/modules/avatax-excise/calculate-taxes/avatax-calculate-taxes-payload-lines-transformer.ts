import { Address, TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE, SHIPPING_UNIT_OF_MEASURE } from "./avatax-calculate-taxes-adapter";
import { TransactionLine } from "../ate-types";
import invariant from "tiny-invariant";

/**
 * Adapted from https://github.com/saleor/saleor/blob/3.8.45/saleor/plugins/avatax_excise/utils.py#L180-L326
 */
export class AvataxCalculateTaxesPayloadLinesTransformer {
  transform(taxBase: TaxBaseFragment, config: AvataxConfig): TransactionLine[] {
    const isDiscounted = taxBase.discounts.length > 0;
    const shippingAddress = taxBase.address;

    invariant(shippingAddress, "Cannot calculate taxes without a shipping address");

    const productLines: TransactionLine[] = taxBase.lines.map((line, i) => {
      const variant =
        line.sourceLine.__typename === "CheckoutLine"
          ? line.sourceLine.checkoutProductVariant
          : line.sourceLine.orderProductVariant;

      invariant(variant?.sku, `Missing variant information for line ${line.sourceLine.id}`);
      invariant(
        variant.ateUnitOfMeasure,
        `Missing required metadata UnitOfMeasure on variant ${variant.id}`,
      );
      invariant(
        variant.ateUnitOfMeasure,
        `Missing required metadata UnitOfMeasure on variant ${variant.id}`,
      );
      invariant(
        variant.ateUnitQuantity,
        `Missing required metadata UnitQuantity on variant ${variant.id}`,
      );
      invariant(
        variant.ateUnitQuantityUnitOfMeasure,
        `Missing required metadata UnitQuantityUnitOfMeasure on variant ${variant.id}`,
      );

      return {
        // Requires a numerical invoice line id.
        InvoiceLine: i + 1,
        ProductCode: variant.sku,
        UnitPrice: line.unitPrice.amount,
        UnitOfMeasure: variant.ateUnitOfMeasure,
        BilledUnits: line.quantity,
        LineAmount: line.totalPrice.amount,
        // AlternateUnitPrice: variant_channel_listing.cost_price_amount, todo query pricing with shipping address as input
        TaxIncluded: taxBase.pricesEnteredWithTax,
        UnitQuantity: parseInt(variant.ateUnitQuantity, 10),
        UnitQuantityUnitOfMeasure: variant.ateUnitQuantityUnitOfMeasure,
        DestinationCountryCode: shippingAddress.country.code,
        DestinationJurisdiction: shippingAddress.countryArea,
        DestinationAddress1: shippingAddress.streetAddress1,
        DestinationAddress2: shippingAddress.streetAddress2,
        DestinationCity: shippingAddress.city,
        DestinationCounty: shippingAddress.cityArea,
        DestinationPostalCode: shippingAddress.postalCode,
        SaleCountryCode: shippingAddress.country.code,
        SaleJurisdiction: shippingAddress.countryArea,
        SaleAddress1: shippingAddress.streetAddress1,
        SaleAddress2: shippingAddress.streetAddress2,
        SaleCity: shippingAddress.city,
        SaleCounty: shippingAddress.cityArea,
        SalePostalCode: shippingAddress.postalCode,
        // Todo: determine origin by querying stocks with shipping address
        // OriginCountryCode: origin.country.code,
        // OriginJurisdiction: origin.countryArea,
        // OriginAddress1: origin.streetAddress1,
        // OriginAddress2: origin.streetAddress2,
        // OriginCity: origin.city,
        // OriginCounty: origin.cityArea,
        // OriginPostalCode: origin.postalCode,
        UserData: variant.sku,
        Discounted: isDiscounted,
        CustomString1: variant.ateCustomString1,
        CustomString2: variant.ateCustomString2,
        CustomString3: variant.ateCustomString3,
        CustomNumeric1: variant.ateCustomNumeric1 ? parseFloat(variant.ateCustomNumeric1) : null,
        CustomNumeric2: variant.ateCustomNumeric2 ? parseFloat(variant.ateCustomNumeric2) : null,
        CustomNumeric3: variant.ateCustomNumeric3 ? parseFloat(variant.ateCustomNumeric3) : null,
      };
    });

    if (taxBase.shippingPrice.amount !== 0) {
      // * In AvaTax, shipping is a regular line
      const shippingLine: TransactionLine = {
        InvoiceLine: 0,
        ProductCode: config.shippingTaxCode!,
        UnitOfMeasure: SHIPPING_UNIT_OF_MEASURE,
        LineAmount: taxBase.shippingPrice.amount,
        TaxIncluded: taxBase.pricesEnteredWithTax,
        DestinationCountryCode: shippingAddress.country.code,
        DestinationJurisdiction: shippingAddress.countryArea,
        DestinationAddress1: shippingAddress.streetAddress1,
        DestinationAddress2: shippingAddress.streetAddress2,
        DestinationCity: shippingAddress.city,
        DestinationCounty: shippingAddress.cityArea,
        DestinationPostalCode: shippingAddress.postalCode,
        SaleCountryCode: shippingAddress.country.code,
        SaleJurisdiction: shippingAddress.countryArea,
        SaleAddress1: shippingAddress.streetAddress1,
        SaleAddress2: shippingAddress.streetAddress2,
        SaleCity: shippingAddress.city,
        SaleCounty: shippingAddress.cityArea,
        SalePostalCode: shippingAddress.postalCode,
        UserData: SHIPPING_ITEM_CODE,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
