"use client";

import { useState } from "react";
import UserTable from "@/components/admin/UserTable";
import { users as initialUsers } from "@/data/users";
import { User, UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER" as UserRole,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const openAddUserModal = () => {
    setFormData({ name: "", email: "", role: "USER" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", role: "USER" });
  };

  const saveUser = () => {
    if (!formData.name || !formData.email) return;

    const newUser: User = {
      id: `RG-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "ACTIVE",
    };

    setUsers([...users, newUser]);
    closeModal();
  };

  const deleteUser = (id: string) => {
    if (window.confirm("УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const changeRole = (id: string) => {
    const roles: UserRole[] = ["USER", "MODERATOR", "ADMIN"];
    setUsers(
      users.map((user) => {
        if (user.id === id) {
          const currentIndex = roles.indexOf(user.role);
          return { ...user, role: roles[(currentIndex + 1) % roles.length] };
        }
        return user;
      }),
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">
            ПОЛЬЗОВАТЕЛИ
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Управление доступом и ролями
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="ПОИСК ПО EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase font-mono"
            />
          </div>
          <button
            onClick={openAddUserModal}
            className="btn-primary px-6 py-3 text-xs font-bold"
          >
            + НОВЫЙ ПОЛЬЗОВАТЕЛЬ
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <UserTable
          users={filteredUsers}
          onChangeRole={changeRole}
          onDelete={deleteUser}
        />
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg p-8 bg-white border-2 border-black shadow-[10px_10px_0px_#000]">
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight font-display">
              Добавить пользователя
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 font-mono">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-[#FFE600]/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 font-mono">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-[#FFE600]/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 font-mono">
                  Роль
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full border-2 border-black p-3 text-sm font-bold uppercase outline-none"
                >
                  <option value="USER">Пользователь</option>
                  <option value="MODERATOR">Модератор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={saveUser}
                className="btn-primary flex-1 py-4 text-xs font-bold"
              >
                СОХРАНИТЬ
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-4 text-xs font-bold uppercase border border-black bg-transparent text-black hover:bg-black hover:text-white transition-all"
              >
                ОТМЕНА
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
