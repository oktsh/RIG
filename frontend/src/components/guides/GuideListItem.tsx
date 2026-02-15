import Link from "next/link";
import { Guide } from "@/types";

interface GuideListItemProps {
  guide: Guide;
  index: number;
}

export default function GuideListItem({ guide, index }: GuideListItemProps) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group py-8 border-b border-black cursor-pointer relative hover:bg-white transition-all duration-300 pl-4 pr-4 -mx-4 block"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs font-bold text-[#888]">
            0{index + 1}
          </span>
          <h3 className="text-3xl font-bold text-black uppercase group-hover:underline decoration-2 underline-offset-4">
            {guide.title}
          </h3>
        </div>
        <span className="font-mono text-[10px] font-bold text-black border border-black px-2 py-1 uppercase bg-[#FFE600]">
          {guide.category}
        </span>
      </div>
      <p className="text-base text-[#444] mb-6 max-w-2xl font-medium pl-8">
        {guide.desc}
      </p>

      <div className="flex items-center gap-8 text-[11px] font-mono font-bold text-[#666] pl-8 uppercase">
        <span className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {guide.time} ЧТЕНИЯ
        </span>
        <span className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {guide.views} ПРОСМОТРОВ
        </span>
        <span className="text-black">— {guide.author || guide.author_name || "Unknown"}</span>
      </div>
    </Link>
  );
}
