"use client";

import { useState } from "react";
import StatsBar from "@/components/content/StatsBar";
import ContentFilter from "@/components/content/ContentFilter";
import ContentCard from "@/components/content/ContentCard";
import CreateContentModal from "@/components/content/CreateContentModal";
import { contents } from "@/data/contents";

export default function ContentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredContents =
    activeFilter === "all"
      ? contents
      : contents.filter(
          (c) => c.type.toLowerCase() === activeFilter.replace(/s$/, ""),
        );

  return (
    <div>
      <div className="flex items-center justify-end mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-6 py-3 text-xs font-bold flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          НОВАЯ ПУБЛИКАЦИЯ
        </button>
      </div>

      <StatsBar published="05" drafts="02" pending="01" copies="2.4k" />

      <ContentFilter active={activeFilter} onChange={setActiveFilter} />

      <div className="flex flex-col gap-4">
        {filteredContents.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onEdit={() => console.log("Edit", item.id)}
            onDelete={() => console.log("Delete", item.id)}
          />
        ))}
      </div>

      <CreateContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
