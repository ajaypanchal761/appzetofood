import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("loading") // "loading", "success", "error"
  const [error, setError] = useState("")
  const [provider, setProvider] = useState("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get provider from URL params
        const providerParam = searchParams.get("provider") || "google"
        setProvider(providerParam)

        // Get OAuth parameters from URL
        const code = searchParams.get("code")
        const errorParam = searchParams.get("error")
        const state = searchParams.get("state")

        // Check for OAuth errors
        if (errorParam) {
          setStatus("error")
          setError(
            errorParam === "access_denied"
              ? "You denied access to your account. Please try again."
              : "Authentication failed. Please try again."
          )
          return
        }

        // If no code, it might be a direct redirect (for demo purposes)
        if (!code) {
          // Simulate OAuth flow for demo
          await new Promise((resolve) => setTimeout(resolve, 2000))
          
          // In a real app, you would:
          // 1. Exchange the code for tokens
          // 2. Get user info from the provider
          // 3. Create/login user in your backend
          // 4. Set authentication tokens

          // For demo, simulate success
          setStatus("success")
          
          // Store auth success in sessionStorage
          sessionStorage.setItem("oauthSuccess", JSON.stringify({
            provider: providerParam,
            timestamp: Date.now(),
          }))

          // Redirect to home after short delay
          setTimeout(() => {
            navigate("/user")
          }, 1500)
          return
        }

        // In a real app, exchange code for tokens
        // This is a simplified version
        setStatus("loading")
        
        // Simulate API call to exchange code for tokens
        const response = await fetch("/api/auth/oauth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            provider: providerParam,
            state,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to authenticate")
        }

        const data = await response.json()

        // Store auth tokens (in a real app, use secure storage)
        if (data.token) {
          localStorage.setItem("authToken", data.token)
        }
        if (data.user) {
          localStorage.setItem("userProfile", JSON.stringify(data.user))
        }

        setStatus("success")

        // Redirect to home
        setTimeout(() => {
          navigate("/user")
        }, 1500)
      } catch (err) {
        setStatus("error")
        setError(
          err.message || "An error occurred during authentication. Please try again."
        )
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  const handleRetry = () => {
    navigate("/user/auth/sign-in")
  }

  const handleGoHome = () => {
    navigate("/user")
  }

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Authentication Successful!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
          <CardDescription className="text-base">
            {status === "loading" && `Signing you in with ${provider || "your account"}...`}
            {status === "success" && "You've been successfully signed in."}
            {status === "error" && "We couldn't complete the authentication process."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we verify your credentials...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-green-600">
                  Welcome!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to the home page...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-red-600">
                  Something went wrong
                </h3>
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 p-4 rounded-lg text-sm text-red-700 max-w-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-left">{error}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Please try signing in again or use a different method.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  Go Home
                </Button>
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r bg-primary-orange hover:opacity-90"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>This may take a few seconds...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
