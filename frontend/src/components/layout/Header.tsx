"use client";

import { usePathname } from "next/navigation";
import { useModal } from "@/components/modals/ModalProvider";

interface HeaderConfig {
  title: string;
  subtitle: string;
  showSearch: boolean;
}

const headerConfig: Record<string, HeaderConfig> = {
  "/": {
    title: "О Проекте",
    subtitle: "ДОБРО ПОЖАЛОВАТЬ В RIG",
    showSearch: false,
  },
  "/dashboard": {
    title: "Панель",
    subtitle: "ОБЗОР АКТИВНОСТИ / DASHBOARD",
    showSearch: false,
  },
  "/content": {
    title: "Управление Контентом",
    subtitle: "ВАШИ ПУБЛИКАЦИИ",
    showSearch: false,
  },
  "/prompts": {
    title: "Промпты",
    subtitle: "БИБЛИОТЕКА ПРОМПТОВ / PROMPTS",
    showSearch: true,
  },
  "/guides": {
    title: "Гайды",
    subtitle: "РУКОВОДСТВА И ИНСТРУКЦИИ / GUIDES",
    showSearch: true,
  },
  "/rules-agents": {
    title: "Правила и Агенты",
    subtitle: "НАСТРОЙКИ АССИСТЕНТОВ / RULES & AGENTS",
    showSearch: true,
  },
};

function getHeaderConfig(pathname: string): HeaderConfig {
  if (pathname.startsWith("/guides/")) {
    return {
      title: "Гайд",
      subtitle: "РУКОВОДСТВО / GUIDE DETAIL",
      showSearch: false,
    };
  }
  return (
    headerConfig[pathname] || {
      title: "RIG",
      subtitle: "ПЛАТФОРМА",
      showSearch: false,
    }
  );
}

export default function Header() {
  const pathname = usePathname();
  const { openJoinModal } = useModal();
  const config = getHeaderConfig(pathname);

  return (
    <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
      <div className="flex flex-col">
        <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">
          {config.title}
        </h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          {config.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {config.showSearch && (
          <div className="relative w-64">
            <input
              type="text"
              placeholder="ПОИСК..."
              className="w-full bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase font-mono"
            />
          </div>
        )}
        <button className="btn-outline px-6 py-3 text-xs font-bold">
          Войти
        </button>
        <button
          onClick={openJoinModal}
          className="btn-primary px-6 py-3 text-xs font-bold"
        >
          JOIN RIG
        </button>
      </div>
    </header>
  );
}
