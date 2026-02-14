import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
        {children}
      </main>
    </div>
  );
}
