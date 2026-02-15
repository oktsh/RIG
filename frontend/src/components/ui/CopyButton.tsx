"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={
        className ||
        "text-[10px] font-mono font-bold text-black border border-black bg-white px-2 py-1 hover:bg-[#FFE600]"
      }
    >
      {copied ? "СКОПИРОВАНО" : "КОПИРОВАТЬ"}
    </button>
  );
}
