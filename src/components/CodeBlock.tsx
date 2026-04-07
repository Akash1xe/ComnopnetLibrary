import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CodeFile } from "../types";

export function CodeBlock({ file }: { file: CodeFile }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(file.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#1e1e1e] px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#555]">{file.language}</span>
        <button className="text-[#777] transition hover:text-white" onClick={handleCopy} type="button">
          {copied ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="max-h-[600px] overflow-auto text-[13px]">
        <SyntaxHighlighter
          customStyle={{ margin: 0, background: "transparent", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}
          language={file.language}
          showLineNumbers
          style={oneDark}
        >
          {file.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
