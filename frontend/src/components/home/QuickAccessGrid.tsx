import Link from "next/link";

const quickAccessItems = [
  {
    href: "/prompts",
    title: "Промпты",
    description:
      "Готовые промпты для исследований, ревью и архитектуры.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
  {
    href: "/guides",
    title: "Гайды",
    description:
      "Пошаговые инструкции от настройки до продвинутых агентов.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/rules-agents",
    title: "Правила и Агенты",
    description:
      "Правила контекста и специализированные AI-агенты для разработки.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
  },
];

export default function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-l-2 border-black bg-white">
      {quickAccessItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="card-base p-8 border-r-2 border-b-2 border-black group cursor-pointer hover:bg-[#FFE600] transition-colors duration-0"
        >
          <div className="w-10 h-10 border border-black flex items-center justify-center mb-6 bg-white group-hover:bg-black group-hover:text-white transition-colors">
            {item.icon}
          </div>
          <h3 className="font-display text-2xl font-bold mb-3 text-black">
            {item.title}
          </h3>
          <p className="text-sm text-[#444] font-medium leading-relaxed group-hover:text-black">
            {item.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
