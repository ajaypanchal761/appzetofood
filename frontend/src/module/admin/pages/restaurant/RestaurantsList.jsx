import { useState, useMemo, useEffect } from "react"
import { Search, Download, ChevronDown, Eye, Edit, Settings, ArrowUpDown } from "lucide-react"
import { getRestaurants } from "../../utils/restaurantStorage"

// Import icons from Dashboard-icons
import locationIcon from "../../assets/Dashboard-icons/image1.png"
import restaurantIcon from "../../assets/Dashboard-icons/image2.png"
import inactiveIcon from "../../assets/Dashboard-icons/image3.png"
import buildingIcon from "../../assets/Dashboard-icons/image4.png"
import documentIcon from "../../assets/Dashboard-icons/image5.png"
import checkIcon from "../../assets/Dashboard-icons/image6.png"
import currencyIcon from "../../assets/Dashboard-icons/image7.png"
import transactionIcon from "../../assets/Dashboard-icons/image8.png"
import withdrawIcon from "../../assets/Dashboard-icons/image9.png"

export default function RestaurantsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [restaurants, setRestaurants] = useState([])

  // Load restaurants from storage on mount and when storage changes
  useEffect(() => {
    const loadRestaurants = () => {
      const storedRestaurants = getRestaurants()
      setRestaurants(storedRestaurants)
    }
    
    loadRestaurants()
    
    // Listen for storage changes (when restaurant is added from another tab/page)
    const handleStorageChange = (e) => {
      if (e.key === "appzeto_restaurants") {
        loadRestaurants()
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(loadRestaurants, 1000)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  const [filters, setFilters] = useState({
    all: "All",
    businessModel: "",
    cuisine: "",
    zone: "",
  })

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.ownerName.toLowerCase().includes(query) ||
        restaurant.ownerPhone.includes(query)
      )
    }

    if (filters.all !== "All") {
      if (filters.all === "Active") {
        result = result.filter(restaurant => restaurant.status === true)
      } else if (filters.all === "Inactive") {
        result = result.filter(restaurant => restaurant.status === false)
      }
    }

    if (filters.cuisine) {
      result = result.filter(restaurant => 
        restaurant.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
      )
    }

    if (filters.zone) {
      result = result.filter(restaurant => restaurant.zone === filters.zone)
    }

    return result
  }, [restaurants, searchQuery, filters])

  const handleToggleStatus = (id) => {
    setRestaurants(restaurants.map(restaurant =>
      restaurant.id === id ? { ...restaurant, status: !restaurant.status } : restaurant
    ))
  }

  const totalRestaurants = restaurants.length
  const activeRestaurants = restaurants.filter(r => r.status).length
  const inactiveRestaurants = restaurants.filter(r => !r.status).length
  const newlyJoined = 0 // Can be calculated based on join date if available

  const maskPhone = (phone) => {
    if (!phone) return ""
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length >= 4) {
      return phone.slice(0, -4) + "****"
    }
    return phone
  }

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Restaurants {totalRestaurants}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={filters.all}
                  onChange={(e) => setFilters(prev => ({ ...prev, all: e.target.value }))}
                  className="px-4 py-2.5 pr-8 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filters.businessModel}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessModel: e.target.value }))}
                  className="px-4 py-2.5 pr-8 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Business model</option>
                  <option value="commission">Commission</option>
                  <option value="subscription">Subscription</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filters.cuisine}
                  onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="px-4 py-2.5 pr-8 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Cuisine</option>
                  <option value="Italian">Italian</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mexican">Mexican</option>
                  <option value="American">American</option>
                  <option value="Indian">Indian</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
                  className="px-4 py-2.5 pr-8 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select zone</option>
                  <option value="All over the World">All over the World</option>
                  <option value="Zone 1">Zone 1</option>
                  <option value="Zone 2">Zone 2</option>
                  <option value="Zone 3">Zone 3</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total restaurants</p>
                <p className="text-2xl font-bold text-slate-900">{totalRestaurants}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <img src={locationIcon} alt="Location" className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Active Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active restaurants</p>
                <p className="text-2xl font-bold text-slate-900">{activeRestaurants}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <img src={restaurantIcon} alt="Restaurant" className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Inactive Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Inactive restaurants</p>
                <p className="text-2xl font-bold text-slate-900">{inactiveRestaurants}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <img src={inactiveIcon} alt="Inactive" className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Newly Joined */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Newly joined restaurants</p>
                <p className="text-2xl font-bold text-slate-900">{newlyJoined}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <img src={buildingIcon} alt="Building" className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-8 lg:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <img src={documentIcon} alt="Transactions" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Transactions</p>
                <p className="text-lg font-bold text-blue-600">56</p>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <img src={checkIcon} alt="Check" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Commission Earned</p>
                <p className="text-lg font-bold text-green-600">$ 13,154.08</p>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <img src={currencyIcon} alt="Withdraws" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase">Total Restaurant Withdraws</p>
                <p className="text-lg font-bold text-red-600">$ 733.23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurants List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Restaurants List</h2>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[250px]">
                <input
                  type="text"
                  placeholder="Ex: search by Restaurant n"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all">
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <button className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>SL</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Restaurant Info</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Owner Info</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Zone</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Cuisine</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-semibold text-slate-700 mb-1">No Data Found</p>
                        <p className="text-sm text-slate-500">No restaurants match your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((restaurant, index) => (
                    <tr
                      key={restaurant.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <img
                              src={restaurant.logo}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/40"
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{restaurant.name}</span>
                            <span className="text-xs text-slate-500">{renderStars(restaurant.rating)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{restaurant.ownerName}</span>
                          <span className="text-xs text-slate-500">{maskPhone(restaurant.ownerPhone)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{restaurant.zone}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{restaurant.cuisine}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(restaurant.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            restaurant.status ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              restaurant.status ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
