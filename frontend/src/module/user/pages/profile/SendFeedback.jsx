import { Link } from "react-router-dom"
import { ArrowLeft, PenSquare, Check } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function SendFeedback() {
  const [feedback, setFeedback] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (feedback.trim()) {
      setIsSubmitted(true)
      // In a real app, you would send this to your backend
      setTimeout(() => {
        setIsSubmitted(false)
        setFeedback("")
      }, 3000)
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
          <h1 className="text-xl font-bold text-black">Send feedback</h1>
        </div>

        {!isSubmitted ? (
          <>
            {/* Info Card */}
            <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                    <PenSquare className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      We'd love to hear from you!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your feedback helps us improve and serve you better. Share your thoughts, suggestions, or report any issues.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Your feedback
                </label>
                <Textarea
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {feedback.length} characters
                </p>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Feedback
            </Button>
          </>
        ) : (
          /* Success State */
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate your input!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  )
}

