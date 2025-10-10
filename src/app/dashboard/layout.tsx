import { DashboardShell } from '@/components/dashboard-shell'
export default async function Dashboard({
  children
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
