import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { tempo } from './tempo';
import { MagicService } from './get-magic';


export const publicClient = createPublicClient({
  chain: tempo,
  transport: http(),
});

export function getWalletClient() {
  return createWalletClient({
    chain: tempo,
    transport: custom(MagicService.magic.rpcProvider),
  });
}