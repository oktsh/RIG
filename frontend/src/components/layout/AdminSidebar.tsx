"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 border-r border-[#333] bg-black">
      <div className="flex flex-col gap-1 p-6 pb-8 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center border border-black">
            <div className="w-2 h-2 bg-black"></div>
          </div>
          <div className="text-5xl font-display text-white tracking-tighter logo-animated font-black">
            RIG
          </div>
        </div>
        <div className="font-mono text-[9px] text-[#666] leading-tight uppercase tracking-widest mt-2">
          ADMINISTRATION MODULE
          <br />
          CORE ACCESS LEVEL 0
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">
            Управление
          </div>
          <Link
            href="/admin/users"
            className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display border transition-all ${
              pathname === "/admin/users"
                ? "bg-[#FFE600] text-black border-[#FFE600] font-semibold"
                : "text-[#888] border-transparent hover:text-white hover:border-[#333]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Пользователи
          </Link>
          <span className="flex items-center gap-3 px-3 py-3 text-[14px] font-display border border-transparent text-[#888] opacity-50 cursor-not-allowed">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Логи системы
          </span>
        </div>
      </nav>

      <div className="mt-auto p-6 border-t border-[#333]">
        <div className="px-3 py-2 border border-[#333] bg-black flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FFE600]"></div>
          <span className="font-mono text-[9px] text-[#666] uppercase tracking-wider">
            ROOT AUTHENTICATED
          </span>
        </div>
      </div>
    </aside>
  );
}
