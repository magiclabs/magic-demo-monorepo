import { ReactNode, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { JsonBlock } from "@/components/CodeBlock";
import { formatPayload } from "@/utils/format";
import { Card } from "./Card";
import IconEdit from "public/icons/icon-edit.svg";
import { Button } from "./Button";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";

const TabsClasses = {
  root: "rounded-2xl w-full max-w-4xl",
  trigger:
    "font-semibold px-6 py-4 text-[#EDEBFF] bg-slate-1 hover:bg-white/10 [&[data-state=active]]:bg-slate-3 cursor-pointer rounded-2xl transition-all duration-200 w-full text-left",
};

interface TabItem {
  value: string;
  label: string;
  functionName?: string;
  payload?: unknown;
  handler?: () => Promise<string>;
}

interface SigningMethodsLayoutProps {
  title: string;
  description: string;
  defaultTab: string;
  tabs: TabItem[];
  children: ReactNode;
}

export function SigningMethodsLayout({
  title,
  description,
  defaultTab,
  tabs,
  children,
}: SigningMethodsLayoutProps) {
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string | Error>>({});
  const [currentTab, setCurrentTab] = useState<string>(defaultTab);

  const currentTabData = tabs.find((t) => t.value === currentTab);
  const signature = signatures[currentTab];
  const error = errors[currentTab];
  const isLoading = loadingStates[currentTab];

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // Clear signature and error for the new tab
    setSignatures((prev) => ({ ...prev, [tab]: "" }));
    setErrors((prev) => ({ ...prev, [tab]: "" }));
  };

  const handleSign = async (
    type: string,
    signFunction: () => Promise<string>
  ) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [type]: true }));
      // Clear previous results
      setSignatures((prev) => ({ ...prev, [type]: "" }));
      setErrors((prev) => ({ ...prev, [type]: "" }));

      const signature = await signFunction();
      setSignatures((prev) => ({ ...prev, [type]: signature }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [type]: error as Error }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderFunctionDisplay = (tabValue: string) => {
    const tab = tabs.find((t) => t.value === tabValue);
    const functionName = tab?.functionName || "Unknown function";
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-secondary tracking-wide">
          Function
        </label>
        <div className="p-4 rounded-lg bg-slate-1 border border-slate-4 font-mono text-sm leading-relaxed">
          <span className="text-[#9AD9FB] break-all">{functionName}</span>
        </div>
      </div>
    );
  };

  return (
    <Tabs
      defaultValue={defaultTab}
      value={currentTab}
      onValueChange={handleTabChange}
      className={TabsClasses.root}
    >
      <Card icon={IconEdit} title={title} subtitle={description}>
        <div className="flex flex-col gap-6 max-[740px]:gap-4 min-[741px]:flex-row">
          {/* Tabs - Above content on mobile, left side on desktop */}
          <div className="w-full min-[741px]:w-1/3">
            <TabsList className="flex gap-2 bg-transparent flex-col">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className={TabsClasses.trigger}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content - Below tabs on mobile, right side on desktop */}
          <div className="w-full min-[741px]:w-2/3">
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-4">
                {currentTab && renderFunctionDisplay(currentTab)}

                {currentTabData?.payload != null && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-secondary tracking-wide">
                      Request Payload
                    </label>
                    <div className="relative">
                      <JsonBlock
                        data={formatPayload(currentTabData.payload as any)}
                        maxHeight="16rem"
                      />
                    </div>
                  </div>
                )}

                {signature && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-secondary tracking-wide">
                      Signature Response
                    </label>
                    <div className="relative">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30">
                        <JsonBlock data={signature} maxHeight="16rem" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-secondary tracking-wide">
                      Error Response
                    </label>
                    <div className="relative">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-error/10 to-red-500/10 border border-error/30">
                        <JsonBlock
                          data={
                            error instanceof Error
                              ? {
                                  message: error.message,
                                  name: error.name,
                                  stack: error.stack,
                                }
                              : error
                          }
                          maxHeight="16rem"
                        />
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {currentTabData?.handler && (
                <Button
                  onClick={() =>
                    currentTabData.handler &&
                    handleSign(currentTab, currentTabData.handler)
                  }
                  disabled={isLoading}
                  fullWidth
                >
                  <div className="flex items-center justify-between">
                    {isLoading ? "Signing..." : "Execute"}
                    <Image src={IconWand} alt="Wand" width={22} height={22} />
                  </div>
                </Button>
              )}

              {children}
            </div>
          </div>
        </div>
      </Card>
    </Tabs>
  );
}
