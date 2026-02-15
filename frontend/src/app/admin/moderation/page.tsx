"use client";

import { useState, useEffect, useCallback } from "react";
import ModerationCard from "@/components/admin/ModerationCard";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDebounce } from "@/lib/useDebounce";
import {
  getPendingPrompts,
  getPendingGuides,
  getProposals,
  updatePromptStatus,
  updateGuideStatus,
  updateProposalStatus,
} from "@/lib/api";
import type { PaginatedResponse, Prompt, Guide, Proposal } from "@/types";

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

type TypeFilter = "all" | "prompts" | "guides" | "proposals";
type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function ModerationPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingCounts, setPendingCounts] = useState({
    prompts: 0,
    guides: 0,
    proposals: 0,
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const statusParam = statusFilter === "all" ? "all" : statusFilter;
      const searchParam = debouncedSearch || undefined;

      const results: ModerationItem[] = [];
      let totalCount = 0;

      if (typeFilter === "all" || typeFilter === "prompts") {
        const data = (await getPendingPrompts(token, {
          status: statusParam,
          search: searchParam,
          page: typeFilter === "prompts" ? page : 1,
          limit: typeFilter === "prompts" ? 20 : 100,
        })) as PaginatedResponse<Prompt>;
        data.items.forEach((p) =>
          results.push({
            id: p.id,
            type: "prompt",
            title: p.title,
            description: p.desc,
            content: p.content,
            author_name: p.author_name,
            tags: p.tags,
            status: p.status || "pending",
            created_at: p.created_at || new Date().toISOString(),
          }),
        );
        if (typeFilter === "prompts") totalCount = data.total;
      }

      if (typeFilter === "all" || typeFilter === "guides") {
        const data = (await getPendingGuides(token, {
          status: statusParam,
          search: searchParam,
          page: typeFilter === "guides" ? page : 1,
          limit: typeFilter === "guides" ? 20 : 100,
        })) as PaginatedResponse<Guide>;
        data.items.forEach((g) =>
          results.push({
            id: g.id,
            type: "guide",
            title: g.title,
            description: g.desc,
            content: g.content,
            author_name: g.author_name,
            status: g.status || "pending",
            created_at: g.created_at || new Date().toISOString(),
          }),
        );
        if (typeFilter === "guides") totalCount = data.total;
      }

      if (typeFilter === "all" || typeFilter === "proposals") {
        const data = (await getProposals(token, {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchParam,
          page: typeFilter === "proposals" ? page : 1,
          limit: typeFilter === "proposals" ? 20 : 100,
        })) as PaginatedResponse<Proposal>;
        data.items.forEach((p) =>
          results.push({
            id: p.id,
            type: "proposal",
            title: p.title,
            description: p.description,
            content: p.content,
            email: p.email,
            tags: p.tags,
            status: p.status,
            created_at: p.created_at,
          }),
        );
        if (typeFilter === "proposals") totalCount = data.total;
      }

      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      if (typeFilter === "all") {
        totalCount = results.length;
        const start = (page - 1) * 20;
        setItems(results.slice(start, start + 20));
      } else {
        setItems(results);
      }
      setTotalItems(totalCount);

      // Fetch pending counts for stats bar
      if (statusFilter === "pending" && !searchParam) {
        setPendingCounts({
          prompts: typeFilter === "prompts" || typeFilter === "all"
            ? results.filter((r) => r.type === "prompt").length
            : pendingCounts.prompts,
          guides: typeFilter === "guides" || typeFilter === "all"
            ? results.filter((r) => r.type === "guide").length
            : pendingCounts.guides,
          proposals: typeFilter === "proposals" || typeFilter === "all"
            ? results.filter((r) => r.type === "proposal").length
            : pendingCounts.proposals,
        });
      }
    } catch (err) {
      console.error("Failed to fetch moderation data:", err);
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter, statusFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, debouncedSearch]);

  const handleApprove = async (item: ModerationItem) => {
    if (!token) return;
    try {
      if (item.type === "prompt") await updatePromptStatus(token, item.id, "published");
      else if (item.type === "guide") await updateGuideStatus(token, item.id, "published");
      else if (item.type === "proposal") await updateProposalStatus(token, item.id, "approved");
      fetchData();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (item: ModerationItem) => {
    if (!token) return;
    try {
      if (item.type === "prompt") await updatePromptStatus(token, item.id, "rejected");
      else if (item.type === "guide") await updateGuideStatus(token, item.id, "rejected");
      else if (item.type === "proposal") await updateProposalStatus(token, item.id, "rejected");
      fetchData();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const typeFilters: { key: TypeFilter; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "prompts", label: "Промпты" },
    { key: "guides", label: "Гайды" },
    { key: "proposals", label: "Заявки" },
  ];

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: "На проверке" },
    { key: "approved", label: "Одобрены" },
    { key: "rejected", label: "Отклонены" },
    { key: "all", label: "Все статусы" },
  ];

  const totalPending =
    pendingCounts.prompts + pendingCounts.guides + pendingCounts.proposals;

  return (
    <>
      <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">
            МОДЕРАЦИЯ
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Проверка и одобрение контента / {totalPending} на проверке
          </p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="ПОИСК..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase font-mono"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-0 mb-8 border-2 border-black bg-white">
          {[
            { label: "Всего на проверке", value: totalPending },
            { label: "Промптов", value: pendingCounts.prompts },
            { label: "Гайдов", value: pendingCounts.guides },
            { label: "Заявок", value: pendingCounts.proposals },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`p-4 ${i < 3 ? "border-r-2 border-black" : ""}`}
            >
              <div className="text-3xl font-black font-display">
                {stat.value}
              </div>
              <div className="text-[9px] font-mono uppercase text-gray-500 tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex gap-0">
            {typeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`px-4 py-2 text-[10px] font-bold uppercase font-mono border border-black -ml-[1px] first:ml-0 transition-colors ${
                  typeFilter === f.key
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-[#FFE600]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-0">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 text-[10px] font-bold uppercase font-mono border border-black -ml-[1px] first:ml-0 transition-colors ${
                  statusFilter === f.key
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-[#FFE600]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 font-mono text-sm text-gray-500 uppercase">
            Загрузка...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">&#10003;</div>
            <div className="font-display text-xl font-bold uppercase">
              Нет элементов для проверки
            </div>
            <div className="font-mono text-[10px] text-gray-500 uppercase mt-2">
              Все контент-единицы обработаны
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <ModerationCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onApprove={() => handleApprove(item)}
                  onReject={() => handleReject(item)}
                />
              ))}
            </div>
            <Pagination
              page={page}
              pages={Math.ceil(totalItems / 20)}
              total={totalItems}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
