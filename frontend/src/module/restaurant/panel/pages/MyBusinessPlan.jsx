import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Calendar } from "lucide-react"
import Footer from "../components/Footer"

export default function MyBusinessPlan() {
  const handleChangePlan = () => {
    // Handle change business plan logic here
    console.log("Change business plan clicked")
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Crown className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Hungry Puppets Business Plan</h1>
      </div>

      {/* Overview Navigation */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <span className="text-blue-600 font-bold">Overview</span>
      </div>

      {/* Commission Base Plan Card */}
      <Card className="border-gray-200 shadow-lg">
        <CardContent className="p-8">
          {/* Plan Title */}
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Commission Base Plan</h2>

          {/* Commission Details */}
          <div className="space-y-4 mb-8">
            <div className="text-3xl font-bold text-gray-900">10 % Commission per order</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Restaurant will pay 10% Commission to <strong>AppZetoFood</strong> From each order. You
              will get access of all the features and options in restaurant panel, app and
              interaction with user.
            </p>
          </div>

          {/* Change Business Plan Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleChangePlan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Change Business Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

