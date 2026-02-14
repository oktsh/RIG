"use client";

const filters = [
  { key: "all", label: "Все" },
  { key: "prompts", label: "Промпты" },
  { key: "guides", label: "Гайды" },
  { key: "agents", label: "Агенты" },
];

interface ContentFilterProps {
  active: string;
  onChange: (key: string) => void;
}

export default function ContentFilter({
  active,
  onChange,
}: ContentFilterProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              active === f.key
                ? "bg-black text-white"
                : "bg-white border border-black hover:bg-[#FFE600]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="h-[1px] bg-black flex-1 opacity-20"></div>
    </div>
  );
}
