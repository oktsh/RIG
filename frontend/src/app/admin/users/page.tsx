"use client";

import { useState, useEffect, useCallback } from "react";
import UserTable from "@/components/admin/UserTable";
import { users as staticUsers } from "@/data/users";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, UserRole } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>(staticUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setUsers(
          data.map((u: { id: number; name: string; email: string; role: string; is_active: boolean }) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role as UserRole,
            status: u.is_active ? "ACTIVE" : "INACTIVE",
          })),
        );
      })
      .catch(() => {
        // Keep static fallback
      });
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddUserModal = () => {
    setFormData({ name: "", email: "", password: "", role: "USER" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", password: "", role: "USER" });
  };

  const saveUser = () => {
    if (!formData.name || !formData.email) return;

    if (token) {
      fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || "changeme123",
          role: formData.role,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then(() => {
          fetchUsers();
          closeModal();
        })
        .catch(() => {
          const newUser: User = {
            id: `RG-${Math.floor(Math.random() * 900) + 100}`,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: "ACTIVE",
          };
          setUsers([...users, newUser]);
          closeModal();
        });
    } else {
      const newUser: User = {
        id: `RG-${Math.floor(Math.random() * 900) + 100}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: "ACTIVE",
      };
      setUsers([...users, newUser]);
      closeModal();
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm("УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ?")) {
      if (token) {
        fetch(`${API_BASE}/api/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => fetchUsers())
          .catch(() => {
            setUsers(users.filter((u) => u.id !== id));
          });
      } else {
        setUsers(users.filter((u) => u.id !== id));
      }
    }
  };

  const changeRole = (id: string) => {
    const roles: UserRole[] = ["USER", "MODERATOR", "ADMIN"];
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const nextRole = roles[(roles.indexOf(user.role) + 1) % roles.length];

    if (token) {
      fetch(`${API_BASE}/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      })
        .then(() => fetchUsers())
        .catch(() => {
          setUsers(
            users.map((u) =>
              u.id === id ? { ...u, role: nextRole } : u,
            ),
          );
        });
    } else {
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, role: nextRole } : u,
        ),
      );
    }
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
                  Пароль
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="changeme123"
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
