"use client";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  pages,
  total,
  onPageChange,
}: PaginationProps) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums: (number | "...")[] = [];
    if (pages <= 5) {
      for (let i = 1; i <= pages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(pages - 1, page + 1);
        i++
      ) {
        nums.push(i);
      }
      if (page < pages - 2) nums.push("...");
      nums.push(pages);
    }
    return nums;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <span className="text-[10px] font-mono font-bold uppercase text-gray-500">
        {total} items total
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-[10px] font-mono font-bold uppercase border border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFE600] transition-colors"
        >
          &larr;
        </button>
        {getPageNumbers().map((num, i) =>
          num === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-2 text-[10px] font-mono"
            >
              ...
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`px-3 py-2 text-[10px] font-mono font-bold border border-black transition-colors ${
                num === page
                  ? "bg-black text-white"
                  : "hover:bg-[#FFE600]"
              }`}
            >
              {num}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-2 text-[10px] font-mono font-bold uppercase border border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFE600] transition-colors"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
