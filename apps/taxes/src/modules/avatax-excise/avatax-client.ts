import { DocumentType } from "avatax/lib/enums/DocumentType";
import { VoidReasonCode } from "avatax/lib/enums/VoidReasonCode";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { BaseAvataxConfig } from "./avatax-connection-schema";
import { createLogger } from "@saleor/apps-shared";
import invariant from "tiny-invariant";

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

  constructor(config: BaseAvataxConfig) {
    if (config.isSandbox) {
      this.baseUrl = "https://excisesbx.avalara.com";
    } else {
      this.baseUrl = "https://excise.avalara.com";
    }
    this.credentials = config.credentials;
  }

  private callEndpoint(endpoint: string, init?: RequestInit, payload?: {} | null | undefined) {
    const url = new URL(`/api/v1/AvaTaxExcise/${endpoint}`, this.baseUrl);
    const headers = mergeHeaders(init?.headers ?? [], {
      Accept: "application/json",
      Authorization:
        "Basic " +
        Buffer.from(this.credentials.username + ":" + this.credentials.password).toString("base64"),
      "Content-Type": "Application/JSON",
      "X-Avalara-Client": "Saleor Excise App",
    });

    return fetch(url, {
      ...init,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    }).then((r) => r.json());
  }

  getHeaders(context: { companyCode?: string }): HeadersInit {
    invariant(context.companyCode, "companyCode is required");
    return [["x-company-id", context.companyCode]];
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    /*
     * We use createOrAdjustTransaction instead of createTransaction because
     * we must guarantee a way of idempotent update of the transaction due to the
     * migration requirements. The transaction can be created in the old flow, but committed in the new flow.
     */

    return this.callEndpoint(
      "transactions/createoradjust",
      {
        method: "POST",
        headers: this.getHeaders(model),
      },
      model,
    );
  }

  async commitTransaction(args: CommitTransactionArgs) {
    return this.callEndpoint(`transactions/${args.transactionCode}/commit`, {
      method: "POST",
      headers: this.getHeaders(args),
    });
  }

  async voidTransaction({
    transactionCode,
    companyCode,
  }: {
    transactionCode: string;
    companyCode: string;
  }) {
    return this.callEndpoint(
      `transactions/${transactionCode}/void`,
      {
        method: "POST",
        headers: this.getHeaders({ companyCode }),
      },
      { model: { code: VoidReasonCode.DocVoided } },
    );
  }

  async ping() {
    return this.callEndpoint("Utilities/Ping");
  }
}

function mergeHeaders(...headers: Array<HeadersInit>) {
  const result = new Headers();

  for (let hinit of headers) {
    new Headers(hinit).forEach((value, key) => {
      result.set(key, value);
    });
  }
  return result;
}
