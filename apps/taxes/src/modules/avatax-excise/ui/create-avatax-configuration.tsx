import React from "react";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import { AvataxConfig, BaseAvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { Button } from "@saleor/macaw-ui";

export const CreateAvataxConfiguration = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.avataxExciseConnection.create.useMutation({
      async onSuccess() {
        notifySuccess("Success", "Provider created");
        await refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const validateCredentialsMutation =
    trpcClient.avataxExciseConnection.createValidateCredentials.useMutation({});

  const validateCredentialsHandler = React.useCallback(
    async (config: BaseAvataxConfig) => {
      return validateCredentialsMutation.mutateAsync({ value: config });
    },
    [validateCredentialsMutation],
  );

  const submitHandler = React.useCallback(
    (data: AvataxConfig) => {
      createMutation({ value: data });
    },
    [createMutation],
  );

  const submit = React.useMemo(() => {
    return {
      isLoading: isCreateLoading,
      handleFn: submitHandler,
    };
  }, [isCreateLoading, submitHandler]);

  const validateCredentials = React.useMemo(() => {
    return {
      isLoading: validateCredentialsMutation.isLoading,
      handleFn: validateCredentialsHandler,
    };
  }, [validateCredentialsHandler, validateCredentialsMutation]);

  return (
    <AvataxConfigurationForm
      submit={submit}
      validateCredentials={validateCredentials}
      defaultValues={defaultAvataxConfig}
      leftButton={
        <Button
          onClick={() => router.push("/configuration")}
          variant="tertiary"
          data-testid="create-avatax-cancel-button"
        >
          Cancel
        </Button>
      }
    />
  );
};
