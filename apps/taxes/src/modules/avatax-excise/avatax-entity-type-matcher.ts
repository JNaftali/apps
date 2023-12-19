import { Logger, createLogger } from "../../lib/logger";
import { AvataxExciseClient } from "./avatax-client";

/*
 * Arbitrary key-value pair that is used to store the entity code in the metadata.
 * see: https://docs.saleor.io/docs/3.x/developer/app-store/apps/taxes/avatax#mapping-the-entity-type
 */
const AVATAX_ENTITY_CODE = "avataxEntityCode";

export class AvataxEntityTypeMatcher {
  private client: AvataxExciseClient;
  private logger: Logger;

  constructor({ client }: { client: AvataxExciseClient }) {
    this.client = client;
    this.logger = createLogger({
      name: "AvataxEntityTypeMatcher",
    });
  }

  private returnFallback() {
    // Empty string will be treated as non existing entity code.
    return "";
  }

  private async validateEntityCode(entityCode: string) {
    // Todo: actually do this? Maybe?
    // const result = await this.client.getEntityUseCode(entityCode);

    // If verified, return the entity code. If not, return empty string.
    // return result.value?.[0].code || this.returnFallback();
    return this.returnFallback();
  }

  async match(entityCode: string | null | undefined) {
    if (!entityCode) {
      return this.returnFallback();
    }

    try {
      return this.validateEntityCode(entityCode);
    } catch (error) {
      this.logger.debug({ error }, "Failed to verify entity code");
      return this.returnFallback();
    }
  }
}
