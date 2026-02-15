"use client";

import { useState, useEffect, useCallback } from "react";
import UserTable from "@/components/admin/UserTable";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDebounce } from "@/lib/useDebounce";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUserApi,
} from "@/lib/api";
import type { User, UserRole, PaginatedResponse } from "@/types";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = (await getUsers(token, {
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      })) as PaginatedResponse<User>;
      setUsers(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openAddUserModal = () => {
    setFormData({ name: "", email: "", password: "", role: "USER" });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const saveUser = async () => {
    if (!formData.name || !formData.email) {
      setError("Имя и email обязательны");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Пароль обязателен (минимум 6 символов)");
      return;
    }
    if (!token) return;

    try {
      await createUser(token, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      closeModal();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания пользователя");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ?")) return;
    if (!token) return;
    try {
      await deleteUserApi(token, id);
      fetchUsers();
    } catch {
      setError("Не удалось удалить пользователя");
    }
  };

  const handleChangeRole = async (id: number) => {
    if (!token) return;
    const roles: UserRole[] = ["USER", "MODERATOR", "ADMIN"];
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const nextRole = roles[(roles.indexOf(user.role) + 1) % roles.length];
    try {
      await updateUser(token, id, { role: nextRole });
      fetchUsers();
    } catch {
      setError("Не удалось сменить роль");
    }
  };

  const handleToggleActive = async (id: number) => {
    if (!token) return;
    const user = users.find((u) => u.id === id);
    if (!user) return;
    try {
      await updateUser(token, id, { is_active: !user.is_active });
      fetchUsers();
    } catch {
      setError("Не удалось изменить статус");
    }
  };

  return (
    <>
      <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">
            ПОЛЬЗОВАТЕЛИ
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Управление доступом и ролями / {total} пользователей
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
        {loading ? (
          <div className="text-center py-20 font-mono text-sm text-gray-500 uppercase">
            Загрузка...
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              onChangeRole={handleChangeRole}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
            <Pagination
              page={page}
              pages={pages}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
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
            {error && (
              <div className="mb-4 p-3 bg-[#FF6B6B] text-white text-xs font-bold uppercase font-mono border border-black">
                {error}
              </div>
            )}
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
                  Пароль (мин. 6 символов)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
