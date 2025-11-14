import { DashboardLayout } from "@/layout/dashboard-layout"
import { ReleasesDataTable } from "@/components/releases/releases-datatable"

export default function ReleasesPage() {
  return (
    <DashboardLayout>
      <ReleasesDataTable />
    </DashboardLayout>
  )
}
