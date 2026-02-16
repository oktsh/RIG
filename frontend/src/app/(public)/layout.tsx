'use client'
import { usePathname } from 'next/navigation'
import AppShell from "@/components/layout/AppShell"
import ModalProvider from "@/components/modals/ModalProvider"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  if (isLanding) {
    return <>{children}</>
  }

  return (
    <ModalProvider>
      <AppShell>{children}</AppShell>
    </ModalProvider>
  )
}
