"use client";

import { Prompt } from "@/types";
import { useModal } from "@/components/modals/ModalProvider";

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const { openPromptModal } = useModal();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
  };

  return (
    <div className="p-8 border-r-2 border-b-2 border-black group flex flex-col relative hover:bg-[#FAFAFA] transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          {prompt.tags &&
            prompt.tags.map((t) => (
              <span
                key={t}
                className="bg-[#F0F0F0] border border-black text-[10px] text-black px-2 py-1 font-mono font-bold uppercase"
              >
                {t}
              </span>
            ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-black font-mono font-bold border border-black px-2 py-1 bg-[#FFE600]">
          {prompt.copies} КОПИЙ
        </div>
      </div>

      <h3 className="text-2xl font-bold text-black mb-3 uppercase tracking-tight">
        {prompt.title}
      </h3>
      <p className="text-sm text-[#444] mb-6 font-medium line-clamp-2">
        {prompt.desc}
      </p>

      <div className="text-[10px] font-mono text-[#666] font-bold mb-8 uppercase tracking-widest">
        {prompt.tech || ""}
      </div>

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-black">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black flex items-center justify-center text-[10px] font-bold text-white">
            {prompt.author.charAt(0)}
          </div>
          <span className="text-xs font-bold text-black uppercase">
            {prompt.author}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openPromptModal(prompt.id)}
            className="btn-outline text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2"
          >
            Открыть
          </button>
          <button
            onClick={handleCopy}
            className="btn-primary text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2"
          >
            Копировать
          </button>
        </div>
      </div>
    </div>
  );
}
