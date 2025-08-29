import { useState } from "react";
import { Button } from "./Primitives";
import { formatPayload } from "../utils/format";

export function SignComponent({
  title,
  payloadDisplay,
  onSign,
}: {
  title: string;
  payloadDisplay: string | object | [];
  onSign: () => Promise<string>;
}) {
  const [signature, setSignature] = useState("");

  const handleSign = async () => {
    try {
      const signature = await onSign();
      setSignature(signature);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full px-4 py-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="flex flex-col gap-3">
        <p>Payload:</p>
        <pre className="p-2 rounded-md bg-black/80 text-sm text-white whitespace-pre-wrap break-all">
          {JSON.stringify(formatPayload(payloadDisplay), null, 2)}
        </pre>
        {signature && (
          <>
            <p>Response:</p>
            <pre className="p-2 rounded-md bg-black/80 text-sm text-white whitespace-pre-wrap break-all">
              {JSON.stringify(signature, null, 2)}
            </pre>
          </>
        )}
      </div>
      <Button onClick={handleSign}>Sign</Button>
    </div>
  );
}
