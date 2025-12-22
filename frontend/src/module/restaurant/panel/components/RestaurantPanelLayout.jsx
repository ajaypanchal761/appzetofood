import { useState, useEffect, useRef } from "react"
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  CheckSquare,
  Utensils,
  FolderTree,
  Plus,
  Star,
  Megaphone,
  Tag,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  Wallet,
  ChevronUp,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Tv,
  List,
  Building2,
  Camera,
  Clock,
  Briefcase,
  FileText,
  Receipt,
  Home,
  Crown,
  QrCode,
  Users,
  UserCog,
  PieChart,
  Globe,
  Mail,
  Package,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { promoIcon } from "@/constants/restaurantIcons"

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/restaurant-panel/dashboard",
  },
  {
    id: "pos",
    label: "Point Of Sale",
    icon: ShoppingBag,
    path: "/restaurant-panel/pos",
  },
  {
    id: "divider-orders",
    label: "ORDER MANAGEMENT",
    type: "divider",
  },
  {
    id: "regular-orders",
    label: "Regular Orders",
    icon: ShoppingCart,
    path: "/restaurant-panel/orders",
  },
  {
    id: "subscription-orders",
    label: "Subscription Orders",
    icon: CheckSquare,
    path: "/restaurant-panel/subscription-orders",
  },
  {
    id: "divider-food",
    label: "FOOD MANAGEMENT",
    type: "divider",
  },
  {
    id: "foods",
    label: "Foods",
    icon: Utensils,
    path: "/restaurant-panel/foods",
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderTree,
    path: "/restaurant-panel/categories",
  },
  {
    id: "addons",
    label: "Addons",
    icon: Plus,
    path: "/restaurant-panel/addons",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    path: "/restaurant-panel/reviews",
  },
  {
    id: "divider-promotions",
    label: "PROMOTIONS MANAGEMENT",
    type: "divider",
  },
  {
    id: "campaign",
    label: "Campaign",
    icon: Megaphone,
    path: "/restaurant-panel/campaign",
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: Tag,
    path: "/restaurant-panel/coupons",
  },
  {
    id: "divider-help",
    label: "HELP & SUPPORT",
    type: "divider",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
    path: "/restaurant-panel/chat",
  },
  {
    id: "divider-ads",
    label: "ADS MANAGEMENT",
    type: "divider",
  },
  {
    id: "new-ads",
    label: "New Ads",
    icon: Tv,
    path: "/restaurant-panel/new-ads",
  },
  {
    id: "ads-list",
    label: "Ads List",
    icon: List,
    path: "/restaurant-panel/ads-list",
  },
  {
    id: "divider-wallet",
    label: "WALLET MANAGEMENT",
    type: "divider",
  },
  {
    id: "my-wallet",
    label: "My Wallet",
    icon: Wallet,
    path: "/restaurant-panel/my-wallet",
  },
  {
    id: "wallet-method",
    label: "Wallet Method",
    icon: Building2,
    path: "/restaurant-panel/wallet-method",
  },
  {
    id: "divider-reports",
    label: "REPORTS",
    type: "divider",
  },
  {
    id: "expense-report",
    label: "Expense Report",
    icon: Camera,
    path: "/restaurant-panel/expense-report",
  },
  {
    id: "transaction",
    label: "Transaction",
    icon: Clock,
    path: "/restaurant-panel/transaction",
  },
  {
    id: "disbursement-report",
    label: "Disbursement Report",
    icon: Briefcase,
    path: "/restaurant-panel/disbursement-report",
  },
  {
    id: "order-report",
    label: "Order Report",
    icon: User,
    path: "/restaurant-panel/order-report",
  },
  {
    id: "food-report",
    label: "Food Report",
    icon: Utensils,
    path: "/restaurant-panel/food-report",
  },
  {
    id: "tax-report",
    label: "Tax Report",
    icon: Receipt,
    path: "/restaurant-panel/tax-report",
  },
  {
    id: "divider-business",
    label: "BUSINESS MANAGEMENT",
    type: "divider",
  },
  {
    id: "my-restaurant",
    label: "My Restaurant",
    icon: Home,
    path: "/restaurant-panel/my-restaurant",
  },
  {
    id: "restaurant-config",
    label: "Restaurant Config",
    icon: Settings,
    path: "/restaurant-panel/restaurant-config",
  },
  {
    id: "my-business-plan",
    label: "My Business Plan",
    icon: Crown,
    path: "/restaurant-panel/my-business-plan",
  },
  {
    id: "my-qr-code",
    label: "My Qr Code",
    icon: QrCode,
    path: "/restaurant-panel/my-qr-code",
  },
  {
    id: "notification-setup",
    label: "Notification Setup",
    icon: Bell,
    path: "/restaurant-panel/notification-setup",
  },
  {
    id: "divider-employee",
    label: "EMPLOYEE MANAGEMENT",
    type: "divider",
  },
  {
    id: "employee-role",
    label: "Employee Role",
    icon: UserCog,
    path: "/restaurant-panel/employee-role",
  },
  {
    id: "all-employee",
    label: "All Employee",
    icon: Users,
    path: "/restaurant-panel/all-employee",
  },
]

