import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import * as bitcoin from "bitcoinjs-lib";

function BtcMethodsIcon() {
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

export default function BtcMethods() {
  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.btc.signTransaction()",
      payload: null,
      handler: async () => {
        const TESTNET = bitcoin.networks.testnet;

        const tx = new bitcoin.TransactionBuilder(TESTNET);
        tx.addInput(
          "fde789dad13b52e33229baed29b11d3e6f6dd306eb159865957dce13219bf85c",
          0
        );

        tx.addOutput("mfkv2a593E1TfDVFmf1szjAkyihLowyBaT", 80000);

        const txHex = tx.buildIncomplete().toHex();

        return MagicService.magic.bitcoin.signTransaction(txHex, 0);
      },
    },
  ];
  return (
    <MethodsCard
      title="Btc Methods"
      description="Test Btc methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<BtcMethodsIcon />}
    />
  );
}
