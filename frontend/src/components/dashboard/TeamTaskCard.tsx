interface TeamTaskCardProps {
  title: string;
  description: string;
  badge: string;
}

export default function TeamTaskCard({
  title,
  description,
  badge,
}: TeamTaskCardProps) {
  return (
    <div className="bg-[#F0F0F0] border border-black p-5 min-h-[140px] flex flex-col hover:bg-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
      <span className="text-sm font-bold text-black uppercase">{title}</span>
      <p className="text-xs text-[#555] mt-2 font-medium">{description}</p>
      <div className="mt-auto pt-2">
        <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold">
          {badge}
        </span>
      </div>
    </div>
  );
}
