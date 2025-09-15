"use client";

import { ConsoleProvider, useConsole } from "../../contexts/ConsoleContext";

function ConsolePanel() {
  const { consoleLogs, clearConsole } = useConsole();

  return (
    <div className="w-96 h-screen bg-black/90 backdrop-blur-sm border-l border-white/10 flex flex-col">
      {/* Console Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Developer Console</h3>
          <button
            onClick={clearConsole}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Console Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {consoleLogs.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No logs yet...</div>
        ) : (
          consoleLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg text-xs font-mono border ${
                log.type === 'error'
                  ? 'bg-red-900/20 border-red-500/30 text-red-300'
                  : log.type === 'success'
                  ? 'bg-green-900/20 border-green-500/30 text-green-300'
                  : log.type === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
                  : 'bg-blue-900/20 border-blue-500/30 text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">{log.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  log.type === 'error'
                    ? 'bg-red-600 text-white'
                    : log.type === 'success'
                    ? 'bg-green-600 text-white'
                    : log.type === 'warning'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {log.type}
                </span>
              </div>
              <div className="text-white mb-2">{log.message}</div>
              {log.data && (
                <details className="text-gray-300">
                  <summary className="cursor-pointer hover:text-white">View Data</summary>
                  <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleProvider>
      <div className="min-h-screen flex">
        <div className="flex-1">
          {children}
        </div>
        <ConsolePanel />
      </div>
    </ConsoleProvider>
  );
}
