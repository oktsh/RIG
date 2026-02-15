"use client";

import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ContentStatus } from "@/types";

interface ModerationItem {
  id: number;
  type: "prompt" | "guide" | "proposal";
  title: string;
  description?: string | null;
  content?: string | null;
  author_name?: string | null;
  email?: string;
  tags?: string[];
  status: string;
  created_at: string;
}

interface ModerationCardProps {
  item: ModerationItem;
  onApprove: () => void;
  onReject: () => void;
}

const typeLabels: Record<string, string> = {
  prompt: "ПРОМПТ",
  guide: "ГАЙД",
  proposal: "ЗАЯВКА",
};

export default function ModerationCard({
  item,
  onApprove,
  onReject,
}: ModerationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(item.created_at).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0px_#000] hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[9px] px-2 py-0.5 border border-black font-mono font-bold uppercase bg-[#F0F0F0]">
              {typeLabels[item.type] || item.type}
            </span>
            <StatusBadge status={item.status as ContentStatus} />
            <span className="text-[10px] font-mono text-gray-500">
              {date}
            </span>
          </div>

          <h3 className="text-lg font-bold uppercase font-display mb-1">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          )}

          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase">
            {item.author_name && <span>Автор: {item.author_name}</span>}
            {item.email && <span>Email: {item.email}</span>}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 border border-black font-mono uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.content && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-mono font-bold uppercase underline hover:text-blue-600"
              >
                {expanded ? "Скрыть контент" : "Показать контент"}
              </button>
              {expanded && (
                <pre className="mt-2 p-4 bg-[#F5F5F5] border border-black text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {item.content}
                </pre>
              )}
            </div>
          )}
        </div>

        {item.status === "pending" && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              className="px-4 py-2 text-[10px] font-bold uppercase border-2 border-black bg-[#B4FF00] hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              Одобрить
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 text-[10px] font-bold uppercase border-2 border-black bg-[#FF6B6B] text-white hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              Отклонить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
