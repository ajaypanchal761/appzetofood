import { Link } from "react-router-dom"
import { X, ChevronRight } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function StickyCartCard() {
  const { cart, getCartCount } = useCart()
  const [isVisible, setIsVisible] = useState(true)
  const [bottomPosition, setBottomPosition] = useState("bottom-[54px]") // bottom-18 equivalent
  const lastScrollY = useRef(0)
  const cartCount = getCartCount()

  // Scroll detection for positioning
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current)

      // Only update if scroll difference is significant (avoid flickering)
      if (scrollDifference < 5) {
        return
      }

      // Scroll down -> bottom-0, Scroll up -> bottom-[54px] (bottom-18)
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setBottomPosition("bottom-0")
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setBottomPosition("bottom-[54px]")
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get restaurant info from first cart item or use default
  const restaurantName = cart[0]?.restaurant || "Restaurant"
  const restaurantImage = cart[0]?.image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop"
  
  // Create restaurant slug from restaurant name
  const restaurantSlug = restaurantName.toLowerCase().replace(/\s+/g, "-")

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity * 83), 0)

  // Animation variants for the popout effect
  const cardVariants = {
    initial: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 100,
      rotate: -5,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  // Don't render if cart is empty
  if (cartCount === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${bottomPosition} left-0 right-0 z-50 px-4 pb-4 md:pb-6 pointer-events-none`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={cardVariants}
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                {/* Restaurant Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={restaurantImage} 
                    alt={restaurantName}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </div>

                {/* Restaurant Info */}
                <Link to={`/user/restaurants/${restaurantSlug}`} className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-0.5 line-clamp-1">
                    {restaurantName}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <span>View Menu</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </Link>

                {/* View Cart Button */}
                <Link 
                  to="/user/cart"
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  <div className="text-center">
                    <div className="text-xs opacity-90">View Cart</div>
                    <div className="text-xs font-bold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
                  </div>
                </Link>

                {/* Close Button */}
                <motion.button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

