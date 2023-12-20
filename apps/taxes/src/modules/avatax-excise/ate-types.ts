import { DocumentType } from "avatax/lib/enums/DocumentType";

export interface TransactionLine {
  InvoiceLine?: number; // integer
  ProductCode: string;
  UnitPrice?: number; // decimal
  UnitOfMeasure?: string;
  BilledUnits?: number; // decimal
  LineAmount?: number; // decimal
  AlternateUnitPrice?: number; // decimal
  TaxIncluded?: boolean;
  UnitQuantity?: number; // integer
  UnitQuantityUnitOfMeasure?: string;
  DestinationCountryCode: string;
  /**
   * ISO 3166-1 alpha-3 code
   */
  DestinationJurisdiction: string;
  DestinationAddress1?: string;
  DestinationAddress2?: string;
  DestinationCounty?: string;
  DestinationCity: string;
  DestinationPostalCode: string;
  SaleCountryCode: string;
  SaleAddress1?: string;
  SaleAddress2?: string;
  SaleJurisdiction: string;
  SaleCounty?: string;
  SaleCity: string;
  SalePostalCode: string;
  /**
   * @default false
   */
  Discounted?: boolean;

  /**
   * @default null
   */
  OriginCountryCode?: string;
  /**
   * @default null
   */
  OriginJurisdiction?: string;
  /**
   * @default null
   */
  OriginCounty?: string;
  /**
   * @default null
   */
  OriginCity?: string;
  /**
   * @default null
   */
  OriginPostalCode?: string;
  /**
   * @default null
   */
  OriginAddress1?: string;
  /**
   * @default null
   */
  OriginAddress2?: string;

  /**
   * @default null
   */
  UserData?: string;
  /**
   * @default null
   */
  CustomString1?: string | null;
  /**
   * @default null
   */
  CustomString2?: string | null;
  /**
   * @default null
   */
  CustomString3?: string | null;
  /**
   * @description decimal
   * @default null
   */
  CustomNumeric1?: number | null;
  /**
   * @description decimal
   * @default null
   */
  CustomNumeric2?: number | null;
  /**
   * @description decimal
   * @default null
   */
  CustomNumeric3?: number | null;
}

export interface TransactionCreateRequestData {
  EffectiveDate: string;
  InvoiceDate: string;
  TitleTransferCode: "DEST";
  /**
   * # Must be DIRECT for direct to consumer e-commerece
   */
  TransactionType: "DIRECT";
  TransactionLines: Array<TransactionLine>;
  /**
   * @default null
   */
  InvoiceNumber?: string;
  /**
   * @description decimal
   * @default 0.00
   */
  Discount?: number;
  /**
   * @default null
   */
  UserTranId?: string;
}
