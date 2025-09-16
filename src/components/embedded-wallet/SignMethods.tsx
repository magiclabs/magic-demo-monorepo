import { MagicService } from "../../lib/get-magic";
import { parseEther, ethers } from "ethers";
import { TabsContent } from "@radix-ui/react-tabs";
import { Button } from "../Primitives";
import { SigningMethodsLayout } from "../SigningMethodsLayout";
import { JsonBlock } from "../CodeBlock";
import { formatPayload } from "../../utils/format";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V1_PAYLOAD,
  SIGN_TYPED_DATA_V3_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD,
} from "../../const/sign-typed-data-payloads";

export function SignMethods({
  publicAddress,
}: {
  publicAddress: string | null;
}) {

  const signTransactionPayload = {
    from: publicAddress,
    to: publicAddress,
    value: parseEther("0.00001"),
    gasLimit: 21000,
  };


  const handlePersonalSign = async (): Promise<string> => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signMessage(PERSONAL_SIGN_PAYLOAD);
  };

  const handleSignTypedDataV1 = async (): Promise<string> => {
    const provider = new ethers.BrowserProvider(
      MagicService.magic.rpcProvider as any,
    );
    try {
      const accounts = await provider.listAccounts();
      const publicAddress = accounts[0].address;

      const payload = {
        id: 1,
        method: 'eth_signTypedData',
        params: [SIGN_TYPED_DATA_V1_PAYLOAD, publicAddress],
      };

      return new Promise((resolve, reject) => {
        MagicService.magic.rpcProvider.sendAsync(payload, (err: any, response: any) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(response?.result);
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const handleSignTypedDataV3 = async (): Promise<string> => {
    const provider = new ethers.BrowserProvider(
      MagicService.magic.rpcProvider as any,
    );
    try {
      const accounts = await provider.listAccounts();
      const publicAddress = accounts[0].address;

      const payload = {
        id: 1,
        method: 'eth_signTypedData_v3',
        params: [publicAddress, JSON.stringify(SIGN_TYPED_DATA_V3_PAYLOAD)],
      };

      return new Promise((resolve, reject) => {
        MagicService.magic.rpcProvider.sendAsync(payload, (err: any, response: any) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(response?.result);
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const handleSignTypedDataV4 = async (): Promise<string> => {
    const provider = new ethers.BrowserProvider(
      MagicService.magic.rpcProvider as any,
    );
    try {
      const accounts = await provider.listAccounts();
      const publicAddress = accounts[0].address;

      const payload = {
        id: 1,
        method: 'eth_signTypedData_v4',
        params: [publicAddress, JSON.stringify(SIGN_TYPED_DATA_V4_PAYLOAD)],
      };

      return new Promise((resolve, reject) => {
        MagicService.magic.rpcProvider.sendAsync(payload, (err: any, response: any) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(response?.result);
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const handleSignTransaction = async (): Promise<string> => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signTransaction(signTransactionPayload);
  };


  const tabs = [
    { 
      value: "personal", 
      label: "Personal Sign", 
      functionName: "signer.signMessage(message)",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign
    },
    { 
      value: "typed-data-v1", 
      label: "Sign Typed Data V1", 
      functionName: "magic.rpcProvider.sendAsync({ method: 'eth_signTypedData', params: [data, address] })",
      payload: SIGN_TYPED_DATA_V1_PAYLOAD,
      handler: handleSignTypedDataV1
    },
    { 
      value: "typed-data-v3", 
      label: "Sign Typed Data V3", 
      functionName: "magic.rpcProvider.sendAsync({ method: 'eth_signTypedData_v3', params: [address, data] })",
      payload: SIGN_TYPED_DATA_V3_PAYLOAD,
      handler: handleSignTypedDataV3
    },
    { 
      value: "typed-data-v4", 
      label: "Sign Typed Data V4", 
      functionName: "magic.rpcProvider.sendAsync({ method: 'eth_signTypedData_v4', params: [address, data] })",
      payload: SIGN_TYPED_DATA_V4_PAYLOAD,
      handler: handleSignTypedDataV4
    },
    { 
      value: "transaction", 
      label: "Sign Transaction", 
      functionName: "signer.signTransaction(transaction)",
      payload: signTransactionPayload,
      handler: handleSignTransaction
    },
  ];

  return (
    <SigningMethodsLayout
      title="EVM Signing Methods"
      description="Test various cryptographic signing operations with Magic SDK"
      defaultTab="personal"
      tabs={tabs}
    >
      <TabsContent value="personal" />
      <TabsContent value="typed-data-v1" />
      <TabsContent value="typed-data-v3" />
      <TabsContent value="typed-data-v4" />
      <TabsContent value="transaction" />
    </SigningMethodsLayout>
  );
}
