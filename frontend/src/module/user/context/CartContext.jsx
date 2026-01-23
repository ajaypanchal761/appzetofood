// src/context/cart-context.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // Safe init (works with SSR and bad JSON)
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Track last add event for animation
  const [lastAddEvent, setLastAddEvent] = useState(null)
  // Track last remove event for animation
  const [lastRemoveEvent, setLastRemoveEvent] = useState(null)

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart))
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [cart])

  const addToCart = (item, sourcePosition = null) => {
    setCart((prev) => {
      // CRITICAL: Validate restaurant consistency
      // If cart already has items, ensure new item belongs to the same restaurant
      if (prev.length > 0) {
        const firstItemRestaurantId = prev[0]?.restaurantId;
        const firstItemRestaurantName = prev[0]?.restaurant;
        const newItemRestaurantId = item?.restaurantId;
        const newItemRestaurantName = item?.restaurant;
        
        // Normalize restaurant names for comparison (trim and case-insensitive)
        const normalizeName = (name) => name ? name.trim().toLowerCase() : '';
        const firstRestaurantNameNormalized = normalizeName(firstItemRestaurantName);
        const newRestaurantNameNormalized = normalizeName(newItemRestaurantName);
        
        // Check restaurant name first (more reliable than IDs which can have different formats)
        // If names match, allow it even if IDs differ (same restaurant, different ID format)
        if (firstRestaurantNameNormalized && newRestaurantNameNormalized) {
          if (firstRestaurantNameNormalized !== newRestaurantNameNormalized) {
            console.error('❌ Cannot add item: Restaurant name mismatch!', {
              cartRestaurantId: firstItemRestaurantId,
              cartRestaurantName: firstItemRestaurantName,
              newItemRestaurantId: newItemRestaurantId,
              newItemRestaurantName: newItemRestaurantName
            });
            throw new Error(`Cart already contains items from "${firstItemRestaurantName}". Please clear cart or complete order first.`);
          }
          // Names match - allow it (even if IDs differ, it's the same restaurant)
        } else if (firstItemRestaurantId && newItemRestaurantId) {
          // If names are not available, fallback to ID comparison
          if (firstItemRestaurantId !== newItemRestaurantId) {
            console.error('❌ Cannot add item: Cart contains items from different restaurant!', {
              cartRestaurantId: firstItemRestaurantId,
              cartRestaurantName: firstItemRestaurantName,
              newItemRestaurantId: newItemRestaurantId,
              newItemRestaurantName: newItemRestaurantName
            });
            throw new Error(`Cart already contains items from "${firstItemRestaurantName || 'another restaurant'}". Please clear cart or complete order first.`);
          }
        }
      }
      
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        // Set last add event for animation when incrementing existing item
        if (sourcePosition) {
          setLastAddEvent({
            product: {
              id: item.id,
              name: item.name,
              imageUrl: item.image || item.imageUrl,
            },
            sourcePosition,
          })
          // Clear after animation completes (increased delay)
          setTimeout(() => setLastAddEvent(null), 1500)
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      
      // Validate item has required restaurant info
      if (!item.restaurantId && !item.restaurant) {
        console.error('❌ Cannot add item: Missing restaurant information!', item);
        throw new Error('Item is missing restaurant information. Please refresh the page.');
      }
      
      const newItem = { ...item, quantity: 1 }
      
      // Set last add event for animation if sourcePosition is provided
      if (sourcePosition) {
        setLastAddEvent({
          product: {
            id: item.id,
            name: item.name,
            imageUrl: item.image || item.imageUrl,
          },
          sourcePosition,
        })
        // Clear after animation completes (increased delay to allow full animation)
        setTimeout(() => setLastAddEvent(null), 1500)
      }
      
      return [...prev, newItem]
    })
  }

  const removeFromCart = (itemId, sourcePosition = null, productInfo = null) => {
    setCart((prev) => {
      const itemToRemove = prev.find((i) => i.id === itemId)
      if (itemToRemove && sourcePosition && productInfo) {
        // Set last remove event for animation
        setLastRemoveEvent({
          product: {
            id: productInfo.id || itemToRemove.id,
            name: productInfo.name || itemToRemove.name,
            imageUrl: productInfo.imageUrl || productInfo.image || itemToRemove.image || itemToRemove.imageUrl,
          },
          sourcePosition,
        })
        // Clear after animation completes
        setTimeout(() => setLastRemoveEvent(null), 1500)
      }
      return prev.filter((i) => i.id !== itemId)
    })
  }

  const updateQuantity = (itemId, quantity, sourcePosition = null, productInfo = null) => {
    if (quantity <= 0) {
      setCart((prev) => {
        const itemToRemove = prev.find((i) => i.id === itemId)
        if (itemToRemove && sourcePosition && productInfo) {
          // Set last remove event for animation
          setLastRemoveEvent({
            product: {
              id: productInfo.id || itemToRemove.id,
              name: productInfo.name || itemToRemove.name,
              imageUrl: productInfo.imageUrl || productInfo.image || itemToRemove.image || itemToRemove.imageUrl,
            },
            sourcePosition,
          })
          // Clear after animation completes
          setTimeout(() => setLastRemoveEvent(null), 1500)
        }
        return prev.filter((i) => i.id !== itemId)
      })
      return
    }
    
    // When quantity decreases (but not to 0), also trigger removal animation
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === itemId)
      if (existingItem && quantity < existingItem.quantity && sourcePosition && productInfo) {
        // Set last remove event for animation when decreasing quantity
        setLastRemoveEvent({
          product: {
            id: productInfo.id || existingItem.id,
            name: productInfo.name || existingItem.name,
            imageUrl: productInfo.imageUrl || productInfo.image || existingItem.image || existingItem.imageUrl,
          },
          sourcePosition,
        })
        // Clear after animation completes
        setTimeout(() => setLastRemoveEvent(null), 1500)
      }
      return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    })
  }

  const getCartCount = () =>
    cart.reduce((total, item) => total + (item.quantity || 0), 0)

  const isInCart = (itemId) => cart.some((i) => i.id === itemId)

  const getCartItem = (itemId) => cart.find((i) => i.id === itemId)

  const clearCart = () => setCart([])

  // Transform cart to match AddToCartAnimation expected structure
  const cartForAnimation = useMemo(() => {
    const items = cart.map(item => ({
      product: {
        id: item.id,
        name: item.name,
        imageUrl: item.image || item.imageUrl,
      },
      quantity: item.quantity || 1,
    }))
    
    const itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0)
    const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    
    return {
      items,
      itemCount,
      total,
    }
  }, [cart])

  const value = useMemo(
    () => ({
      // Keep original cart array for backward compatibility
      cart,
      // Add animation-compatible structure
      items: cartForAnimation.items,
      itemCount: cartForAnimation.itemCount,
      total: cartForAnimation.total,
      lastAddEvent,
      lastRemoveEvent,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartCount,
      isInCart,
      getCartItem,
      clearCart,
    }),
    [cart, cartForAnimation, lastAddEvent, lastRemoveEvent]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    const errorMessage = "useCart must be used within a CartProvider. " +
      "Make sure the component is rendered inside UserLayout which provides CartProvider. " +
      "Check that the route is defined inside UserRouter with UserLayout wrapper.";
    console.error('❌', errorMessage);
    console.error('💡 Component stack:', new Error().stack);
    throw new Error(errorMessage);
  }
  return context
}
