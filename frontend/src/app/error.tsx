"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-screen bg-[#E5E5E5] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-black mx-auto mb-8 flex items-center justify-center">
          <span className="font-mono text-[#FFE600] text-3xl font-bold">!</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-black uppercase mb-4">
          Ошибка Системы
        </h2>
        <p className="font-mono text-sm text-[#666] uppercase tracking-wider mb-8">
          SYSTEM ERROR / UNEXPECTED FAILURE
        </p>
        <button
          onClick={reset}
          className="btn-primary px-10 py-4 text-xs font-bold"
        >
          ПОПРОБОВАТЬ СНОВА
        </button>
      </div>
    </div>
  );
}
