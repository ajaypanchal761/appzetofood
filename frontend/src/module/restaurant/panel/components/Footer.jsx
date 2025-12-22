import { Home } from "lucide-react"

export default function Footer() {
  return (
    <div className="mt-auto pt-6 border-t border-gray-200 bg-[#f8f9fa] -mx-6 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Copyright Text - Left Side */}
        <div className="text-sm text-gray-600 font-medium">
          © Hungry Puppets.
        </div>

        {/* Navigation Links - Right Side */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hover:text-gray-900 transition-colors duration-200 cursor-pointer font-normal">
            Restaurant settings
          </span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="hover:text-gray-900 transition-colors duration-200 cursor-pointer font-normal">
            Profile
          </span>
          <span className="text-gray-400 text-xs">•</span>
          <Home className="h-4 w-4 text-gray-500 hover:text-gray-900 transition-colors duration-200 cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

