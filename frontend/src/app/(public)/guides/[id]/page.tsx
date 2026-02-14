import Link from "next/link";
import { guides, guideContent } from "@/data/guides";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return guides.map((guide) => ({
    id: String(guide.id),
  }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = guides.find((g) => g.id === parseInt(id));

  if (!guide) {
    notFound();
  }

  const content = guideContent[guide.id];

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
            <span className="border border-black px-2 py-1 text-black">
              {guide.date}
            </span>
            <span className="border border-black px-2 py-1 bg-[#FFE600] text-black">
              {guide.time} READ
            </span>
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
