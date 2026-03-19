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

const customBaseOptions = {
  rpcUrl: "https://mainnet.base.org",
  chainId: 8453,
};

const CHAIN_CONFIG: Record<
  string,
  { chainId: string; rpcUrl: string; name: string }
> = {
  ethereum: {
    chainId: "0x1",
    rpcUrl: "https://eth.llamarpc.com",
    name: "Ethereum",
  },
  polygon: {
    chainId: "0x89",
    rpcUrl: "https://polygon.drpc.org",
    name: "Polygon",
  },
  optimism: {
    chainId: "0xa",
    rpcUrl: "https://mainnet.optimism.io",
    name: "Optimism",
  },
  base: { chainId: "0x2105", rpcUrl: "https://mainnet.base.org", name: "Base" },
};

export class MagicService {
  private static _magic: any = null;

  static async switchChain(network: string) {
    const config = CHAIN_CONFIG[network];
    if (!config) return; // non-EVM networks (solana, hedera)
    try {
      await MagicService.magic.rpcProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });
    } catch {
      await MagicService.magic.rpcProvider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: config.chainId,
            chainName: config.name,
            rpcUrls: [config.rpcUrl],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          },
        ],
      });
    }
  }

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
            new EVMExtension([
              customPolygonOptions,
              customOptimismOptions,
              customBaseOptions,
            ]),
            new WalletKitExtension(),
          ],
        },
      );
    }
    return this._magic;
  }

  public static get provider(): ethers.BrowserProvider {
    // Create a fresh provider each time to pick up chain switches
    return new ethers.BrowserProvider(MagicService.magic.rpcProvider as any);
  }
}
