"use client";

import { useState, useEffect } from "react";
import GuideListItem from "@/components/guides/GuideListItem";
import Pagination from "@/components/ui/Pagination";
import { guides as staticGuides } from "@/data/guides";
import { useDebounce } from "@/lib/useDebounce";
import type { Guide, PaginatedResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(staticGuides);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`${API_BASE}/api/guides?${params}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: PaginatedResponse<Guide>) => {
        setGuides(data.items);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setGuides(staticGuides);
        }
      });

    return () => controller.abort();
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="max-w-[1000px] mx-auto px-10 py-10">
      <div className="fixed right-10 top-20 text-[200px] font-black text-[#F0F0F0] select-none pointer-events-none -z-10 leading-none font-display uppercase">
        RIG
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="ПОИСК ГАЙДОВ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase font-mono w-64"
        />
      </div>

      <div className="flex flex-col border-t-2 border-black">
        {guides.map((guide, index) => (
          <GuideListItem key={guide.id} guide={guide} index={index} />
        ))}
      </div>

      {guides.length === 0 && (
        <div className="text-center py-20 font-mono text-sm text-gray-500 uppercase">
          Ничего не найдено
        </div>
      )}

      <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
    </div>
  );
}
