"use client";

import GuideListItem from "@/components/guides/GuideListItem";
import { guides as staticGuides } from "@/data/guides";
import { useApi } from "@/lib/useApi";
import type { Guide } from "@/types";

export default function GuidesPage() {
  const { data: guides } = useApi<Guide[]>("/api/guides", staticGuides);

  return (
    <div className="max-w-[1000px] mx-auto px-10 py-10">
      <div className="fixed right-10 top-20 text-[200px] font-black text-[#F0F0F0] select-none pointer-events-none -z-10 leading-none font-display uppercase">
        RIG
      </div>

      <div className="flex flex-col border-t-2 border-black">
        {guides.map((guide, index) => (
          <GuideListItem key={guide.id} guide={guide} index={index} />
        ))}
      </div>
    </div>
  );
}
