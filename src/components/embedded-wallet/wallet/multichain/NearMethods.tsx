import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import * as nearAPI from "near-api-js";
import { type QueryResponseKind } from "near-api-js/lib/providers/provider";

function NearMethodsIcon() {
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

export default function NearMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.near.signTransaction()",
      payload: {
        rawTransaction: 'base64 encoded transaction',
        networkID: "testnet",
      },
      handler: async () => {
        const publicKeyString = await MagicService.magic.near.getPublicKey();

        const publicKey = nearAPI.utils.PublicKey.fromString(publicKeyString);

        const actions = [nearAPI.transactions.transfer(BigInt(1))];
        const provider = new nearAPI.providers.JsonRpcProvider({
          url: `https://rpc.testnet.near.org`,
        });
        let accessKey: QueryResponseKind;

        try {
          accessKey = await provider.query(
            `access_key/${publicAddress}/${publicKey.toString()}`,
            ""
          );
        } catch (error) {
          accessKey = {
            block_hash: "AswGYz1J1FEEJW9c6aRKppZVPivzSKMGn5tVmJWANpJ9",
            block_height: 158227802,
            // @ts-expect-error allow nonce number
            nonce: 158161839000003,
            permission: "FullAccess",
          };
        }

        const recentBlockHash = nearAPI.utils.serialize.base_decode(
          accessKey.block_hash
        );

        const transaction = nearAPI.transactions.createTransaction(
          publicAddress as string,
          publicKey,
          publicAddress as string,
          0,
          actions,
          recentBlockHash
        );

        const rawTransaction = transaction.encode();

        const result = await MagicService.magic.near.signTransaction({
          rawTransaction,
          networkID: "testnet",
        });

        const signedTransaction = nearAPI.transactions.SignedTransaction.decode(
          Buffer.from(result.encodedSignedTransaction)
        );

        const safeJsonResult = JSON.parse(
          JSON.stringify(signedTransaction, (k, v) =>
            typeof v === "bigint" ? Number(v) : v
          )
        );

        return safeJsonResult;
      },
    },
    {
      value: "get-public-key",
      label: "Get Public Key",
      functionName: "magic.near.getPublicKey()",
      payload: null,
      handler: async () => {
        return await MagicService.magic.near.getPublicKey();
      },
    }
  ];
  return (
    <MethodsCard
      title="Near Methods"
      description="Test Near methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<NearMethodsIcon />}
    />
  );
}
