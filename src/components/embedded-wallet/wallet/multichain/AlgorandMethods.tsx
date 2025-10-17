import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import algosdk from "algosdk";

function AlgorandMethodsIcon() {
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

export default function AlgorandMethods() {
  const { publicAddress } = useEmbeddedWallet();

  let client: algosdk.Algodv2 | null = null;
  function setupClient() {
    if (client == null) {
      let algodClient = new algosdk.Algodv2(
        "",
        "https://testnet-api.algonode.cloud",
        ""
      );
      client = algodClient;
    } else {
      return client;
    }
    return client;
  }

  const tabs = [
    {
      value: "get-wallet",
      label: "Get Wallet",
      functionName: "magic.algod.getWallet()",
      payload: null,
      handler: () => MagicService.magic.algod.getWallet(),
    },
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.algod.signTransaction(transaction)",
      payload: null,
      handler: async () => {
        const algodClient = setupClient();
        let params = await algodClient.getTransactionParams().do();
        let note = new TextEncoder().encode("Hello World");
        let txn = algosdk.makePaymentTxnWithSuggestedParams(
          publicAddress as string,
          publicAddress as string,
          1000,
          undefined,
          note,
          params
        );

        let encodedTxn = algosdk.encodeObj(txn.get_obj_for_encoding());

        return MagicService.magic.algod.signTransaction(encodedTxn);
      },
    },
    {
      value: "sign-bid",
      label: "Sign Bid",
      functionName: "magic.algod.signBid(bid)",
      payload: {
        bidderKey: publicAddress,
        auctionKey: publicAddress,
        bidAmount: 1_000_000, // 1 Algo
        maxPrice: 1_500_000,
        bidID: 1001,
        auctionID: 2002,
      },
      handler: async () => {
        const bid = {
          bidderKey: publicAddress,
          auctionKey: publicAddress,
          bidAmount: 1_000_000, // 1 Algo
          maxPrice: 1_500_000,
          bidID: 1001,
          auctionID: 2002,
        };

        return MagicService.magic.algod.signBid(bid);
      },
    },
    {
      value: "sign-group-transaction",
      label: "Sign Group Transaction",
      functionName: "magic.algod.signGroupTransaction(txns)",
      payload: [
        {
          from: publicAddress,
          to: publicAddress,
          amount: 1000,
          closeRemainderTo: undefined,
          note: undefined,
          suggestedParams: "params",
        },
        {
          from: publicAddress,
          to: publicAddress,
          amount: 1000,
          closeRemainderTo: undefined,
          note: undefined,
          suggestedParams: "params",
        },
      ],
      handler: async () => {
        const algodClient = await setupClient();

        let params = await algodClient.getTransactionParams().do();

        const txns = [
          {
            from: publicAddress,
            to: publicAddress,
            amount: 1000,
            closeRemainderTo: undefined,
            note: undefined,
            suggestedParams: params,
          },
          {
            from: publicAddress,
            to: publicAddress,
            amount: 1000,
            closeRemainderTo: undefined,
            note: undefined,
            suggestedParams: params,
          },
        ];

        const safePayload = JSON.parse(
          JSON.stringify(txns, (k, v) =>
            typeof v === "bigint" ? Number(v) : v
          )
        );

        return MagicService.magic.algod.signGroupTransaction(safePayload);
      },
    },
    {
      value: "sign-group-transaction-V2",
      label: "Sign Group Transaction V2",
      functionName: "magic.algod.signGroupTransaction(txns)",
      payload: null,
      handler: async () => {
        const algodClient = setupClient();
        const params = await algodClient.getTransactionParams().do();

        const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: publicAddress as string,
          to: publicAddress as string,
          amount: 1000,
          note: new Uint8Array(Buffer.from("group v2 tx1")),
          suggestedParams: params,
        });

        const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: publicAddress as string,
          to: publicAddress as string,
          amount: 2000,
          note: new Uint8Array(Buffer.from("group v2 tx2")),
          suggestedParams: params,
        });

        const group = algosdk.assignGroupID([txn1, txn2]);

        const paramsArray = group.map((txn) => ({
          txn: Buffer.from(txn.toByte()).toString("base64"),
        }));

        return MagicService.magic.algod.signGroupTransactionV2(paramsArray);
      },
    },
  ];
  return (
    <MethodsCard
      title="Algorand Methods"
      description="Test Algod methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<AlgorandMethodsIcon />}
    />
  );
}
