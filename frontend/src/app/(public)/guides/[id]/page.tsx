"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { guides as staticGuides, guideContent } from "@/data/guides";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GuideDetail {
  id: number;
  title: string;
  desc: string | null;
  author: string;
  author_name?: string | null;
  category: string | null;
  time: string | null;
  views: string;
  date: string | null;
  content: string | null;
  status?: string;
  created_at?: string;
}

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const numId = parseInt(id);

    fetch(`${API_BASE}/api/guides/${numId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setGuide({
          ...data,
          author: data.author_name || data.author || "Unknown",
        });
      })
      .catch(() => {
        const staticGuide = staticGuides.find((g) => g.id === numId);
        if (staticGuide) {
          setGuide({
            ...staticGuide,
            author: staticGuide.author || staticGuide.author_name || "Unknown",
            content: guideContent[staticGuide.id] || null,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-[11px] text-[#666] uppercase tracking-widest">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-[800px] mx-auto px-10 py-12">
        <div className="border-2 border-black bg-white p-12 text-center">
          <div className="font-display text-6xl font-bold text-[#E0E0E0] mb-6">
            404
          </div>
          <p className="font-mono text-sm text-[#666] uppercase tracking-wider mb-6">
            Гайд не найден
          </p>
          <Link href="/guides" className="btn-primary px-6 py-3 text-xs font-bold">
            Назад к гайдам
          </Link>
        </div>
      </div>
    );
  }

  const content = guide.content || guideContent[guide.id] || null;

  return (
    <div className="max-w-[800px] mx-auto px-10 py-12 pb-32">
      <Link
        href="/guides"
        className="flex items-center gap-2 text-[10px] font-mono font-bold text-black mb-12 hover:underline uppercase tracking-wider"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Назад к Индексу
      </Link>

      <div className="mb-12 border-b-2 border-black pb-8">
        <h1 className="text-5xl font-display font-bold text-black mb-8 leading-tight tracking-tight uppercase">
          {guide.title}
        </h1>

        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-black flex items-center justify-center text-[12px] font-bold text-white">
            {guide.author.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-black uppercase">
              {guide.author}
            </span>
            <span className="text-[10px] text-[#666] font-mono uppercase font-bold">
              АВТОР / СОЗДАТЕЛЬ
            </span>
          </div>
          <div className="ml-auto flex gap-6 text-[10px] font-mono font-bold text-[#666] uppercase">
            {guide.date && (
              <span className="border border-black px-2 py-1 text-black">
                {guide.date}
              </span>
            )}
            {guide.time && (
              <span className="border border-black px-2 py-1 bg-[#FFE600] text-black">
                {guide.time} READ
              </span>
            )}
          </div>
        </div>
      </div>

      {content ? (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="border-2 border-black bg-white p-12 text-center">
          <div className="font-display text-6xl font-bold text-[#E0E0E0] mb-6">
            SOON
          </div>
          <p className="font-mono text-sm text-[#666] uppercase tracking-wider">
            Контент скоро будет доступен
          </p>
        </div>
      )}
    </div>
  );
}
