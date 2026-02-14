"use client";

import { useState, useEffect } from "react";
import CategoryFilter from "@/components/prompts/CategoryFilter";
import PromptCard from "@/components/prompts/PromptCard";
import Pagination from "@/components/ui/Pagination";
import { prompts as staticPrompts } from "@/data/prompts";
import { useDebounce } from "@/lib/useDebounce";
import type { Prompt, PaginatedResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(staticPrompts);
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

    fetch(`${API_BASE}/api/prompts?${params}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: PaginatedResponse<Prompt>) => {
        setPrompts(data.items);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPrompts(staticPrompts);
        }
      });

    return () => controller.abort();
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-6">
        <CategoryFilter />
        <input
          type="text"
          placeholder="ПОИСК ПРОМПТОВ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase font-mono w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0 border-t-2 border-l-2 border-black bg-white">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {prompts.length === 0 && (
        <div className="text-center py-20 font-mono text-sm text-gray-500 uppercase">
          Ничего не найдено
        </div>
      )}

      <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
    </div>
  );
}
