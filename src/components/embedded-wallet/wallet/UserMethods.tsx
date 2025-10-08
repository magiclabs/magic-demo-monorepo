import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

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
    value: "show-settings",
    label: "Show Settings",
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
