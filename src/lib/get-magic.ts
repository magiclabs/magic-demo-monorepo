import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { SolanaExtension } from "@magic-ext/solana";
import { HederaExtension } from "@magic-ext/hedera";
import { EVMExtension } from "@magic-ext/evm";
import { ethers } from "ethers";

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
            network: 'mainnet',
          }),
          new EVMExtension([customPolygonOptions, customOptimismOptions]),
        ],
      });
    }
    return this._magic;
  }

  // Whitelabel Email OTP methods
  public static async sendEmailOTP(email: string): Promise<void> {
    try {
      await this.magic.auth.loginWithEmailOTP({ 
        email, 
        showUI: false 
      });
    } catch (error) {
      console.error('Error sending email OTP:', error);
      throw error;
    }
  }

  public static async verifyEmailOTP(email: string, code: string): Promise<string> {
    try {
      const didToken = await this.magic.auth.loginWithEmailOTP({
        email,
        code,
        showUI: false
      });
      return didToken;
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      throw error;
    }
  }

  public static get provider(): ethers.BrowserProvider {
    if (!this._provider) {
      this._provider = new ethers.BrowserProvider(
        // cast as any if necessary; Magic’s rpcProvider type is slightly different
        MagicService.magic.rpcProvider as any
      );
    }
    return this._provider;
  }
}