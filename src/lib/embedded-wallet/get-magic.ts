import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { SolanaExtension } from "@magic-ext/solana";
import { HederaExtension } from "@magic-ext/hedera";
import { EVMExtension } from "@magic-ext/evm";
import { ethers } from "ethers";
import { AlgorandExtension } from "@magic-ext/algorand";

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
      this._magic = new Magic('pk_live_493172A4D3AFF148', {
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
