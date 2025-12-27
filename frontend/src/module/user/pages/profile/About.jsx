import { Link } from "react-router-dom"
import { ArrowLeft, Info, Heart, Users, Award } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
  return (
    <AnimatedPage className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-8">
          <Link to="/user/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 p-0">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-black dark:text-white" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">About</h1>
        </div>

        {/* App Info Card */}
        <Card className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-0 dark:border-gray-800 mb-4 md:mb-5 lg:mb-6">
          <CardContent className="p-6 md:p-8 lg:p-10 text-center">
            <div className="flex justify-center mb-4 md:mb-5 lg:mb-6">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 md:p-5 lg:p-6">
                <Info className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">Appzeto Food</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg mb-4 md:mb-5">Version 1.0.0</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
              Your trusted food delivery partner, bringing delicious meals right to your doorstep.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-3 md:space-y-4 lg:space-y-5 mb-4 md:mb-5 lg:mb-6">
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-0 dark:border-gray-800">
            <CardContent className="p-4 md:p-5 lg:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 md:p-3 mt-0.5">
                  <Heart className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                    Made with Love
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    We're passionate about bringing you the best food experience possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-0 dark:border-gray-800">
            <CardContent className="p-4 md:p-5 lg:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 md:p-3 mt-0.5">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                    Serving Millions
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Join millions of satisfied customers enjoying great food every day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-0 dark:border-gray-800">
            <CardContent className="p-4 md:p-5 lg:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 md:p-3 mt-0.5">
                  <Award className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                    Quality Assured
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    We partner with the best restaurants to ensure quality and freshness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Links */}
        <Card className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-0 dark:border-gray-800">
          <CardContent className="p-4 md:p-5 lg:p-6">
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Legal</h3>
            <div className="space-y-2 md:space-y-3">
              <Link to="/user/profile/terms" className="block text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Terms of Service
              </Link>
              <Link to="/user/profile/privacy" className="block text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

