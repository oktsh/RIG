/* ARCHIVED v1-neo-brutalist - commented out for ghosttly-ux experiment */

/*
"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["ADMIN", "MODERATOR"]}>
      <div className="h-screen flex overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
*/

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return null;
}
