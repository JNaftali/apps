import { createLogger, Logger } from "../../../lib/logger";
import { AvataxExciseClient } from "../avatax-client";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxAuthValidationService {
  private logger: Logger;

  constructor(private avataxClient: AvataxExciseClient) {
    this.logger = createLogger({
      name: "AvataxAuthValidationService",
    });
  }

  async validate() {
    try {
      const result = await this.avataxClient.ping();

      if (!result.authenticated) {
        throw new Error("Invalid AvaTax credentials.");
      }
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
