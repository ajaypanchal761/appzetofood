import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Image as ImageIcon, 
  Grid3x3,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ThumbsUp,
  Edit,
  Plus,
  Utensils,
  X,
  Menu,
  Camera,
  SlidersHorizontal,
  ArrowLeft,
  Trash2
} from "lucide-react"
import BottomNavOrders from "../components/BottomNavOrders"
// Removed foodManagement - now using backend API directly
import { Switch } from "@/components/ui/switch"
import { useNavigate } from "react-router-dom"
import { restaurantAPI } from "@/lib/api"
import { toast } from "sonner"

export default function HubMenu() {
  const navigate = useNavigate()
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvailabilityPopupOpen, setIsAvailabilityPopupOpen] = useState(false)
  const [isCategoryOptionsOpen, setIsCategoryOptionsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null) // { id, name }
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null) // Active filter for filtering menu
  const [availabilityReason, setAvailabilityReason] = useState(null)
  const [switchingOffTarget, setSwitchingOffTarget] = useState(null) // { type: 'item' | 'group', id: string, groupId?: string }
  const [menuData, setMenuData] = useState([]) // Store menu groups with state
  const scrollContainerRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const mainScrollRef = useRef(null)
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [subCategoryName, setSubCategoryName] = useState("")
  const [selectedGroupForSubCategory, setSelectedGroupForSubCategory] = useState(null) // { id, name }
  const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [restaurantData, setRestaurantData] = useState(null)

  // Restaurant info - fetch from backend
  const restaurantName = restaurantData?.name || ""
  const restaurantExpertise = restaurantData?.cuisines?.length > 0 
    ? restaurantData.cuisines.join(", ") 
    : ""

  // Handle scroll to change title
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop
      // Change title when scrolled more than 80px for smoother transition
      setIsScrolled(scrollPosition > 80)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate filter counts from menu data
  const calculateFilterCounts = useMemo(() => {
    // Get all items from menuData (including subsections)
    const allItems = []
    menuData.forEach(section => {
      if (section.items && Array.isArray(section.items)) {
        allItems.push(...section.items)
      }
      if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections.forEach(subsection => {
          if (subsection.items && Array.isArray(subsection.items)) {
            allItems.push(...subsection.items)
          }
        })
      }
    })

    // Calculate counts for each filter (matching the filtering logic exactly)
    const counts = {
      recommended: allItems.filter(item => item.isRecommended === true).length,
      "out-of-stock": allItems.filter(item => !item.isAvailable).length,
      "no-photos": allItems.filter(item => !item.image || item.photoCount === 0).length,
      "without-description": allItems.filter(item => !item.description || item.description.trim() === "").length,
      "without-serving-info": allItems.filter(item => !item.variations || item.variations.length === 0).length,
      "item-not-live": allItems.filter(item => !item.isAvailable).length,
      "photos-rejected": 0, // This would need a status field in the item model
      "under-review": 0, // This would need a status field in the item model
      goods: 0, // This would need a category type field
      services: 0, // This would need a category type field
    }

    return counts
  }, [menuData])

  // Filter options with dynamic counts
  const filterOptions = useMemo(() => [
    { id: "recommended", label: "Recommended", count: calculateFilterCounts.recommended },
    { id: "out-of-stock", label: "Out of stock", count: calculateFilterCounts["out-of-stock"] },
    { id: "goods", label: "Goods", count: calculateFilterCounts.goods },
    { id: "services", label: "Services", count: calculateFilterCounts.services },
    { id: "item-not-live", label: "Item not live", count: calculateFilterCounts["item-not-live"] },
    { id: "photos-rejected", label: "Photos rejected", count: calculateFilterCounts["photos-rejected"] },
    { id: "no-photos", label: "No photos", count: calculateFilterCounts["no-photos"] },
    { id: "under-review", label: "Under review", count: calculateFilterCounts["under-review"] },
    { id: "without-description", label: "Without description", count: calculateFilterCounts["without-description"] },
    { id: "without-serving-info", label: "Without serving info", count: calculateFilterCounts["without-serving-info"] },
  ], [calculateFilterCounts])

  // Quick filter buttons (horizontally scrollable) - only show filters with count > 0
  const quickFilters = useMemo(() => {
    const filters = [
      { id: "out-of-stock", label: "Out of stock", count: calculateFilterCounts["out-of-stock"] },
      { id: "no-photos", label: "No photos", count: calculateFilterCounts["no-photos"] },
      { id: "recommended", label: "Recommended", count: calculateFilterCounts.recommended },
      { id: "services", label: "Services", count: calculateFilterCounts.services },
      { id: "photos-rejected", label: "Photos Rejected", count: calculateFilterCounts["photos-rejected"] },
    ]
    // Only return filters with count > 0
    return filters.filter(f => f.count > 0)
  }, [calculateFilterCounts])

  // Menu groups are now directly from menuData (fetched from backend)

  // Fetch restaurant data on mount
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantData(data)
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error)
      }
    }
    
    fetchRestaurantData()
  }, [])

  // Fetch menu from API on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true)
        const response = await restaurantAPI.getMenu()
        
        if (response.data && response.data.success && response.data.data && response.data.data.menu) {
          const menuSections = response.data.data.menu.sections || []
          setMenuData(menuSections)
          
          // Menu data is now directly from backend, no need to transform
        } else {
          // Empty menu - start fresh
          setMenuData([])
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
        // Check if it's a network error (backend not running)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          toast.error('Cannot connect to server. Please check if backend is running.')
        } else {
          toast.error('Failed to load menu')
        }
        setMenuData([])
      } finally {
        setLoadingMenu(false)
      }
    }
    
    fetchMenu()
  }, [])

  // Save menu to API whenever menuData changes (debounced)
  useEffect(() => {
    if (!loadingMenu && menuData.length >= 0) {
      const timeoutId = setTimeout(async () => {
        try {
          // Normalize menuData before saving to ensure proper structure matching backend schema
          const normalizedSections = menuData.map((section, index) => ({
            id: section.id || `section-${index}`,
            name: section.name || "Unnamed Section",
            items: Array.isArray(section.items) ? section.items.map(item => ({
              id: String(item.id || Date.now() + Math.random()),
              name: item.name || "Unnamed Item",
              nameArabic: item.nameArabic || "",
              image: item.image || "",
              category: item.category || section.name,
              rating: item.rating ?? 0.0,
              reviews: item.reviews ?? 0,
              price: item.price || 0,
              stock: item.stock || "Unlimited",
              discount: item.discount || null,
              originalPrice: item.originalPrice || null,
              foodType: item.foodType || "Non-Veg",
              availabilityTimeStart: item.availabilityTimeStart || "12:01 AM",
              availabilityTimeEnd: item.availabilityTimeEnd || "11:57 PM",
              description: item.description || "",
              discountType: item.discountType || "Percent",
              discountAmount: item.discountAmount ?? 0.0,
              isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
              isRecommended: item.isRecommended || false,
              variations: Array.isArray(item.variations) ? item.variations.map(v => ({
                id: String(v.id || Date.now() + Math.random()),
                name: v.name || "",
                price: v.price || 0,
                stock: v.stock || "Unlimited",
              })) : [],
              tags: Array.isArray(item.tags) ? item.tags : [],
              nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
              allergies: Array.isArray(item.allergies) ? item.allergies : [],
              photoCount: item.photoCount ?? 1,
            })) : [],
            subsections: Array.isArray(section.subsections) ? section.subsections.map(subsection => ({
              id: subsection.id || `subsection-${Date.now()}`,
              name: subsection.name || "Unnamed Subsection",
              items: Array.isArray(subsection.items) ? subsection.items.map(item => ({
                id: String(item.id || Date.now() + Math.random()),
                name: item.name || "Unnamed Item",
                nameArabic: item.nameArabic || "",
                image: item.image || "",
                category: item.category || section.name,
                rating: item.rating ?? 0.0,
                reviews: item.reviews ?? 0,
                price: item.price || 0,
                stock: item.stock || "Unlimited",
                discount: item.discount || null,
                originalPrice: item.originalPrice || null,
                foodType: item.foodType || "Non-Veg",
                availabilityTimeStart: item.availabilityTimeStart || "12:01 AM",
                availabilityTimeEnd: item.availabilityTimeEnd || "11:57 PM",
                description: item.description || "",
                discountType: item.discountType || "Percent",
                discountAmount: item.discountAmount ?? 0.0,
                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                isRecommended: item.isRecommended || false,
                variations: Array.isArray(item.variations) ? item.variations.map(v => ({
                  id: String(v.id || Date.now() + Math.random()),
                  name: v.name || "",
                  price: v.price || 0,
                  stock: v.stock || "Unlimited",
                })) : [],
                tags: Array.isArray(item.tags) ? item.tags : [],
                nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
                allergies: Array.isArray(item.allergies) ? item.allergies : [],
                photoCount: item.photoCount ?? 1,
              })) : [],
            })) : [],
            isEnabled: section.isEnabled !== undefined ? section.isEnabled : true,
            order: section.order !== undefined ? section.order : index,
          }))
          
          await restaurantAPI.updateMenu({ sections: normalizedSections })
          console.log('✅ Menu saved successfully with', normalizedSections.length, 'sections')
        } catch (error) {
          console.error('Error saving menu:', error)
          // Check if it's a network error (backend not running)
          if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.warn('Backend server may not be running. Menu changes will be saved when connection is restored.')
            // Don't show error toast for network errors during auto-save to avoid spam
            // The user will see the error when they manually try to save
          } else {
            toast.error('Failed to save menu changes')
          }
        }
      }, 1000) // Debounce: save 1 second after last change
      
      return () => clearTimeout(timeoutId)
    }
  }, [menuData, loadingMenu])

  // Initialize menuData from menuGroups if empty (for backward compatibility)
  // This is now handled in the fetchMenu useEffect, so we don't need this anymore
  // Keeping it commented out in case we need it for migration
  // useEffect(() => {
  //   if (menuData.length === 0 && menuGroups.length > 0 && !loadingMenu) {
  //     setMenuData(menuGroups)
  //   }
  // }, [menuGroups, loadingMenu])

  // Expand all groups by default on mount
  useEffect(() => {
    if (expandedGroups.size === 0 && menuData.length > 0) {
      setExpandedGroups(new Set(menuData.map(g => g.id)))
    }
  }, [menuData, expandedGroups])

  // Prevent body scroll when popups are open
  useEffect(() => {
    if (isFilterOpen || isAddPopupOpen || isMenuOpen || isAvailabilityPopupOpen || 
        isCategoryOptionsOpen || isEditCategoryOpen || isAddSubCategoryOpen || isAddCategoryPopupOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFilterOpen, isAddPopupOpen, isMenuOpen, isAvailabilityPopupOpen, 
      isCategoryOptionsOpen, isEditCategoryOpen, isAddSubCategoryOpen, isAddCategoryPopupOpen, isSearchOpen])

  // Filter menu based on active filter and search query
  const filteredMenuGroups = useMemo(() => {
    let filtered = menuData

    // Apply filter-based filtering
    if (activeFilter) {
      filtered = filtered.map(group => {
        const filteredItems = group.items.filter(item => {
          switch (activeFilter) {
            case "recommended":
              return item.isRecommended
            case "out-of-stock":
              return !item.isAvailable
            case "no-photos":
              return !item.image || item.photoCount === 0
            case "without-description":
              return !item.description || item.description.trim() === ""
            case "without-serving-info":
              return !item.variations || item.variations.length === 0
            default:
              return true
          }
        })
        return { ...group, items: filteredItems }
      }).filter(group => group.items.length > 0)
    }

    // Apply search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.map(group => {
        const filteredItems = group.items.filter(item => {
          return item.name.toLowerCase().includes(query) ||
                 item.category.toLowerCase().includes(query) ||
                 (item.description && item.description.toLowerCase().includes(query))
        })
        return { ...group, items: filteredItems }
      }).filter(group => group.items.length > 0)
    }

    return filtered
  }, [menuData, activeFilter, searchQuery])

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // Toggle group enable/disable - opens popup
  const toggleGroupEnabled = (groupId) => {
    const group = menuData.find(g => g.id === groupId)
    if (group && group.isEnabled) {
      // Opening popup to switch off
      setSwitchingOffTarget({ type: 'group', id: groupId })
      setIsAvailabilityPopupOpen(true)
      setAvailabilityReason(null)
    } else {
      // Directly turn on (no popup needed)
      setMenuData(prev => prev.map(g => 
        g.id === groupId ? { ...g, isEnabled: true } : g
      ))
    }
  }

  // Toggle item stock status - opens popup
  const toggleItemStock = (itemId, groupId) => {
    const group = menuData.find(g => g.id === groupId)
    const item = group?.items.find(i => i.id === itemId)
    if (item && item.isAvailable) {
      // Opening popup to switch off
      setSwitchingOffTarget({ type: 'item', id: itemId, groupId })
      setIsAvailabilityPopupOpen(true)
      setAvailabilityReason(null)
    } else {
      // Directly turn on (no popup needed)
      setMenuData(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => 
          i.id === itemId ? { ...i, isAvailable: true } : i
        )
      })))
    }
  }

  // Toggle item recommendation
  const toggleItemRecommendation = (itemId, groupId) => {
    setMenuData(prev => prev.map(g => ({
      ...g,
      items: g.items.map(i => 
        i.id === itemId ? { ...i, isRecommended: !i.isRecommended } : i
      )
    })))
  }

  // Handle availability popup confirm
  const handleAvailabilityConfirm = () => {
    if (!availabilityReason || !switchingOffTarget) return

    if (switchingOffTarget.type === 'group') {
      setMenuData(prev => prev.map(g => 
        g.id === switchingOffTarget.id ? { ...g, isEnabled: false } : g
      ))
    } else if (switchingOffTarget.type === 'item') {
      setMenuData(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => 
          i.id === switchingOffTarget.id ? { ...i, isAvailable: false } : i
        )
      })))
    }

    setIsAvailabilityPopupOpen(false)
    setAvailabilityReason(null)
    setSwitchingOffTarget(null)
  }

  // Handle filter selection
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId)
    setActiveFilter(filterId)
    setIsFilterOpen(false)
  }

  // Category options handlers
  const handleOpenCategoryOptions = (group) => {
    setSelectedCategory({ id: group.id, name: group.name })
    setIsCategoryOptionsOpen(true)
  }

  const handleEditCategory = () => {
    if (!selectedCategory) return
    setEditCategoryName(selectedCategory.name)
    setIsEditCategoryOpen(true)
    setIsCategoryOptionsOpen(false)
  }

  const handleSaveCategoryName = () => {
    if (!editCategoryName.trim() || !selectedCategory) return
    
    const newCategoryName = editCategoryName.trim()
    if (newCategoryName === selectedCategory.name) {
      setIsEditCategoryOpen(false)
      setSelectedCategory(null)
      return
    }

    // Update all foods in this category
    const allFoods = getAllFoods()
    const updatedFoods = allFoods.map(food => {
      if (food.category === selectedCategory.name) {
        return { ...food, category: newCategoryName }
      }
      return food
    })

    // Save updated foods
    try {
      localStorage.setItem('restaurant_foods', JSON.stringify(updatedFoods))
      window.dispatchEvent(new CustomEvent('foodsChanged'))
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category name')
      return
    }

    setIsEditCategoryOpen(false)
    setSelectedCategory(null)
    setEditCategoryName("")
  }

  // Sub-category handlers
  const handleOpenAddSubCategory = (group) => {
    setSelectedGroupForSubCategory({ id: group.id, name: group.name })
    setSubCategoryName("")
    setIsAddSubCategoryOpen(true)
  }

  const handleContinueSubCategory = () => {
    if (!subCategoryName.trim() || !selectedGroupForSubCategory) return
    
    // Navigate to new item page with sub-category info
    navigate('/restaurant/hub-menu/item/new', {
      state: {
        groupId: selectedGroupForSubCategory.id,
        category: selectedGroupForSubCategory.name,
        subCategory: subCategoryName.trim()
      }
    })
    
    // Close popup and reset
    setIsAddSubCategoryOpen(false)
    setSubCategoryName("")
    setSelectedGroupForSubCategory(null)
  }

  // Add category handlers
  const handleOpenAddCategory = () => {
    setNewCategoryName("")
    setIsAddCategoryPopupOpen(true)
    setIsAddPopupOpen(false) // Close the main add popup
  }

  const handleContinueAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }
    
    try {
      // Add category to backend
      const response = await restaurantAPI.addSection(newCategoryName.trim())
      
      if (response.data && response.data.success) {
        // Refresh menu data
        const menuResponse = await restaurantAPI.getMenu()
        if (menuResponse.data && menuResponse.data.success && menuResponse.data.data && menuResponse.data.data.menu) {
          setMenuData(menuResponse.data.data.menu.sections || [])
        }
        
        toast.success('Category added successfully!')
        
        // Navigate to new item page with new category
        navigate('/restaurant/hub-menu/item/new', {
          state: {
            category: newCategoryName.trim(),
            isNewCategory: true,
            sectionId: response.data.data.section.id
          }
        })
      } else {
        toast.error(response.data?.message || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error(error.response?.data?.message || 'Failed to add category')
    }
    
    // Close popup and reset
    setIsAddCategoryPopupOpen(false)
    setNewCategoryName("")
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    
    if (!window.confirm(`Are you sure you want to delete the category "${selectedCategory.name}"? This will delete all items in this category.`)) {
      return
    }

    try {
      // Remove section from menuData and update backend
      const updatedSections = menuData.filter(section => section.id !== selectedCategory.id)
      
      await restaurantAPI.updateMenu({ sections: updatedSections })
      
      // Update local state
      setMenuData(updatedSections)
      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
      return
    }

    setIsCategoryOptionsOpen(false)
    setSelectedCategory(null)
  }

  // Scroll to category
  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`group-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>{`
        [data-slot="switch"][data-state="checked"] {
          background-color: #16a34a !important;
        }
        [data-slot="switch-thumb"][data-state="checked"] {
          background-color: #ffffff !important;
        }
      `}</style>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white ">
        <div className="">
          {/* Top bar with Menu title and icons */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="relative h-8 flex items-center flex-1 min-w-0 pr-3">
              <AnimatePresence mode="wait">
                {!isScrolled ? (
                  <motion.h1
                    key="menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-2xl font-bold text-gray-900 absolute"
                  >
                    Menu
                  </motion.h1>
                ) : (
                  <motion.h1
                    key="restaurant"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-lg font-bold text-gray-900 absolute truncate max-w-full"
                    title={restaurantName}
                  >
                    {restaurantName.length > 25 ? `${restaurantName.substring(0, 25)}...` : restaurantName}
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <button
              className="p-2 ml-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => navigate("/restaurant/explore")}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            </div>
          </div>

          {/* Restaurant name and expertise */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div
                initial={{ opacity: 1, height: "auto" }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mb-3 px-4 py-1 overflow-hidden"
              >
                <h2 className="text-lg font-bold text-gray-900">{restaurantName}</h2>
                <p className="text-sm text-gray-600">{restaurantExpertise}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontally scrollable filters */}
          <div className="flex pl-4 relative items-center gap-2 overflow-x-auto pb-2" ref={scrollContainerRef} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {activeFilter && (
              <button
                onClick={() => {
                  setActiveFilter(null)
                  setSelectedFilter(null)
                }}
                className="flex items-center gap-2 px-2 py-1 text-semibold border-2 border-gray-300 rounded-md text-sm font-medium whitespace-nowrap shrink-0 bg-white text-gray-900"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterSelect(filter.id)}
                className={`flex items-center gap-2 px-2 py-1 text-semibold border-2 rounded-md text-sm font-medium whitespace-nowrap shrink-0 ${
                  activeFilter === filter.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <span>{filter.label}</span>
                <span className="bg-red-100 border-2 border-red-400 text-red-400 text-xs  font-bold p-0.5 py-0.25 rounded-sm">
                  {filter.count}
                </span>
              </button>

            ))}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="sticky right-0 z-10 bg-black p-2 text-white border-2 border-black flex items-center gap-2 px-2 py-1 text-semibold rounded-l-lg text-sm font-medium whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
      </div>

        <div className="flex items-center gap-2 p-0.5 mt-2 w-auto mx-4 bg-gray-200 rounded-md">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white text-black"
                : " text-gray-600"
            }`}
          >
            All items
          </button>
          <button
            onClick={() => setActiveTab("add-ons")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "add-ons"
                ? "bg-white text-black"
                : " text-gray-600"
            }`}
          >
            Add-ons
          </button>
        </div>
      {/* Content */}
      <div className="flex-1 space-y-4 pt-8">
        {activeTab === "add-ons" ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-500">No add-ons available</p>
              <p className="text-sm text-gray-400 mt-2">Add-ons will appear here when you create them</p>
            </div>
          </div>
        ) : (
          filteredMenuGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id)
            const itemCount = group.items.length
            const enabledItems = group.items.filter(item => item.isAvailable).length

          return (
            <div
              key={group.id}
              id={`group-${group.id}`}
              className="bg-white rounded-lg  overflow-hidden"
            >
              {/* Group Header */}
              <div className="py-3 flex items-center justify-between px-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-1 h-6 bg-red-500 rounded-r-full" />
                  <h3 className="text-base font-bold text-gray-900">
                    {group.name} ({enabledItems})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleGroup(group.id)
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors z-10 relative"
                    aria-label={isExpanded ? "Collapse section" : "Expand section"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleOpenCategoryOptions(group)
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors z-10 relative"
                    aria-label="Category options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-2">
                  {/* Group Toggle Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">
                      {group.name} ({enabledItems})
                    </h4>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={group.isEnabled}
                        onCheckedChange={() => toggleGroupEnabled(group.id)}
                        className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          {/* Left: Veg/Non-veg icon, name, price */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center ${
                                  item.foodType === "Veg"
                                    ? "bg-green-50 border-green-600"
                                    : "bg-red-50 border-red-600"
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  item.foodType === "Veg"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`} />
                              </div>
                            </div>
                            <h5 className="text-base font-bold text-gray-900">{item.name}</h5>
                            <p className="text-sm font-medium text-gray-700 mb-3">₹{item.price}</p>
                          </div>

                          {/* Right: Image */}
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                              <div className="flex items-center gap-1">
                                <Camera className="w-3 h-3 text-white" />
                                <span className="text-white text-xs font-semibold">{item.photoCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons - below image */}
                        <div className="flex items-center justify-between gap-3 mt-4">
                          <button
                            onClick={() => toggleItemRecommendation(item.id, group.id)}
                            className={`flex items-center gap-1.5 px-3 bg-transparent py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              item.isRecommended
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Recommend</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => toggleItemStock(item.id, group.id)}
                              className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-green-600"
                            />
                            <span className="text-sm text-gray-600">In stock</span>
                          </div>
                          <button 
                            onClick={() => navigate(`/restaurant/hub-menu/item/${item.id}`, { state: { item, groupId: group.id } })}
                            className="flex items-center gap-1.5 bg-transparent text-gray-700 text-sm font-medium"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add buttons at end of group */}
                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => handleOpenAddSubCategory(group)}
                      className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                    >
                      + Add sub-category
                    </button>
                    <button 
                      onClick={() => navigate(`/restaurant/hub-menu/item/new`, { state: { groupId: group.id, category: group.name } })}
                      className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                    >
                      + Add item
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }))
        }
      </div>

      {/* Filter Popup */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {filterOptions.map((filter, index) => (
                    <label
                      key={filter.id}
                      className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {filter.label} ({filter.count})
                      </span>
                      <input
                        type="radio"
                        name="filter"
                        value={filter.id}
                        checked={activeFilter === filter.id}
                        onChange={() => handleFilterSelect(filter.id)}
                        className="w-5 h-5 text-black border-gray-400 focus:ring-black"
                        style={{ accentColor: "#000000" }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4 border-t border-gray-200 space-y-2">
                {activeFilter && (
                  <button
                    onClick={() => {
                      setActiveFilter(null)
                      setSelectedFilter(null)
                      setIsFilterOpen(false)
                    }}
                    className="w-full py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Clear filter
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 rounded-lg font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Popup */}
      <AnimatePresence>
        {isAddPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 text-center">Add item</h2>
              </div>
              <div className="px-4 py-4 space-y-2">
                <button
                  onClick={() => {
                    navigate(`/restaurant/hub-menu/item/new`)
                  }}
                  className="w-full py-3 px-4 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Add item</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Availability Popup */}
      <div>
        {isAvailabilityPopupOpen && (
          <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[9999]"
            >
              {/* Header */}
              <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsAvailabilityPopupOpen(false)
                    setAvailabilityReason(null)
                    setSwitchingOffTarget(null)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">When will this be available?</h2>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                {/* Auto turn-on after section */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Auto turn-on after</h3>
                  <div className="space-y-4">
                    {[
                      { id: "2-hours", label: "2 Hours" },
                      { id: "4-hours", label: "4 Hours" },
                      { id: "next-business-day", label: "Next business day" },
                      { id: "custom", label: "Custom date & time (upto 7 days)" },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={option.id}
                          checked={availabilityReason === option.id}
                          onChange={() => setAvailabilityReason(option.id)}
                          className="w-5 h-5 text-black border-gray-400 focus:ring-black"
                          style={{ accentColor: "#000000" }}
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6" />

                {/* Manually turn on section */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Manually turn on</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer py-2">
                      <input
                        type="radio"
                        name="availability"
                        value="manual"
                        checked={availabilityReason === "manual"}
                        onChange={() => setAvailabilityReason("manual")}
                        className="w-5 h-5 text-black border-gray-400 focus:ring-black"
                        style={{ accentColor: "#000000" }}
                      />
                      <span className="text-sm font-medium text-gray-900">I will turn it on myself</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-8">
                      This item will not be visible to customers on the Zomato app till you switch it on.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  onClick={handleAvailabilityConfirm}
                  disabled={!availabilityReason}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                    availabilityReason
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Sticky Bottom Right Buttons */}
      <div className="fixed right-4 bottom-24 z-30 flex flex-col gap-1">
        {/* ADD Button */}

        {activeTab !== "add-ons" && (
          <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsAddPopupOpen(true)}
          className="px-4 py-2 border bg-black text-white border-gray-800 rounded-lg text-sm font-bold"
        >
          + ADD
        </motion.button>)}

        {/* Menu Button */}
        {activeTab !== "add-ons" && (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-800 bg-white text-sm font-medium shadow-sm"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {isMenuOpen ? (
                  <X className="w-4 h-4 text-gray-900" />
                ) : (
                  <Utensils className="w-4 h-4 text-gray-900" />
                )}
              </span>
              <span>{isMenuOpen ? "Close" : "Menu"}</span>
            </motion.button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/40 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed right-4 bottom-36 z-30 w-[60vw] max-w-sm h-[45vh] bg-white rounded-3xl shadow-lg overflow-hidden"
                  >
                    <div className="h-full flex flex-col">
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-sm font-semibold text-gray-900">Menu</p>
                      </div>
                      <div className="h-px bg-gray-200 mx-4" />
                      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                        {menuData.map((category, index) => {
                          const itemCount = category.items.filter(item => item.isAvailable).length
                          const isLast = index === menuData.length - 1

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                setIsMenuOpen(false)
                                setTimeout(() => scrollToCategory(category.id), 200)
                              }}
                              className="w-full text-left py-3 focus:outline-none"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </span>
                                <span className="min-w-[28px] h-7 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-800">
                                  {itemCount}
                                </span>
                              </div>
                              {!isLast && (
                                <div className="mt-3 border-t border-dashed border-gray-200" />
                              )}
                            </button>
                          )
                        })}
                      </div>
        </div>
      </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Category Options Popup */}
      <AnimatePresence>
        {isCategoryOptionsOpen && selectedCategory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryOptionsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[50vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{selectedCategory.name}</h2>
                <button
                  onClick={() => setIsCategoryOptionsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  <button
                    onClick={handleEditCategory}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                    <span>Edit category name</span>
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-red-600 bg-gray-50 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span>Delete category</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Category Name Popup */}
      <AnimatePresence>
        {isEditCategoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditCategoryOpen(false)
                setEditCategoryName("")
                setSelectedCategory(null)
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[40vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Edit category name</h2>
                <button
                  onClick={() => {
                    setIsEditCategoryOpen(false)
                    setEditCategoryName("")
                    setSelectedCategory(null)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category name
                    </label>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditCategoryOpen(false)
                        setEditCategoryName("")
                        setSelectedCategory(null)
                      }}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategoryName}
                      disabled={!editCategoryName.trim()}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
                        editCategoryName.trim()
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Sub-Category Popup */}
      <AnimatePresence>
        {isAddSubCategoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddSubCategoryOpen(false)
                setSubCategoryName("")
                setSelectedGroupForSubCategory(null)
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[40vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Add sub-category</h2>
                <button
                  onClick={() => {
                    setIsAddSubCategoryOpen(false)
                    setSubCategoryName("")
                    setSelectedGroupForSubCategory(null)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Sub-category name
                    </label>
                    <input
                      type="text"
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && subCategoryName.trim()) {
                          handleContinueSubCategory()
                        }
                      }}
                      placeholder="Enter sub-category name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    {selectedGroupForSubCategory && (
                      <p className="text-xs text-gray-500 mt-2">
                        Category: <span className="font-medium">{selectedGroupForSubCategory.name}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleContinueSubCategory}
                    disabled={!subCategoryName.trim()}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      subCategoryName.trim()
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Category Popup */}
      <AnimatePresence>
        {isAddCategoryPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddCategoryPopupOpen(false)
                setNewCategoryName("")
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[40vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Add category</h2>
                <button
                  onClick={() => {
                    setIsAddCategoryPopupOpen(false)
                    setNewCategoryName("")
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category name
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newCategoryName.trim()) {
                          handleContinueAddCategory()
                        }
                      }}
                      placeholder="Enter category name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleContinueAddCategory}
                    disabled={!newCategoryName.trim()}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      newCategoryName.trim()
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery("")
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Search Menu</h2>
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery("")
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for food items..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {searchQuery.trim() ? (
                  filteredMenuGroups.length > 0 ? (
                    <div className="space-y-4">
                      {filteredMenuGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                          <h3 className="text-sm font-bold text-gray-900 uppercase">
                            {group.name} ({group.items.length})
                          </h3>
                          <div className="space-y-3">
                            {group.items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setIsSearchOpen(false)
                                  navigate(`/restaurant/hub-menu/item/${item.id}`, { 
                                    state: { item, groupId: group.id } 
                                  })
                                }}
                                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div
                                      className={`w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center ${
                                        item.foodType === "Veg"
                                          ? "bg-green-50 border-green-600"
                                          : "bg-red-50 border-red-600"
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${
                                        item.foodType === "Veg"
                                          ? "bg-green-600"
                                          : "bg-red-600"
                                      }`} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                      {item.name}
                                    </h4>
                                  </div>
                                  <p className="text-sm font-medium text-gray-700">₹{item.price}</p>
                                  {!item.isAvailable && (
                                    <span className="text-xs text-red-600 font-medium">Out of stock</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-500">No items found</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Try searching with different keywords
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-500">Start searching</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Type to search for food items by name or category
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {searchQuery.trim() && filteredMenuGroups.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full py-3 rounded-lg font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    View Results ({filteredMenuGroups.reduce((acc, group) => acc + group.items.length, 0)} items)
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavOrders />
    </div>
  )
}
