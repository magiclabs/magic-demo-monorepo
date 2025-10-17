import { AlgorandExtension } from "@magic-ext/algorand";
import { BitcoinExtension } from "@magic-ext/bitcoin";
import { CosmosExtension } from "@magic-ext/cosmos";
import { AvalancheExtension } from "@magic-ext/avalanche";
import { EVMExtension } from "@magic-ext/evm";
import { HederaExtension } from "@magic-ext/hedera";
import { IconExtension } from "@magic-ext/icon";
import { KadenaExtension } from "@magic-ext/kadena";
import { OAuthExtension } from "@magic-ext/oauth2";
import { SolanaExtension } from "@magic-ext/solana";
import { ethers } from "ethers";
import { Magic } from "magic-sdk";
import { NearExtension } from "@magic-ext/near";
import { PolkadotExtension } from "@magic-ext/polkadot";

const customPolygonOptions = {
  rpcUrl: "https://polygon-rpc.com/", // Polygon RPC URL
  chainId: 137, // Polygon chain id
  default: true, // Set as default network
};

const customOptimismOptions = {
  rpcUrl: "https://mainnet.optimism.io",
  chainId: 10,
};

export class MagicService {
  private static _magic: any = null;
  private static _provider: ethers.BrowserProvider | null = null;

  public static get magic(): any {
    if (!this._magic) {
      this._magic = new Magic("pk_live_493172A4D3AFF148", {
        extensions: [
          new OAuthExtension(),
          new SolanaExtension({
            rpcUrl: "https://api.devnet.solana.com",
          }),
          new HederaExtension({
            network: "mainnet",
          }),
          new EVMExtension([customPolygonOptions, customOptimismOptions]),
          new AlgorandExtension({
            rpcUrl: "https://testnet-api.algonode.cloud",
          }),
          // new AptosExtension({
          //   nodeUrl: "https://fullnode.testnet.aptoslabs.com",
          // }), // Getting errors, needs investigation
          // new AvalancheExtension({
          //   rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
          //   chainId: "43113",
          //   networkId: 1,
          // }), // Getting errors, needs investigation
          new BitcoinExtension({
            network: "testnet",
            rpcUrl: "BTC_RPC_NODE_URL",
          }),
          // new CosmosExtension({
          //   rpcUrl: "https://rpc.testnet.osmosis.zone",
          // }),
          new IconExtension({
            rpcUrl: "https://sejong.net.solidwallet.io/api/v3",
          }),
          new KadenaExtension({
            rpcUrl:
              "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/0/pact",
            networkId: "testnet04", // Kadena testnet network name
            chainId: "0", // Chain index
          }),
          new NearExtension({
            rpcUrl: "https://rpc.testnet.near.org",
          }),
          new PolkadotExtension({
            rpcUrl: "wss://rococo-rpc.polkadot.io/",
          }),
        ],
      });
    }
    return this._magic;
  }

  public static get provider(): ethers.BrowserProvider {
    if (!this._provider) {
      this._provider = new ethers.BrowserProvider(
        // cast as any if necessary; Magic's rpcProvider type is slightly different
        MagicService.magic.rpcProvider as any
      );
    }
    return this._provider;
  }
}
