import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

function CosmosMethodsIcon() {
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

export default function CosmosMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.cosmos.signTransaction()",
      payload: null,
      handler: async () => {
        const message = [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: publicAddress,
              toAddress: publicAddress,
              amount: [
                {
                  amount: String(100),
                  denom: "atom",
                },
              ],
            },
          },
        ];
        const fee = {
          amount: [{ denom: "uatom", amount: "500" }],
          gas: "200000",
        };

        return await MagicService.magic.cosmos.sign(message, fee);
      },
    },
  ];
  return (
    <MethodsCard
      title="Cosmos Methods"
      description="Test Cosmos methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<CosmosMethodsIcon />}
    />
  );
}
