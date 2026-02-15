"use client";

import { Prompt } from "@/types";
import CopyButton from "@/components/ui/CopyButton";

interface PromptModalProps {
  prompt: Prompt;
  onClose: () => void;
}

export default function PromptModal({ prompt, onClose }: PromptModalProps) {
  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            {prompt.tags &&
              prompt.tags.map((t) => (
                <span
                  key={t}
                  className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase"
                >
                  {t}
                </span>
              ))}
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">
            {prompt.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-black hover:bg-[#F0F0F0] p-2 border border-transparent hover:border-black transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-8 overflow-y-auto max-h-[60vh] bg-[#FAFAFA]">
        <p className="text-base text-black font-medium mb-8 pb-8 border-b border-black border-dashed">
          {prompt.desc}
        </p>

        <div className="bg-white border border-black p-0 relative group shadow-sm">
          <div className="flex justify-between items-center bg-[#F0F0F0] border-b border-black px-4 py-2">
            <span className="text-[10px] font-mono font-bold uppercase">
              PROMPT_CONTENT.MD
            </span>
            <CopyButton text={prompt.content} />
          </div>
          <pre className="font-mono text-[13px] leading-relaxed text-black whitespace-pre-wrap p-6 bg-white">
            {prompt.content}
          </pre>
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center text-[10px] font-bold text-white">
            {(prompt.author || prompt.author_name || "?").charAt(0)}
          </div>
          <span className="text-xs text-[#555] font-mono font-bold uppercase">
            ДОБАВЛЕНО {prompt.author || prompt.author_name || "Unknown"}
          </span>
        </div>
        <button className="btn-primary px-8 py-3 text-xs">
          ИСПОЛЬЗОВАТЬ ПРОМПТ
        </button>
      </div>
    </>
  );
}
