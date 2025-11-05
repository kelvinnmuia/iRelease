import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", Major: 100, Medium: 70, Minor: 30 },
  { month: "Feb", Major: 150, Medium: 120, Minor: 30 },
  { month: "Mar", Major: 200, Medium: 150, Minor: 50 },
  { month: "Apr", Major: 180, Medium: 140, Minor: 40 },
  { month: "May", Major: 220, Medium: 170, Minor: 50 },
  { month: "Jun", Major: 240, Medium: 190, Minor: 50 },
  { month: "Jul", Major: 260, Medium: 200, Minor: 60 },
  { month: "Aug", Major: 300, Medium: 250, Minor: 50 },
  { month: "Sep", Major: 280, Medium: 230, Minor: 50 },
  { month: "Oct", Major: 320, Medium: 270, Minor: 50 },
  { month: "Nov", Major: 350, Medium: 300, Minor: 50 },
  { month: "Dec", Major: 400, Medium: 350, Minor: 50 },
]

export function ReleaseTypeChart() {

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    // Listen for screen size changes
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3 flex items-center justify-center">
        <CardTitle className="text-lg lg:text-xl text-center">Release Type by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 13 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 16 }} />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="circle"
              wrapperStyle={{
                marginTop: isLargeScreen ? -30 : -10,
                paddingBottom: 16,
                fontSize: isLargeScreen ? 14 : 13,
                }}
            />
            <Bar dataKey="Major" fill="#0c0c0c" />
            <Bar dataKey="Medium" fill="#767276" />
            <Bar dataKey="Minor" fill="#d11314" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
