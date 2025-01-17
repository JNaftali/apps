import { Box, Text } from "@saleor/macaw-ui";
import { Provider } from "jotai";
import { AvataxInstructions } from "../../../modules/avatax-excise/ui/avatax-instructions";
import { CreateAvataxConfiguration } from "../../../modules/avatax-excise/ui/create-avatax-configuration";
import { AppPageLayout } from "../../../modules/ui/app-page-layout";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Create new AvaTax configuration
      </Text>
    </Box>
  );
};

const NewAvataxPage = () => {
  return (
    <AppPageLayout
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
        {
          href: "/providers",
          label: "Providers",
        },
        {
          href: "/providers/avataxExcise",
          label: "AvaTax Excise",
        },
      ]}
      top={<Header />}
    >
      <AvataxInstructions />
      <Provider>
        <CreateAvataxConfiguration />
      </Provider>
    </AppPageLayout>
  );
};

export default NewAvataxPage;
