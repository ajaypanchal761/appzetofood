import { Link } from "react-router-dom"
import { ArrowLeft, Info, Heart, Users, Award } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
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
          <h1 className="text-xl font-bold text-black">About</h1>
        </div>

        {/* App Info Card */}
        <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <Info className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appzeto Food</h2>
            <p className="text-gray-600 text-sm mb-4">Version 1.0.0</p>
            <p className="text-gray-700 leading-relaxed">
              Your trusted food delivery partner, bringing delicious meals right to your doorstep.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-3 mb-4">
          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                  <Heart className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Made with Love
                  </h3>
                  <p className="text-sm text-gray-600">
                    We're passionate about bringing you the best food experience possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                  <Users className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Serving Millions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join millions of satisfied customers enjoying great food every day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                  <Award className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Quality Assured
                  </h3>
                  <p className="text-sm text-gray-600">
                    We partner with the best restaurants to ensure quality and freshness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Links */}
        <Card className="bg-white rounded-xl shadow-sm border-0">
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Legal</h3>
            <div className="space-y-2">
              <Link to="/user/profile/terms" className="block text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link to="/user/profile/privacy" className="block text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

