"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const tabs = ["All Applicants", "Screening", "Shortlisted", "Interviewing", "Job Offer"]

const applicants = [
  {
    name: "Alex Boide",
    email: "a.boide@hirezy.com",
    role: "Software Engineer",
    date: "Apr 15, 2027",
    type: "Full-time",
    resource: "View Resume",
    status: "Interviewing",
  },
  {
    name: "Alice Johnson",
    email: "a.johnson@hirezy.com",
    role: "HR Specialist",
    date: "Apr 10, 2027",
    type: "Contract",
    resource: "View Resume",
    status: "Shortlisted",
  },
]

export function ApplicantsList() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">Applicants List (1,242)</CardTitle>
          <Button variant="ghost" size="sm">
            See All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === idx
                  ? "border-yellow-400 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name ↓</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role ↓</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date ↓</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Employment Type ↓</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource ↓</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status ↓</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{applicant.name}</p>
                      <p className="text-xs text-gray-500">{applicant.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{applicant.role}</td>
                  <td className="py-4 px-4 text-gray-700">{applicant.date}</td>
                  <td className="py-4 px-4 text-gray-700">{applicant.type}</td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600">
                      👁️ {applicant.resource}
                    </Button>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        applicant.status === "Interviewing"
                          ? "default"
                          : applicant.status === "Shortlisted"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {applicant.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-3">
          {applicants.map((applicant, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{applicant.name}</p>
                  <p className="text-xs text-gray-500">{applicant.email}</p>
                </div>
                <Badge
                  variant={
                    applicant.status === "Interviewing"
                      ? "default"
                      : applicant.status === "Shortlisted"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {applicant.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700 mb-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Role</p>
                  <p className="font-medium">{applicant.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Date</p>
                  <p className="font-medium">{applicant.date}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Type</p>
                  <p className="font-medium">{applicant.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Resource</p>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 text-xs">
                    👁️ {applicant.resource}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
