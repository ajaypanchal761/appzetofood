import { Link } from "react-router-dom"
import { ArrowLeft, AlertTriangle, Phone, Shield } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ReportSafetyEmergency() {
  const [report, setReport] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (report.trim()) {
      setIsSubmitted(true)
      // In a real app, this would trigger an emergency response
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/user/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-black">Report a safety emergency</h1>
        </div>

        {/* Emergency Contact Card */}
        <Card className="bg-red-50 border-red-200 rounded-xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-full p-2 mt-0.5">
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 mb-1">
                  Emergency Contact
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  For immediate emergencies, please call your local emergency services.
                </p>
                <a
                  href="tel:100"
                  className="text-red-600 font-semibold text-lg hover:underline"
                >
                  Emergency: 100
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isSubmitted ? (
          <>
            {/* Info Card */}
            <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                    <Shield className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Safety is our priority
                    </h3>
                    <p className="text-sm text-gray-600">
                      Report any safety concerns, incidents, or emergencies related to your order or delivery experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Form */}
            <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Describe the safety concern or emergency
                </label>
                <Textarea
                  placeholder="Please provide details about the safety issue..."
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {report.length} characters
                </p>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!report.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Report Safety Issue
            </Button>
          </>
        ) : (
          /* Success State */
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
              <p className="text-gray-600 mb-4">
                Your safety report has been submitted. Our team will review it immediately and take appropriate action.
              </p>
              <p className="text-sm text-red-600 font-medium">
                If this is a life-threatening emergency, please call 100 immediately.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  )
}

