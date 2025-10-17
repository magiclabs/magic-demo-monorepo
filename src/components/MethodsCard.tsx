import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import { JsonBlock } from "./CodeBlock";
import { formatPayload } from "@/utils/format";
import { Card } from "./Card";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import { Button } from "./Button";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
interface Props {
  title: string;
  description: string;
  defaultTab: string;
  tabs: TabItem[];
}

interface TabItem {
  value: string;
  label: string;
  functionName?: string;
  payload?: unknown;
  handler?: () => Promise<any>;
}

const TabsClasses = {
  root: "rounded-2xl w-full max-w-4xl",
  trigger:
    "font-semibold px-6 py-4 text-muted-foreground bg-white/5 hover:text-white hover:bg-white/10 [&[data-state=active]]:text-white [&[data-state=active]]:bg-gradient-to-r [&[data-state=active]]:from-primary/20 [&[data-state=active]]:to-secondary/20 cursor-pointer rounded-xl transition-all duration-200 w-full text-left",
};

export function MethodsCard({ title, description, defaultTab, tabs }: Props) {
  const [currentTab, setCurrentTab] = useState<string>(defaultTab);
  const currentTabData = tabs.find((t) => t.value === currentTab);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <Tabs
      defaultValue={defaultTab}
      value={currentTab}
      onValueChange={handleTabChange}
      className={TabsClasses.root}
    >
      <Card icon={IconGlobeCard} title={title} subtitle={description}>
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
          <MethodCardContent tab={currentTabData} key={currentTabData?.value} />
        </div>
      </Card>
    </Tabs>
  );
}

interface MethodCardContentProps {
  tab?: TabItem;
}

function MethodCardContent({ tab }: MethodCardContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const renderFunctionDisplay = (tab: TabItem) => {
    const functionName = tab?.functionName || "Unknown function";
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Function
        </label>
        <div className="p-4 rounded-lg bg-[#1e1e1e] border border-[#3e3e3e] font-mono text-sm leading-relaxed">
          <span className="text-[#9cdcfe]">{functionName}</span>
        </div>
      </div>
    );
  };

  const handleExecute = async () => {
    if (!tab?.handler) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await tab.handler();
      setResult(result);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tab) return null;

  return (
    <div className="w-full min-[741px]:w-2/3">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          {tab && renderFunctionDisplay(tab)}

          {tab?.payload != null && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Request Payload
              </label>
              <div className="relative">
                <JsonBlock
                  data={formatPayload(tab.payload as any)}
                  maxHeight="16rem"
                />
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Method Result
              </label>
              <div className="relative">
                <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30">
                  <JsonBlock data={result} maxHeight="16rem" />
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

        {tab?.handler && (
          <Button onClick={handleExecute} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading ? "Executing..." : "Execute"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
