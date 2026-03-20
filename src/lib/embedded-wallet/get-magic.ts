import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { SolanaExtension } from "@magic-ext/solana";
import { HederaExtension } from "@magic-ext/hedera";
import { EVMExtension } from "@magic-ext/evm";
import { ethers } from "ethers";
import { WalletKitExtension } from "@magic-ext/wallet-kit";

const customPolygonOptions = {
  rpcUrl: "https://polygon.drpc.org", // Polygon RPC URL
  chainId: 137, // Polygon chain id
  default: true, // Set as default network
};

const customOptimismOptions = {
  rpcUrl: "https://mainnet.optimism.io",
  chainId: 10,
};

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  polygon: 137,
  optimism: 10,
};

export class MagicService {
  private static _magic: any = null;

  public static get magic(): any {
    if (!this._magic) {
      this._magic = new Magic(
        process.env.NEXT_PUBLIC_MAGIC_EMBEDDED_WALLET_KEY ?? "",
        {
          extensions: [
            new OAuthExtension(),
            new SolanaExtension({
              rpcUrl: "https://api.devnet.solana.com",
            }),
            new HederaExtension({
              network: "mainnet",
            }),
            new EVMExtension([customPolygonOptions, customOptimismOptions]),
            new WalletKitExtension(),
          ],
        },
      );
    }
    return this._magic;
  }

  public static get provider(): ethers.BrowserProvider {
    return new ethers.BrowserProvider(MagicService.magic.rpcProvider as any);
  }

  static async switchChain(network: string) {
    const chainId = CHAIN_IDS[network];
    if (!chainId) return;
    await MagicService.magic.evm.switchChain(chainId);
  }
}
