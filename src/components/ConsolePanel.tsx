"use client";

import { useConsole } from "@/contexts/ConsoleContext";
import { useState, useEffect } from "react";
import { JsonBlock } from "./CodeBlock";

export function ConsolePanel() {
  const { consoleLogs, clearConsole } = useConsole();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if screen is 1300px or under and set default collapsed state
  useEffect(() => {
    setMounted(true);

    const checkScreenSize = () => {
      const smallScreen = window.innerWidth <= 1300;
      setIsSmallScreen(smallScreen);
      // Only expand on large screens, keep collapsed on small screens
      setIsCollapsed(smallScreen);
    };

    // Set initial state with a small delay to allow transition
    const timer = setTimeout(() => {
      checkScreenSize();
    }, 50);

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Don't render client-specific content during SSR
  if (!mounted) {
    return (
      <div className="w-12 h-screen bg-black/90 backdrop-blur-sm border-l border-white/10 flex flex-col">
        {/* Console Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="text-gray-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
                title="Expand Console"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed State Indicator */}
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <div className="writing-mode-vertical text-gray-400 text-xs font-semibold tracking-wider transform rotate-90">
            CONSOLE
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay for small screens when expanded */}
      {isSmallScreen && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Spacer for small screens to prevent content overlap */}
      {isSmallScreen && <div className="w-12 flex-shrink-0" />}

      <div
        className={`h-screen bg-black/90 backdrop-blur-sm border-l border-white/10 flex flex-col transition-all duration-300 ${
          isSmallScreen
            ? `fixed right-0 top-0 z-50 ${isCollapsed ? "w-12" : "w-96"}`
            : isCollapsed
            ? "w-12"
            : "w-96"
        }`}
      >
        {/* Console Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h3 className="text-lg font-semibold text-white">
                Developer Console
              </h3>
            )}
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <button
                  onClick={clearConsole}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
                title={isCollapsed ? "Expand Console" : "Collapse Console"}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Console Logs */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {consoleLogs.length === 0 ? (
              <div className="text-gray-500 text-sm italic">No logs yet...</div>
            ) : (
              consoleLogs.map((log) => (
                <div
                  key={`${log.id}-${log.timestamp}`}
                  className={`p-3 rounded-lg text-xs font-mono border ${
                    log.type === "error"
                      ? "bg-red-900/20 border-red-500/30 text-red-300"
                      : log.type === "success"
                      ? "bg-green-900/20 border-green-500/30 text-green-300"
                      : log.type === "warning"
                      ? "bg-yellow-900/20 border-yellow-500/30 text-yellow-300"
                      : "bg-blue-900/20 border-blue-500/30 text-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400">{log.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        log.type === "error"
                          ? "bg-red-600 text-white"
                          : log.type === "success"
                          ? "bg-green-600 text-white"
                          : log.type === "warning"
                          ? "bg-yellow-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {log.type}
                    </span>
                  </div>
                  <div className="text-white mb-2">{log.message}</div>
                  {log.data != null && (
                    <details className="text-gray-300">
                      <summary className="cursor-pointer hover:text-white">
                        View Data
                      </summary>
                      <div className="mt-2">
                        <JsonBlock data={log.data as any} maxHeight="8rem" />
                      </div>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Collapsed State Indicator */}
        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center justify-center p-2">
            <div className="relative">
              <div className="writing-mode-vertical text-gray-400 text-xs font-semibold tracking-wider transform rotate-90">
                CONSOLE
              </div>
              {consoleLogs.length > 0 && (
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse absolute -bottom-9 left-1/2 transform -translate-x-1/2"
                  title={`${consoleLogs.length} logs`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
