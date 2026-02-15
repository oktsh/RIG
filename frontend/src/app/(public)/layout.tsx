import AppShell from "@/components/layout/AppShell";
import ModalProvider from "@/components/modals/ModalProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <AppShell>{children}</AppShell>
    </ModalProvider>
  );
}
