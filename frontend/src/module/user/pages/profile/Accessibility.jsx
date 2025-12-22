import { Link } from "react-router-dom"
import { ArrowLeft, Accessibility as AccessibilityIcon, Eye, Volume2, MousePointerClick } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function Accessibility() {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

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
          <h1 className="text-xl font-bold text-black">Accessibility</h1>
        </div>

        {/* Info Card */}
        <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                <AccessibilityIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Make the app more accessible
                </h3>
                <p className="text-sm text-gray-600">
                  Customize your experience to better suit your needs and preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Options */}
        <div className="space-y-3">
          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Eye className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-medium text-gray-900">
                      Large Text
                    </Label>
                    <p className="text-sm text-gray-500">
                      Increase text size for better readability
                    </p>
                  </div>
                </div>
                <Switch
                  checked={largeText}
                  onCheckedChange={setLargeText}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Eye className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-medium text-gray-900">
                      High Contrast
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enhance contrast for better visibility
                    </p>
                  </div>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Volume2 className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-medium text-gray-900">
                      Screen Reader Support
                    </Label>
                    <p className="text-sm text-gray-500">
                      Optimize for screen readers
                    </p>
                  </div>
                </div>
                <Switch
                  checked={screenReader}
                  onCheckedChange={setScreenReader}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gray-100 rounded-full p-2">
                    <MousePointerClick className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-medium text-gray-900">
                      Reduce Motion
                    </Label>
                    <p className="text-sm text-gray-500">
                      Minimize animations and transitions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-white rounded-xl shadow-sm border-0 mt-4">
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Need more help?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              If you need additional accessibility features or have suggestions, please contact our support team.
            </p>
            <Link to="/user/profile/send-feedback">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

