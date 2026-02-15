"use client";

import { User } from "@/types";

interface UserTableProps {
  users: User[];
  onChangeRole: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

export default function UserTable({
  users,
  onChangeRole,
  onDelete,
  onToggleActive,
}: UserTableProps) {
  return (
    <div className="bg-white border-t-2 border-l-2 border-black">
      <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] text-[10px] font-bold uppercase tracking-widest bg-[#F0F0F0] font-mono">
        <div className="p-4 border-r-2 border-b-2 border-black">ID</div>
        <div className="p-4 border-r-2 border-b-2 border-black">
          ПОЛЬЗОВАТЕЛЬ
        </div>
        <div className="p-4 border-r-2 border-b-2 border-black">РОЛЬ</div>
        <div className="p-4 border-r-2 border-b-2 border-black">СТАТУС</div>
        <div className="p-4 border-r-2 border-b-2 border-black">ДЕЙСТВИЯ</div>
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] font-medium text-sm hover:bg-[#FAFAFA] transition-colors"
        >
          <div className="p-4 border-r-2 border-b-2 border-black text-[11px] font-mono">
            {user.id}
          </div>
          <div className="p-4 border-r-2 border-b-2 border-black">
            <div className="font-bold uppercase">{user.name}</div>
            <div className="text-[10px] text-gray-500 font-mono">
              {user.email}
            </div>
          </div>
          <div className="p-4 border-r-2 border-b-2 border-black">
            <span
              className={`px-2 py-1 text-[10px] font-bold border border-black ${
                user.role === "ADMIN" ? "bg-[#FFE600]" : user.role === "MODERATOR" ? "bg-[#B4FF00]" : "bg-white"
              }`}
            >
              {user.role}
            </span>
          </div>
          <div className="p-4 border-r-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="text-[10px] font-bold font-mono">
                {user.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>
          <div className="p-4 border-r-2 border-b-2 border-black flex gap-2 flex-wrap">
            <button
              onClick={() => onChangeRole(user.id)}
              className="text-[10px] font-bold underline hover:text-blue-600 uppercase"
            >
              Роль
            </button>
            <button
              onClick={() => onToggleActive(user.id)}
              className="text-[10px] font-bold underline hover:text-orange-600 uppercase"
            >
              {user.is_active ? "Откл." : "Вкл."}
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="text-[10px] font-bold underline hover:text-red-600 uppercase"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