// Regular Orders sub-categories with counts
const regularOrderStatuses = [
  { label: "All", count: 67, color: "text-blue-400" },
  { label: "Pending", count: 35, color: "text-green-400" },
  { label: "Confirmed", count: 2, color: "text-green-400" },
  { label: "Accepted", count: 1, color: "text-green-400" },
  { label: "Cooking", count: 0, color: "text-gray-400" },
  { label: "Ready For Delivery", count: 1, color: "text-blue-400" },
  { label: "Food On The Way", count: 1, color: "text-blue-400" },
  { label: "Delivered", count: 25, color: "text-green-400" },
  { label: "Dine In", count: 0, color: "text-gray-400" },
  { label: "Refunded", count: 0, color: "text-red-400", pill: true },
  { label: "Refund Requested", count: 2, color: "text-red-400", pill: true },
  { label: "Scheduled", count: 1, color: "text-blue-400" },
  { label: "Payment Failed", count: 0, color: "text-gray-400" },
  { label: "Canceled", count: 4, color: "text-green-400" },
]

// Foods sub-menu items
const foodsSubMenu = [
  { label: "Add New", path: "/restaurant-panel/foods/add" },
  { label: "List", path: "/restaurant-panel/foods" },
  { label: "Bulk Import", path: "/restaurant-panel/foods/bulk-import" },
  { label: "Bulk Export", path: "/restaurant-panel/foods/bulk-export" },
]

// Categories sub-menu items
const categoriesSubMenu = [
  { label: "Category", path: "/restaurant-panel/categories" },
  { label: "Sub Category", path: "/restaurant-panel/categories/sub-category" },
]

// Campaign sub-menu items
const campaignSubMenu = [
  { label: "Basic Campaign", path: "/restaurant-panel/campaign/basic" },
  { label: "Food Campaign", path: "/restaurant-panel/campaign/food" },
]

// Ads List sub-menu items
const adsListSubMenu = [
  { label: "Pending", path: "/restaurant-panel/ads-list/pending" },
  { label: "List", path: "/restaurant-panel/ads-list" },
]

// Order Report sub-menu items
const orderReportSubMenu = [
  { label: "Regular Order Report", path: "/restaurant-panel/order-report/regular" },
  { label: "Campaign Order Report", path: "/restaurant-panel/order-report/campaign" },
]

// All Employee sub-menu items
const allEmployeeSubMenu = [
  { label: "Add New Employee", path: "/restaurant-panel/all-employee/add" },
  { label: "List", path: "/restaurant-panel/all-employee" },
]

