import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { Pact } from "@kadena/client";
import { PactNumber } from "@kadena/pactjs";

function KadenaMethodsIcon() {
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

export default function KadenaMethods() {
  const { publicAddress } = useEmbeddedWallet();

  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.kadena.signTransaction()",
      payload: null,
      handler: async () => {
        const chainId = "1";
        const networkId = "testnet04";
        const toAccount = publicAddress;
        const senderPublicKey = publicAddress?.substring(2);
        const receiverPublicKey = toAccount?.substring(2);
        const amount = new PactNumber("0.0001").toPactDecimal();

        const transaction = Pact.builder
          .execution(
            (Pact.modules as any).coin.transfer(
              publicAddress,
              toAccount,
              amount
            )
          )
          .addData("receiverKeyset", {
            keys: [receiverPublicKey],
            pred: "keys-all",
          })
          .addSigner(senderPublicKey as string, (withCapability: any) => [
            withCapability("coin.GAS"),
            withCapability("coin.TRANSFER", publicAddress, toAccount, amount),
          ])
          .setMeta({ chainId, senderAccount: publicAddress! })
          .setNetworkId(networkId)
          .createTransaction();

        return await MagicService.magic.kadena.signTransaction(
          transaction.hash
        );
      },
    },
    // {
    //   value: "sign-transaction-with-spirekey",
    //   label: "Sign Transaction with Spirekey",
    //   functionName: "magic.kadena.signTransaction(transaction)",
    //   payload: null,
    //   handler: async () => {
    //     const chainId = "1";
    //     const networkId = "testnet04";

    //     const publicAddress1 =
    //       await MagicService.magic.kadena.getPublicAddress();

    //     console.log({ publicAddress1 });

    //     const senderPublicKey = publicAddress?.substring(2);

    //     const toAccount = publicAddress;
    //     const receiverPublicKey = toAccount?.substring(2);

    //     const amount = new PactNumber("0.0001").toPactDecimal();

    //     const transaction = Pact.builder
    //       .execution(
    //         (Pact.modules as any).coin.transfer(
    //           publicAddress,
    //           toAccount,
    //           amount
    //         )
    //       )
    //       .addSigner(
    //         {
    //           pubKey: senderPublicKey as string,
    //           scheme: "WebAuthn",
    //         },
    //         (withCapability: any) => [
    //           withCapability("coin.GAS"),
    //           withCapability("coin.TRANSFER", publicAddress, toAccount, amount),
    //         ]
    //       )
    //       .addData("receiverKeyset", {
    //         keys: [receiverPublicKey],
    //         pred: "keys-all",
    //       })
    //       .setMeta({ chainId, senderAccount: publicAddress! })
    //       .setNetworkId(networkId)
    //       .createTransaction();

    //     return await MagicService.magic.kadena.signTransactionWithSpireKey(
    //       transaction
    //     );
    //   },
    // },
  ];
  return (
    <MethodsCard
      title="Kadena Methods"
      description="Test Kadena methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<KadenaMethodsIcon />}
    />
  );
}
