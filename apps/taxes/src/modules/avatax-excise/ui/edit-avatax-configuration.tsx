import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";
import { AvataxObfuscator } from "../avatax-obfuscator";
import { AvataxConfig, BaseAvataxConfig } from "../avatax-connection-schema";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import { useAvataxConfigurationStatus } from "./configuration-status";

const avataxObfuscator = new AvataxObfuscator();

export const EditAvataxConfiguration = () => {
  const { setStatus } = useAvataxConfigurationStatus();

  const router = useRouter();
  const { id } = router.query;

  const configurationId = z.string().parse(id ?? "");

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  React.useEffect(() => {
    // When editing, we know the address is verified (because it was validated when creating the configuration)
    setStatus("address_verified");
  }, [setStatus]);

  const { notifySuccess, notifyError } = useDashboardNotification();
  const { mutate: patchMutation, isLoading: isPatchLoading } =
    trpcClient.avataxConnection.update.useMutation({
      onSuccess() {
        notifySuccess("Success", "Updated AvaTax configuration");
        refetchProvidersConfigurationData();
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { mutate: deleteMutation, isLoading: isDeleteLoading } =
    trpcClient.avataxConnection.delete.useMutation({
      onSuccess() {
        notifySuccess("Success", "Deleted AvaTax configuration");
        refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const {
    data,
    isLoading: isGetLoading,
    isError: isGetError,
  } = trpcClient.avataxConnection.getById.useQuery(
    {
      id: configurationId,
    },
    {
      enabled: !!configurationId,
    },
  );

  const submitHandler = React.useCallback(
    (data: AvataxConfig) => {
      patchMutation({
        // todo: remove obfuscation
        value: avataxObfuscator.filterOutObfuscated(data),
        id: configurationId,
      });
    },
    [configurationId, patchMutation],
  );

  const deleteHandler = () => {
    /*
     * // todo: add support for window.confirm to AppBridge or wait on Dialog component in Macaw
     * if (window.confirm("Are you sure you want to delete the provider?")) {
     */
    deleteMutation({ id: configurationId });
    // }
  };

  const validateCredentialsMutation =
    trpcClient.avataxConnection.editValidateCredentials.useMutation({});

  const validateCredentialsHandler = React.useCallback(
    async (config: BaseAvataxConfig) => {
      return validateCredentialsMutation.mutateAsync({ id: configurationId, value: config });
    },
    [configurationId, validateCredentialsMutation],
  );

  const submit = React.useMemo(() => {
    return {
      isLoading: isPatchLoading,
      handleFn: submitHandler,
    };
  }, [isPatchLoading, submitHandler]);

  const validateCredentials = React.useMemo(() => {
    return {
      isLoading: validateCredentialsMutation.isLoading,
      handleFn: validateCredentialsHandler,
    };
  }, [validateCredentialsHandler, validateCredentialsMutation]);

  if (isGetLoading) {
    // todo: replace with skeleton once its available in Macaw
    return (
      <Box>
        <Text color="textNeutralSubdued">Loading...</Text>
      </Box>
    );
  }

  if (isGetError) {
    return (
      <Box>
        <Text color="textCriticalDefault">Error while fetching the provider data.</Text>
      </Box>
    );
  }

  return (
    <AvataxConfigurationForm
      submit={submit}
      validateCredentials={validateCredentials}
      defaultValues={data.config}
      leftButton={
        <Button onClick={deleteHandler} variant="error" data-testid="delete-avatax-button">
          Delete provider
        </Button>
      }
    />
  );
};
