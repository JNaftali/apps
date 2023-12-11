import Avatax from "avatax";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { VoidReasonCode } from "avatax/lib/enums/VoidReasonCode";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LogOptions } from "avatax/lib/utils/logger";
import packageJson from "../../../package.json";
import { AvataxClientTaxCodeService } from "./avatax-client-tax-code.service";
import { BaseAvataxConfig } from "./avatax-connection-schema";
import { createLogger } from "@saleor/apps-shared";

type AvataxSettings = {
  appName: string;
  appVersion: string;
  environment: "sandbox" | "production";
  machineName: string;
  timeout: number;
  logOptions?: LogOptions;
};

export type CommitTransactionArgs = {
  companyCode: string;
  transactionCode: string;
  model: CommitTransactionModel;
  documentType: DocumentType;
};

export type CreateTransactionArgs = {
  model: CreateTransactionModel;
};

export type ValidateAddressArgs = {
  address: AvataxAddress;
};

export type VoidTransactionArgs = {
  transactionCode: string;
  companyCode: string;
};

export class AvataxExciseClient {
  private logger = createLogger({ name: "AvataxExciseClient" });
  private baseUrl: string;
  private credentials: BaseAvataxConfig["credentials"];

  constructor(baseConfig: BaseAvataxConfig) {
    if (baseConfig.isSandbox) {
      this.baseUrl = "https://excisesbx.avalara.com";
    } else {
      this.baseUrl = "https://excise.avalara.com";
    }
    this.credentials = baseConfig.credentials;
  }

  private callEndpoint(endpoint: string, init?: RequestInit) {
    const url = new URL(`/api/v1/${endpoint}`, this.baseUrl);
    const headers = new Headers(init?.headers);

    headers.set(
      "Authorization",
      "Basic " +
        Buffer.from(this.credentials.username + ":" + this.credentials.password).toString("base64"),
    );

    return fetch(url, { ...init, headers }).then((r) => r.json());
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    /*
     * We use createOrAdjustTransaction instead of createTransaction because
     * we must guarantee a way of idempotent update of the transaction due to the
     * migration requirements. The transaction can be created in the old flow, but committed in the new flow.
     */
    return this.client.createOrAdjustTransaction({ model: { createTransactionModel: model } });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    return this.client.commitTransaction(args);
  }

  async voidTransaction({
    transactionCode,
    companyCode,
  }: {
    transactionCode: string;
    companyCode: string;
  }) {
    return this.client.voidTransaction({
      transactionCode,
      companyCode,
      model: { code: VoidReasonCode.DocVoided },
    });
  }

  async validateAddress({ address }: ValidateAddressArgs) {
    return this.client.resolveAddress(address);
  }

  async getTaxCodes() {
    const taxCodeService = new AvataxClientTaxCodeService(this.client);

    return taxCodeService.getTaxCodes();
  }

  async ping() {
    return this.callEndpoint("Utilities/Ping");
  }

  async getEntityUseCode(useCode: string) {
    return this.client.listEntityUseCodes({
      // https://developer.avalara.com/avatax/filtering-in-rest/
      filter: `code eq ${useCode}`,
    });
  }
}
