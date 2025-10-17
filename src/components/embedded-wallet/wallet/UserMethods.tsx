import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

const tabs = [
  {
    value: "is-logged-in",
    label: "isLoggedIn",
    functionName: "magic.user.isLoggedIn()",
    payload: null,
    handler: () => MagicService.magic.user.isLoggedIn(),
  },
  {
    value: "get-info",
    label: "getInfo",
    functionName: "magic.user.getInfo()",
    payload: null,
    handler: () => MagicService.magic.user.getInfo(),
  },
  {
    value: "show-settings",
    label: "showSettings",
    functionName: "magic.user.showSettings()",
    payload: null,
    handler: () => MagicService.magic.user.showSettings(),
  },
];

export function UserMethods() {
  return (
    <MethodsCard
      title="User Methods"
      description="Test various user methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
    />
  );
}
