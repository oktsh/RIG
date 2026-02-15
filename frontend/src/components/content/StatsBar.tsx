interface StatsBarProps {
  published: string;
  drafts: string;
  pending: string;
  copies: string;
}

export default function StatsBar({
  published,
  drafts,
  pending,
  copies,
}: StatsBarProps) {
  const stats = [
    { label: "Опубликовано", value: published },
    { label: "В Черновиках", value: drafts },
    { label: "На Проверке", value: pending },
    { label: "Копирований", value: copies },
  ];

  return (
    <div className="grid grid-cols-4 gap-0 border-2 border-black bg-white mb-10">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`p-6 flex flex-col gap-1 ${i < 3 ? "border-r border-black" : ""}`}
        >
          <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">
            {stat.label}
          </span>
          <span className="text-3xl font-display font-bold">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
