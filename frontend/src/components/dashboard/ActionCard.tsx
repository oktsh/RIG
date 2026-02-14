import Link from "next/link";

interface ActionCardProps {
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  buttons: { label: string; href?: string; variant: "primary" | "outline" }[];
}

export default function ActionCard({
  icon,
  badge,
  title,
  description,
  buttons,
}: ActionCardProps) {
  return (
    <div className="bg-white border-2 border-black p-0 group relative hover:-translate-y-1 transition-transform">
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 border border-black bg-[#F5F5F5] flex items-center justify-center text-black">
            {icon}
          </div>
          <span className="font-mono text-xs font-bold bg-[#FFE600] px-2 py-1 border border-black">
            {badge}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-black mb-2 uppercase">
          {title}
        </h3>
        <p className="text-sm text-[#444] mb-8 font-medium">{description}</p>

        <div className="mt-auto pt-6 border-t border-black flex gap-3">
          {buttons.map((btn) =>
            btn.href ? (
              <Link
                key={btn.label}
                href={btn.href}
                className={`${btn.variant === "primary" ? "btn-primary" : "btn-outline"} px-4 py-2 text-xs font-bold uppercase`}
              >
                {btn.label}
              </Link>
            ) : (
              <button
                key={btn.label}
                className={`${btn.variant === "primary" ? "btn-primary" : "btn-outline"} px-4 py-2 text-xs font-bold uppercase`}
              >
                {btn.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
