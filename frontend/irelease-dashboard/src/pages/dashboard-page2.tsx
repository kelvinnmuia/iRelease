import { StatsCards } from "@/components/dashboard/stats-cards"
import { ReleaseTypeChart } from "@/components/dashboard/release-type-chart"
import { ReleasesBySystemName } from "@/components/dashboard/releases-by-system-name"
import { SirsTypeChart } from "@/components/dashboard/sirs-types-chart"
import { DeploymentStatus } from "@/components/dashboard/deployment-status"

export default function DashboardPage() {
  return (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="md:col-span-3 lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <ReleaseTypeChart />
            <ReleasesBySystemName />
            <SirsTypeChart />
            <DeploymentStatus />
          </div>
        </div>
      </div>
  )
}