export default function RestaurantPanelLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [regularOrdersExpanded, setRegularOrdersExpanded] = useState(true)
  const [foodsExpanded, setFoodsExpanded] = useState(true)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const [campaignExpanded, setCampaignExpanded] = useState(false)
  const [adsListExpanded, setAdsListExpanded] = useState(false)
  const [orderReportExpanded, setOrderReportExpanded] = useState(false)
  const [allEmployeeExpanded, setAllEmployeeExpanded] = useState(false)
  
  // Navbar state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [language, setLanguage] = useState("En")
  const searchInputRef = useRef(null)

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen])

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [searchOpen])

  // Mock search results - replace with actual search logic
  const searchResults = [
    { type: "Order", title: "Order #12345", description: "Pending delivery", icon: Package },
    { type: "Food", title: "Chicken Biryani", description: "Food item", icon: UtensilsCrossed },
    { type: "Report", title: "Sales Report", description: "Monthly analytics", icon: FileText },
    { type: "Category", title: "Main Course", description: "Food category", icon: FolderTree },
  ].filter((item) =>
    searchQuery.trim() === "" ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const languages = [
    { code: "En", name: "English", flag: "🇬🇧" },
    { code: "Bn", name: "Bengali - বাংলা", flag: "🇧🇩" },
    { code: "Ar", name: "Arabic - العربية", flag: "🇸🇦" },
    { code: "Es", name: "Spanish - español", flag: "🇪🇸" },
    { code: "Hi", name: "Hindi - हिन्दी", flag: "🇮🇳" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  // Mock data for dropdowns
  const messages = [
    { id: 1, sender: "Customer Support", message: "New order #12345 received", time: "2m ago", unread: true },
    { id: 2, sender: "System", message: "Payment processed successfully", time: "15m ago", unread: true },
    { id: 3, sender: "Admin", message: "Your restaurant profile updated", time: "1h ago", unread: false },
  ]

  const emails = [
    { id: 1, subject: "Weekly Report Ready", from: "reports@appzeto.com", time: "5m ago", unread: true },
    { id: 2, subject: "New Order Notification", from: "orders@appzeto.com", time: "1h ago", unread: true },
    { id: 3, subject: "System Update", from: "admin@appzeto.com", time: "2h ago", unread: false },
  ]

  const cartItems = [
    { id: 1, name: "Chicken Biryani", quantity: 2, price: 450 },
    { id: 2, name: "Butter Naan", quantity: 4, price: 120 },
    { id: 3, name: "Mango Lassi", quantity: 2, price: 100 },
  ]

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleLogout = () => {
    navigate("/restaurant/auth/sign-in")
  }

  const isActive = (path) => {
    const currentPath = location.pathname
    // Remove trailing slash for comparison
    const normalizedPath = path.replace(/\/$/, "")
    const normalizedCurrent = currentPath.replace(/\/$/, "")
    return normalizedCurrent === normalizedPath || normalizedCurrent.startsWith(normalizedPath + "/")
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("/dashboard")) return "Dashboard"
    if (path.includes("/pos")) return "Point Of Sale"
    if (path.includes("/orders") && !path.includes("/subscription")) return "Regular Orders"
    if (path.includes("/subscription-orders")) return "Subscription Orders"
    if (path.includes("/foods")) return "Foods"
    if (path.includes("/categories") && !path.includes("/sub-category")) return "Category List"
    if (path.includes("/categories/sub-category")) return "Sub Category List"
    if (path.includes("/addons")) return "Addons"
    if (path.includes("/reviews")) return "Customers Reviews"
    if (path.includes("/campaign/food")) return "Food Campaign"
    if (path.includes("/campaign/basic")) return "Basic Campaign"
    if (path.includes("/campaign")) return "Campaign"
    if (path.includes("/coupons")) return "Coupons"
    if (path.includes("/ads-list")) return "Ads List"
    if (path.includes("/new-ads")) return "Create Advertisement"
    if (path.includes("/my-wallet")) return "Restaurant Wallet"
    if (path.includes("/wallet-method")) return "Withdraw Method Setup"
    if (path.includes("/expense-report")) return "Expense Report"
    if (path.includes("/transaction")) return "Transaction Report"
    if (path.includes("/disbursement-report")) return "Disbursement Report"
    if (path.includes("/order-report")) return "Order Report"
    if (path.includes("/tax-report")) return "Tax Report"
    if (path.includes("/my-restaurant")) return "Shop Details"
    if (path.includes("/my-business-plan")) return "Hungry Puppets Business Plan"
    if (path.includes("/restaurant-config")) return "Restaurant Setup"
    if (path.includes("/settings")) return "Settings"
    return "Dashboard"
  }

  const getPageIcon = () => {
    const path = location.pathname
    if (path.includes("/dashboard")) return LayoutDashboard
    if (path.includes("/pos")) return ShoppingBag
    if (path.includes("/orders") && !path.includes("/subscription")) return ShoppingCart
    if (path.includes("/subscription-orders")) return CheckSquare
    if (path.includes("/foods")) return Utensils
    if (path.includes("/categories")) return FolderTree
    if (path.includes("/addons")) return Plus
    if (path.includes("/reviews")) return Star
    if (path.includes("/campaign")) return Megaphone
    if (path.includes("/coupons")) return Tag
    if (path.includes("/expense-report")) return FileText
    if (path.includes("/transaction")) return PieChart
    if (path.includes("/disbursement-report")) return Receipt
    if (path.includes("/order-report")) return FileText
    if (path.includes("/tax-report")) return Receipt
    if (path.includes("/my-restaurant")) return Home
    if (path.includes("/my-business-plan")) return Crown
    if (path.includes("/restaurant-config")) return Settings
    return LayoutDashboard
  }

  const PageIcon = getPageIcon()

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes expandDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
        
        .menu-item-animate {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .submenu-animate {
          animation: expandDown 0.3s ease-out forwards;
        }
        
        .restaurant-sidebar-scroll {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .restaurant-sidebar-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .restaurant-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .restaurant-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .restaurant-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        .restaurant-sidebar-scroll:hover::-webkit-scrollbar {
          width: 6px;
        }
        .restaurant-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) rgba(15, 23, 42, 0.3);
        }
      `}</style>
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-20"
        } restaurant-sidebar-scroll bg-[#0f172a] border-r border-blue-800/40 text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
        style={{ willChange: "width" }}
      >
        {/* Logo */}
        <div className="px-3 py-3 border-b border-blue-800/40 bg-[#1e293b] animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-center justify-between mb-3">
            {sidebarOpen && (
              <div className="flex items-center gap-2 animate-[slideIn_0.3s_ease-out]">
                <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform duration-300 hover:scale-110">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-orange-500 text-left">Appzeto Food</span>
              </div>
            )}
            {!sidebarOpen && (
              <div className="w-full flex items-center justify-center">
                <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform duration-300 hover:scale-110">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-blue-200/80 hover:text-blue-100 transition-all duration-200 hover:scale-110 p-1.5 rounded-lg hover:bg-blue-900/30"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Restaurant Panel Label */}
          {sidebarOpen && (
            <div className="mb-3 animate-[slideIn_0.4s_ease-out_0.1s_both]">
              <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wider text-left">
                Restaurant Panel
              </h2>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2 restaurant-sidebar-scroll">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return (
                sidebarOpen && (
                  <div
                    key={item.id}
                    className="px-3 py-2 mb-2 animate-[fadeIn_0.4s_ease-out]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-blue-200/60 font-bold text-sm uppercase tracking-wider text-left">
                      {item.label}
                    </span>
                  </div>
                )
              )
            }

            // Handle Regular Orders as expandable section
            if (item.id === "regular-orders") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/orders")
              const sectionKey = "regularorders"

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setRegularOrdersExpanded(!regularOrdersExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setRegularOrdersExpanded(!regularOrdersExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: regularOrdersExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {regularOrdersExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {regularOrderStatuses.map((status, subIndex) => {
                        const linkPath = status.label === "All" 
                          ? item.path 
                          : `${item.path}?status=${status.label.toLowerCase().replace(/\s+/g, "-")}`
                        
                        const statusParam = searchParams.get("status")
                        const normalizedStatus = status.label.toLowerCase().replace(/\s+/g, "-")
                        const isSubActive = status.label === "All" 
                          ? location.pathname === item.path && !statusParam
                          : statusParam === normalizedStatus
                        
                        return (
                          <Link
                            key={status.label}
                            to={linkPath}
                            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                                isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                              }`}></span>
                              <span className="text-left">{status.label}</span>
                            </div>
                            {status.pill ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color} border-red-400 bg-white`}>
                                {status.count}
                              </span>
                            ) : (
                              <span className={`text-xs font-medium ${status.color}`}>
                                {status.count}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle Foods as expandable section
            if (item.id === "foods") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/foods")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setFoodsExpanded(!foodsExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setFoodsExpanded(!foodsExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: foodsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {foodsExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {foodsSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle Categories as expandable section
            if (item.id === "categories") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/categories")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: categoriesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {categoriesExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {categoriesSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path || 
                          (subItem.label === "Category" && location.pathname === "/restaurant-panel/categories")
                        
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle Campaign as expandable section
            if (item.id === "campaign") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/campaign")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setCampaignExpanded(!campaignExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setCampaignExpanded(!campaignExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: campaignExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {campaignExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {campaignSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle Ads List as expandable section
            if (item.id === "ads-list") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/ads-list")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setAdsListExpanded(!adsListExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setAdsListExpanded(!adsListExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: adsListExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {adsListExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {adsListSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle Order Report as expandable section
            if (item.id === "order-report") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/order-report")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setOrderReportExpanded(!orderReportExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setOrderReportExpanded(!orderReportExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: orderReportExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {orderReportExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {orderReportSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Handle All Employee as expandable section
            if (item.id === "all-employee") {
              const Icon = item.icon
              const active = isActive(item.path) || location.pathname.startsWith("/restaurant-panel/all-employee")

              if (!sidebarOpen) {
                return (
                  <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      onClick={() => setAllEmployeeExpanded(!allEmployeeExpanded)}
                      className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-white hover:bg-blue-900/40 hover:text-blue-100"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-200/80 transition-transform duration-300" />
                    </button>
                  </div>
                )
              }

              return (
                <div key={item.id} className="menu-item-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => setAllEmployeeExpanded(!allEmployeeExpanded)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left ${
                      active
                        ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                        : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                        active ? "text-blue-300 scale-110" : "text-blue-200/80"
                      }`} />
                      <span className="font-medium text-left">{item.label}</span>
                    </div>
                    <div className="transition-transform duration-300" style={{ transform: allEmployeeExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="w-4 h-4 shrink-0 text-blue-200/70" />
                    </div>
                  </button>
                  {allEmployeeExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-blue-700/40 pl-3 submenu-animate overflow-hidden">
                      {allEmployeeSubMenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300 ease-out text-sm font-normal text-left ${
                              isSubActive
                                ? "bg-blue-600/30 text-blue-100 font-semibold"
                                : "text-blue-50/90 hover:bg-blue-900/30 hover:text-blue-100"
                            }`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isSubActive ? "bg-blue-300 scale-125" : "bg-blue-300/60"
                            }`}></span>
                            <span className="text-left">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const Icon = item.icon
            const active = isActive(item.path)

            if (!sidebarOpen) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left menu-item-animate ${
                    active
                      ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                      : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                    active ? "text-blue-300 scale-110" : "text-blue-200/80"
                  }`} />
                </Link>
              )
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium text-left menu-item-animate ${
                  active
                    ? "bg-blue-600/30 text-blue-100 border-blue-400 font-semibold"
                    : "text-blue-50/90 hover:bg-blue-900/40 hover:text-blue-100"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                title={sidebarOpen ? undefined : item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 text-left ${
                  active ? "text-blue-300 scale-110" : "text-blue-200/80"
                }`} />
                <span className="text-left whitespace-nowrap font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Advertisement Card - Inside scrollable nav */}
          {sidebarOpen && (
            <div className="px-2 pb-4 mt-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 relative overflow-hidden">
                {/* Promo Image */}
                <div className="mb-3 flex justify-center">
                  <img
                    src={promoIcon}
                    alt="Promo"
                    className="h-24 w-auto object-contain"
                  />
                </div>
                <div className="text-center mb-3">
                  <div className="text-base font-bold text-gray-900 mb-1">
                    Want To Get Highlighted?
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    Create Ads To Get Highlighted On The App And Web Browser
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-semibold"
                  onClick={() => navigate("/restaurant-panel/new-ads")}
                >
                  Create Ads
                </Button>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 w-full">
          <div className="flex items-center gap-4 flex-shrink-0 w-20">
            {/* Menu Button - Only show when sidebar is collapsed */}
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Center Section - Search */}
          <div className="flex items-center justify-center flex-1 min-w-0">
            <div className="max-w-lg w-full">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors w-full"
              >
                <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-left flex-1">Search</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white text-gray-500 flex-shrink-0">
                  Ctrl+K
                </span>
              </button>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{currentLanguage.code}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.code === language && (
                      <CheckCircle2 className="ml-auto w-4 h-4 text-orange-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Chat/MessageCircle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  {messages.filter((m) => m.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold px-1">
                      {messages.filter((m) => m.unread).length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Messages</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {messages.filter((m) => m.unread).length} new
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <DropdownMenuItem
                      key={msg.id}
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{msg.sender}</p>
                            {msg.unread && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{msg.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center cursor-pointer text-orange-500 hover:text-orange-600"
                  onClick={() => navigate("/restaurant-panel/chat")}
                >
                  View all conversations
                  <ArrowRight className="ml-2 w-4 h-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Messages/Mail */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <Mail className="w-5 h-5" />
                  {emails.filter((e) => e.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold px-1">
                      {emails.filter((e) => e.unread).length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Emails</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {emails.filter((e) => e.unread).length} new
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {emails.map((email) => (
                    <DropdownMenuItem
                      key={email.id}
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                            {email.unread && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{email.from}</p>
                          <p className="text-xs text-gray-400 mt-1">{email.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center cursor-pointer text-orange-500 hover:text-orange-600">
                  View all emails
                  <ArrowRight className="ml-2 w-4 h-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Shopping Cart with badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold px-1">
                      {totalCartItems > 9 ? "9+" : totalCartItems}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Shopping Cart</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {totalCartItems} items
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="p-6 text-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          className="flex items-center justify-between p-3 cursor-default hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <div className="p-3 flex items-center justify-between bg-gray-50">
                        <span className="text-sm font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-orange-500">₹{totalCartPrice}</span>
                      </div>
                      <DropdownMenuItem className="justify-center cursor-pointer bg-orange-500 text-white hover:bg-orange-600 mt-2 mx-2 rounded-md">
                        Checkout
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </DropdownMenuItem>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-orange flex items-center justify-center overflow-hidden">
                    <span className="text-white text-sm font-semibold">P</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Pichart</p>
                    <p className="text-xs text-gray-500">t**********@gmail.com</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center overflow-hidden">
                      <span className="text-white text-sm font-semibold">P</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Pichart</p>
                      <p className="text-xs text-gray-500">t**********@gmail.com</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Wallet className="mr-2 w-4 h-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="mr-2 w-4 h-4" />
                    <span>Documentation</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl p-0 bg-white opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 ease-in-out data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Universal Search
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search orders, foods, reports, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {searchQuery.trim() === "" ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-4">Quick Actions</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Package, label: "Orders", color: "bg-blue-50 text-blue-600" },
                    { icon: UtensilsCrossed, label: "Foods", color: "bg-orange-50 text-orange-600" },
                    { icon: FolderTree, label: "Categories", color: "bg-green-50 text-green-600" },
                    { icon: FileText, label: "Reports", color: "bg-purple-50 text-purple-600" },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className={`p-2 rounded-md ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Order #12345", "Chicken Biryani", "Main Course"].map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-500 mb-3">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                    </div>
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                      >
                        <div className="p-2 rounded-md bg-gray-100">
                          <result.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{result.title}</p>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

