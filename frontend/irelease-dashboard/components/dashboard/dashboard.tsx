"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { StatsCards } from "./stats-cards"
import { ApplicationsChart } from "./applications-chart"
import { ApplicationByDepartment } from "./application-by-department"
import { CurrentVacancies } from "./current-vacancies"
import { ApplicantsList } from "./applicants-list"
import { Tasks } from "./tasks"
import { Schedule } from "./schedule"
import { RecentActivity } from "./recent-activity"
import { ApplicantResources } from "./applicant-resources"

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Main content area */}
            <div className="md:col-span-2 lg:col-span-3 space-y-4 md:space-y-6">
              <StatsCards />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <ApplicationsChart />
                <ApplicationByDepartment />
              </div>

              {/* Current Vacancies */}
              <CurrentVacancies />

              {/* Applicants List */}
              <ApplicantsList />
            </div>

            {/* Right Sidebar */}
            <div className="hidden md:flex md:flex-col space-y-4 md:space-y-6">
              <ApplicantResources />
              <Tasks />
              <Schedule />
              <RecentActivity />
            </div>
          </div>

          {/* Mobile Right Sidebar - below main content */}
          <div className="md:hidden p-4 space-y-4">
            <ApplicantResources />
            <Tasks />
            <Schedule />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
