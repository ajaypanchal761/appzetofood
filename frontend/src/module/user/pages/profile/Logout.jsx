import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Power, AlertCircle } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { authAPI } from "@/lib/api"
import { firebaseAuth } from "@/lib/firebase"

export default function Logout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState("")

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError("")

    try {
      // Call backend logout API to invalidate refresh token
      try {
        await authAPI.logout()
      } catch (apiError) {
        // Continue with logout even if API call fails (network issues, etc.)
        console.warn("Logout API call failed, continuing with local cleanup:", apiError)
      }

      // Sign out from Firebase if user logged in via Google
      try {
        const { signOut } = await import("firebase/auth")
        const currentUser = firebaseAuth.currentUser
        if (currentUser) {
          await signOut(firebaseAuth)
        }
      } catch (firebaseError) {
        // Continue even if Firebase logout fails
        console.warn("Firebase logout failed, continuing with local cleanup:", firebaseError)
      }

      // Clear all authentication data from localStorage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user_authenticated")
      localStorage.removeItem("user_user")

      // Clear sessionStorage
      sessionStorage.removeItem("userAuthData")

      // Dispatch auth change event to notify other components
      window.dispatchEvent(new Event("userAuthChanged"))

      // Small delay for UX, then navigate to sign in
      setTimeout(() => {
        navigate("/user/auth/sign-in", { replace: true })
      }, 500)
    } catch (err) {
      // Even if there's an error, we should still clear local data and logout
      console.error("Error during logout:", err)
      
      // Clear local data anyway
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user_authenticated")
      localStorage.removeItem("user_user")
      sessionStorage.removeItem("userAuthData")
      window.dispatchEvent(new Event("userAuthChanged"))

      setError("An error occurred during logout, but you have been signed out locally.")
      
      // Still navigate after showing error
      setTimeout(() => {
        navigate("/user/auth/sign-in", { replace: true })
      }, 2000)
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
          <h1 className="text-xl font-bold text-black">Log out</h1>
        </div>

        {!isLoggingOut ? (
          <>
            {/* Warning Card */}
            <Card className="bg-white rounded-xl shadow-sm border-0 mb-4">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Power className="h-10 w-10 text-gray-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Log out?</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to log out? You'll need to sign in again to access your account.
                </p>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-yellow-50 border-yellow-200 rounded-xl shadow-sm mb-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 rounded-full p-2 mt-0.5">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-yellow-900 mb-1">
                      Before you go
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Make sure you've saved any important information. Your cart and preferences will be saved for next time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Log out
              </Button>
              <Link to="/user/profile">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        ) : (
          /* Logging Out State */
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Power className="h-10 w-10 text-gray-700 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Logging out...</h2>
              <p className="text-gray-600 mb-4">
                Please wait while we sign you out.
              </p>
              {error && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  )
}

