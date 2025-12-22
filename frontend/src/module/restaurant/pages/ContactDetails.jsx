import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import {
  ArrowLeft,
  Edit,
  User,
  Users,
  UserCog,
  Plus,
  X,
  Check,
  Coffee,
  Mail,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BottomPopup from "@/module/delivery/components/BottomPopup"

// Permissions data structure
const permissionsData = {
  owner: {
    "Home": { description: "Business reports, payouts etc.", allowed: true },
    "Menu management": { description: "Edit items and item details", allowed: true },
    "Marketing | Promo": { description: "Create and manage discounts", allowed: true },
    "Marketing | Ads": { description: "Create and manage ad campaigns", allowed: true },
    "Operations": { description: "Orders & items management, action on complaints etc.", allowed: true },
    "Manage Hyperpure": { description: "Purchase and track food raw materials", allowed: true },
    "Manage users": { description: "Edit owner, manager, staff contact details", allowed: true },
    "Manage outlet settings": { description: "Adjust outlet timings, contact info & more", allowed: true },
    "Manage payouts": { description: "View payouts, invoices & tax certificates", allowed: true },
  },
  manager: {
    "Home": { description: "Business reports, payouts etc.", allowed: true },
    "Menu management": { description: "Edit items and item details", allowed: true },
    "Marketing | Promo": { description: "Create and manage discounts", allowed: true },
    "Marketing | Ads": { description: "Create and manage ad campaigns", allowed: false },
    "Operations": { description: "Orders & items management, action on complaints etc.", allowed: true },
    "Manage Hyperpure": { description: "Purchase and track food raw materials", allowed: true },
    "Manage users": { description: "Edit owner, manager, staff contact details", allowed: true },
    "Manage outlet settings": { description: "Adjust outlet timings, contact info & more", allowed: true },
    "Manage payouts": { description: "View payouts, invoices & tax certificates", allowed: true },
  },
  staff: {
    "Home": { description: "Business reports, payouts etc.", allowed: false },
    "Menu management": { description: "Edit items and item details", allowed: false },
    "Marketing | Promo": { description: "Create and manage discounts", allowed: false },
    "Marketing | Ads": { description: "Create and manage ad campaigns", allowed: false },
    "Operations": { description: "Orders & items management, action on complaints etc.", allowed: true },
    "Manage Hyperpure": { description: "Purchase and track food raw materials", allowed: false },
    "Manage users": { description: "Edit owner, manager, staff contact details", allowed: false },
    "Manage outlet settings": { description: "Adjust outlet timings, contact info & more", allowed: false },
    "Manage payouts": { description: "View payouts, invoices & tax certificates", allowed: false },
  }
}

const INVITES_STORAGE_KEY = "restaurant_invited_users"

export default function ContactDetails() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPermissionsPopup, setShowPermissionsPopup] = useState(false)
  const [selectedRole, setSelectedRole] = useState("owner")
  const [invitedUsers, setInvitedUsers] = useState([])
  
  // Owner data - Load from localStorage
  const STORAGE_KEY = "restaurant_owner_contact"
  
  const getDefaultOwnerData = () => ({
    name: "RAJKUMAR CHOUHAN Raj",
    phone: "+91-9981127415",
    email: "rrajkumarchouhan96@gmail.com",
    photo: null
  })

  const [ownerData, setOwnerData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Error loading owner data:", error)
    }
    return getDefaultOwnerData()
  })

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Open permissions popup when coming from InviteUser with query param
  useEffect(() => {
    const view = searchParams.get("view")
    if (view === "permissions") {
      setShowPermissionsPopup(true)
    }
  }, [searchParams])

  const handleInviteClick = (role = "") => {
    navigate(`/restaurant/invite-user?role=${role}`)
  }

  const handleEditOwner = () => {
    navigate("/restaurant/edit-owner")
  }

  // Load invited users from localStorage
  useEffect(() => {
    const loadInvitedUsers = () => {
      try {
        const saved = localStorage.getItem(INVITES_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          setInvitedUsers(parsed)
        }
      } catch (error) {
        console.error("Error loading invited users:", error)
      }
    }

    loadInvitedUsers()

    // Listen for invites updates
    const handleInvitesUpdate = () => {
      loadInvitedUsers()
    }

    window.addEventListener("invitesUpdated", handleInvitesUpdate)
    return () => {
      window.removeEventListener("invitesUpdated", handleInvitesUpdate)
    }
  }, [])

  // Listen for owner data updates
  useEffect(() => {
    const handleOwnerDataUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          setOwnerData(parsed)
        }
      } catch (error) {
        console.error("Error loading updated owner data:", error)
      }
    }

    window.addEventListener("ownerDataUpdated", handleOwnerDataUpdate)
    return () => {
      window.removeEventListener("ownerDataUpdated", handleOwnerDataUpdate)
    }
  }, [])

  // Calculate days until expiration
  const getDaysUntilExpiration = (expiresAt) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Resend invite
  const handleResendInvite = (inviteId) => {
    try {
      const updatedInvites = invitedUsers.map(invite => {
        if (invite.id === inviteId) {
          return {
            ...invite,
            invitedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
        return invite
      })
      localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(updatedInvites))
      setInvitedUsers(updatedInvites)
      window.dispatchEvent(new Event("invitesUpdated"))
    } catch (error) {
      console.error("Error resending invite:", error)
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate("/restaurant")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Contact details</h1>
          </div>
          <button
            onClick={() => setShowPermissionsPopup(true)}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
          >
            View permissions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className=" bg-gray-100 space-y-6">
        {/* Owner Section */}
        <div>
          <h2 className="px-4 text-base font-bold text-gray-900 my-3">Owner</h2>
          <div className="bg-white rounded-0 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              {ownerData.photo ? (
                <img 
                  src={ownerData.photo} 
                  alt="Owner profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 mb-1">{ownerData.name || "RAJKUMAR CHOUHAN Raj"}</p>
              <p className="text-sm text-gray-900 font-normal">{ownerData.phone || "+91-9981127415"}</p>
              <p className="text-sm text-gray-900 font-normal">{ownerData.email || "rrajkumarchouhan96@gmail.com"}</p>
            </div>
            <button
              onClick={handleEditOwner}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="Edit owner"
            >
              <Edit className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Manager Section */}
        <div>
          <h2 className="px-4 text-base font-bold text-gray-900 mb-3">Manager</h2>
          {invitedUsers.filter(invite => invite.role === "manager").length === 0 ? (
            <div className="bg-white rounded-0 p-4">
              <p className="text-sm text-gray-900 font-normal">
                No one added as manager yet.{" "}
                <button
                  onClick={() => handleInviteClick("manager")}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Invite someone now
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitedUsers
                .filter(invite => invite.role === "manager")
                .map((invite) => {
                  const daysLeft = getDaysUntilExpiration(invite.expiresAt)
                  return (
                    <div key={invite.id} className="bg-white rounded-0 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center shrink-0">
                          <Coffee className="w-6 h-6 text-orange-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                              INVITED
                            </span>
                            <button
                              onClick={() => handleResendInvite(invite.id)}
                              className="text-blue-600 text-xs font-normal hover:text-blue-700 transition-colors"
                            >
                              Resend invite
                            </button>
                          </div>
                          <p className="text-sm text-gray-900 font-normal">
                            {invite.phone || invite.email}
                          </p>
                          {daysLeft > 0 ? (
                            <p className="text-sm text-red-600 font-normal mt-1">
                              Invite expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}.
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 font-normal mt-1">
                              Invite has expired.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              <div className="bg-white rounded-0 p-4">
                <button
                  onClick={() => handleInviteClick("manager")}
                  className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-normal"
                >
                  + Invite another manager
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Staff Section */}
        <div>
          <h2 className="px-4 text-base font-bold text-gray-900 mb-3">Staff</h2>
          {invitedUsers.filter(invite => invite.role === "staff").length === 0 ? (
            <div className="bg-white rounded-0 p-4">
              <p className="text-sm text-gray-900 font-normal">
                No one added as staff yet.{" "}
                <button
                  onClick={() => handleInviteClick("staff")}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Invite someone now
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitedUsers
                .filter(invite => invite.role === "staff")
                .map((invite) => {
                  const daysLeft = getDaysUntilExpiration(invite.expiresAt)
                  return (
                    <div key={invite.id} className="bg-white rounded-0 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center shrink-0">
                          <Coffee className="w-6 h-6 text-orange-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                              INVITED
                            </span>
                            <button
                              onClick={() => handleResendInvite(invite.id)}
                              className="text-blue-600 text-xs font-normal hover:text-blue-700 transition-colors"
                            >
                              Resend invite
                            </button>
                          </div>
                          <p className="text-sm text-gray-900 font-normal">
                            {invite.phone || invite.email}
                          </p>
                          {daysLeft > 0 ? (
                            <p className="text-sm text-red-600 font-normal mt-1">
                              Invite expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}.
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 font-normal mt-1">
                              Invite has expired.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              <div className="bg-white rounded-0 p-4">
                <button
                  onClick={() => handleInviteClick("staff")}
                  className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-normal"
                >
                  + Invite another staff
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleInviteClick("")}
        className="fixed bottom-6 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-colors z-40"
      >
        <Plus className="w-5 h-5" />
        <span>Invite user</span>
      </motion.button>

      {/* View Permissions Bottom Popup */}
      <BottomPopup
        isOpen={showPermissionsPopup}
        onClose={() => setShowPermissionsPopup(false)}
        showHandle={true}
        title="View permissions"
        maxHeight="90vh"
      >
        <div className="pb-4">
          {/* Role Selection Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedRole("owner")}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                selectedRole === "owner"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <Users className={`w-6 h-6 ${selectedRole === "owner" ? "text-white" : "text-gray-600"}`} />
              <span className="text-sm font-bold">Owner</span>
            </button>
            <button
              onClick={() => setSelectedRole("manager")}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                selectedRole === "manager"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <UserCog className={`w-6 h-6 ${selectedRole === "manager" ? "text-white" : "text-gray-600"}`} />
              <span className="text-sm font-bold">Manager</span>
            </button>
            <button
              onClick={() => setSelectedRole("staff")}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                selectedRole === "staff"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <Users className={`w-6 h-6 ${selectedRole === "staff" ? "text-white" : "text-gray-600"}`} />
              <span className="text-sm font-bold">Staff</span>
            </button>
          </div>

          {/* Permissions List */}
          <div className="space-y-0">
            {Object.entries(permissionsData[selectedRole])
              .sort(([, a], [, b]) => {
                // Sort: allowed permissions first (true comes before false)
                if (a.allowed && !b.allowed) return -1
                if (!a.allowed && b.allowed) return 1
                return 0
              })
              .map(([permission, data], index, sortedArray) => (
              <div key={permission}>
                <div className="flex items-start justify-between py-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-base font-bold text-gray-900 mb-1">{permission}</p>
                    <p className="text-sm text-gray-500 font-normal">{data.description}</p>
                  </div>
                  <div className="shrink-0">
                    {data.allowed ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
                {index < sortedArray.length - 1 && (
                  <div className="border-b border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </BottomPopup>
    </div>
  )
}
