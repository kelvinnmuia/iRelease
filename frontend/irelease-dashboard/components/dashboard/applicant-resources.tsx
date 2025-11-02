"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const resources = [
  { label: "Job Boards", value: 350, color: "bg-yellow-300" },
  { label: "Employee Referrals", value: 200, color: "bg-blue-400" },
  { label: "Social Media Campaigns", value: 300, color: "bg-lime-300" },
  { label: "Recruitment Agencies", value: 150, color: "bg-purple-300" },
]

export function ApplicantResources() {
  return (
    <Card className="bg-gradient-to-br from-blue-100 to-purple-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Applicant Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32">
            {/* Donut Chart Visualization */}
            <svg className="w-full h-full" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              {/* Colored segments */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="8"
                strokeDasharray="55 314"
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="8"
                strokeDasharray="63 314"
                strokeDashoffset="-55"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#bfdb38"
                strokeWidth="8"
                strokeDasharray="95 314"
                strokeDashoffset="-118"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#c084fc"
                strokeWidth="8"
                strokeDasharray="47 314"
                strokeDashoffset="-213"
                transform="rotate(-90 60 60)"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">1,000</p>
                <p className="text-xs text-gray-600">Total Applicants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Stats */}
        <div className="space-y-3">
          {resources.map((resource, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${resource.color}`}></div>
                <span className="text-gray-700">{resource.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{resource.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
