import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronDown,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Utensils,
  LayoutDashboard,
  BarChart3,
  Star,
} from "lucide-react"
import Footer from "../components/Footer"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Import restaurant icons from constants (handles space in folder name)
import {
  confirmedIcon,
  cookingIcon,
  readyIcon,
  onTheWayIcon,
  deliveredIcon,
  refundedIcon,
  scheduledIcon,
  allIcon,
  promoIcon,
} from "@/constants/restaurantIcons"

// Import Top Selling Foods images
import topSelling1 from "@/assets/restaurant icons/Top selling foods/1.png"
import topSelling2 from "@/assets/restaurant icons/Top selling foods/2.png"
import topSelling3 from "@/assets/restaurant icons/Top selling foods/3.png"
import topSelling4 from "@/assets/restaurant icons/Top selling foods/4.png"
import topSelling5 from "@/assets/restaurant icons/Top selling foods/5.png"
import topSelling6 from "@/assets/restaurant icons/Top selling foods/6.png"

// Import Top Rated Foods images
import topRated1 from "@/assets/restaurant icons/Top rated foods/1.png"
import topRated2 from "@/assets/restaurant icons/Top rated foods/2.png"
import topRated3 from "@/assets/restaurant icons/Top rated foods/3.png"
import topRated4 from "@/assets/restaurant icons/Top rated foods/4.png"
import topRated5 from "@/assets/restaurant icons/Top rated foods/5.png"
import topRated6 from "@/assets/restaurant icons/Top rated foods/6.png"

const orderStats = [
  {
    id: "confirmed",
    label: "Confirmed",
    count: 1,
    icon: confirmedIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    status: "confirmed",
  },
  {
    id: "cooking",
    label: "Cooking",
    count: 0,
    icon: cookingIcon,
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    status: "cooking",
  },
  {
    id: "ready",
    label: "Ready for delivery",
    count: 1,
    icon: readyIcon,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    status: "ready-for-delivery",
  },
  {
    id: "on-the-way",
    label: "Food on the way",
    count: 1,
    icon: onTheWayIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    status: "food-on-the-way",
  },
  {
    id: "delivered",
    label: "Delivered",
    count: 26,
    icon: deliveredIcon,
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    status: "delivered",
  },
  {
    id: "refunded",
    label: "Refunded",
    count: 0,
    icon: refundedIcon,
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    status: "refunded",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    count: 1,
    icon: scheduledIcon,
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    status: "scheduled",
  },
  {
    id: "all",
    label: "All",
    count: 72,
    icon: allIcon,
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    status: null, // "All" doesn't need status param
  },
]

// Top Selling Foods Data
const topSellingFoods = [
  {
    id: 1,
    name: "Medu Vada",
    sold: 9,
    image: topSelling1,
  },
  {
    id: 2,
    name: "Meat Pizza",
    sold: 6,
    image: topSelling2,
  },
  {
    id: 3,
    name: "grilled lemon herb M...",
    sold: 3,
    image: topSelling3,
  },
  {
    id: 4,
    name: "Cheese Pizza",
    sold: 1,
    image: topSelling4,
  },
  {
    id: 5,
    name: "Steak Kebabs",
    sold: 0,
    image: topSelling5,
  },
  {
    id: 6,
    name: "FRIED RICE",
    sold: 0,
    image: topSelling6,
  },
]

// Top Rated Foods Data
const topRatedFoods = [
  {
    id: 1,
    name: "Meat Pizza",
    rating: 4.5,
    reviews: 3,
    image: topRated1,
  },
  {
    id: 2,
    name: "Steak Kebabs",
    rating: 0,
    reviews: 0,
    image: topRated2,
  },
  {
    id: 3,
    name: "FRIED RICE",
    rating: 0,
    reviews: 0,
    image: topRated3,
  },
  {
    id: 4,
    name: "Thai Fried Rice",
    rating: 0,
    reviews: 0,
    image: topRated4,
  },
  {
    id: 5,
    name: "Cheese Pizza",
    rating: 0,
    reviews: 0,
    image: topRated5,
  },
  {
    id: 6,
    name: "grilled lemon herb M...",
    rating: 0,
    reviews: 0,
    image: topRated6,
  },
]

