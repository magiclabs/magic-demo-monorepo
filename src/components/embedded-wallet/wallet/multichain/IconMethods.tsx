import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
// @ts-expect-error no types for icon-sdk-js
import IconService from "icon-sdk-js";

function IconMethodsIcon() {
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
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

export default function IconMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const { IconBuilder, IconAmount, IconConverter } = IconService;

  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.icon.signTransaction()",
      payload: null,
      handler: async () => {
        const sendICXAmount = "10";

        // Build a transaction
        const txObj = new IconBuilder.IcxTransactionBuilder()
          .from(publicAddress)
          .to(publicAddress)
          .value(IconAmount.of(sendICXAmount, IconAmount.Unit.ICX).toLoop())
          .stepLimit(IconConverter.toBigNumber(100000))
          .nid(IconConverter.toBigNumber(3))
          .nonce(IconConverter.toBigNumber(1))
          .version(IconConverter.toBigNumber(3))
          .timestamp(new Date().getTime() * 1000)
          .build();

        // Send a transaction
        return await MagicService.magic.icon.signTransaction(txObj);
      },
    },
  ];
  return (
    <MethodsCard
      title="Icon Methods"
      description="Test Icon methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<IconMethodsIcon />}
    />
  );
}
