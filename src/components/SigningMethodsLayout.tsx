import { ReactNode, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { JsonBlock } from "@/components/CodeBlock";
import { formatPayload } from "@/utils/format";
import { Button } from "@/components/Primitives";

const TabsClasses = {
  root: "glass rounded-2xl w-full max-w-4xl glow-secondary",
  trigger:
    "font-semibold px-6 py-4 text-muted-foreground bg-white/5 hover:text-white hover:bg-white/10 [&[data-state=active]]:text-white [&[data-state=active]]:bg-gradient-to-r [&[data-state=active]]:from-primary/20 [&[data-state=active]]:to-secondary/20 cursor-pointer rounded-xl transition-all duration-200 w-full text-left",
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
    const [funcPart, paramsPart] = functionName.split("(");
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Function
        </label>
        <div className="p-4 rounded-lg bg-[#1e1e1e] border border-[#3e3e3e] font-mono text-sm leading-relaxed">
          <span className="text-[#9cdcfe]">{funcPart}</span>
          <span className="text-[#ffd700]">(</span>
          <span className="text-[#ce9178]">{paramsPart?.replace(")", "")}</span>
          <span className="text-[#ffd700]">)</span>
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
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex flex-shrink-0 items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

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
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
                  variant="secondary"
                  disabled={isLoading}
                >
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
                  {isLoading ? "Signing..." : "Execute"}
                </Button>
              )}

              {children}
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
}
