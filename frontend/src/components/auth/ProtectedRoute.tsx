"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (roles && user && !roles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, user, roles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-[11px] text-[#666] uppercase tracking-widest">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (roles && user && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
