import { AvataxConfig } from "./avatax-connection-schema";

const defaultAvataxConfig: AvataxConfig = {
  companyCode: "DEFAULT",
  isAutocommit: false,
  isSandbox: true,
  name: "Avatax-1",
  shippingTaxCode: "FR000000",
  isDocumentRecordingEnabled: true,
  credentials: {
    password: "password",
    username: "username",
  },
};

const testingScenariosMap = {
  default: defaultAvataxConfig,
};

export class AvataxConfigMockGenerator {
  constructor(private scenario: keyof typeof testingScenariosMap = "default") {}

  generateAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario],
      ...overrides,
    });
}
