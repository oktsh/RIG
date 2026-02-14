import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
        <Header />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
