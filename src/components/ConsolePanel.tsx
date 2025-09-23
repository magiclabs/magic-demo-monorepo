"use client";

import { useConsole } from "@/contexts/ConsoleContext";
import { useState } from "react";
import { JsonBlock } from "./CodeBlock";

export function ConsolePanel() {
  const { consoleLogs, clearConsole } = useConsole();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-black/90 backdrop-blur-sm border-l border-white/10 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-96"
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
                key={log.id}
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
          <div className="writing-mode-vertical text-gray-400 text-xs font-semibold tracking-wider transform rotate-90">
            CONSOLE
          </div>
          {consoleLogs.length > 0 && (
            <div
              className="mt-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              title={`${consoleLogs.length} logs`}
            />
          )}
        </div>
      )}
    </div>
  );
}
