import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen bg-[#E5E5E5] flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-[200px] font-black text-black leading-none tracking-tighter">
          404
        </div>
        <div className="border-t-2 border-black pt-6 mt-6">
          <p className="font-mono text-sm uppercase tracking-widest text-[#666] mb-8">
            СТРАНИЦА НЕ НАЙДЕНА / PAGE NOT FOUND
          </p>
          <Link
            href="/"
            className="btn-primary px-10 py-4 text-xs font-bold inline-block"
          >
            ВЕРНУТЬСЯ НА ГЛАВНУЮ
          </Link>
        </div>
      </div>
    </div>
  );
}
