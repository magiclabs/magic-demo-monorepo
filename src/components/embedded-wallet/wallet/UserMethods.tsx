import { MethodsCard } from "@/components/MethodsCard";
import { LogMethod, LogType, useConsole } from "@/contexts/ConsoleContext";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { MagicUserMetadata } from "magic-sdk";
import { useRouter } from "next/navigation";

export function UserMethods() {
  const router = useRouter();
  const { logToConsole } = useConsole();
  const { selectedNetwork } = useEmbeddedWallet();
  const evmNetworks = ["polygon", "ethereum", "optimism"];
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
      }
    : {
        value: "reveal-private-key",
        label: `Reveal ${capitalNetworkName} Private Key`,
        functionName: `magic.${selectedNetwork}.revealPrivateKey()`,
        payload: null,
        handler: () => MagicService.magic[selectedNetwork].revealPrivateKey(),
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
    },
    {
      value: "generate-id-token",
      label: "Generate ID Token",
      functionName: "magic.user.generateIdToken()",
      payload: null,
      handler: () => MagicService.magic.user.generateIdToken(),
    },
    {
      value: "show-settings",
      label: "Show Settings",
      functionName: "magic.user.showSettings()",
      payload: null,
      handler: () => MagicService.magic.user.showSettings(),
    },
    {
      value: "recover-account",
      label: "Recover Account",
      functionName: "magic.user.recoverAccount()",
      payload: null,
      handler: () =>
        MagicService.magic.user.getInfo().then((user: MagicUserMetadata) =>
          MagicService.magic.user
            .logout()
            .then(() =>
              MagicService.magic.user.recoverAccount({ email: user.email })
            )
            .catch((error: unknown) => {
              logToConsole(
                LogType.ERROR,
                LogMethod.MAGIC_USER_RECOVER_ACCOUNT,
                "Error recovering account",
                error
              );
              logToConsole(
                LogType.INFO,
                LogMethod.MAGIC_USER_RECOVER_ACCOUNT,
                "Redirecting to auth page"
              );
              router.push("/embedded-wallet");
            })
        ),
    },
    revealPrivateKeyTab,
    {
      value: "enable-mfa",
      label: "Enable MFA",
      functionName: "magic.user.enableMFA({showUI: true})",
      payload: null,
      handler: () => MagicService.magic.user.enableMFA({showUI: true}),
    },
    {
      value: "disable-mfa",
      label: "Disable MFA",
      functionName: "magic.user.disableMFA({showUI: true})",
      payload: null,
      handler: () => MagicService.magic.user.disableMFA({showUI: true}),
    },
  ];

  return (
    <MethodsCard
      title="User Methods"
      description="Test various user methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<UserMethodsIcon />}
    />
  );
}

function UserMethodsIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