export default function Dashboard() {
  const [statisticsType, setStatisticsType] = useState("overall")
  const navigate = useNavigate()

  const handleOrderStatClick = (stat) => {
    if (stat?.status) {
      navigate(`/restaurant-panel/orders?status=${stat.status}`)
    } else {
      navigate("/restaurant-panel/orders")
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Title and Followup Section */}
      <div className="flex items-center justify-between">
        {/* Dashboard Title with Icon - Left Side */}
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary-orange" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Followup Section - Right Side */}
        <div className="flex items-center gap-2 text-gray-700">
          <Utensils className="h-5 w-5 text-primary-orange" />
          <span className="font-medium">Followup</span>
        </div>
      </div>

      {/* Two Cards in Flex Layout - Order Statistics (larger) and Create Ads (smaller) */}
      <div className="flex gap-6">
        {/* Order Statistics Card - Increased width */}
        <Card className="flex-[3]">
          <CardHeader className="pb-3 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Order statistics</CardTitle>
              <Select value={statisticsType} onValueChange={setStatisticsType}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 hover:bg-white [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select period" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="overall" className="bg-white hover:bg-gray-50 focus:bg-gray-50">Overall Statistics</SelectItem>
                  <SelectItem value="today" className="bg-white hover:bg-gray-50 focus:bg-gray-50">Today</SelectItem>
                  <SelectItem value="week" className="bg-white hover:bg-gray-50 focus:bg-gray-50">This Week</SelectItem>
                  <SelectItem value="month" className="bg-white hover:bg-gray-50 focus:bg-gray-50">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* First Row - 4 Cards (Vertical Layout) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {orderStats.slice(0, 4).map((stat, index) => (
                  <Card
                    key={stat.id}
                    onClick={() => handleOrderStatClick(stat)}
                    className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={stat.icon}
                            alt={stat.label}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div className={`text-2xl font-bold ${stat.textColor} mb-1 group-hover:scale-110 transition-transform duration-300`}>
                          {stat.count}
                        </div>
                        <div className={`text-xs font-medium ${stat.textColor} text-center`}>
                          {stat.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Second Row - 4 Cards (Horizontal Flex Layout) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {orderStats.slice(4, 8).map((stat, index) => (
                  <Card
                    key={stat.id}
                    onClick={() => handleOrderStatClick(stat)}
                    className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up`}
                    style={{
                      animationDelay: `${(index + 4) * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <CardContent className="p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={stat.icon}
                            alt={stat.label}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-lg font-bold ${stat.textColor} mb-0.5 group-hover:scale-105 transition-transform duration-300`}>
                            {stat.count}
                          </div>
                          <div className={`text-xs font-medium ${stat.textColor} truncate`}>
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Ads Card - Reduced width */}
        <Card className="flex-[1.2] bg-gradient-to-br from-gray-50 to-white border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              {/* Promo Illustration */}
              <div className="mb-3 flex items-center justify-center group">
                <img
                  src={promoIcon}
                  alt="Promotional illustration"
                  className="w-full h-auto object-contain max-h-36 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="space-y-2.5">
                <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-200">
                  Want to get highlighted?
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  Create ads to get highlighted on the app and web browser
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white font-semibold py-2 rounded-md shadow-md hover:shadow-lg text-sm transition-all duration-300">
                  Create Ads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graph Section */}
      <Card>
        <CardHeader className="bg-white">
          <div className="flex items-center justify-between">
            {/* Title with Icon - Left Side */}
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-orange" />
              <CardTitle className="text-lg font-semibold">Yearly Statistics</CardTitle>
            </div>

            {/* Legend - Right Side */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-300"></div>
                <span className="text-sm text-gray-700">Commission given : $ 164.00</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-700">Total earning : $ 1,410.00</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { month: "Jan", commission: 0, earning: 0 },
                { month: "Feb", commission: 0, earning: 0 },
                { month: "Mar", commission: 0, earning: 0 },
                { month: "Apr", commission: 0, earning: 0 },
                { month: "May", commission: 0, earning: 0 },
                { month: "Jun", commission: 0, earning: 0 },
                { month: "Jul", commission: 1300, earning: 150 },
                { month: "Aug", commission: 0, earning: 0 },
                { month: "Sep", commission: 0, earning: 0 },
                { month: "Oct", commission: 0, earning: 0 },
                { month: "Nov", commission: 0, earning: 0 },
                { month: "Dec", commission: 0, earning: 0 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                label={{ value: "$(Currency)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 12 }}
                domain={[0, 2000]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
                formatter={(value) => `$${value}`}
              />
              <Bar
                dataKey="commission"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
                name="Commission given"
              />
              <Bar
                dataKey="earning"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                name="Total earning"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top rated foods + Top selling foods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top rated foods */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={cookingIcon} alt="top rated foods" className="w-4 h-4 object-contain" />
              <CardTitle className="text-sm font-semibold text-[#111827]">
                Top Rated Foods
              </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {topRatedFoods.map((food, idx) => (
                <div key={food.id || idx} className="text-center">
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-[#E5E7EB]">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#111827] mb-1 line-clamp-2">
                    {food.name}
                  </p>
                  <p className="text-[10px] text-[#F59E0B] mb-0.5">
                    ★ {food.rating || "0.0"}
                  </p>
                  <p className="text-[10px] text-[#9BA6B7]">
                    {food.reviews || 0} Reviews
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top selling foods */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={deliveredIcon} alt="top selling foods" className="w-4 h-4 object-contain" />
              <CardTitle className="text-sm font-semibold text-[#111827]">
                Top Selling Foods
              </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {topSellingFoods.map((food, idx) => (
                <div key={food.id || idx} className="text-center">
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-[#E5E7EB]">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#111827] mb-1 line-clamp-2">
                    {food.name}
                  </p>
                  <p className="text-[10px] text-[#9BA6B7]">
                    Sold: {food.sold}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

