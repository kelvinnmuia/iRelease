import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"

const applicants = [
  {
    id: 1,
    name: "Alex Boide",
    email: "a.boide@hirezy.com",
    role: "Software Engineer",
    date: "Apr 15, 2027",
    type: "Full-time",
    status: "Interviewing",
  },
  {
    id: 2,
    name: "Alice Johnson",
    email: "a.johnson@hirezy.com",
    role: "HR Specialist",
    date: "Apr 10, 2027",
    type: "Contract",
    status: "Shortlisted",
  },
]

export function ApplicantsList() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Applicants List</CardTitle>
          <span className="text-xs text-gray-500">(1,242)</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All Applicants
            </TabsTrigger>
            <TabsTrigger value="screening" className="text-xs md:text-sm">
              Screening
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="text-xs md:text-sm">
              Shortlisted
            </TabsTrigger>
            <TabsTrigger value="interviewing" className="text-xs md:text-sm">
              Interviewing
            </TabsTrigger>
            <TabsTrigger value="offer" className="text-xs md:text-sm">
              Job Offer
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 md:px-4 font-medium">Name</th>
                    <th className="text-left py-2 px-2 md:px-4 font-medium">Role</th>
                    <th className="text-left py-2 px-2 md:px-4 font-medium">Date</th>
                    <th className="text-left py-2 px-2 md:px-4 font-medium">Type</th>
                    <th className="text-left py-2 px-2 md:px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-2 md:px-4">
                        <div>
                          <p className="font-medium">{applicant.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{applicant.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 md:px-4">{applicant.role}</td>
                      <td className="py-3 px-2 md:px-4">{applicant.date}</td>
                      <td className="py-3 px-2 md:px-4">
                        <Badge variant="outline" className="text-xs">
                          {applicant.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 md:px-4">
                        <Badge className="text-xs">{applicant.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
