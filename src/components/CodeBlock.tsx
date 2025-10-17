"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = "json",
  showLineNumbers = false,
  className = "",
  maxHeight = "16rem",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  // Custom dark theme matching the app's design
  const customStyle = {
    ...vscDarkPlus,
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: "transparent",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: "rgba(0, 0, 0, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "0.75rem",
      margin: 0,
      padding: "1rem",
      maxHeight,
      overflow: "auto",
    },
  };

  return (
    <div className={`relative group w-full min-w-0 ${className}`}>
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{
          background: "#000",
          border: "1px solid #474747",
          borderRadius: "0.75rem",
          margin: 0,
          padding: "1rem",
          maxHeight,
          overflow: "auto",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "auto",
        }}
        className="code-block-container w-full min-w-0"
      >
        {code}
      </SyntaxHighlighter>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// Specialized components for different use cases
interface JsonBlockProps {
  data: unknown;
  className?: string;
  maxHeight?: string;
}

export function JsonBlock({ data, className, maxHeight }: JsonBlockProps) {
  const jsonString =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return (
    <CodeBlock
      code={jsonString}
      language="json"
      className={className}
      maxHeight={maxHeight}
    />
  );
}

interface JavaScriptBlockProps {
  code: string;
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function JavaScriptBlock({
  code,
  className,
  showLineNumbers,
  maxHeight,
}: JavaScriptBlockProps) {
  return (
    <CodeBlock
      code={code}
      language="javascript"
      showLineNumbers={showLineNumbers}
      className={className}
      maxHeight={maxHeight}
    />
  );
}

interface TypeScriptBlockProps {
  code: string;
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function TypeScriptBlock({
  code,
  className,
  showLineNumbers,
  maxHeight,
}: TypeScriptBlockProps) {
  return (
    <CodeBlock
      code={code}
      language="typescript"
      showLineNumbers={showLineNumbers}
      className={className}
      maxHeight={maxHeight}
    />
  );
}
