import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

const TabsClasses = {
  root: "glass rounded-2xl w-full max-w-4xl glow-secondary",
  trigger:
    "font-semibold px-6 py-4 text-muted-foreground bg-white/5 hover:text-white hover:bg-white/10 [&[data-state=active]]:text-white [&[data-state=active]]:bg-gradient-to-r [&[data-state=active]]:from-primary/20 [&[data-state=active]]:to-secondary/20 cursor-pointer rounded-xl transition-all duration-200 w-full text-left",
};

interface TabItem {
  value: string;
  label: string;
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
  return (
    <Tabs defaultValue={defaultTab} className={TabsClasses.root}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
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

        <div className="flex gap-6">
          {/* Left side - Tabs */}
          <div className="w-1/3">
            <TabsList className="flex flex-col gap-2 bg-transparent">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} className={TabsClasses.trigger} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Right side - Content */}
          <div className="w-2/3">
            {children}
          </div>
        </div>
      </div>
    </Tabs>
  );
}
