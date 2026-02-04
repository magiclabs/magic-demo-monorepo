import { MethodsCard } from "@/components/MethodsCard";
import { Network, useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useEffect, useState } from "react";

export function UserMethods() {
  const { selectedNetwork } = useEmbeddedWallet();
  const [isWalletLogin, setIsWalletLogin] = useState(false);

  useEffect(() => {
    setIsWalletLogin(
      localStorage.getItem("magic_widget_login_method") === "wallet"
    );
  }, []);
  const evmNetworks = [Network.POLYGON, Network.ETHEREUM, Network.OPTIMISM];
  const showEvmMethods = evmNetworks.includes(selectedNetwork);
  const capitalNetworkName =
    selectedNetwork[0].toUpperCase() + selectedNetwork.slice(1);

  const revealPrivateKeyTab = showEvmMethods
    ? {
        value: "reveal-private-key",
        label: "Reveal EVM Private Key",
        functionName: "magic.user.revealEVMPrivateKey()",
        payload: null,
        handler: () => MagicService.magic.user.revealEVMPrivateKey(),
        disabled: isWalletLogin,
      }
    : {
        value: "reveal-private-key",
        label: `Reveal ${capitalNetworkName} Private Key`,
        functionName: `magic.${selectedNetwork}.revealPrivateKey()`,
        payload: null,
        handler: () => MagicService.magic[selectedNetwork].revealPrivateKey(),
        disabled: isWalletLogin,
      };

  const tabs = [
    {
      value: "is-logged-in",
      label: "Is Logged In",
      functionName: "magic.user.isLoggedIn()",
      payload: null,
      handler: () => MagicService.magic.user.isLoggedIn(),
    },
    {
      value: "get-info",
      label: "Get Info",
      functionName: "magic.user.getInfo()",
      payload: null,
      handler: () => MagicService.magic.user.getInfo(),
    },
    {
      value: "logout",
      label: "Logout",
      functionName: "magic.user.logout()",
      payload: null,
      handler: () => MagicService.magic.user.logout(),
    },
    {
      value: "get-id-token",
      label: "Get ID Token",
      functionName: "magic.user.getIdToken()",
      payload: null,
      handler: () => MagicService.magic.user.getIdToken(),
      disabled: isWalletLogin,
    },
    {
      value: "generate-id-token",
      label: "Generate ID Token",
      functionName: "magic.user.generateIdToken()",
      payload: null,
      handler: () => MagicService.magic.user.generateIdToken(),
      disabled: isWalletLogin,
    },
    {
      value: "show-settings",
      label: "Show Settings",
      functionName: "magic.user.showSettings()",
      payload: null,
      handler: () => MagicService.magic.user.showSettings(),
      disabled: isWalletLogin,
    },
    // {
    //   value: "recover-account",
    //   label: "Recover Account",
    //   functionName: "magic.user.recoverAccount()",
    //   payload: null,
    //   handler: () =>
    //     MagicService.magic.user.getInfo().then((user: MagicUserMetadata) =>
    //       MagicService.magic.user
    //         .logout()
    //         .then(() =>
    //           MagicService.magic.user.recoverAccount({ email: user.email })
    //         )
    //         .catch((error: unknown) => {
    //           logToConsole(
    //             LogType.ERROR,
    //             LogMethod.MAGIC_USER_RECOVER_ACCOUNT,
    //             "Error recovering account",
    //             error
    //           );
    //           logToConsole(
    //             LogType.INFO,
    //             LogMethod.MAGIC_USER_RECOVER_ACCOUNT,
    //             "Redirecting to auth page"
    //           );
    //           router.push("/embedded-wallet");
    //         })
    //     ),
    // },
    revealPrivateKeyTab,
    {
      value: "enable-mfa",
      label: "Enable MFA",
      functionName: "magic.user.enableMFA({showUI: true})",
      payload: null,
      handler: () => MagicService.magic.user.enableMFA({ showUI: true }),
      disabled: isWalletLogin,
    },
    {
      value: "disable-mfa",
      label: "Disable MFA",
      functionName: "magic.user.disableMFA({showUI: true})",
      payload: null,
      handler: () => MagicService.magic.user.disableMFA({ showUI: true }),
      disabled: isWalletLogin,
    },
  ];

  return (
    <MethodsCard
      title="User Methods"
      description="Test various user methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
    />
  );
}
