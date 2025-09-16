import { useState } from "react";
import { Button } from "../Primitives";
import { formatPayload } from "../../utils/format";

export function SignComponent({
  payloadDisplay,
  onSign,
}: {
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
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Request Payload
          </label>
          <div className="relative">
            <pre className="p-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white whitespace-pre-wrap break-all overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {JSON.stringify(formatPayload(payloadDisplay), null, 2)}
            </pre>
          </div>
        </div>

        {signature && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Signature Response
            </label>
            <div className="relative">
              <pre className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30 text-sm text-white whitespace-pre-wrap break-all overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-success/20 scrollbar-track-transparent">
                {JSON.stringify(signature, null, 2)}
              </pre>
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSign} variant="secondary">
        <svg
          className="w-5 h-5"
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
        Execute Signing
      </Button>
    </div>
  );
}
