import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { Section } from "../../ui/app-section";

export const AvataxInstructions = () => {
  return (
    <Section.Description
      title="AvaTax Configuration"
      description={
        <>
          <Text as="p" marginBottom={8}>
            The form consists of two sections: <i>Credentials</i> and <i>Address</i>.
          </Text>
          <Text as="p">
            <i>Credentials</i> will fail if:
          </Text>
          <Box as="ol" marginBottom={1}>
            <li>
              <Text>- The username or password are incorrect.</Text>
            </li>
            <li>
              <Text>
                - The combination of username and password do not match &quot;sandbox mode&quot;
                setting.
              </Text>
            </li>
          </Box>
          <Text as="p" marginBottom={8}>
            You must verify the credentials by clicking the <Text variant="bodyStrong">Verify</Text>{" "}
            button.
          </Text>
        </>
      }
    />
  );
};
