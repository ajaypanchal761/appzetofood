import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import { restaurantAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { 
  ArrowLeft, 
  Search, 
  MoreVertical, 
  MapPin, 
  Clock, 
  Tag, 
  ChevronDown,
  Info,
  Star,
  SlidersHorizontal,
  Utensils,
  Flame,
  Bookmark,
  Share2,
  Plus,
  Minus,
  X,
  RotateCcw,
  Zap,
  Check,
  Lock,
  Percent,
  Eye,
  Users,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import AnimatedPage from "../../components/AnimatedPage"
import { useCart } from "../../context/CartContext"
import AddToCartAnimation from "../../components/AddToCartAnimation"

// Restaurant data - matching the structure
const restaurantsData = {
  "golden-dragon": {
    id: 1,
    name: "Golden Dragon",
    cuisine: "Chinese",
    rating: 4.8,
    reviews: 1247,
    deliveryTime: "25-30 mins",
    distance: "1.2 km",
    location: "RNT Marg",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      {
        title: "Ultimate Savings Chicken Bucket",
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
      },
      {
        title: "Family Combo Special",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      },
      {
        title: "Weekend Delight",
        image:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      },
      {
        title: "Happy Hour Special",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
      },
    ],
    offerText: "FLAT 50% OFF",
    offerCount: 5,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free delivery above ₹99",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        {
          id: 1,
          title: "Flat ₹80 OFF above ₹299",
          code: "MCNEW80",
        },
        {
          id: 2,
          title: "Flat ₹100 OFF above ₹499",
          code: "GET100",
        },
        {
          id: 3,
          title: "Flat ₹125 OFF above ₹549",
          code: "GET125",
        },
        {
          id: 4,
          title: "Flat ₹150 OFF above ₹599",
          code: "GET150",
        },
      ],
    },
    outlets: [
      {
        id: 1,
        location: "RNT Marg, Indore",
        deliveryTime: "35-40 mins",
        distance: "2.4 km",
        rating: 4.0,
        reviews: 11000,
        isNearest: true,
      },
      {
        id: 2,
        location: "Vijay Nagar, Indore",
        deliveryTime: "40-45 mins",
        distance: "2.5 km",
        rating: 3.9,
        reviews: 18000,
        isNearest: false,
      },
      {
        id: 3,
        location: "Vijay Nagar, Indore",
        deliveryTime: "35-40 mins",
        distance: "3.9 km",
        rating: 4.1,
        reviews: 8500,
        isNearest: false,
      },
      {
        id: 4,
        location: "Bhawar Kuan, Indore",
        deliveryTime: "30-35 mins",
        distance: "4.9 km",
        rating: 4.2,
        reviews: 4100,
        isNearest: false,
      },
      {
        id: 5,
        location: "Rajendra Nagar, Indore",
        deliveryTime: "45-50 mins",
        distance: "11.2 km",
        rating: 4.0,
        reviews: 3700,
        isNearest: false,
      },
    ],
    menuSections: [
      {
        title: "FLAT 50% OFF",
        subtitle: "View coupon details",
        items: [
          {
            id: 1,
            name: "Wednesday Chicken Strips Bucket",
            image:
              "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
            price: 415.63,
            originalPrice: 831.26,
            discount: "50% OFF",
            description:
              "12 pc Peri Peri chicken strips & 4 delicious dips (20gm each)",
            isSpicy: true,
            notEligibleForCoupons: true,
            customisable: true,
          },
        ],
      },
      {
        title: "Items upto 40% OFF",
        subtitle: "View coupon details",
        subsections: [
          {
            title: "Wednesday KFC Epic Deals (upto 50% Off)",
            items: [
              {
                id: 2,
                name: "Wednesday Value Special Chicken Bucket",
                image:
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                price: 549,
                originalPrice: 915,
                discount: "40% OFF",
                description:
                  "7 Strips, 6 Wings, 2 Hot & Crispy on Wednesday Specials",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 3,
                name: "Wednesday Value Special Chicken Meal Bucket",
                image:
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
                price: 699.01,
                originalPrice: 1075.4,
                discount: "35% OFF",
                description:
                  "Wednesday Value Savings of 40% on Bucket of 6 Pc Hot Wings, 7 ...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 4,
                name: "Wednesday Chicken Bucket",
                image:
                  "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
                price: 714,
                originalPrice: 1190,
                discount: "40% OFF",
                description:
                  "Enjoy Special Wednesday Bucket with flat 37% off on 10 pcs of ...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 5,
                name: "Wednesday Chicken Strips Meal Bucket",
                image:
                  "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
                price: 645.12,
                originalPrice: 1024,
                discount: "37% OFF",
                description:
                  "Saving on 36% on Bucket of 10 Pc Peri Peri Strips, 3 Dips, 4 P...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
            ],
          },
        ],
      },
    ],
  },
  "kfc": {
    id: 2,
    name: "KFC",
    cuisine: "Fast Food",
    rating: 4.0,
    reviews: 11000,
    deliveryTime: "25-30 mins",
    distance: "2.4 km",
    location: "RNT Marg",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      {
        title: "Ultimate Savings Chicken Bucket",
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
      },
      {
        title: "Family Feast",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      },
      {
        title: "Weekend Special",
        image:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      },
      {
        title: "Happy Hour Deal",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
      },
    ],
    offerText: "FLAT 50% OFF",
    offerCount: 5,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free delivery above ₹99",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        {
          id: 1,
          title: "Flat ₹80 OFF above ₹299",
          code: "MCNEW80",
        },
        {
          id: 2,
          title: "Flat ₹100 OFF above ₹499",
          code: "GET100",
        },
        {
          id: 3,
          title: "Flat ₹125 OFF above ₹549",
          code: "GET125",
        },
        {
          id: 4,
          title: "Flat ₹150 OFF above ₹599",
          code: "GET150",
        },
      ],
    },
    outlets: [
      {
        id: 1,
        location: "RNT Marg, Indore",
        deliveryTime: "35-40 mins",
        distance: "2.4 km",
        rating: 4.0,
        reviews: 11000,
        isNearest: true,
      },
      {
        id: 2,
        location: "Vijay Nagar, Indore",
        deliveryTime: "40-45 mins",
        distance: "2.5 km",
        rating: 3.9,
        reviews: 18000,
        isNearest: false,
      },
      {
        id: 3,
        location: "Vijay Nagar, Indore",
        deliveryTime: "35-40 mins",
        distance: "3.9 km",
        rating: 4.1,
        reviews: 8500,
        isNearest: false,
      },
      {
        id: 4,
        location: "Bhawar Kuan, Indore",
        deliveryTime: "30-35 mins",
        distance: "4.9 km",
        rating: 4.2,
        reviews: 4100,
        isNearest: false,
      },
      {
        id: 5,
        location: "Rajendra Nagar, Indore",
        deliveryTime: "45-50 mins",
        distance: "11.2 km",
        rating: 4.0,
        reviews: 3700,
        isNearest: false,
      },
    ],
    menuSections: [
      {
        title: "FLAT 50% OFF",
        subtitle: "View coupon details",
        items: [
          {
            id: 1,
            name: "Wednesday Chicken Strips Bucket",
            image:
              "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
            price: 415.63,
            originalPrice: 831.26,
            discount: "50% OFF",
            description:
              "12 pc Peri Peri chicken strips & 4 delicious dips (20gm each)",
            isSpicy: true,
            notEligibleForCoupons: true,
            customisable: true,
          },
        ],
      },
      {
        title: "Items upto 40% OFF",
        subtitle: "View coupon details",
        subsections: [
          {
            title: "Wednesday KFC Epic Deals (upto 50% Off)",
            items: [
              {
                id: 2,
                name: "Wednesday Value Special Chicken Bucket",
                image:
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                price: 549,
                originalPrice: 915,
                discount: "40% OFF",
                description:
                  "7 Strips, 6 Wings, 2 Hot & Crispy on Wednesday Specials",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 3,
                name: "Wednesday Value Special Chicken Meal Bucket",
                image:
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
                price: 699.01,
                originalPrice: 1075.4,
                discount: "35% OFF",
                description:
                  "Wednesday Value Savings of 40% on Bucket of 6 Pc Hot Wings, 7 ...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 4,
                name: "Wednesday Chicken Bucket",
                image:
                  "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
                price: 714,
                originalPrice: 1190,
                discount: "40% OFF",
                description:
                  "Enjoy Special Wednesday Bucket with flat 37% off on 10 pcs of ...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
              {
                id: 5,
                name: "Wednesday Chicken Strips Meal Bucket",
                image:
                  "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
                price: 645.12,
                originalPrice: 1024,
                discount: "37% OFF",
                description:
                  "Saving on 36% on Bucket of 10 Pc Peri Peri Strips, 3 Dips, 4 P...more",
                isSpicy: true,
                notEligibleForCoupons: true,
                customisable: true,
              },
            ],
          },
        ],
      },
    ],
  },
  "burger-paradise": {
    id: 2,
    name: "Burger Paradise",
    cuisine: "American",
    rating: 4.6,
    reviews: 2156,
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    location: "Main Street",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      {
        title: "Double Cheese Burger Combo",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
      },
      {
        title: "Family Meal Deal",
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop",
      },
      {
        title: "Burger & Fries Combo",
        image:
          "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop",
      },
      {
        title: "Happy Hour Special",
        image:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
      },
    ],
    offerText: "20% OFF",
    offerCount: 4,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free delivery above ₹149",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        { id: 1, title: "20% OFF up to ₹100", code: "BURGER20" },
        { id: 2, title: "Flat ₹50 OFF above ₹199", code: "FEAST50" },
        { id: 3, title: "Free Fries on orders above ₹299", code: "FREEFRIED" },
      ],
    },
    outlets: [
      { id: 1, location: "Main Street, City Center", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.6, reviews: 2156, isNearest: true },
      { id: 2, location: "West End, Mall Road", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, reviews: 1800, isNearest: false },
    ],
    menuSections: [
      {
        title: "Best Sellers",
        subtitle: "Most popular items",
        items: [
          { id: 101, name: "Classic Cheeseburger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", price: 179, originalPrice: 199, discount: "10% OFF", description: "Juicy beef patty with melted cheese, lettuce, tomato, and special sauce", isSpicy: false, customisable: true },
          { id: 102, name: "Double Bacon Burger", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Two beef patties with crispy bacon, cheese, and BBQ sauce", isSpicy: false, customisable: true },
          { id: 103, name: "Spicy Chicken Burger", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Crispy chicken with spicy mayo and jalapenos", isSpicy: true, customisable: true },
        ],
      },
      {
        title: "Combos",
        subtitle: "Value for money",
        items: [
          { id: 104, name: "Burger + Fries + Drink", image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop", price: 299, originalPrice: 399, discount: "25% OFF", description: "Classic burger with large fries and soft drink", isSpicy: false, customisable: true },
          { id: 105, name: "Family Meal for 4", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", price: 799, originalPrice: 999, discount: "20% OFF", description: "4 burgers, 4 fries, 4 drinks and 2 desserts", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "sushi-master": {
    id: 3,
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.9,
    reviews: 3421,
    deliveryTime: "30-35 mins",
    distance: "2.1 km",
    location: "Tokyo Street",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [
      {
        title: "Premium Sushi Platter",
        image:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
      },
      {
        title: "Salmon Roll Special",
        image:
          "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop",
      },
      {
        title: "Chef's Selection",
        image:
          "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=800&h=600&fit=crop",
      },
    ],
    offerText: "Free Delivery",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "10% extra off on premium items",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        { id: 1, title: "Free Miso Soup above ₹499", code: "MISOFREE" },
        { id: 2, title: "15% OFF on Platters", code: "PLATTER15" },
        { id: 3, title: "Flat ₹100 OFF above ₹599", code: "SUSHI100" },
      ],
    },
    outlets: [
      { id: 1, location: "Tokyo Street, Downtown", deliveryTime: "30-35 mins", distance: "2.1 km", rating: 4.9, reviews: 3421, isNearest: true },
      { id: 2, location: "Sakura Mall, East Wing", deliveryTime: "35-40 mins", distance: "3.2 km", rating: 4.8, reviews: 2100, isNearest: false },
    ],
    menuSections: [
      {
        title: "Signature Rolls",
        subtitle: "Chef's special creations",
        items: [
          { id: 201, name: "Salmon Sushi Roll", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", price: 399, originalPrice: 449, discount: "11% OFF", description: "Fresh salmon with avocado, cucumber, and special sauce", isSpicy: false, customisable: true },
          { id: 202, name: "Dragon Roll", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop", price: 549, originalPrice: 599, discount: "8% OFF", description: "Eel and cucumber inside, topped with avocado", isSpicy: false, customisable: true },
          { id: 203, name: "Spicy Tuna Roll", image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=400&h=300&fit=crop", price: 449, originalPrice: 499, discount: "10% OFF", description: "Fresh tuna with spicy mayo and tobiko", isSpicy: true, customisable: true },
        ],
      },
      {
        title: "Platters",
        subtitle: "Perfect for sharing",
        items: [
          { id: 204, name: "Premium Sushi Platter (12 pcs)", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", price: 899, originalPrice: 1099, discount: "18% OFF", description: "Assortment of chef's finest sushi selection", isSpicy: false, customisable: true },
          { id: 205, name: "Family Sashimi Set", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop", price: 1299, originalPrice: 1499, discount: "13% OFF", description: "Premium cuts of salmon, tuna, and yellowtail", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "pizza-corner": {
    id: 4,
    name: "Pizza Corner",
    cuisine: "Italian",
    rating: 4.7,
    reviews: 1876,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    location: "Italian Street",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      {
        title: "Margherita Special",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
      },
      {
        title: "Pepperoni Feast",
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop",
      },
      {
        title: "Veggie Supreme",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
      },
      {
        title: "Family Pizza Combo",
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
      },
    ],
    offerText: "Flat ₹40 OFF",
    offerCount: 4,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free garlic bread above ₹299",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        { id: 1, title: "Flat ₹40 OFF above ₹149", code: "PIZZA40" },
        { id: 2, title: "Buy 1 Get 1 on Medium Pizza", code: "BOGO" },
        { id: 3, title: "20% OFF on Large Pizza", code: "LARGE20" },
      ],
    },
    outlets: [
      { id: 1, location: "Italian Street, Food Court", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.7, reviews: 1876, isNearest: true },
      { id: 2, location: "Central Mall, 2nd Floor", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.6, reviews: 1500, isNearest: false },
    ],
    menuSections: [
      {
        title: "Classic Pizzas",
        subtitle: "Traditional favorites",
        items: [
          { id: 301, name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Classic tomato sauce, fresh mozzarella, and basil", isSpicy: false, customisable: true },
          { id: 302, name: "Pepperoni Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", price: 399, originalPrice: 449, discount: "11% OFF", description: "Loaded with pepperoni and extra cheese", isSpicy: true, customisable: true },
          { id: 303, name: "Veggie Supreme", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", price: 349, originalPrice: 399, discount: "13% OFF", description: "Bell peppers, onions, mushrooms, olives, and corn", isSpicy: false, customisable: true },
        ],
      },
      {
        title: "Specialty Pizzas",
        subtitle: "Chef's creations",
        items: [
          { id: 304, name: "BBQ Chicken Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", price: 449, originalPrice: 499, discount: "10% OFF", description: "Grilled chicken with BBQ sauce and caramelized onions", isSpicy: false, customisable: true },
          { id: 305, name: "Four Cheese Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", price: 429, originalPrice: 479, discount: "10% OFF", description: "Mozzarella, cheddar, parmesan, and gouda", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "taco-fiesta": {
    id: 5,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.5,
    reviews: 1245,
    deliveryTime: "20-25 mins",
    distance: "1.5 km",
    location: "Mexican Plaza",
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      {
        title: "Chicken Taco Combo",
        image:
          "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
      },
      {
        title: "Burrito Bowl",
        image:
          "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=600&fit=crop",
      },
      {
        title: "Nachos Grande",
        image:
          "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=600&fit=crop",
      },
    ],
    offerText: "Buy 1 Get 1",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free guacamole above ₹249",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        { id: 1, title: "Buy 1 Get 1 on Tacos", code: "TACOBOGO" },
        { id: 2, title: "Flat ₹30 OFF above ₹199", code: "FIESTA30" },
        { id: 3, title: "Free Salsa with any order", code: "FREESALSA" },
      ],
    },
    outlets: [
      { id: 1, location: "Mexican Plaza, Main Street", deliveryTime: "20-25 mins", distance: "1.5 km", rating: 4.5, reviews: 1245, isNearest: true },
    ],
    menuSections: [
      {
        title: "Tacos",
        subtitle: "Fresh handmade tortillas",
        items: [
          { id: 401, name: "Chicken Tacos (3 pcs)", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", price: 159, originalPrice: 199, discount: "20% OFF", description: "Grilled chicken with fresh salsa, lettuce, and cheese", isSpicy: true, customisable: true },
          { id: 402, name: "Beef Tacos (3 pcs)", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop", price: 189, originalPrice: 229, discount: "17% OFF", description: "Seasoned ground beef with sour cream and guacamole", isSpicy: true, customisable: true },
          { id: 403, name: "Veggie Tacos (3 pcs)", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", price: 139, originalPrice: 169, discount: "18% OFF", description: "Grilled vegetables with beans and fresh salsa", isSpicy: false, customisable: true },
        ],
      },
      {
        title: "Burritos & Bowls",
        subtitle: "Hearty Mexican meals",
        items: [
          { id: 404, name: "Chicken Burrito Bowl", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Rice, beans, grilled chicken, corn, salsa, and sour cream", isSpicy: false, customisable: true },
          { id: 405, name: "Loaded Nachos", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop", price: 199, originalPrice: 249, discount: "20% OFF", description: "Crispy tortilla chips with cheese, beans, and toppings", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "fresh-salad-bar": {
    id: 6,
    name: "Fresh Salad Bar",
    cuisine: "Healthy",
    rating: 4.4,
    reviews: 987,
    deliveryTime: "15-20 mins",
    distance: "0.9 km",
    location: "Green Street",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      {
        title: "Garden Fresh Salad",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
      },
      {
        title: "Protein Power Bowl",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      },
      {
        title: "Smoothie & Salad Combo",
        image:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
      },
    ],
    offerText: "15% OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: {
        title: "Gold exclusive offer",
        description: "Free smoothie above ₹399",
        unlockText: "join Gold to unlock",
        buttonText: "Add Gold - ₹1",
      },
      coupons: [
        { id: 1, title: "15% OFF on all salads", code: "HEALTHY15" },
        { id: 2, title: "Free dressing upgrade", code: "FREEDRESS" },
        { id: 3, title: "Flat ₹50 OFF above ₹299", code: "GREEN50" },
      ],
    },
    outlets: [
      { id: 1, location: "Green Street, Health Hub", deliveryTime: "15-20 mins", distance: "0.9 km", rating: 4.4, reviews: 987, isNearest: true },
    ],
    menuSections: [
      {
        title: "Signature Salads",
        subtitle: "Fresh & nutritious",
        items: [
          { id: 501, name: "Caesar Salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", price: 229, originalPrice: 269, discount: "15% OFF", description: "Romaine lettuce, parmesan, croutons with caesar dressing", isSpicy: false, customisable: true },
          { id: 502, name: "Greek Salad", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 249, originalPrice: 289, discount: "14% OFF", description: "Cucumber, tomatoes, olives, feta cheese with olive oil dressing", isSpicy: false, customisable: true },
          { id: 503, name: "Grilled Chicken Salad", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Mixed greens with grilled chicken breast and honey mustard", isSpicy: false, customisable: true },
        ],
      },
      {
        title: "Power Bowls",
        subtitle: "High protein options",
        items: [
          { id: 504, name: "Quinoa Power Bowl", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 329, originalPrice: 379, discount: "13% OFF", description: "Quinoa, chickpeas, roasted vegetables, and tahini dressing", isSpicy: false, customisable: true },
          { id: 505, name: "Protein Boost Bowl", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", price: 349, originalPrice: 399, discount: "13% OFF", description: "Grilled chicken, eggs, avocado, and mixed greens", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "spice-garden": {
    id: 7,
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.7,
    reviews: 2341,
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    location: "Spice Road",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Butter Chicken Special", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
      { title: "Biryani Feast", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop" },
      { title: "Thali Combo", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹75 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dessert above ₹399", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹75 OFF above ₹299", code: "SPICE75" },
        { id: 2, title: "20% OFF on Biryani", code: "BIRYANI20" },
        { id: 3, title: "Free Raita above ₹249", code: "FREERAITA" },
      ],
    },
    outlets: [
      { id: 1, location: "Spice Road, City Center", deliveryTime: "25-30 mins", distance: "1.8 km", rating: 4.7, reviews: 2341, isNearest: true },
    ],
    menuSections: [
      {
        title: "Signature Curries",
        subtitle: "Authentic Indian flavors",
        items: [
          { id: 601, name: "Butter Chicken", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 329, originalPrice: 379, discount: "13% OFF", description: "Tender chicken in rich tomato-butter gravy", isSpicy: true, customisable: true },
          { id: 602, name: "Paneer Tikka Masala", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop", price: 279, originalPrice: 329, discount: "15% OFF", description: "Cottage cheese in spiced tomato gravy", isSpicy: true, customisable: true },
          { id: 603, name: "Dal Makhani", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Creamy black lentils slow-cooked overnight", isSpicy: false, customisable: true },
        ],
      },
      {
        title: "Biryani",
        subtitle: "Fragrant rice dishes",
        items: [
          { id: 604, name: "Chicken Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Aromatic basmati rice with tender chicken pieces", isSpicy: true, customisable: true },
          { id: 605, name: "Veg Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 249, originalPrice: 289, discount: "14% OFF", description: "Fragrant rice with mixed vegetables and spices", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "ocean-breeze": {
    id: 9,
    name: "Ocean Breeze",
    cuisine: "Seafood",
    rating: 4.8,
    reviews: 1876,
    deliveryTime: "30-35 mins",
    distance: "2.5 km",
    location: "Harbor Road",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [
      { title: "Grilled Salmon Special", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop" },
      { title: "Seafood Platter", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop" },
      { title: "Fish & Chips Combo", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop" },
    ],
    offerText: "Free Delivery",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "10% extra off on platters", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Free Delivery above ₹399", code: "SEAFREE" },
        { id: 2, title: "Flat ₹100 OFF above ₹599", code: "SEA100" },
        { id: 3, title: "15% OFF on Platters", code: "PLATTER15" },
      ],
    },
    outlets: [
      { id: 1, location: "Harbor Road, Beach Side", deliveryTime: "30-35 mins", distance: "2.5 km", rating: 4.8, reviews: 1876, isNearest: true },
    ],
    menuSections: [
      {
        title: "Fresh Catch",
        subtitle: "Today's specials",
        items: [
          { id: 701, name: "Grilled Salmon", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 449, originalPrice: 499, discount: "10% OFF", description: "Fresh Atlantic salmon grilled to perfection", isSpicy: false, customisable: true },
          { id: 702, name: "Fish & Chips", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", price: 349, originalPrice: 399, discount: "13% OFF", description: "Crispy battered fish with golden fries", isSpicy: false, customisable: true },
          { id: 703, name: "Prawn Tempura", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop", price: 399, originalPrice: 449, discount: "11% OFF", description: "Light and crispy tempura prawns", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "smokehouse-bbq": {
    id: 10,
    name: "Smokehouse BBQ",
    cuisine: "American",
    rating: 4.5,
    reviews: 1543,
    deliveryTime: "35-40 mins",
    distance: "2.8 km",
    location: "Grill Street",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "BBQ Ribs Special", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
      { title: "Pulled Pork Platter", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop" },
      { title: "Family BBQ Combo", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop" },
    ],
    offerText: "Buy 2 Get 1",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free coleslaw with ribs", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Buy 2 Get 1 Free on Ribs", code: "RIBS21" },
        { id: 2, title: "Flat ₹80 OFF above ₹399", code: "SMOKE80" },
        { id: 3, title: "20% OFF on Combos", code: "COMBO20" },
      ],
    },
    outlets: [
      { id: 1, location: "Grill Street, Food Hub", deliveryTime: "35-40 mins", distance: "2.8 km", rating: 4.5, reviews: 1543, isNearest: true },
    ],
    menuSections: [
      {
        title: "BBQ Classics",
        subtitle: "Slow-smoked perfection",
        items: [
          { id: 801, name: "BBQ Ribs (Full Rack)", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", price: 379, originalPrice: 449, discount: "16% OFF", description: "Tender pork ribs with signature BBQ sauce", isSpicy: false, customisable: true },
          { id: 802, name: "Pulled Pork Sandwich", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop", price: 249, originalPrice: 289, discount: "14% OFF", description: "Slow-cooked pulled pork with coleslaw", isSpicy: false, customisable: true },
          { id: 803, name: "BBQ Brisket Platter", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", price: 449, originalPrice: 499, discount: "10% OFF", description: "Smoked beef brisket with two sides", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "noodle-house": {
    id: 11,
    name: "Noodle House",
    cuisine: "Asian",
    rating: 4.6,
    reviews: 1234,
    deliveryTime: "18-22 mins",
    distance: "1.0 km",
    location: "Asian Street",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Spicy Ramen Special", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop" },
      { title: "Noodle Bowl Combo", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop" },
      { title: "Wok Tossed Noodles", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹30 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free spring rolls above ₹249", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹30 OFF above ₹149", code: "NOODLE30" },
        { id: 2, title: "15% OFF on Ramen", code: "RAMEN15" },
        { id: 3, title: "Free Drink above ₹199", code: "FREEDRINK" },
      ],
    },
    outlets: [
      { id: 1, location: "Asian Street, Food Court", deliveryTime: "18-22 mins", distance: "1.0 km", rating: 4.6, reviews: 1234, isNearest: true },
    ],
    menuSections: [
      {
        title: "Noodle Bowls",
        subtitle: "Hearty and filling",
        items: [
          { id: 901, name: "Spicy Ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Rich broth with noodles, egg, and pork belly", isSpicy: true, customisable: true },
          { id: 902, name: "Hakka Noodles", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=300&fit=crop", price: 169, originalPrice: 199, discount: "15% OFF", description: "Stir-fried noodles with vegetables", isSpicy: true, customisable: true },
          { id: 903, name: "Pad Thai", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", price: 219, originalPrice: 259, discount: "15% OFF", description: "Thai rice noodles with tamarind sauce", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "dessert-delight": {
    id: 12,
    name: "Dessert Delight",
    cuisine: "Desserts",
    rating: 4.9,
    reviews: 2156,
    deliveryTime: "15-20 mins",
    distance: "0.7 km",
    location: "Sweet Lane",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Chocolate Cake Special", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop" },
      { title: "Ice Cream Sundae", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop" },
      { title: "Brownie Combo", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop" },
    ],
    offerText: "20% OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free topping on cakes", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "20% OFF on desserts", code: "SWEET20" },
        { id: 2, title: "Buy 2 Get 1 on Cakes", code: "CAKE21" },
        { id: 3, title: "Free Ice Cream above ₹299", code: "FREEICE" },
      ],
    },
    outlets: [
      { id: 1, location: "Sweet Lane, Mall Road", deliveryTime: "15-20 mins", distance: "0.7 km", rating: 4.9, reviews: 2156, isNearest: true },
    ],
    menuSections: [
      {
        title: "Cakes & Pastries",
        subtitle: "Freshly baked",
        items: [
          { id: 1001, name: "Chocolate Cake (Slice)", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Rich dark chocolate cake with ganache", isSpicy: false, customisable: true },
          { id: 1002, name: "Red Velvet Cake", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop", price: 169, originalPrice: 199, discount: "15% OFF", description: "Classic red velvet with cream cheese frosting", isSpicy: false, customisable: true },
          { id: 1003, name: "Brownie Sundae", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Warm brownie with ice cream and chocolate sauce", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "cafe-mocha": {
    id: 13,
    name: "Cafe Mocha",
    cuisine: "Cafe",
    rating: 4.4,
    reviews: 987,
    deliveryTime: "12-15 mins",
    distance: "0.4 km",
    location: "Coffee Street",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Cappuccino & Croissant", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop" },
      { title: "Coffee & Cake Combo", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop" },
      { title: "Breakfast Special", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹25 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free cookie with coffee", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹25 OFF above ₹99", code: "CAFE25" },
        { id: 2, title: "Buy 1 Get 1 on Coffee", code: "COFFEE21" },
        { id: 3, title: "20% OFF on Pastries", code: "PASTRY20" },
      ],
    },
    outlets: [
      { id: 1, location: "Coffee Street, Downtown", deliveryTime: "12-15 mins", distance: "0.4 km", rating: 4.4, reviews: 987, isNearest: true },
    ],
    menuSections: [
      {
        title: "Coffee & Beverages",
        subtitle: "Freshly brewed",
        items: [
          { id: 1101, name: "Cappuccino", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop", price: 129, originalPrice: 149, discount: "13% OFF", description: "Classic Italian espresso with steamed milk foam", isSpicy: false, customisable: true },
          { id: 1102, name: "Cold Brew Coffee", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Smooth cold-brewed coffee served over ice", isSpicy: false, customisable: true },
          { id: 1103, name: "Chocolate Croissant", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", price: 89, originalPrice: 99, discount: "10% OFF", description: "Flaky pastry filled with chocolate", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "apna-sweets": {
    id: 14,
    name: "Apna Sweets",
    cuisine: "Indian Sweets",
    rating: 4.7,
    reviews: 1876,
    deliveryTime: "20-25 mins",
    distance: "1.1 km",
    location: "Sweet Market",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Gulab Jamun Special", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" },
      { title: "Mithai Box", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop" },
      { title: "Festival Special", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
    ],
    offerText: "50% OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free ladoo with orders", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "50% OFF on sweets", code: "SWEET50" },
        { id: 2, title: "Flat ₹40 OFF above ₹199", code: "MITHAI40" },
        { id: 3, title: "Buy 500g Get 100g Free", code: "SWEETFREE" },
      ],
    },
    outlets: [
      { id: 1, location: "Sweet Market, Main Road", deliveryTime: "20-25 mins", distance: "1.1 km", rating: 4.7, reviews: 1876, isNearest: true },
    ],
    menuSections: [
      {
        title: "Traditional Sweets",
        subtitle: "Made fresh daily",
        items: [
          { id: 1201, name: "Gulab Jamun (6 pcs)", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 89, originalPrice: 119, discount: "25% OFF", description: "Soft milk dumplings in rose-flavored syrup", isSpicy: false, customisable: true },
          { id: 1202, name: "Rasgulla (6 pcs)", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", price: 79, originalPrice: 99, discount: "20% OFF", description: "Spongy cheese balls in light sugar syrup", isSpicy: false, customisable: true },
          { id: 1203, name: "Kaju Katli (250g)", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Premium cashew fudge, thin and delicate", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "biryani-house": {
    id: 15,
    name: "Biryani House",
    cuisine: "Biryani",
    rating: 4.5,
    reviews: 2345,
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    location: "Mughlai Lane",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Hyderabadi Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop" },
      { title: "Family Biryani Pack", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop" },
      { title: "Biryani Combo", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹50 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free raita with biryani", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹50 OFF above ₹199", code: "BIRYANI50" },
        { id: 2, title: "20% OFF on Family Pack", code: "FAMILY20" },
        { id: 3, title: "Free Mirchi Ka Salan", code: "FREESALAN" },
      ],
    },
    outlets: [
      { id: 1, location: "Mughlai Lane, Food Street", deliveryTime: "25-30 mins", distance: "1.8 km", rating: 4.5, reviews: 2345, isNearest: true },
    ],
    menuSections: [
      {
        title: "Signature Biryanis",
        subtitle: "Dum cooked perfection",
        items: [
          { id: 1301, name: "Hyderabadi Chicken Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Authentic dum biryani with tender chicken", isSpicy: true, customisable: true },
          { id: 1302, name: "Mutton Biryani", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", price: 329, originalPrice: 379, discount: "13% OFF", description: "Slow-cooked mutton with aromatic rice", isSpicy: true, customisable: true },
          { id: 1303, name: "Veg Dum Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Mixed vegetables layered with fragrant rice", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "dominos-pizza": {
    id: 16,
    name: "Domino's Pizza",
    cuisine: "Pizza",
    rating: 4.3,
    reviews: 5678,
    deliveryTime: "15-20 mins",
    distance: "0.6 km",
    location: "Pizza Hub",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Pepperoni Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop" },
      { title: "Party Pack", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop" },
      { title: "Cheesy Combo", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop" },
    ],
    offerText: "Buy 1 Get 1",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free garlic bread", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Buy 1 Get 1 Free", code: "BOGO" },
        { id: 2, title: "Flat 50% OFF on Medium", code: "PIZZA50" },
        { id: 3, title: "Free Coke with Large", code: "FREECOKE" },
      ],
    },
    outlets: [
      { id: 1, location: "Pizza Hub, City Center", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.3, reviews: 5678, isNearest: true },
    ],
    menuSections: [
      {
        title: "Classic Pizzas",
        subtitle: "30 mins or free",
        items: [
          { id: 1401, name: "Pepperoni Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", price: 399, originalPrice: 499, discount: "20% OFF", description: "Loaded with pepperoni and extra cheese", isSpicy: true, customisable: true },
          { id: 1402, name: "Cheese Burst Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", price: 449, originalPrice: 549, discount: "18% OFF", description: "Cheese-filled crust with mozzarella topping", isSpicy: false, customisable: true },
          { id: 1403, name: "Veggie Supreme", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", price: 349, originalPrice: 399, discount: "13% OFF", description: "Loaded with fresh vegetables", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "thali-express": {
    id: 17,
    name: "Thali Express",
    cuisine: "Thali",
    rating: 4.2,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Thali Street",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "North Indian Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
      { title: "Special Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" },
      { title: "Mini Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹40 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sweet with thali", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹40 OFF above ₹149", code: "THALI40" },
        { id: 2, title: "20% OFF on Special Thali", code: "SPECIAL20" },
        { id: 3, title: "Free Raita", code: "FREERAITA" },
      ],
    },
    outlets: [
      { id: 1, location: "Thali Street, Food Court", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.2, reviews: 1234, isNearest: true },
    ],
    menuSections: [
      {
        title: "Thali Combos",
        subtitle: "Complete meals",
        items: [
          { id: 1501, name: "North Indian Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 199, originalPrice: 249, discount: "20% OFF", description: "Dal, sabzi, roti, rice, raita, and sweet", isSpicy: false, customisable: true },
          { id: 1502, name: "Rajasthani Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Dal baati churma, gatte ki sabzi, and more", isSpicy: true, customisable: true },
          { id: 1503, name: "Gujarati Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 229, originalPrice: 279, discount: "18% OFF", description: "Sweet and savory Gujarati specialties", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "sweet-dreams-bakery": {
    id: 18,
    name: "Sweet Dreams Bakery",
    cuisine: "Bakery",
    rating: 4.6,
    reviews: 1567,
    deliveryTime: "30-35 mins",
    distance: "2.0 km",
    location: "Baker Street",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Chocolate Cake", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop" },
      { title: "Birthday Cake Special", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop" },
      { title: "Pastry Box", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹100 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free cupcake above ₹499", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹100 OFF above ₹499", code: "CAKE100" },
        { id: 2, title: "20% OFF on Birthday Cakes", code: "BIRTHDAY20" },
        { id: 3, title: "Buy 6 Cupcakes Get 2 Free", code: "CUPCAKE62" },
      ],
    },
    outlets: [
      { id: 1, location: "Baker Street, Central", deliveryTime: "30-35 mins", distance: "2.0 km", rating: 4.6, reviews: 1567, isNearest: true },
    ],
    menuSections: [
      {
        title: "Fresh Cakes",
        subtitle: "Baked with love",
        items: [
          { id: 1601, name: "Chocolate Truffle Cake", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", price: 599, originalPrice: 699, discount: "14% OFF", description: "Rich chocolate cake with truffle layers", isSpicy: false, customisable: true },
          { id: 1602, name: "Red Velvet Cake", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop", price: 549, originalPrice: 649, discount: "15% OFF", description: "Classic red velvet with cream cheese frosting", isSpicy: false, customisable: true },
          { id: 1603, name: "Black Forest Cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 499, originalPrice: 599, discount: "17% OFF", description: "Chocolate layers with cherries and cream", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "burger-king": {
    id: 19,
    name: "Burger King",
    cuisine: "Fast Food",
    rating: 4.2,
    reviews: 4567,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Food Court",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Whopper Special", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
      { title: "Value Meal", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop" },
      { title: "Family Bucket", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹50 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free fries with Whopper", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹50 OFF above ₹299", code: "BK50" },
        { id: 2, title: "Buy 1 Get 1 on Whopper", code: "WHOPPER21" },
        { id: 3, title: "Free Drink with Meal", code: "FREEDRINK" },
      ],
    },
    outlets: [
      { id: 1, location: "Food Court, Mall Road", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.2, reviews: 4567, isNearest: true },
    ],
    menuSections: [
      {
        title: "Burgers",
        subtitle: "Flame-grilled goodness",
        items: [
          { id: 1701, name: "Whopper", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Flame-grilled beef patty with fresh veggies", isSpicy: false, customisable: true },
          { id: 1702, name: "Chicken Royale", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", price: 179, originalPrice: 209, discount: "14% OFF", description: "Crispy chicken with mayo and lettuce", isSpicy: false, customisable: true },
          { id: 1703, name: "Veg Whopper", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Plant-based patty with all the toppings", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "chinese-wok": {
    id: 20,
    name: "Chinese Wok",
    cuisine: "Chinese",
    rating: 4.0,
    reviews: 1234,
    deliveryTime: "30-35 mins",
    distance: "2.0 km",
    location: "Dragon Street",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Hakka Noodles", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop" },
      { title: "Manchurian Combo", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop" },
      { title: "Fried Rice Special", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop" },
    ],
    offerText: "20% OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free spring rolls", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "20% OFF on all orders", code: "WOK20" },
        { id: 2, title: "Flat ₹40 OFF above ₹199", code: "CHINESE40" },
        { id: 3, title: "Free Soup above ₹299", code: "FREESOUP" },
      ],
    },
    outlets: [
      { id: 1, location: "Dragon Street, Food Hub", deliveryTime: "30-35 mins", distance: "2.0 km", rating: 4.0, reviews: 1234, isNearest: true },
    ],
    menuSections: [
      {
        title: "Wok Specials",
        subtitle: "Stir-fried to perfection",
        items: [
          { id: 1801, name: "Hakka Noodles", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", price: 189, originalPrice: 229, discount: "17% OFF", description: "Stir-fried noodles with vegetables", isSpicy: true, customisable: true },
          { id: 1802, name: "Veg Manchurian", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=300&fit=crop", price: 169, originalPrice: 199, discount: "15% OFF", description: "Crispy vegetable balls in tangy sauce", isSpicy: true, customisable: true },
          { id: 1803, name: "Chicken Fried Rice", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", price: 219, originalPrice: 259, discount: "15% OFF", description: "Wok-tossed rice with chicken and vegetables", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "south-indian-delight": {
    id: 21,
    name: "South Indian Delight",
    cuisine: "South Indian",
    rating: 4.4,
    reviews: 1876,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    location: "South Street",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Masala Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop" },
      { title: "Idli Vada Combo", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" },
      { title: "Uttapam Special", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop" },
    ],
    offerText: "Free Delivery",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free filter coffee", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Free Delivery above ₹199", code: "SOUTHFREE" },
        { id: 2, title: "Flat ₹30 OFF above ₹149", code: "SOUTH30" },
        { id: 3, title: "20% OFF on Combos", code: "COMBO20" },
      ],
    },
    outlets: [
      { id: 1, location: "South Street, Food Court", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.4, reviews: 1876, isNearest: true },
    ],
    menuSections: [
      {
        title: "Dosas",
        subtitle: "Crispy and delicious",
        items: [
          { id: 1901, name: "Masala Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", price: 99, originalPrice: 119, discount: "17% OFF", description: "Crispy dosa with spiced potato filling", isSpicy: true, customisable: true },
          { id: 1902, name: "Rava Dosa", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 109, originalPrice: 129, discount: "15% OFF", description: "Crispy semolina dosa with onions", isSpicy: false, customisable: true },
          { id: 1903, name: "Idli Vada (4 pcs)", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", price: 79, originalPrice: 99, discount: "20% OFF", description: "Soft idlis with crispy vadas and sambar", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "momos-express": {
    id: 22,
    name: "Momos Express",
    cuisine: "Momos",
    rating: 4.3,
    reviews: 1567,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Tibetan Street",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Steam Momos", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop" },
      { title: "Fried Momos Platter", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" },
      { title: "Momos Combo", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹30 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney upgrade", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹30 OFF above ₹149", code: "MOMO30" },
        { id: 2, title: "Buy 1 Get 1 on Steam Momos", code: "STEAM21" },
        { id: 3, title: "Free Soup above ₹199", code: "FREESOUP" },
      ],
    },
    outlets: [
      { id: 1, location: "Tibetan Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.3, reviews: 1567, isNearest: true },
    ],
    menuSections: [
      {
        title: "Momos",
        subtitle: "Fresh and steaming",
        items: [
          { id: 2001, name: "Veg Steam Momos (8 pcs)", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", price: 99, originalPrice: 119, discount: "17% OFF", description: "Steamed dumplings with vegetable filling", isSpicy: false, customisable: true },
          { id: 2002, name: "Chicken Steam Momos (8 pcs)", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 129, originalPrice: 149, discount: "13% OFF", description: "Steamed dumplings with chicken filling", isSpicy: false, customisable: true },
          { id: 2003, name: "Fried Momos (8 pcs)", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", price: 139, originalPrice: 159, discount: "13% OFF", description: "Crispy fried momos with spicy sauce", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "tandoori-express": {
    id: 23,
    name: "Tandoori Express",
    cuisine: "North Indian",
    rating: 4.5,
    reviews: 1987,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Tandoor Street",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Chicken Tandoori", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop" },
      { title: "Tandoori Platter", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop" },
      { title: "Kebab Combo", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹50 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free naan with tandoori", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹50 OFF above ₹199", code: "TANDOOR50" },
        { id: 2, title: "20% OFF on Platters", code: "PLATTER20" },
        { id: 3, title: "Free Raita above ₹299", code: "FREERAITA" },
      ],
    },
    outlets: [
      { id: 1, location: "Tandoor Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, reviews: 1987, isNearest: true },
    ],
    menuSections: [
      {
        title: "Tandoori Specials",
        subtitle: "Charcoal grilled",
        items: [
          { id: 2101, name: "Chicken Tandoori (Half)", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Marinated chicken grilled in tandoor", isSpicy: true, customisable: true },
          { id: 2102, name: "Paneer Tikka", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Cottage cheese marinated and grilled", isSpicy: true, customisable: true },
          { id: 2103, name: "Seekh Kebab (6 pcs)", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", price: 279, originalPrice: 329, discount: "15% OFF", description: "Minced meat kebabs on skewers", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "donut-delight": {
    id: 24,
    name: "Donut Delight",
    cuisine: "Desserts",
    rating: 4.6,
    reviews: 1234,
    deliveryTime: "30-35 mins",
    distance: "2.0 km",
    location: "Sweet Street",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Chocolate Donut", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop" },
      { title: "Donut Box (6)", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop" },
      { title: "Party Pack", image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹50 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free donut above ₹199", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹50 OFF above ₹199", code: "DONUT50" },
        { id: 2, title: "Buy 5 Get 1 Free", code: "DONUT51" },
        { id: 3, title: "20% OFF on Box", code: "BOX20" },
      ],
    },
    outlets: [
      { id: 1, location: "Sweet Street, Mall", deliveryTime: "30-35 mins", distance: "2.0 km", rating: 4.6, reviews: 1234, isNearest: true },
    ],
    menuSections: [
      {
        title: "Donuts",
        subtitle: "Freshly glazed",
        items: [
          { id: 2201, name: "Chocolate Glazed", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop", price: 69, originalPrice: 79, discount: "13% OFF", description: "Classic donut with chocolate glaze", isSpicy: false, customisable: true },
          { id: 2202, name: "Strawberry Frosted", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", price: 79, originalPrice: 89, discount: "11% OFF", description: "Donut with strawberry frosting and sprinkles", isSpicy: false, customisable: true },
          { id: 2203, name: "Donut Box (6 pcs)", image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=400&h=300&fit=crop", price: 349, originalPrice: 449, discount: "22% OFF", description: "Assorted donuts pack", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "dosa-corner": {
    id: 25,
    name: "Dosa Corner",
    cuisine: "South Indian",
    rating: 4.3,
    reviews: 1456,
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    location: "South Street",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Masala Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop" },
      { title: "Rava Dosa Special", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" },
      { title: "Dosa Combo", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹30 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sambar vada", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹30 OFF above ₹99", code: "DOSA30" },
        { id: 2, title: "Buy 1 Get 1 on Plain Dosa", code: "DOSA21" },
        { id: 3, title: "Free Filter Coffee above ₹149", code: "FREECOFFEE" },
      ],
    },
    outlets: [
      { id: 1, location: "South Street, Food Court", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.3, reviews: 1456, isNearest: true },
    ],
    menuSections: [
      {
        title: "Dosas",
        subtitle: "Crispy South Indian crepes",
        items: [
          { id: 2301, name: "Masala Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", price: 89, originalPrice: 109, discount: "18% OFF", description: "Crispy dosa with potato masala", isSpicy: true, customisable: true },
          { id: 2302, name: "Rava Dosa", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 99, originalPrice: 119, discount: "17% OFF", description: "Crispy semolina dosa with onions", isSpicy: false, customisable: true },
          { id: 2303, name: "Paper Dosa", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", price: 79, originalPrice: 99, discount: "20% OFF", description: "Extra crispy thin dosa", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "samosa-house": {
    id: 26,
    name: "Samosa House",
    cuisine: "Snacks",
    rating: 4.3,
    reviews: 987,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    location: "Snack Street",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "Aloo Samosa", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop" },
      { title: "Samosa Chaat", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop" },
      { title: "Samosa Party Pack", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹20 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹20 OFF above ₹79", code: "SAMOSA20" },
        { id: 2, title: "Buy 5 Get 1 Free", code: "SAMOSA51" },
        { id: 3, title: "Free Chai above ₹99", code: "FREECHAI" },
      ],
    },
    outlets: [
      { id: 1, location: "Snack Street, Market", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.3, reviews: 987, isNearest: true },
    ],
    menuSections: [
      {
        title: "Samosas",
        subtitle: "Hot and crispy",
        items: [
          { id: 2401, name: "Aloo Samosa (2 pcs)", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 39, originalPrice: 49, discount: "20% OFF", description: "Crispy pastry with spiced potato filling", isSpicy: true, customisable: true },
          { id: 2402, name: "Paneer Samosa (2 pcs)", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", price: 59, originalPrice: 69, discount: "14% OFF", description: "Samosa stuffed with spiced cottage cheese", isSpicy: true, customisable: true },
          { id: 2403, name: "Samosa Chaat", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", price: 79, originalPrice: 99, discount: "20% OFF", description: "Crushed samosa with chutneys and curd", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "fries-express": {
    id: 27,
    name: "Fries Express",
    cuisine: "Fast Food",
    rating: 4.2,
    reviews: 876,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    location: "Fast Food Street",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [
      { title: "French Fries", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop" },
      { title: "Loaded Fries", image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=800&h=600&fit=crop" },
      { title: "Fries Combo", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹20 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dip with fries", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹20 OFF above ₹99", code: "FRIES20" },
        { id: 2, title: "Upgrade to Large Free", code: "FREELARGE" },
        { id: 3, title: "Buy 2 Get 1 Free", code: "FRIES21" },
      ],
    },
    outlets: [
      { id: 1, location: "Fast Food Street, Mall", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.2, reviews: 876, isNearest: true },
    ],
    menuSections: [
      {
        title: "Fries",
        subtitle: "Golden and crispy",
        items: [
          { id: 2501, name: "Classic French Fries", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop", price: 79, originalPrice: 99, discount: "20% OFF", description: "Crispy golden fries with salt", isSpicy: false, customisable: true },
          { id: 2502, name: "Peri Peri Fries", image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=400&h=300&fit=crop", price: 99, originalPrice: 119, discount: "17% OFF", description: "Fries with peri peri seasoning", isSpicy: true, customisable: true },
          { id: 2503, name: "Loaded Cheese Fries", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 129, originalPrice: 149, discount: "13% OFF", description: "Fries topped with cheese and jalapenos", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "starters-corner": {
    id: 28,
    name: "Starters Corner",
    cuisine: "Starters",
    rating: 4.4,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Appetizer Street",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Paneer Tikka", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop" },
      { title: "Chicken Wings", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop" },
      { title: "Starter Platter", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹40 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dip with starters", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹40 OFF above ₹149", code: "STARTER40" },
        { id: 2, title: "20% OFF on Platter", code: "PLATTER20" },
        { id: 3, title: "Buy 2 Get 1 Free", code: "STARTER21" },
      ],
    },
    outlets: [
      { id: 1, location: "Appetizer Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.4, reviews: 1234, isNearest: true },
    ],
    menuSections: [
      {
        title: "Veg Starters",
        subtitle: "Perfect appetizers",
        items: [
          { id: 2601, name: "Paneer Tikka", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Grilled cottage cheese with spices", isSpicy: true, customisable: true },
          { id: 2602, name: "Veg Spring Rolls", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Crispy rolls with vegetable filling", isSpicy: false, customisable: true },
          { id: 2603, name: "Crispy Corn", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", price: 169, originalPrice: 199, discount: "15% OFF", description: "Crunchy corn kernels with spices", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "hotel-apna-avenue": {
    id: 29,
    name: "Hotel Apna Avenue",
    cuisine: "Multi Cuisine",
    rating: 4.3,
    reviews: 2345,
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    location: "Main Road",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Thali Special", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop" },
      { title: "Lunch Combo", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
      { title: "Family Pack", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat 50% OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dessert with meal", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat 50% OFF on Thali", code: "THALI50" },
        { id: 2, title: "Flat ₹60 OFF above ₹249", code: "AVENUE60" },
        { id: 3, title: "Free Raita", code: "FREERAITA" },
      ],
    },
    outlets: [
      { id: 1, location: "Main Road, City Center", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.3, reviews: 2345, isNearest: true },
    ],
    menuSections: [
      {
        title: "Thalis",
        subtitle: "Complete meals",
        items: [
          { id: 2701, name: "Special Thali", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", price: 249, originalPrice: 349, discount: "29% OFF", description: "Dal, sabzi, rice, roti, raita, salad, and sweet", isSpicy: false, customisable: true },
          { id: 2702, name: "Punjabi Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 279, originalPrice: 379, discount: "26% OFF", description: "Dal makhani, paneer, naan, rice, and more", isSpicy: true, customisable: true },
          { id: 2703, name: "Mini Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 149, originalPrice: 199, discount: "25% OFF", description: "Lighter version with essentials", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "bhojan-fix-thali": {
    id: 30,
    name: "Bhojan Fix Thali",
    cuisine: "North Indian",
    rating: 4.1,
    reviews: 1567,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Thali Street",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [
      { title: "Fix Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
      { title: "Premium Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" },
      { title: "Mini Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop" },
    ],
    offerText: "Flat ₹40 OFF",
    offerCount: 3,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sweet dish", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [
        { id: 1, title: "Flat ₹40 OFF above ₹149", code: "BHOJAN40" },
        { id: 2, title: "20% OFF on Premium Thali", code: "PREMIUM20" },
        { id: 3, title: "Free Chaas", code: "FREECHAAS" },
      ],
    },
    outlets: [
      { id: 1, location: "Thali Street, Food Court", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.1, reviews: 1567, isNearest: true },
    ],
    menuSections: [
      {
        title: "Thalis",
        subtitle: "Unlimited refills",
        items: [
          { id: 2801, name: "Fix Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 199, originalPrice: 249, discount: "20% OFF", description: "Daily fix thali with seasonal items", isSpicy: false, customisable: true },
          { id: 2802, name: "Premium Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 274, originalPrice: 349, discount: "21% OFF", description: "Premium thali with paneer and sweets", isSpicy: false, customisable: true },
          { id: 2803, name: "Mini Fix Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Smaller portion, same taste", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "mp-09-delhi-zayka": {
    id: 31,
    name: "MP-09 Delhi Zayka",
    cuisine: "North Indian",
    rating: 4.1,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Delhi Street",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "North Indian Special", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dessert above ₹299", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹40 OFF above ₹199", code: "DELHI40" }],
    },
    outlets: [{ id: 1, location: "Delhi Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.1, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "North Indian Specials",
      subtitle: "Authentic Delhi flavors",
      items: [
        { id: 3101, name: "Butter Chicken", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Creamy tomato-based curry with tender chicken", isSpicy: true, customisable: true },
        { id: 3102, name: "Dal Makhani", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 199, originalPrice: 229, discount: "13% OFF", description: "Creamy black lentils slow-cooked", isSpicy: false, customisable: true },
      ],
    }],
  },
  "rajhans-dal-bafle": {
    id: 32,
    name: "Rajhans Dal Bafle",
    cuisine: "Rajasthani",
    rating: 4.3,
    reviews: 1456,
    deliveryTime: "20-25 mins",
    distance: "1.5 km",
    location: "Rajasthan Street",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Dal Bafle Special", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free churma", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹40 OFF above ₹199", code: "RAJ40" }],
    },
    outlets: [{ id: 1, location: "Rajasthan Street, Food Court", deliveryTime: "20-25 mins", distance: "1.5 km", rating: 4.3, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Rajasthani Specials",
      subtitle: "Authentic flavors",
      items: [
        { id: 3201, name: "Dal Bafle (2 pcs)", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 199, originalPrice: 249, discount: "20% OFF", description: "Crispy bafle with dal, churma, and chutney", isSpicy: false, customisable: true },
        { id: 3202, name: "Gatte Ki Sabzi", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 179, originalPrice: 209, discount: "14% OFF", description: "Gram flour dumplings in spicy gravy", isSpicy: true, customisable: true },
      ],
    }],
  },
  "veg-legacy": {
    id: 33,
    name: "Veg Legacy",
    cuisine: "Healthy",
    rating: 4.0,
    reviews: 987,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Health Street",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Healthy Salad Bowl", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹60 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free smoothie above ₹299", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹60 OFF above ₹249", code: "LEGACY60" }],
    },
    outlets: [{ id: 1, location: "Health Street, Wellness Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.0, reviews: 987, isNearest: true }],
    menuSections: [{
      title: "Healthy Options",
      subtitle: "Nutritious meals",
      items: [
        { id: 3301, name: "Quinoa Salad Bowl", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Quinoa with fresh vegetables and dressing", isSpicy: false, customisable: true },
        { id: 3302, name: "Green Power Smoothie", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Spinach, kale, and fruits blend", isSpicy: false, customisable: true },
      ],
    }],
  },
  "mba-thaliwala": {
    id: 34,
    name: "MBA Thaliwala",
    cuisine: "Thali",
    rating: 3.8,
    reviews: 876,
    deliveryTime: "30-35 mins",
    distance: "1.8 km",
    location: "Thali Street",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Thali Special", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop" }],
    offerText: "FLAT 50% OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sweet", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT 50% OFF on Thali", code: "MBA50" }],
    },
    outlets: [{ id: 1, location: "Thali Street, Food Court", deliveryTime: "30-35 mins", distance: "1.8 km", rating: 3.8, reviews: 876, isNearest: true }],
    menuSections: [{
      title: "Thali Combos",
      subtitle: "Complete meals",
      items: [
        { id: 3401, name: "MBA Special Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 149, originalPrice: 199, discount: "25% OFF", description: "Dal, sabzi, roti, rice, and sweet", isSpicy: false, customisable: true },
      ],
    }],
  },
  "green-leaf-veg-restaurant": {
    id: 35,
    name: "Green Leaf Veg Restaurant",
    cuisine: "Vegetarian",
    rating: 4.4,
    reviews: 1678,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    location: "Green Street",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Veg Thali Special", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹50 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free raita", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹50 OFF above ₹199", code: "GREEN50" }],
    },
    outlets: [{ id: 1, location: "Green Street, Veg Hub", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.4, reviews: 1678, isNearest: true }],
    menuSections: [{
      title: "Veg Thalis",
      subtitle: "Pure vegetarian",
      items: [
        { id: 3501, name: "Veg Thali", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", price: 199, originalPrice: 249, discount: "20% OFF", description: "Dal, sabzi, roti, rice, raita, and sweet", isSpicy: false, customisable: true },
        { id: 3502, name: "Paneer Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Paneer curry with complete meal", isSpicy: true, customisable: true },
      ],
    }],
  },
  "pure-veg-kitchen": {
    id: 36,
    name: "Pure Veg Kitchen",
    cuisine: "Vegetarian",
    rating: 4.2,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Veg Street",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Veg Combo", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dessert", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹40 OFF above ₹149", code: "PURE40" }],
    },
    outlets: [{ id: 1, location: "Veg Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.2, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Veg Combos",
      subtitle: "Complete meals",
      items: [
        { id: 3601, name: "Veg Combo", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 179, originalPrice: 219, discount: "18% OFF", description: "Dal, sabzi, roti, and rice", isSpicy: false, customisable: true },
      ],
    }],
  },
  "veg-express": {
    id: 37,
    name: "Veg Express",
    cuisine: "Vegetarian",
    rating: 4.1,
    reviews: 1098,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Express Street",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Veg Meal", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹30 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chaas", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹30 OFF above ₹129", code: "VEG30" }],
    },
    outlets: [{ id: 1, location: "Express Street, Food Court", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.1, reviews: 1098, isNearest: true }],
    menuSections: [{
      title: "Quick Meals",
      subtitle: "Fast and fresh",
      items: [
        { id: 3701, name: "Veg Meal", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", price: 149, originalPrice: 179, discount: "17% OFF", description: "Quick veg meal with roti and sabzi", isSpicy: false, customisable: true },
      ],
    }],
  },
  "pizza-paradise": {
    id: 38,
    name: "Pizza Paradise",
    cuisine: "Pizza",
    rating: 4.5,
    reviews: 2345,
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    location: "Pizza Lane",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Margherita Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop" }],
    offerText: "Buy 1 Get 1",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free garlic bread", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Buy 1 Get 1 Free", code: "PIZZABOGO" }],
    },
    outlets: [{ id: 1, location: "Pizza Lane, Food Hub", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.5, reviews: 2345, isNearest: true }],
    menuSections: [{
      title: "Pizza Specials",
      subtitle: "Italian favorites",
      items: [
        { id: 3801, name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Classic tomato, mozzarella, and basil", isSpicy: false, customisable: true },
        { id: 3802, name: "Pepperoni Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", price: 299, originalPrice: 349, discount: "14% OFF", description: "Loaded with pepperoni and cheese", isSpicy: true, customisable: true },
      ],
    }],
  },
  "italian-pizza-house": {
    id: 39,
    name: "Italian Pizza House",
    cuisine: "Pizza",
    rating: 4.4,
    reviews: 1876,
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    location: "Italian Street",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Farmhouse Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹60 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dip", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹60 OFF above ₹299", code: "ITALIAN60" }],
    },
    outlets: [{ id: 1, location: "Italian Street, Food Court", deliveryTime: "25-30 mins", distance: "1.8 km", rating: 4.4, reviews: 1876, isNearest: true }],
    menuSections: [{
      title: "Italian Pizzas",
      subtitle: "Authentic recipes",
      items: [
        { id: 3901, name: "Farmhouse Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", price: 349, originalPrice: 409, discount: "15% OFF", description: "Loaded with vegetables and cheese", isSpicy: false, customisable: true },
      ],
    }],
  },
  "rajasthani-thali-house": {
    id: 40,
    name: "Rajasthani Thali House",
    cuisine: "Thali",
    rating: 4.3,
    reviews: 1456,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Rajasthan Street",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Rajasthani Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹50 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free churma", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹50 OFF above ₹199", code: "RAJTHALI50" }],
    },
    outlets: [{ id: 1, location: "Rajasthan Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.3, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Rajasthani Thalis",
      subtitle: "Royal flavors",
      items: [
        { id: 4001, name: "Rajasthani Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Dal baati, gatte, ker sangri, and more", isSpicy: true, customisable: true },
      ],
    }],
  },
  "gujarati-thali": {
    id: 41,
    name: "Gujarati Thali",
    cuisine: "Thali",
    rating: 4.1,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Gujarat Street",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Gujarati Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹35 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free fafda", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹35 OFF above ₹129", code: "GUJ35" }],
    },
    outlets: [{ id: 1, location: "Gujarat Street, Food Court", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.1, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Gujarati Thalis",
      subtitle: "Sweet and savory",
      items: [
        { id: 4101, name: "Gujarati Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 179, originalPrice: 214, discount: "16% OFF", description: "Dhokla, thepla, dal, kadhi, and sweets", isSpicy: false, customisable: true },
      ],
    }],
  },
  "cake-studio": {
    id: 42,
    name: "Cake Studio",
    cuisine: "Bakery",
    rating: 4.5,
    reviews: 1567,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Bakery Street",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Red Velvet Cake", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹80 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free cupcake", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹80 OFF above ₹399", code: "CAKE80" }],
    },
    outlets: [{ id: 1, location: "Bakery Street, Mall", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, reviews: 1567, isNearest: true }],
    menuSections: [{
      title: "Cakes",
      subtitle: "Artisanal creations",
      items: [
        { id: 4201, name: "Red Velvet Cake", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop", price: 499, originalPrice: 579, discount: "14% OFF", description: "Classic red velvet with cream cheese frosting", isSpicy: false, customisable: true },
      ],
    }],
  },
  "chocolate-heaven": {
    id: 43,
    name: "Chocolate Heaven",
    cuisine: "Bakery",
    rating: 4.7,
    reviews: 1987,
    deliveryTime: "35-40 mins",
    distance: "2.5 km",
    location: "Sweet Street",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [{ title: "Black Forest Cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹120 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chocolate truffle", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹120 OFF above ₹599", code: "CHOCO120" }],
    },
    outlets: [{ id: 1, location: "Sweet Street, Central", deliveryTime: "35-40 mins", distance: "2.5 km", rating: 4.7, reviews: 1987, isNearest: true }],
    menuSections: [{
      title: "Chocolate Cakes",
      subtitle: "Decadent desserts",
      items: [
        { id: 4301, name: "Black Forest Cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 699, originalPrice: 819, discount: "15% OFF", description: "Chocolate layers with cherries and cream", isSpicy: false, customisable: true },
      ],
    }],
  },
  "paradise-biryani": {
    id: 44,
    name: "Paradise Biryani",
    cuisine: "Biryani",
    rating: 4.5,
    reviews: 2345,
    deliveryTime: "30-35 mins",
    distance: "2.5 km",
    location: "Biryani Street",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Hyderabadi Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop" }],
    offerText: "50% OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free raita", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "50% OFF up to ₹100", code: "PARADISE50" }],
    },
    outlets: [{ id: 1, location: "Biryani Street, Food Hub", deliveryTime: "30-35 mins", distance: "2.5 km", rating: 4.5, reviews: 2345, isNearest: true }],
    menuSections: [{
      title: "Biryani Specials",
      subtitle: "Authentic Hyderabadi",
      items: [
        { id: 4401, name: "Hyderabadi Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", price: 299, originalPrice: 399, discount: "25% OFF", description: "Fragrant basmati rice with tender chicken", isSpicy: true, customisable: true },
      ],
    }],
  },
  "hyderabadi-biryani": {
    id: 45,
    name: "Hyderabadi Biryani",
    cuisine: "Biryani",
    rating: 4.6,
    reviews: 1876,
    deliveryTime: "30-35 mins",
    distance: "2.0 km",
    location: "Hyderabad Street",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Chicken Biryani", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹60 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free mirchi ka salan", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹60 OFF above ₹249", code: "HYD60" }],
    },
    outlets: [{ id: 1, location: "Hyderabad Street, Food Court", deliveryTime: "30-35 mins", distance: "2.0 km", rating: 4.6, reviews: 1876, isNearest: true }],
    menuSections: [{
      title: "Hyderabadi Specials",
      subtitle: "Dum cooked",
      items: [
        { id: 4501, name: "Chicken Biryani", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", price: 249, originalPrice: 309, discount: "19% OFF", description: "Authentic Hyderabadi dum biryani", isSpicy: true, customisable: true },
      ],
    }],
  },
  "mughlai-biryani": {
    id: 46,
    name: "Mughlai Biryani",
    cuisine: "Biryani",
    rating: 4.4,
    reviews: 1456,
    deliveryTime: "25-30 mins",
    distance: "2.0 km",
    location: "Mughlai Street",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Mutton Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free raita", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹40 OFF above ₹149", code: "MUGHLAI40" }],
    },
    outlets: [{ id: 1, location: "Mughlai Street, Food Hub", deliveryTime: "25-30 mins", distance: "2.0 km", rating: 4.4, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Mughlai Biryanis",
      subtitle: "Royal recipes",
      items: [
        { id: 4601, name: "Mutton Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 329, originalPrice: 369, discount: "11% OFF", description: "Slow-cooked mutton with aromatic rice", isSpicy: true, customisable: true },
      ],
    }],
  },
  "burger-junction": {
    id: 47,
    name: "Burger Junction",
    cuisine: "Burger",
    rating: 4.3,
    reviews: 1234,
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    location: "Burger Street",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Classic Burger", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free fries", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹40 OFF above ₹249", code: "JUNCTION40" }],
    },
    outlets: [{ id: 1, location: "Burger Street, Food Court", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.3, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Burgers",
      subtitle: "Juicy and delicious",
      items: [
        { id: 4701, name: "Classic Burger", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", price: 179, originalPrice: 219, discount: "18% OFF", description: "Beef patty with fresh veggies", isSpicy: false, customisable: true },
      ],
    }],
  },
  "gourmet-burgers": {
    id: 48,
    name: "Gourmet Burgers",
    cuisine: "Burger",
    rating: 4.5,
    reviews: 1876,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Gourmet Street",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Premium Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹60 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free onion rings", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹60 OFF above ₹349", code: "GOURMET60" }],
    },
    outlets: [{ id: 1, location: "Gourmet Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, reviews: 1876, isNearest: true }],
    menuSections: [{
      title: "Premium Burgers",
      subtitle: "Gourmet creations",
      items: [
        { id: 4801, name: "Premium Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", price: 249, originalPrice: 309, discount: "19% OFF", description: "Gourmet beef patty with premium toppings", isSpicy: false, customisable: true },
      ],
    }],
  },
  "dragon-chinese": {
    id: 49,
    name: "Dragon Chinese",
    cuisine: "Chinese",
    rating: 4.2,
    reviews: 1456,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Dragon Street",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Schezwan Noodles", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹50 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free spring rolls", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹50 OFF above ₹199", code: "DRAGON50" }],
    },
    outlets: [{ id: 1, location: "Dragon Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.2, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Chinese Specials",
      subtitle: "Authentic flavors",
      items: [
        { id: 4901, name: "Schezwan Noodles", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", price: 219, originalPrice: 269, discount: "19% OFF", description: "Spicy noodles with vegetables", isSpicy: true, customisable: true },
      ],
    }],
  },
  "idli-express": {
    id: 50,
    name: "Idli Express",
    cuisine: "South Indian",
    rating: 4.2,
    reviews: 1234,
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    location: "South Street",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Masala Idli", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹25 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free filter coffee", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹25 OFF above ₹99", code: "IDLI25" }],
    },
    outlets: [{ id: 1, location: "South Street, Food Court", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.2, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Idli Varieties",
      subtitle: "Soft and fluffy",
      items: [
        { id: 5001, name: "Masala Idli", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", price: 89, originalPrice: 114, discount: "22% OFF", description: "Idli with spiced potato filling", isSpicy: true, customisable: true },
      ],
    }],
  },
  "tibetan-momos": {
    id: 51,
    name: "Tibetan Momos",
    cuisine: "Momos",
    rating: 4.4,
    reviews: 1567,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Tibetan Street",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Fried Momos", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free soup", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹40 OFF above ₹199", code: "TIBETAN40" }],
    },
    outlets: [{ id: 1, location: "Tibetan Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.4, reviews: 1567, isNearest: true }],
    menuSections: [{
      title: "Tibetan Momos",
      subtitle: "Authentic recipes",
      items: [
        { id: 5101, name: "Fried Momos (8 pcs)", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 149, originalPrice: 189, discount: "21% OFF", description: "Crispy fried momos with spicy sauce", isSpicy: true, customisable: true },
      ],
    }],
  },
  "steam-momos-house": {
    id: 52,
    name: "Steam Momos House",
    cuisine: "Momos",
    rating: 4.2,
    reviews: 1098,
    deliveryTime: "15-20 mins",
    distance: "0.6 km",
    location: "Momos Street",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Veg Momos", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop" }],
    offerText: "Flat ₹25 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "Flat ₹25 OFF above ₹99", code: "STEAM25" }],
    },
    outlets: [{ id: 1, location: "Momos Street, Food Court", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.2, reviews: 1098, isNearest: true }],
    menuSections: [{
      title: "Steam Momos",
      subtitle: "Fresh and hot",
      items: [
        { id: 5201, name: "Veg Momos (8 pcs)", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", price: 109, originalPrice: 134, discount: "19% OFF", description: "Steamed vegetable dumplings", isSpicy: false, customisable: true },
      ],
    }],
  },
  "chhole-bhature-house": {
    id: 53,
    name: "Chhole Bhature House",
    cuisine: "Chhole Bhature",
    rating: 4.3,
    reviews: 1456,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Punjab Street",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Chhole Bhature", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free pickle", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹40 OFF above ₹149", code: "CHOLE40" }],
    },
    outlets: [{ id: 1, location: "Punjab Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.3, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Chhole Bhature",
      subtitle: "Punjabi favorite",
      items: [
        { id: 5301, name: "Chhole Bhature (2 pcs)", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", price: 149, originalPrice: 189, discount: "21% OFF", description: "Spiced chickpeas with fluffy bhature", isSpicy: true, customisable: true },
      ],
    }],
  },
  "delhi-chhole-bhature": {
    id: 54,
    name: "Delhi Chhole Bhature",
    cuisine: "Chhole Bhature",
    rating: 4.4,
    reviews: 1678,
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    location: "Delhi Street",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Special Chhole", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹35 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free lassi", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹35 OFF above ₹129", code: "DELHICHOLE35" }],
    },
    outlets: [{ id: 1, location: "Delhi Street, Food Court", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.4, reviews: 1678, isNearest: true }],
    menuSections: [{
      title: "Delhi Specials",
      subtitle: "Street food favorite",
      items: [
        { id: 5401, name: "Special Chhole Bhature", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", price: 129, originalPrice: 164, discount: "21% OFF", description: "Delhi-style chhole with crispy bhature", isSpicy: true, customisable: true },
      ],
    }],
  },
  "punjabi-chhole": {
    id: 55,
    name: "Punjabi Chhole",
    cuisine: "Chhole Bhature",
    rating: 4.2,
    reviews: 1234,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Punjab Street",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Punjabi Chhole", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹30 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free onion", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹30 OFF above ₹99", code: "PUNJABI30" }],
    },
    outlets: [{ id: 1, location: "Punjab Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.2, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Punjabi Chhole",
      subtitle: "Authentic flavors",
      items: [
        { id: 5501, name: "Punjabi Chhole Bhature", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", price: 119, originalPrice: 149, discount: "20% OFF", description: "Traditional Punjabi chhole with bhature", isSpicy: true, customisable: true },
      ],
    }],
  },
  "mughlai-tandoori": {
    id: 56,
    name: "Mughlai Tandoori",
    cuisine: "Chicken Tanduri",
    rating: 4.4,
    reviews: 1567,
    deliveryTime: "30-35 mins",
    distance: "2.0 km",
    location: "Mughlai Street",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Tanduri Half", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹60 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free naan", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹60 OFF above ₹249", code: "MUGHLAI60" }],
    },
    outlets: [{ id: 1, location: "Mughlai Street, Food Hub", deliveryTime: "30-35 mins", distance: "2.0 km", rating: 4.4, reviews: 1567, isNearest: true }],
    menuSections: [{
      title: "Mughlai Tandoori",
      subtitle: "Royal recipes",
      items: [
        { id: 5601, name: "Tanduri Half", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", price: 299, originalPrice: 359, discount: "17% OFF", description: "Half chicken marinated and grilled", isSpicy: true, customisable: true },
      ],
    }],
  },
  "tandoori-house": {
    id: 57,
    name: "Tandoori House",
    cuisine: "Chicken Tanduri",
    rating: 4.3,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Tandoor Street",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Chicken Tandoori", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free raita", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹40 OFF above ₹199", code: "TANDOOR40" }],
    },
    outlets: [{ id: 1, location: "Tandoor Street, Food Court", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.3, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Tandoori Specials",
      subtitle: "Charcoal grilled",
      items: [
        { id: 5701, name: "Chicken Tandoori", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", price: 229, originalPrice: 269, discount: "15% OFF", description: "Marinated chicken grilled in tandoor", isSpicy: true, customisable: true },
      ],
    }],
  },
  "sweet-donuts": {
    id: 58,
    name: "Sweet Donuts",
    cuisine: "Donuts",
    rating: 4.5,
    reviews: 1456,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Donut Street",
    image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Glazed Donut", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹40 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free donut", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹40 OFF above ₹149", code: "SWEET40" }],
    },
    outlets: [{ id: 1, location: "Donut Street, Mall", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Donuts",
      subtitle: "Freshly glazed",
      items: [
        { id: 5801, name: "Glazed Donut", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", price: 129, originalPrice: 149, discount: "13% OFF", description: "Classic glazed donut", isSpicy: false, customisable: true },
      ],
    }],
  },
  "donut-express": {
    id: 59,
    name: "Donut Express",
    cuisine: "Donuts",
    rating: 4.4,
    reviews: 1234,
    deliveryTime: "35-40 mins",
    distance: "2.2 km",
    location: "Express Street",
    image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Donut Box", image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹35 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free coffee", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹35 OFF above ₹99", code: "EXPRESS35" }],
    },
    outlets: [{ id: 1, location: "Express Street, Food Hub", deliveryTime: "35-40 mins", distance: "2.2 km", rating: 4.4, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Donut Varieties",
      subtitle: "Assorted flavors",
      items: [
        { id: 5901, name: "Donut Box (6 pcs)", image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=400&h=300&fit=crop", price: 299, originalPrice: 334, discount: "10% OFF", description: "Assorted donuts pack", isSpicy: false, customisable: true },
      ],
    }],
  },
  "masala-dosa-house": {
    id: 60,
    name: "Masala Dosa House",
    cuisine: "Dosa",
    rating: 4.4,
    reviews: 1567,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Dosa Street",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Rava Dosa", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹35 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sambar", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹35 OFF above ₹109", code: "MASALA35" }],
    },
    outlets: [{ id: 1, location: "Dosa Street, Food Court", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.4, reviews: 1567, isNearest: true }],
    menuSections: [{
      title: "Dosa Varieties",
      subtitle: "Crispy and delicious",
      items: [
        { id: 6001, name: "Rava Dosa", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", price: 109, originalPrice: 144, discount: "24% OFF", description: "Crispy semolina dosa with onions", isSpicy: false, customisable: true },
      ],
    }],
  },
  "south-dosa": {
    id: 61,
    name: "South Dosa",
    cuisine: "Dosa",
    rating: 4.2,
    reviews: 1098,
    deliveryTime: "15-20 mins",
    distance: "0.9 km",
    location: "South Street",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Plain Dosa", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹25 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹25 OFF above ₹79", code: "SOUTH25" }],
    },
    outlets: [{ id: 1, location: "South Street, Food Court", deliveryTime: "15-20 mins", distance: "0.9 km", rating: 4.2, reviews: 1098, isNearest: true }],
    menuSections: [{
      title: "Dosas",
      subtitle: "South Indian classic",
      items: [
        { id: 6101, name: "Plain Dosa", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", price: 69, originalPrice: 94, discount: "27% OFF", description: "Crispy plain dosa with sambar and chutney", isSpicy: false, customisable: true },
      ],
    }],
  },
  "crispy-fries": {
    id: 62,
    name: "Crispy Fries",
    cuisine: "French Fries",
    rating: 4.3,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Fries Street",
    image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Loaded Fries", image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹25 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dip", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹25 OFF above ₹109", code: "CRISPY25" }],
    },
    outlets: [{ id: 1, location: "Fries Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.3, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Fries",
      subtitle: "Crispy and golden",
      items: [
        { id: 6201, name: "Loaded Fries", image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=400&h=300&fit=crop", price: 129, originalPrice: 154, discount: "16% OFF", description: "Fries topped with cheese and jalapenos", isSpicy: true, customisable: true },
      ],
    }],
  },
  "golden-fries": {
    id: 63,
    name: "Golden Fries",
    cuisine: "French Fries",
    rating: 4.1,
    reviews: 987,
    deliveryTime: "15-20 mins",
    distance: "0.7 km",
    location: "Fries Lane",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Classic Fries", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹15 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free ketchup", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹15 OFF above ₹79", code: "GOLDEN15" }],
    },
    outlets: [{ id: 1, location: "Fries Lane, Food Court", deliveryTime: "15-20 mins", distance: "0.7 km", rating: 4.1, reviews: 987, isNearest: true }],
    menuSections: [{
      title: "Fries",
      subtitle: "Golden perfection",
      items: [
        { id: 6301, name: "Classic French Fries", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 79, originalPrice: 94, discount: "16% OFF", description: "Crispy golden fries", isSpicy: false, customisable: true },
      ],
    }],
  },
  "soft-idli-house": {
    id: 64,
    name: "Soft Idli House",
    cuisine: "Idli",
    rating: 4.3,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.0 km",
    location: "Idli Street",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Masala Idli", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹30 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free vada", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹30 OFF above ₹99", code: "SOFT30" }],
    },
    outlets: [{ id: 1, location: "Idli Street, Food Hub", deliveryTime: "20-25 mins", distance: "1.0 km", rating: 4.3, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Idli Varieties",
      subtitle: "Soft and fluffy",
      items: [
        { id: 6401, name: "Masala Idli", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", price: 109, originalPrice: 139, discount: "22% OFF", description: "Idli with spiced potato filling", isSpicy: true, customisable: true },
      ],
    }],
  },
  "idli-corner": {
    id: 65,
    name: "Idli Corner",
    cuisine: "Idli",
    rating: 4.1,
    reviews: 987,
    deliveryTime: "15-20 mins",
    distance: "0.6 km",
    location: "Idli Lane",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Plain Idli", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹20 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free sambar", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹20 OFF above ₹69", code: "IDLI20" }],
    },
    outlets: [{ id: 1, location: "Idli Lane, Food Court", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.1, reviews: 987, isNearest: true }],
    menuSections: [{
      title: "Idli",
      subtitle: "Classic South Indian",
      items: [
        { id: 6501, name: "Plain Idli (4 pcs)", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", price: 69, originalPrice: 89, discount: "22% OFF", description: "Soft idlis with sambar and chutney", isSpicy: false, customisable: true },
      ],
    }],
  },
  "samosa-express": {
    id: 66,
    name: "Samosa Express",
    cuisine: "Samosa",
    rating: 4.2,
    reviews: 1098,
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    location: "Samosa Street",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
    priceRange: "$",
    offers: [{ title: "Aloo Samosa", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹15 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹15 OFF above ₹59", code: "EXPRESS15" }],
    },
    outlets: [{ id: 1, location: "Samosa Street, Food Court", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.2, reviews: 1098, isNearest: true }],
    menuSections: [{
      title: "Samosas",
      subtitle: "Hot and crispy",
      items: [
        { id: 6601, name: "Aloo Samosa (2 pcs)", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", price: 39, originalPrice: 54, discount: "28% OFF", description: "Crispy samosa with spiced potato", isSpicy: true, customisable: true },
      ],
    }],
  },
  "appetizer-house": {
    id: 67,
    name: "Appetizer House",
    cuisine: "Starters",
    rating: 4.3,
    reviews: 1456,
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    location: "Appetizer Street",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Chicken Wings", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹50 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free dip", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹50 OFF above ₹199", code: "APPETIZER50" }],
    },
    outlets: [{ id: 1, location: "Appetizer Street, Food Hub", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.3, reviews: 1456, isNearest: true }],
    menuSections: [{
      title: "Appetizers",
      subtitle: "Perfect starters",
      items: [
        { id: 6701, name: "Chicken Wings (6 pcs)", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", price: 249, originalPrice: 299, discount: "17% OFF", description: "Spicy chicken wings with sauce", isSpicy: true, customisable: true },
      ],
    }],
  },
  "tasty-starters": {
    id: 68,
    name: "Tasty Starters",
    cuisine: "Starters",
    rating: 4.2,
    reviews: 1234,
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    location: "Starter Street",
    image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [{ title: "Starter Platter", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop" }],
    offerText: "FLAT ₹35 OFF",
    offerCount: 1,
    restaurantOffers: {
      goldOffer: { title: "Gold exclusive offer", description: "Free chutney", unlockText: "join Gold to unlock", buttonText: "Add Gold - ₹1" },
      coupons: [{ id: 1, title: "FLAT ₹35 OFF above ₹149", code: "TASTY35" }],
    },
    outlets: [{ id: 1, location: "Starter Street, Food Court", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.2, reviews: 1234, isNearest: true }],
    menuSections: [{
      title: "Starters",
      subtitle: "Tasty bites",
      items: [
        { id: 6801, name: "Starter Platter", image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", price: 199, originalPrice: 234, discount: "15% OFF", description: "Assorted starters platter", isSpicy: true, customisable: true },
      ],
    }],
  },
  "iris": {
    id: 101,
    name: "IRIS",
    cuisine: "Continental",
    rating: 4.3,
    reviews: 856,
    deliveryTime: "30-35 mins",
    distance: "2.9 km",
    location: "Press Complex, Indore",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [],
    offerText: "Flat 30% OFF + 3 more",
    offerCount: 3,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 1001, name: "Creamy Pasta Carbonara", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", price: 450, originalPrice: 550, discount: "18% OFF", description: "Classic Italian pasta with creamy white sauce, bacon, and parmesan cheese", isSpicy: false, customisable: true },
          { id: 1002, name: "Grilled Chicken Steak", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 650, originalPrice: 750, discount: "13% OFF", description: "Juicy grilled chicken breast served with mashed potatoes and vegetables", isSpicy: false, customisable: true },
          { id: 1003, name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", price: 380, originalPrice: 450, discount: "16% OFF", description: "Fresh tomato sauce, mozzarella cheese, and basil leaves", isSpicy: false, customisable: true },
          { id: 1004, name: "Caesar Salad", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", price: 320, originalPrice: 380, discount: "16% OFF", description: "Fresh romaine lettuce with caesar dressing, croutons, and parmesan", isSpicy: false, customisable: true },
          { id: 1005, name: "Chocolate Lava Cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 280, originalPrice: 320, discount: "13% OFF", description: "Warm chocolate cake with molten center, served with vanilla ice cream", isSpicy: false, customisable: false },
          { id: 1006, name: "Red Wine Braised Lamb", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 850, originalPrice: 1000, discount: "15% OFF", description: "Tender lamb slow-cooked in red wine with herbs and vegetables", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "skyline-rooftop": {
    id: 102,
    name: "Skyline Rooftop",
    cuisine: "Multi-cuisine",
    rating: 4.5,
    reviews: 1243,
    deliveryTime: "35-40 mins",
    distance: "3.2 km",
    location: "MG Road, Indore",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [],
    offerText: "Flat 25% OFF + 2 more",
    offerCount: 2,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 2001, name: "Grilled Chicken Platter", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 550, originalPrice: 650, discount: "15% OFF", description: "Grilled chicken with rice, salad, and garlic bread", isSpicy: false, customisable: true },
          { id: 2002, name: "Mutton Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 480, originalPrice: 580, discount: "17% OFF", description: "Fragrant basmati rice with tender mutton pieces and spices", isSpicy: true, customisable: true },
          { id: 2003, name: "Paneer Tikka", image: "https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400&h=300&fit=crop", price: 320, originalPrice: 380, discount: "16% OFF", description: "Marinated cottage cheese cubes grilled to perfection", isSpicy: true, customisable: true },
          { id: 2004, name: "Chicken Wings", image: "https://images.unsplash.com/photo-1626645738192-c85a3e0e3b1f?w=400&h=300&fit=crop", price: 380, originalPrice: 450, discount: "16% OFF", description: "Crispy chicken wings with spicy buffalo sauce", isSpicy: true, customisable: true },
          { id: 2005, name: "Chocolate Brownie Sundae", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 250, originalPrice: 300, discount: "17% OFF", description: "Warm brownie topped with vanilla ice cream and chocolate sauce", isSpicy: false, customisable: false },
          { id: 2006, name: "Mojito", image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop", price: 180, originalPrice: 220, discount: "18% OFF", description: "Refreshing mint and lime mocktail", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "the-grand-bistro": {
    id: 103,
    name: "The Grand Bistro",
    cuisine: "Continental",
    rating: 4.7,
    reviews: 2156,
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    location: "Vijay Nagar, Indore",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [],
    offerText: "Flat 35% OFF + 4 more",
    offerCount: 4,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 3001, name: "Risotto ai Funghi", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop", price: 650, originalPrice: 800, discount: "19% OFF", description: "Creamy Italian risotto with wild mushrooms and parmesan", isSpicy: false, customisable: true },
          { id: 3002, name: "Beef Tenderloin", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 950, originalPrice: 1200, discount: "21% OFF", description: "Premium beef tenderloin with red wine sauce and vegetables", isSpicy: false, customisable: true },
          { id: 3003, name: "Truffle Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", price: 580, originalPrice: 700, discount: "17% OFF", description: "Gourmet pasta with truffle oil and parmesan cheese", isSpicy: false, customisable: true },
          { id: 3004, name: "Seafood Platter", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 1200, originalPrice: 1500, discount: "20% OFF", description: "Assorted grilled seafood with lemon butter sauce", isSpicy: false, customisable: true },
          { id: 3005, name: "Tiramisu", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", price: 320, originalPrice: 380, discount: "16% OFF", description: "Classic Italian dessert with coffee and mascarpone", isSpicy: false, customisable: false },
          { id: 3006, name: "Caprese Salad", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", price: 380, originalPrice: 450, discount: "16% OFF", description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
  "coastal-kitchen": {
    id: 104,
    name: "Coastal Kitchen",
    cuisine: "Seafood",
    rating: 4.4,
    reviews: 987,
    deliveryTime: "28-33 mins",
    distance: "2.1 km",
    location: "Palasia, Indore",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [],
    offerText: "Flat 20% OFF + 2 more",
    offerCount: 2,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 4001, name: "Fish Curry", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 480, originalPrice: 580, discount: "17% OFF", description: "Traditional coastal fish curry with coconut and spices", isSpicy: true, customisable: true },
          { id: 4002, name: "Prawn Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 520, originalPrice: 620, discount: "16% OFF", description: "Fragrant basmati rice with succulent prawns and spices", isSpicy: true, customisable: true },
          { id: 4003, name: "Grilled Fish", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 450, originalPrice: 550, discount: "18% OFF", description: "Fresh fish marinated and grilled with herbs", isSpicy: false, customisable: true },
          { id: 4004, name: "Crab Masala", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 680, originalPrice: 800, discount: "15% OFF", description: "Spicy crab cooked in rich masala gravy", isSpicy: true, customisable: true },
          { id: 4005, name: "Fish Fry", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 380, originalPrice: 450, discount: "16% OFF", description: "Crispy fried fish with tangy tamarind chutney", isSpicy: true, customisable: true },
          { id: 4006, name: "Seafood Platter", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", price: 850, originalPrice: 1000, discount: "15% OFF", description: "Assorted seafood including fish, prawns, and crab", isSpicy: true, customisable: true },
        ],
      },
    ],
  },
  "garden-terrace": {
    id: 105,
    name: "Garden Terrace",
    cuisine: "North Indian",
    rating: 4.6,
    reviews: 1456,
    deliveryTime: "40-45 mins",
    distance: "4.5 km",
    location: "Scheme 54, Indore",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    priceRange: "$$",
    offers: [],
    offerText: "Flat 30% OFF + 3 more",
    offerCount: 3,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 5001, name: "Butter Chicken", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 380, originalPrice: 480, discount: "21% OFF", description: "Creamy tomato-based curry with tender chicken pieces", isSpicy: false, customisable: true },
          { id: 5002, name: "Dal Makhani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 280, originalPrice: 350, discount: "20% OFF", description: "Creamy black lentils cooked overnight with butter and cream", isSpicy: false, customisable: true },
          { id: 5003, name: "Paneer Butter Masala", image: "https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400&h=300&fit=crop", price: 320, originalPrice: 400, discount: "20% OFF", description: "Soft paneer cubes in rich tomato and cream gravy", isSpicy: false, customisable: true },
          { id: 5004, name: "Tandoori Roti", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop", price: 25, originalPrice: 30, discount: "17% OFF", description: "Freshly baked whole wheat bread from tandoor", isSpicy: false, customisable: false },
          { id: 5005, name: "Chicken Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", price: 420, originalPrice: 520, discount: "19% OFF", description: "Fragrant basmati rice with spiced chicken and fried onions", isSpicy: true, customisable: true },
          { id: 5006, name: "Gulab Jamun", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 120, originalPrice: 150, discount: "20% OFF", description: "Soft milk dumplings soaked in sugar syrup", isSpicy: false, customisable: false },
        ],
      },
    ],
  },
  "midnight-lounge": {
    id: 106,
    name: "Midnight Lounge",
    cuisine: "Continental",
    rating: 4.2,
    reviews: 723,
    deliveryTime: "35-40 mins",
    distance: "3.8 km",
    location: "Bhawarkua, Indore",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    priceRange: "$$$",
    offers: [],
    offerText: "Flat 25% OFF + 2 more",
    offerCount: 2,
    restaurantOffers: { goldOffer: null, coupons: [] },
    highlights: [],
    menuSections: [
      {
        title: "Recommended for you",
        items: [
          { id: 6001, name: "Steak with Peppercorn Sauce", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", price: 750, originalPrice: 900, discount: "17% OFF", description: "Premium beef steak with creamy peppercorn sauce and sides", isSpicy: false, customisable: true },
          { id: 6002, name: "Chicken Alfredo Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", price: 480, originalPrice: 580, discount: "17% OFF", description: "Creamy alfredo pasta with grilled chicken and parmesan", isSpicy: false, customisable: true },
          { id: 6003, name: "BBQ Chicken Wings", image: "https://images.unsplash.com/photo-1626645738192-c85a3e0e3b1f?w=400&h=300&fit=crop", price: 420, originalPrice: 500, discount: "16% OFF", description: "Spicy chicken wings glazed with BBQ sauce", isSpicy: true, customisable: true },
          { id: 6004, name: "Caesar Salad with Grilled Chicken", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", price: 380, originalPrice: 450, discount: "16% OFF", description: "Fresh romaine lettuce with grilled chicken and caesar dressing", isSpicy: false, customisable: true },
          { id: 6005, name: "Chocolate Fondant", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", price: 320, originalPrice: 380, discount: "16% OFF", description: "Warm chocolate cake with molten center and vanilla ice cream", isSpicy: false, customisable: false },
          { id: 6006, name: "Mushroom Risotto", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop", price: 520, originalPrice: 620, discount: "16% OFF", description: "Creamy Italian risotto with wild mushrooms and herbs", isSpicy: false, customisable: true },
        ],
      },
    ],
  },
}

export default function RestaurantDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, updateQuantity, removeFromCart, getCartItem, cart } = useCart()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [quantities, setQuantities] = useState({})
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set())
  const [showToast, setShowToast] = useState(false)
  const [showManageCollections, setShowManageCollections] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [showItemDetail, setShowItemDetail] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showLocationSheet, setShowLocationSheet] = useState(false)
  const [showScheduleSheet, setShowScheduleSheet] = useState(false)
  const [showOffersSheet, setShowOffersSheet] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [expandedCoupons, setExpandedCoupons] = useState(new Set())
  const [showMenuSheet, setShowMenuSheet] = useState(false)
  const [showLargeOrderMenu, setShowLargeOrderMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMenuOptionsSheet, setShowMenuOptionsSheet] = useState(false)
  const [expandedAddButtons, setExpandedAddButtons] = useState(new Set())
  const [expandedSections, setExpandedSections] = useState(new Set([0])) // Default: Recommended section is expanded
  const [filters, setFilters] = useState({
    sortBy: null, // "low-to-high" | "high-to-low"
    vegNonVeg: null, // "veg" | "non-veg"
    highlyReordered: false,
    spicy: false,
  })

  // Restaurant data state
  const [restaurant, setRestaurant] = useState(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [restaurantError, setRestaurantError] = useState(null)

  // Fetch restaurant data from API
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return
      
      try {
        setLoadingRestaurant(true)
        setRestaurantError(null)
        
        console.log('Fetching restaurant with slug:', slug)
        const response = await restaurantAPI.getRestaurantById(slug)
        
        if (response.data && response.data.success && response.data.data && response.data.data.restaurant) {
          const apiRestaurant = response.data.data.restaurant
          console.log('Fetched restaurant from API:', apiRestaurant)
          
          // Transform API data to match expected format with comprehensive fallbacks
          const transformedRestaurant = {
            id: apiRestaurant?.restaurantId || apiRestaurant?._id || null,
            name: apiRestaurant?.name || "Unknown Restaurant", 
            cuisine: (apiRestaurant?.cuisines && Array.isArray(apiRestaurant.cuisines) && apiRestaurant.cuisines.length > 0)
              ? apiRestaurant.cuisines[0] 
              : "Multi-cuisine",
            rating: apiRestaurant?.rating ?? 4.5,
            reviews: apiRestaurant?.totalRatings ?? 0,
            deliveryTime: apiRestaurant?.estimatedDeliveryTime || "25-30 mins",
            distance: apiRestaurant?.distance || "1.2 km",
            location: apiRestaurant?.location?.area || apiRestaurant?.location?.city || apiRestaurant?.location?.addressLine1 || "Location",
            image: apiRestaurant?.profileImage?.url 
              || (Array.isArray(apiRestaurant?.menuImages) && apiRestaurant.menuImages.length > 0 
                ? apiRestaurant.menuImages[0]?.url 
                : null)
              || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
            priceRange: apiRestaurant?.priceRange || "$$",
            offers: Array.isArray(apiRestaurant?.offers) ? apiRestaurant.offers : [], // Will be populated from menu/offers API later
            offerText: apiRestaurant?.offer || "FLAT 50% OFF",
            offerCount: apiRestaurant?.offerCount ?? 0,
            restaurantOffers: {
              goldOffer: {
                title: apiRestaurant?.restaurantOffers?.goldOffer?.title || "Gold exclusive offer",
                description: apiRestaurant?.restaurantOffers?.goldOffer?.description || "Free delivery above ₹99",
                unlockText: apiRestaurant?.restaurantOffers?.goldOffer?.unlockText || "join Gold to unlock",
                buttonText: apiRestaurant?.restaurantOffers?.goldOffer?.buttonText || "Add Gold - ₹1",
              },
              coupons: Array.isArray(apiRestaurant?.restaurantOffers?.coupons) 
                ? apiRestaurant.restaurantOffers.coupons 
                : [],
            },
            outlets: Array.isArray(apiRestaurant?.outlets) ? apiRestaurant.outlets : [],
            categories: Array.isArray(apiRestaurant?.categories) ? apiRestaurant.categories : [],
            menu: Array.isArray(apiRestaurant?.menu) ? apiRestaurant.menu : [],
            slug: apiRestaurant?.slug || slug || "unknown",
            restaurantId: apiRestaurant?.restaurantId || apiRestaurant?._id || null,
            // Add other fields with defaults
            featuredDish: apiRestaurant?.featuredDish || "Special Dish",
            featuredPrice: apiRestaurant?.featuredPrice ?? 249,
            // Additional safety fields
            openDays: Array.isArray(apiRestaurant?.openDays) ? apiRestaurant.openDays : [],
            deliveryTimings: apiRestaurant?.deliveryTimings || {
              openingTime: "09:00",
              closingTime: "22:00",
            },
            cuisines: Array.isArray(apiRestaurant?.cuisines) ? apiRestaurant.cuisines : [],
            profileImage: apiRestaurant?.profileImage || null,
            menuImages: Array.isArray(apiRestaurant?.menuImages) ? apiRestaurant.menuImages : [],
            // Menu sections for display (will be populated from menu API)
            menuSections: [],
          }
          
          console.log('Transformed restaurant:', transformedRestaurant)
          setRestaurant(transformedRestaurant)
          
          // Fetch menu and inventory for this restaurant
          try {
            const menuResponse = await restaurantAPI.getMenuByRestaurantId(slug)
            if (menuResponse.data && menuResponse.data.success && menuResponse.data.data && menuResponse.data.data.menu) {
              const menuSections = menuResponse.data.data.menu.sections || []
              
              // Collect all recommended items from all sections
              // Only include items that are both recommended (isRecommended === true) AND available (isAvailable !== false)
              const recommendedItems = []
              menuSections.forEach(section => {
                // Check direct items - only include if isRecommended is explicitly true (strict check) AND item is available
                if (section.items && Array.isArray(section.items)) {
                  section.items.forEach(item => {
                    // Strict check: isRecommended must be exactly boolean true
                    // This will exclude: false, undefined, null, 0, "", and any other falsy values
                    if (item.isRecommended === true && typeof item.isRecommended === 'boolean' && item.isAvailable !== false) {
                      recommendedItems.push(item)
                    }
                  })
                }
                // Check subsection items - only include if isRecommended is explicitly true (strict check) AND item is available
                if (section.subsections && Array.isArray(section.subsections)) {
                  section.subsections.forEach(subsection => {
                    if (subsection.items && Array.isArray(subsection.items)) {
                      subsection.items.forEach(item => {
                        // Strict check: isRecommended must be exactly boolean true
                        // This will exclude: false, undefined, null, 0, "", and any other falsy values
                        if (item.isRecommended === true && typeof item.isRecommended === 'boolean' && item.isAvailable !== false) {
                          recommendedItems.push(item)
                        }
                      })
                    }
                  })
                }
              })
              
              // Debug log to verify recommended items and their isRecommended values
              console.log('Recommended items collected:', recommendedItems.map(item => ({ 
                name: item.name, 
                isRecommended: item.isRecommended,
                isRecommendedType: typeof item.isRecommended 
              })))
              
              // Always create recommended section (even if empty) - will show "No dish Yet" if empty
              const finalMenuSections = [{ name: "Recommended for you", items: recommendedItems, subsections: [] }, ...menuSections]
              
              setRestaurant(prev => ({
                ...prev,
                menuSections: finalMenuSections,
              }))
              
              // Set first 3 sections (Recommended, Starters, Main Course) as expanded by default
              const defaultExpandedSections = new Set([0, 1, 2]) // Index 0, 1, 2
              setExpandedSections(defaultExpandedSections)
              
              console.log('Fetched menu sections with recommended items:', finalMenuSections)
            }
          } catch (menuError) {
            console.error('Error fetching menu:', menuError)
          }
          
          try {
            const inventoryResponse = await restaurantAPI.getInventoryByRestaurantId(slug)
            if (inventoryResponse.data && inventoryResponse.data.success && inventoryResponse.data.data && inventoryResponse.data.data.inventory) {
              const inventoryCategories = inventoryResponse.data.data.inventory.categories || []
              
              // Normalize inventory categories to ensure proper structure
              const normalizedInventory = inventoryCategories.map((category, index) => ({
                id: category.id || `category-${index}`,
                name: category.name || "Unnamed Category",
                description: category.description || "",
                itemCount: category.itemCount ?? (category.items?.length || 0),
                inStock: category.inStock !== undefined ? category.inStock : true,
                items: Array.isArray(category.items) ? category.items.map(item => ({
                  id: String(item.id || Date.now() + Math.random()),
                  name: item.name || "Unnamed Item",
                  inStock: item.inStock !== undefined ? item.inStock : true,
                  isVeg: item.isVeg !== undefined ? item.isVeg : true,
                  stockQuantity: item.stockQuantity || "Unlimited",
                  unit: item.unit || "piece",
                  expiryDate: item.expiryDate || null,
                  lastRestocked: item.lastRestocked || null,
                })) : [],
                order: category.order !== undefined ? category.order : index,
              }))
              
              setRestaurant(prev => ({
                ...prev,
                inventory: normalizedInventory,
              }))
              console.log('✅ Fetched and normalized inventory categories:', normalizedInventory)
            }
          } catch (inventoryError) {
            console.error('Error fetching inventory:', inventoryError)
          }
        } else {
          console.warn('Invalid API response structure:', response.data)
          setRestaurantError('Restaurant not found')
          // Fallback to hardcoded data if API fails
          setRestaurant(restaurantsData[slug] || restaurantsData["golden-dragon"])
        }
      } catch (error) {
        // Only log non-404 errors (404 is expected when restaurant doesn't exist in DB)
        if (error.response?.status !== 404) {
          console.error('Error fetching restaurant:', error)
        } else {
          console.log(`Restaurant "${slug}" not found in database, using fallback data`)
        }
        setRestaurantError(error.response?.status === 404 ? null : (error.message || 'Failed to load restaurant'))
        // Fallback to hardcoded data if API fails
        setRestaurant(restaurantsData[slug] || restaurantsData["golden-dragon"])
      } finally {
        setLoadingRestaurant(false)
      }
    }
    
    fetchRestaurant()
  }, [slug])

  // Sync quantities from cart on mount and when restaurant changes
  useEffect(() => {
    if (!restaurant || !restaurant.name) return
    
    const cartQuantities = {}
    cart.forEach((item) => {
      if (item.restaurant === restaurant.name) {
        cartQuantities[item.id] = item.quantity || 0
      }
    })
    setQuantities(cartQuantities)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.name, cart])

  // Helper function to update item quantity in both local state and cart
  const updateItemQuantity = (item, newQuantity, event = null) => {
    // Update local state
    setQuantities((prev) => ({
      ...prev,
      [item.id]: newQuantity,
    }))

    // Prepare cart item with all required properties
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant?.name || "Unknown Restaurant",
      description: item.description,
      originalPrice: item.originalPrice,
    }

    // Get source position for animation from event target
    // Prefer currentTarget (the button) over target (might be icon inside button)
    let sourcePosition = null
    if (event) {
      // Use currentTarget (the button element) for accurate button position
      // If currentTarget is not available, try to find the button element
      let buttonElement = event.currentTarget
      if (!buttonElement && event.target) {
        // If we clicked on an icon inside, find the closest button
        buttonElement = event.target.closest('button') || event.target
      }
      
      if (buttonElement) {
        // Store button reference and current viewport position
        // We'll recalculate position right before animation to account for scroll
        const rect = buttonElement.getBoundingClientRect()
        const scrollX = window.pageXOffset || window.scrollX || 0
        const scrollY = window.pageYOffset || window.scrollY || 0
        
        // Store both viewport position and scroll at capture time
        // This allows us to adjust for scroll changes later
        sourcePosition = {
          // Viewport-relative position at capture time
          viewportX: rect.left + rect.width / 2,
          viewportY: rect.top + rect.height / 2,
          // Scroll position at capture time
          scrollX: scrollX,
          scrollY: scrollY,
          // Store button identifier to potentially find it again
          itemId: item.id,
        }
      }
    }

    // Update cart context
    if (newQuantity <= 0) {
      // Pass sourcePosition and product info for removal animation
      const productInfo = {
        id: item.id,
        name: item.name,
        imageUrl: item.image,
      }
      removeFromCart(item.id, sourcePosition, productInfo)
    } else {
      const existingCartItem = getCartItem(item.id)
      if (existingCartItem) {
        // Prepare product info for animation
        const productInfo = {
          id: item.id,
          name: item.name,
          imageUrl: item.image,
        }
        
        // If incrementing quantity, trigger add animation with sourcePosition
        if (newQuantity > existingCartItem.quantity && sourcePosition) {
          addToCart(cartItem, sourcePosition)
          if (newQuantity > existingCartItem.quantity + 1) {
            updateQuantity(item.id, newQuantity)
          }
        } 
        // If decreasing quantity, trigger removal animation with sourcePosition
        else if (newQuantity < existingCartItem.quantity && sourcePosition) {
          updateQuantity(item.id, newQuantity, sourcePosition, productInfo)
        } 
        // Otherwise just update quantity without animation
        else {
          updateQuantity(item.id, newQuantity)
        }
      } else {
        // Add to cart first (adds with quantity 1), then update to desired quantity
        // Pass sourcePosition when adding a new item
        addToCart(cartItem, sourcePosition)
        if (newQuantity > 1) {
          updateQuantity(item.id, newQuantity)
        }
      }
    }
  }

  // Menu categories - dynamically generated from restaurant menu sections
  const menuCategories = (restaurant?.menuSections && Array.isArray(restaurant.menuSections)) 
    ? restaurant.menuSections.map((section, index) => {
        // Handle section name - check for valid non-empty string
        let sectionTitle = "Unnamed Section"
        if (index === 0) {
          sectionTitle = "Recommended for you"
        } else if (section?.name && typeof section.name === 'string' && section.name.trim()) {
          sectionTitle = section.name.trim()
        } else if (section?.title && typeof section.title === 'string' && section.title.trim()) {
          sectionTitle = section.title.trim()
        }
        
        const itemCount = section?.items?.length || 0
        const subsectionCount = section?.subsections?.reduce((sum, sub) => sum + (sub?.items?.length || 0), 0) || 0
        const totalCount = itemCount + subsectionCount
        
        return {
          name: sectionTitle,
          count: totalCount,
          sectionIndex: index,
        }
      })
    : []

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.sortBy) count++
    if (filters.vegNonVeg) count++
    if (filters.highlyReordered) count++
    if (filters.spicy) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Handle bookmark click
  const handleBookmarkClick = (itemId) => {
    setBookmarkedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        // If already bookmarked, show Manage Collections modal
        setSelectedItemId(itemId)
        setShowManageCollections(true)
        return newSet // Don't remove bookmark
      } else {
        newSet.add(itemId)
        // Show toast notification
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
        }, 3000)
        return newSet
      }
    })
  }

  // Handle item card click
  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowItemDetail(true)
  }

  // Filter menu items based on active filters
  const filterMenuItems = (items) => {
    if (!items) return items

    return items.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const itemName = item.name?.toLowerCase() || ""
        if (!itemName.includes(query)) return false
      }

      // Veg/Non-veg filter
      if (filters.vegNonVeg === "veg") {
        // Show only veg items
        if (item.foodType !== "Veg") return false
      }
      if (filters.vegNonVeg === "non-veg") {
        // Show only non-veg items
        if (item.foodType !== "Non-Veg") return false
      }

      // Spicy filter
      if (filters.spicy && !item.isSpicy) return false

      // Highly reordered filter (items with customisable are shown as highly reordered)
      if (filters.highlyReordered && !item.customisable) return false

      return true
    })
  }

  // Sort items based on sortBy filter
  const sortMenuItems = (items) => {
    if (!items) return items
    if (!filters.sortBy) return items

    const sorted = [...items]
    if (filters.sortBy === "low-to-high") {
      return sorted.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === "high-to-low") {
      return sorted.sort((a, b) => b.price - a.price)
    }
    return sorted
  }

  // Highlight offers/texts for the blue offer line
  const highlightOffers = [
    "Upto 50% OFF",
    restaurant?.offerText || "",
    ...(Array.isArray(restaurant?.offers) ? restaurant.offers.map((offer) => offer?.title || "") : []),
  ]
  
  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const offersLength = Array.isArray(restaurant?.offers) ? restaurant.offers.length : 1
        return (prev + 1) % offersLength
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [restaurant?.offers?.length || 0])

  // Auto-rotate highlight offer text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % highlightOffers.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [highlightOffers.length])

  // Show loading state
  if (loadingRestaurant) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <span className="text-sm text-gray-600">Loading restaurant...</span>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  // Show error state if restaurant not found
  if (restaurantError && !restaurant) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Restaurant not found</h2>
              <p className="text-sm text-gray-600 mb-4">{restaurantError}</p>
              <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  // Show error if restaurant is still null
  if (!restaurant) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <span className="text-sm text-gray-600">Restaurant not found</span>
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage id="scrollingelement" className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
      {/* Header - Back, Search, Menu (like reference image) */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-3 md:pt-4 lg:pt-5 pb-2 md:pb-3 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
            <Button
            variant="outline"
              size="icon"
            className="rounded-full h-10 w-10 border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1a1a]"
              onClick={() => navigate(-1)}
            >
            <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-white" />
            </Button>

          {/* Right side: Search pill + menu */}
            <div className="flex items-center gap-3">
              {!showSearch ? (
                <Button
                  variant="outline"
                  className="rounded-full h-10 px-4 border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1a1a] flex items-center gap-2 text-gray-900 dark:text-white"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Search</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1a1a] text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) {
                          setShowSearch(false)
                        }
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setShowSearch(false)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1a1a]"
                onClick={() => setShowMenuOptionsSheet(true)}
              >
                <MoreVertical className="h-5 w-5 text-gray-900 dark:text-white" />
              </Button>
            </div>
          </div>
        </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-t-3xl relative z-10 min-h-[40vh] pb-4 md:pb-6 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 md:py-6 lg:py-8 space-y-3 md:space-y-4 lg:space-y-5 pb-0">
          {/* Restaurant Name and Rating */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{restaurant?.name || "Unknown Restaurant"}</h1>
              <Info className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col items-end">
              <Badge className="bg-green-500 text-white mb-1 flex items-center gap-1 px-2 py-1">
                <Star className="h-3 w-3 fill-white" />
                {restaurant?.rating ?? 4.5}
              </Badge>
              <span className="text-xs text-gray-500">By {(restaurant.reviews || 0).toLocaleString()}+</span>
            </div>
          </div>

          {/* Location */}
          <div
            className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={() => setShowLocationSheet(true)}
          >
              <MapPin className="h-4 w-4" />
              <span>{restaurant?.distance || "1.2 km"} · {restaurant?.location || "Location"}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>

          {/* Delivery Time */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Set default selections if not set
                if (!selectedDate) {
                  const today = new Date()
                  setSelectedDate(today.toISOString().split('T')[0])
                }
                if (!selectedTimeSlot) {
                  setSelectedTimeSlot("6:30 - 7 PM")
                }
                setShowScheduleSheet(true)
              }}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>{restaurant?.deliveryTime || "25-30 mins"} · Schedule for later</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Offers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm overflow-hidden">
              <Tag className="h-4 w-4 text-blue-600" />
              <div className="relative h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={highlightIndex}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-blue-600 font-medium inline-block"
                  >
                    {highlightOffers[highlightIndex]}
                  </motion.span>
                </AnimatePresence>
            </div>
            </div>
            <div
              className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              onClick={() => setShowOffersSheet(true)}
            >
              <span>{(restaurant?.offerCount || 0)} offers</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Filter/Category Buttons */}
          <div className="border-y border-gray-200 py-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 w-max">
            <Button
              variant="outline"
              size="sm"
                className="flex items-center gap-1.5 whitespace-nowrap border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] relative"
                onClick={() => setShowFilterSheet(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
                className={`flex items-center gap-1.5 whitespace-nowrap border-gray-300 bg-white rounded-full ${
                  filters.vegNonVeg === "veg" ? "border-green-500 bg-green-50" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    vegNonVeg: prev.vegNonVeg === "veg" ? null : "veg",
                  }))
                }
            >
              <div className="h-3 w-3 rounded-full bg-green-500" />
              Veg
                {filters.vegNonVeg === "veg" && (
                  <X className="h-3 w-3 text-gray-600" />
                )}
            </Button>
            <Button
              variant="outline"
              size="sm"
                className={`flex items-center gap-1.5 whitespace-nowrap border-gray-300 bg-white rounded-full ${
                  filters.vegNonVeg === "non-veg" ? "border-amber-700 bg-amber-50" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    vegNonVeg: prev.vegNonVeg === "non-veg" ? null : "non-veg",
                  }))
                }
            >
              <div className="h-3 w-3 rounded-full bg-amber-700" />
              Non-veg
                {filters.vegNonVeg === "non-veg" && (
                  <X className="h-3 w-3 text-gray-600" />
                )}
            </Button>
            <Button
              variant="outline"
              size="sm"
                className={`flex items-center gap-1.5 whitespace-nowrap border-gray-300 bg-white rounded-full ${
                  filters.spicy ? "border-red-500 bg-red-50" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    spicy: !prev.spicy,
                  }))
                }
              >
                <Flame className="h-3 w-3 text-red-500" />
                Spicy
                {filters.spicy && (
                  <X className="h-3 w-3 text-gray-600" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1.5 whitespace-nowrap border-gray-300 bg-white rounded-full ${
                  filters.highlyReordered ? "border-green-500 bg-green-50" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    highlyReordered: !prev.highlyReordered,
                  }))
                }
            >
              <div className="h-3 w-3 rounded-full bg-green-500 rotate-45" />
              Highly
                {filters.highlyReordered && (
                  <X className="h-3 w-3 text-gray-600" />
                )}
            </Button>
            </div>
          </div>
        </div>

        {/* Menu Items Section */}
        {restaurant?.menuSections && Array.isArray(restaurant.menuSections) && restaurant.menuSections.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12 space-y-6 md:space-y-8 lg:space-y-10">
            {restaurant.menuSections.map((section, sectionIndex) => {
              // Handle section name - check for valid non-empty string
              let sectionTitle = "Unnamed Section"
              if (sectionIndex === 0) {
                sectionTitle = "Recommended for you"
              } else if (section?.name && typeof section.name === 'string' && section.name.trim()) {
                sectionTitle = section.name.trim()
              } else if (section?.title && typeof section.title === 'string' && section.title.trim()) {
                sectionTitle = section.title.trim()
              }
              const sectionId = `menu-section-${sectionIndex}`
              
              const isExpanded = expandedSections.has(sectionIndex)
              
              return (
              <div key={sectionIndex} id={sectionId} className="space-y-4 scroll-mt-20">
                {/* Section Header */}
                {sectionIndex === 0 && (
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Recommended for you
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedSections(prev => {
                          const newSet = new Set(prev)
                          if (newSet.has(sectionIndex)) {
                            newSet.delete(sectionIndex)
                          } else {
                            newSet.add(sectionIndex)
                          }
                          return newSet
                        })
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                          isExpanded ? '' : '-rotate-90'
                        }`}
                      />
                    </button>
      </div>
                )}
                {sectionIndex > 0 && (
                  <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {(section?.name && typeof section.name === 'string' && section.name.trim()) 
                        ? section.name.trim() 
                        : (section?.title && typeof section.title === 'string' && section.title.trim())
                        ? section.title.trim()
                        : "Unnamed Section"}
                    </h2>
                    {section.subtitle && (
                      <button className="text-sm text-blue-600 dark:text-blue-400 underline">
                        {section.subtitle}
                      </button>
                    )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedSections(prev => {
                          const newSet = new Set(prev)
                          if (newSet.has(sectionIndex)) {
                            newSet.delete(sectionIndex)
                          } else {
                            newSet.add(sectionIndex)
                          }
                          return newSet
                        })
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                          isExpanded ? '' : '-rotate-90'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Direct Items */}
                {isExpanded && sectionIndex === 0 && section.items && section.items.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                      No dish recommended
                    </p>
                  </div>
                )}
                {isExpanded && section.items && section.items.length > 0 && (
                  <div className="space-y-0">
                    {sortMenuItems(filterMenuItems(section.items)).map((item) => {
                      const quantity = quantities[item.id] || 0
                      // Determine veg/non-veg based on foodType
                      const isVeg = item.foodType === "Veg"
                      
                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 border-b border-gray-100 last:border-none relative cursor-pointer"
                          onClick={() => handleItemClick(item)}
                        >
                          {/* Left Side - Details */}
                          <div className="flex-1 min-w-0">
                            {/* Veg Icon & Spicy Indicator */}
                            <div className="flex items-center gap-2 mb-1">
                              {isVeg ? (
                                <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm flex-shrink-0">
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-orange-600 flex items-center justify-center rounded-sm flex-shrink-0">
                                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                </div>
                              )}
                              {item.isSpicy && <span className="text-red-500">🌶️</span>}
                            </div>

                            <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{item.name}</h3>
                            
                            {/* Highly Reordered Progress Bar - Show if customisable */}
                              {item.customisable && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-600 w-3/4"></div>
                            </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Highly reordered</span>
                              </div>
                            )}

                            <p className="font-semibold text-gray-900 dark:text-white mt-1">₹{Math.round(item.price)}</p>
                            
                            {/* Description - Show if available */}
                            {item.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                            )}

                            {/* Action Buttons - Bookmark and Share */}
                            <div className="flex gap-4 mt-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleBookmarkClick(item.id)
                                }}
                                className={`p-1.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                  bookmarkedItems.has(item.id)
                                    ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                <Bookmark
                                  size={18} 
                                  className={bookmarkedItems.has(item.id) ? "fill-red-500" : ""}
                                />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <Share2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Right Side - Image and Add Button */}
                          <div className="relative w-32 h-32 flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover rounded-2xl shadow-sm"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                <span className="text-xs text-gray-400">No image</span>
                              </div>
                            )}
                              {quantity > 0 ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-green-600 text-green-600 font-bold px-4 py-1.5 rounded-lg shadow-md hover:bg-green-50 flex items-center gap-1"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateItemQuantity(item, Math.max(0, quantity - 1), e)
                                    }}
                                  className="text-green-600 hover:text-green-700"
                                  >
                                  <Minus size={14} />
                                  </button>
                                <span className="mx-2 text-sm">{quantity}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateItemQuantity(item, quantity + 1, e)
                                    }}
                                  className="text-green-600 hover:text-green-700"
                                  >
                                  <Plus size={14} className="stroke-[3px]" />
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  layoutId={`add-button-${item.id}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, type: "spring", damping: 20, stiffness: 300 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateItemQuantity(item, 1, e)
                                  }}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-green-600 text-green-600 font-bold px-6 py-1.5 rounded-lg shadow-md hover:bg-green-50 flex items-center gap-1 transition-colors"
                                >
                                ADD <Plus size={14} className="stroke-[3px]" />
                                </motion.button>
                              )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Subsections */}
                {isExpanded && section.subsections && section.subsections.length > 0 && (
                  <div className="space-y-4">
                    {section.subsections.map((subsection, subIndex) => {
                      const subsectionKey = `${sectionIndex}-${subIndex}`
                      const isSubsectionExpanded = expandedSections.has(subsectionKey)
                      
                      return (
                      <div key={subIndex} className="space-y-4">
                        {/* Subsection Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {subsection?.name || subsection?.title || "Subsection"}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedSections(prev => {
                                const newSet = new Set(prev)
                                if (newSet.has(subsectionKey)) {
                                  newSet.delete(subsectionKey)
                                } else {
                                  newSet.add(subsectionKey)
                                }
                                return newSet
                              })
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                                isSubsectionExpanded ? '' : '-rotate-90'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Subsection Items */}
                        {isSubsectionExpanded && subsection.items && subsection.items.length > 0 && (
                            <div className="space-y-0">
                              {sortMenuItems(filterMenuItems(subsection.items)).map((item) => {
                                const quantity = quantities[item.id] || 0
                                // Determine veg/non-veg based on foodType
                                const isVeg = item.foodType === "Veg"
                                
                                return (
                                  <div
                                    key={item.id}
                                    className="flex gap-4 p-4 border-b border-gray-100 last:border-none relative cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                  >
                                    {/* Left Side - Details */}
                                    <div className="flex-1 min-w-0">
                                      {/* Veg Icon & Spicy Indicator */}
                                      <div className="flex items-center gap-2 mb-1">
                                        {isVeg ? (
                                          <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm flex-shrink-0">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                        ) : (
                                          <div className="w-4 h-4 border-2 border-orange-600 flex items-center justify-center rounded-sm flex-shrink-0">
                                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                          </div>
                                        )}
                                        {item.isSpicy && <span className="text-red-500">🌶️</span>}
                                      </div>

                                      <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{item.name}</h3>
                                      
                                      {/* Highly Reordered Progress Bar - Show if customisable */}
                                        {item.customisable && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-600 w-3/4"></div>
                                      </div>
                                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Highly reordered</span>
                                        </div>
                                      )}

                                      <p className="font-semibold text-gray-900 dark:text-white mt-1">₹{Math.round(item.price)}</p>
                                      
                                      {/* Description - Show if available */}
                                      {item.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                      )}

                                      {/* Action Buttons - Bookmark and Share */}
                                      <div className="flex gap-4 mt-3">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              handleBookmarkClick(item.id)
                                            }}
                                          className={`p-1.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                              bookmarkedItems.has(item.id)
                                              ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20"
                                              : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                            }`}
                                          >
                                            <Bookmark
                                            size={18} 
                                            className={bookmarkedItems.has(item.id) ? "fill-red-500" : ""}
                                            />
                                          </button>
                                          <button
                                            onClick={(e) => e.stopPropagation()}
                                          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                          >
                                          <Share2 size={18} />
                                          </button>
                                      </div>
                                    </div>

                                    {/* Right Side - Image and Add Button */}
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                      {item.image ? (
                                        <img 
                                          src={item.image} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover rounded-2xl shadow-sm"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                          <span className="text-xs text-gray-400">No image</span>
                                        </div>
                                      )}
                                          {quantity > 0 ? (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-green-600 text-green-600 font-bold px-4 py-1.5 rounded-lg shadow-md hover:bg-green-50 flex items-center gap-1"
                                            >
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  updateItemQuantity(item, Math.max(0, quantity - 1), e)
                                                }}
                                            className="text-green-600 hover:text-green-700"
                                              >
                                            <Minus size={14} />
                                              </button>
                                          <span className="mx-2 text-sm">{quantity}</span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  updateItemQuantity(item, quantity + 1, e)
                                                }}
                                            className="text-green-600 hover:text-green-700"
                                              >
                                            <Plus size={14} className="stroke-[3px]" />
                                              </button>
                                            </motion.div>
                                          ) : (
                                            <motion.button
                                              layoutId={`add-button-sub-${item.id}`}
                                              initial={{ opacity: 0, scale: 0.9 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ duration: 0.3, type: "spring", damping: 20, stiffness: 300 }}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                updateItemQuantity(item, 1, e)
                                              }}
                                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-green-600 text-green-600 font-bold px-6 py-1.5 rounded-lg shadow-md hover:bg-green-50 flex items-center gap-1 transition-colors"
                                            >
                                          ADD <Plus size={14} className="stroke-[3px]" />
                                            </motion.button>
                                          )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Menu Button - Sticky at page bottom right (hidden when filter or menu sheet open) */}
      {!showFilterSheet && !showMenuSheet && !showMenuOptionsSheet && (
        <div className="sticky dark:bg-[#1a1a1a] bottom-4 flex justify-end px-4 z-50 mt-auto">
        <Button
          className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 shadow-lg px-6 py-2.5 rounded-lg"
          size="lg"
            onClick={() => setShowMenuSheet(true)}
        >
          <Utensils className="h-5 w-5" />
          Menu
        </Button>
      </div>
      )}

      {/* Menu Categories Bottom Sheet - Rendered via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showMenuSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowMenuSheet(false)}
                />

                {/* Menu Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[85vh] md:max-h-[90vh] md:max-w-lg w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                  style={{ willChange: "transform" }}
                >
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="space-y-1">
                      {menuCategories.map((category, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                          onClick={() => {
                            setShowMenuSheet(false)
                            // Scroll to category section
                            setTimeout(() => {
                              const sectionId = `menu-section-${category.sectionIndex}`
                              const sectionElement = document.getElementById(sectionId)
                              if (sectionElement) {
                                sectionElement.scrollIntoView({ 
                                  behavior: 'smooth', 
                                  block: 'start' 
                                })
                              }
                            }, 300) // Small delay to allow sheet to close
                          }}
                        >
                          <span className="text-base font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {category.count}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Large Order Menu Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        className="w-full flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setShowLargeOrderMenu(!showLargeOrderMenu)}
                      >
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          LARGE ORDER MENU
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                            showLargeOrderMenu ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showLargeOrderMenu && (
                        <div className="mt-2 space-y-1 pl-4">
                          {/* Add large order menu items here if needed */}
                          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            Large order options coming soon
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 bg-white dark:bg-[#1a1a1a]">
                    <Button
                      variant="outline"
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white border-0 flex items-center justify-center gap-2 py-3 rounded-lg"
                      onClick={() => setShowMenuSheet(false)}
                    >
                      <X className="h-5 w-5" />
                      Close
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Filters and Sorting Bottom Sheet - Rendered via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showFilterSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setShowFilterSheet(false)}
                />

                {/* Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl h-[80vh] md:h-auto md:max-h-[90vh] md:max-w-lg w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                  style={{ willChange: "transform" }}
                >
              {/* Header with X button */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters and Sorting</h2>
                <button
                  onClick={() => setShowFilterSheet(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Sort by */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sort by:</h3>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: prev.sortBy === "low-to-high" ? null : "low-to-high",
                        }))
                      }
                      className={`text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                        filters.sortBy === "low-to-high"
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      Price - low to high
                    </button>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: prev.sortBy === "high-to-low" ? null : "high-to-low",
                        }))
                      }
                      className={`text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                        filters.sortBy === "high-to-low"
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      Price - high to low
                    </button>
                  </div>
                </div>

                {/* Veg/Non-veg preference */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Veg/Non-veg preference:</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          vegNonVeg: prev.vegNonVeg === "veg" ? null : "veg",
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all flex-1 ${
                        filters.vegNonVeg === "veg"
                          ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-green-500 dark:bg-green-400" />
                      <span className="font-medium">Veg</span>
                    </button>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          vegNonVeg: prev.vegNonVeg === "non-veg" ? null : "non-veg",
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all flex-1 ${
                        filters.vegNonVeg === "non-veg"
                          ? "border-amber-700 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-amber-700 dark:bg-amber-600" />
                      <span className="font-medium">Non-veg</span>
                    </button>
                  </div>
                </div>

                {/* Top picks */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top picks:</h3>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        highlyReordered: !prev.highlyReordered,
                      }))
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all w-full ${
                      filters.highlyReordered
                        ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-medium">Highly reordered</span>
                  </button>
                </div>

                {/* Dietary preference */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dietary preference:</h3>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        spicy: !prev.spicy,
                      }))
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all w-full ${
                      filters.spicy
                        ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    <span className="font-medium">Spicy</span>
                  </button>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                <button
                  onClick={() => {
                    setFilters({
                      sortBy: null,
                      vegNonVeg: null,
                      highlyReordered: false,
                      spicy: false,
                    })
                  }}
                  className="text-red-600 dark:text-red-400 font-medium text-sm hover:text-red-700 dark:hover:text-red-500"
                >
                  Clear All
                </button>
                <Button
                  className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-lg font-medium"
                  onClick={() => setShowFilterSheet(false)}
                >
                  Apply {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Location Outlets Bottom Sheet - Rendered via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showLocationSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowLocationSheet(false)}
                />

                {/* Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl h-[75vh] md:h-auto md:max-h-[90vh] md:max-w-xl w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                  style={{ willChange: "transform" }}
                >
                  {/* Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">All delivery outlets for</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-base">{(restaurant.name || "R").charAt(0).toUpperCase()}</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{restaurant?.name || "Unknown Restaurant"}</h2>
                    </div>
                  </div>

                  {/* Outlets List */}
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {restaurant?.outlets && Array.isArray(restaurant.outlets) && restaurant.outlets.length > 0 ? (
                      <div className="space-y-2">
                        {restaurant.outlets.map((outlet) => (
                          <div
                            key={outlet?.id || Math.random()}
                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a]"
                          >
                            {outlet?.isNearest && (
                              <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-md">
                                <Zap className="h-3.5 w-3.5 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                  Nearest available outlet
                                </span>
                              </div>
                            )}
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              {outlet?.location || "Location"}
                            </h3>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{outlet?.deliveryTime || "25-30 mins"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{outlet?.distance || "1.2 km"}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-0.5">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                                    {outlet?.rating ?? 4.5}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  By {(outlet?.reviews || 0) >= 1000 ? `${((outlet.reviews || 0) / 1000).toFixed(1)}K+` : `${outlet?.reviews || 0}+`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No outlets available
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {restaurant?.outlets && Array.isArray(restaurant.outlets) && restaurant.outlets.length > 5 && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-[#1a1a1a]">
                      <button className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm w-full">
                        <span>See all {restaurant.outlets.length} outlets</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Toast Notification - Fixed to viewport bottom */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", damping: 25 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10001] bg-black text-white px-6 py-3 rounded-lg shadow-2xl"
              >
                <p className="text-sm font-medium">Added to bookmark</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Manage Collections Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showManageCollections && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowManageCollections(false)}
                />

                {/* Manage Collections Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl md:max-w-lg w-full md:w-auto"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manage Collections</h2>
                    <button
                      onClick={() => setShowManageCollections(false)}
                      className="h-8 w-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Collections List */}
                  <div className="px-4 py-4 space-y-2">
                    {/* Bookmarks Collection */}
                    <button
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Don't close modal on click, let checkbox handle it
                      }}
                    >
                      <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                        <Bookmark className="h-6 w-6 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-gray-900 dark:text-white">Bookmarks</span>
                          {selectedItemId && (
                            <Checkbox
                              checked={bookmarkedItems.has(selectedItemId)}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  setBookmarkedItems((prev) => {
                                    const newSet = new Set(prev)
                                    newSet.delete(selectedItemId)
                                    return newSet
                                  })
                                  setSelectedItemId(null)
                                  setShowManageCollections(false)
                                }
                              }}
                              className="h-5 w-5 rounded border-2 border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {!selectedItemId && (
                            <div className="h-5 w-5 rounded border-2 border-red-500 bg-red-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {bookmarkedItems.size} dishes • 0 restaurant
                        </p>
                      </div>
                    </button>

                    {/* Create new Collection */}
                    <button
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setShowManageCollections(false)}
                    >
                      <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                        <Plus className="h-6 w-6 text-red-500 dark:text-red-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-base font-medium text-gray-900 dark:text-white">
                          Create new Collection
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Done Button */}
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4">
                    <Button
                      className="w-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-medium"
                      onClick={() => {
                        setSelectedItemId(null)
                        setShowManageCollections(false)
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Item Detail Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showItemDetail && selectedItem && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowItemDetail(false)}
                />

            {/* Item Detail Bottom Sheet */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] md:max-w-2xl lg:max-w-3xl w-full md:w-auto flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.15, type: "spring", damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Top Center Above Popup with 4px gap */}
              <div className="absolute -top-[44px] left-1/2 -translate-x-1/2 z-[10001]">
                <motion.button
                  onClick={() => setShowItemDetail(false)}
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-900 transition-colors shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>

                  {/* Image Section */}
                  <div className="relative w-full h-64 overflow-hidden rounded-t-3xl">
                    {selectedItem.image ? (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-sm text-gray-400">No image available</span>
                      </div>
                    )}
                    {/* Bookmark and Share Icons Overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmarkClick(selectedItem.id)
                        }}
                        className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          bookmarkedItems.has(selectedItem.id)
                            ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                            : "border-white dark:border-gray-800 bg-white/90 dark:bg-[#1a1a1a]/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#2a2a2a]"
                        }`}
                      >
                        <Bookmark
                          className={`h-5 w-5 transition-all duration-300 ${
                            bookmarkedItems.has(selectedItem.id) ? "fill-red-500 dark:fill-red-400" : ""
                          }`}
                        />
                      </button>
                      <button className="h-10 w-10 rounded-full border border-white dark:border-gray-800 bg-white/90 dark:bg-[#1a1a1a]/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {/* Item Name and Indicator */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-5 w-5 rounded border-2 border-amber-700 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-700 dark:bg-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedItem.name}
                        </h2>
                      </div>
                      {/* Bookmark and Share Icons (Desktop) */}
                      <div className="hidden md:flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookmarkClick(selectedItem.id)
                          }}
                          className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                            bookmarkedItems.has(selectedItem.id)
                              ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                              : "border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          }`}
                        >
                          <Bookmark
                            className={`h-4 w-4 transition-all duration-300 ${
                              bookmarkedItems.has(selectedItem.id) ? "fill-red-500 dark:fill-red-400" : ""
                            }`}
                          />
                        </button>
                        <button className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {selectedItem.description}
                    </p>

                    {/* Highly Reordered Progress Bar */}
                    {selectedItem.customisable && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 dark:bg-green-400 rounded-full" style={{ width: '50%' }} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                          highly reordered
                        </span>
                      </div>
                    )}

                    {/* Not Eligible for Coupons */}
                    {selectedItem.notEligibleForCoupons && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-4">
                        NOT ELIGIBLE FOR COUPONS
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 bg-white dark:bg-[#1a1a1a]">
                    <div className="flex items-center gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 h-[44px] bg-white dark:bg-[#2a2a2a]">
                        <button
                          onClick={(e) =>
                            updateItemQuantity(selectedItem, Math.max(0, (quantities[selectedItem.id] || 0) - 1), e)
                          }
                          disabled={(quantities[selectedItem.id] || 0) === 0}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                          {quantities[selectedItem.id] || 0}
                        </span>
                        <button
                          onClick={(e) =>
                            updateItemQuantity(selectedItem, (quantities[selectedItem.id] || 0) + 1, e)
                          }
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Add Item Button */}
                      <Button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white h-[44px] rounded-lg font-semibold flex items-center justify-center gap-2"
                        onClick={(e) => {
                          updateItemQuantity(selectedItem, (quantities[selectedItem.id] || 0) + 1, e)
                          setShowItemDetail(false)
                        }}
                      >
                        <span>Add item</span>
                        <div className="flex items-center gap-1">
                          {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.price && (
                            <span className="text-sm line-through text-red-200">
                              ₹{Math.round(selectedItem.originalPrice)}
                            </span>
                          )}
                          <span className="text-base font-bold">
                            ₹{Math.round(selectedItem.price)}
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Schedule Delivery Time Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showScheduleSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowScheduleSheet(false)}
                />

                {/* Schedule Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[60vh] md:max-h-[90vh] md:max-w-lg w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.15, type: "spring", damping: 30, stiffness: 400 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button - Centered Overlapping */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <button
                      onClick={() => setShowScheduleSheet(false)}
                      className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-900 transition-colors shadow-lg"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-4 pt-10 pb-4">
                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                      Select your delivery time
                    </h2>

                    {/* Date Selection */}
                    <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {(() => {
                        const today = new Date()
                        const tomorrow = new Date(today)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        const dayAfter = new Date(today)
                        dayAfter.setDate(dayAfter.getDate() + 2)
                        
                        const dates = [
                          { date: today, label: "Today" },
                          { date: tomorrow, label: "Tomorrow" },
                          { date: dayAfter, label: dayAfter.toLocaleDateString('en-US', { weekday: 'short' }) }
                        ]
                        
                        return dates.map((item, index) => {
                          const dateStr = item.date.toISOString().split('T')[0]
                          const day = String(item.date.getDate()).padStart(2, '0')
                          const month = item.date.toLocaleDateString('en-US', { month: 'short' })
                          const isSelected = selectedDate === dateStr
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedDate(dateStr)}
                              className="flex flex-col items-center gap-0.5 flex-shrink-0 pb-1"
                            >
                              <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {day} {month} {item.label}
                              </span>
                              {isSelected && (
                                <div className="h-0.5 w-full bg-red-500 mt-0.5" />
                              )}
                            </button>
                          )
                        })
                      })()}
                    </div>

                    {/* Time Slot Selection */}
                    <div className="space-y-2 mb-4">
                      {["6:30 - 7 PM", "7 - 7:30 PM", "7:30 - 8 PM", "8 - 8:30 PM"].map((slot, index) => {
                        const isSelected = selectedTimeSlot === slot
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                              isSelected
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                            }`}
                          >
                            <span className="text-sm font-medium">{slot}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Confirm Button - Fixed at bottom */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <Button
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
                      onClick={() => {
                        setShowScheduleSheet(false)
                        // Handle schedule confirmation
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Offers Bottom Sheet - Rendered via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showOffersSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setShowOffersSheet(false)}
                />

                {/* Offers Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[85vh] md:max-h-[90vh] md:max-w-lg w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                  style={{ willChange: "transform" }}
                >
                  {/* Header */}
                  <div className="px-4 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Offers at {restaurant?.name || "Unknown Restaurant"}
                    </h2>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {/* Gold Exclusive Offer Section */}
                    {restaurant?.restaurantOffers?.goldOffer && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          {restaurant.restaurantOffers.goldOffer?.title || "Gold exclusive offer"}
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {restaurant.restaurantOffers.goldOffer?.description || "Free delivery above ₹99"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {restaurant.restaurantOffers.goldOffer?.unlockText || "join Gold to unlock"}
                              </p>
                            </div>
                          </div>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap"
                            onClick={() => {
                              // Handle add gold
                            }}
                          >
                            {restaurant.restaurantOffers.goldOffer?.buttonText || "Add Gold - ₹1"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Restaurant Coupons Section */}
                    {restaurant?.restaurantOffers?.coupons && Array.isArray(restaurant.restaurantOffers.coupons) && restaurant.restaurantOffers.coupons.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Restaurant coupons
                        </h3>
                        <div className="space-y-3">
                          {restaurant.restaurantOffers.coupons.map((coupon) => {
                            const isExpanded = expandedCoupons.has(coupon.id)
                            return (
                              <div
                                key={coupon.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                              >
                                <button
                                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => {
                                    setExpandedCoupons((prev) => {
                                      const newSet = new Set(prev)
                                      if (newSet.has(coupon.id)) {
                                        newSet.delete(coupon.id)
                                      } else {
                                        newSet.add(coupon.id)
                                      }
                                      return newSet
                                    })
                                  }}
                                >
                                  <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                      {coupon.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Use code {coupon.code}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Copy code to clipboard
                                        navigator.clipboard.writeText(coupon.code)
                                      }}
                                    >
                                      {coupon.code}
                                    </button>
                                    <ChevronDown
                                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </button>
                                {isExpanded && (
                                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Terms and conditions apply
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 bg-white dark:bg-[#1a1a1a]">
                    <Button
                      variant="outline"
                      className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white border-0 flex items-center justify-center gap-2 py-3 rounded-lg"
                      onClick={() => setShowOffersSheet(false)}
                    >
                      <X className="h-5 w-5" />
                      Close
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Menu Options Bottom Sheet - Rendered via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showMenuOptionsSheet && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setShowMenuOptionsSheet(false)}
                />

                {/* Menu Options Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[70vh] md:max-h-[90vh] md:max-w-lg w-full md:w-auto flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                  style={{ willChange: "transform" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {restaurant?.name || "Unknown Restaurant"}
                    </h2>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {/* Menu Options List */}
                    <div className="space-y-1">
                      {/* Add to Collection */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle add to collection
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <Bookmark className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">Add to Collection</span>
                      </button>

                      {/* Group Order */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle group order
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">Group Order</span>
                      </button>

                      {/* See more about this restaurant */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle see more
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <Info className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">See more about this restaurant</span>
                      </button>

                      {/* Share this restaurant */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle share
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">Share this restaurant</span>
                      </button>

                      {/* Hide this restaurant */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle hide restaurant
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <Eye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">Hide this restaurant</span>
                      </button>

                      {/* Report fraud or bad practices */}
                      <button
                        className="w-full flex items-center gap-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        onClick={() => {
                          // Handle report
                          setShowMenuOptionsSheet(false)
                        }}
                      >
                        <AlertCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="text-base text-gray-900 dark:text-white">Report fraud or bad practices</span>
                      </button>
                    </div>

                    {/* Disclaimer Text */}
                    <div className="mt-6 px-2">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Menu items, prices, photos and descriptions are set directly by the restaurant. In case you see any incorrect information, please report it to us.
                      </p>
                    </div>
                  </div>

                  {/* Bottom Handle */}
                  <div className="px-4 pb-2 pt-2 flex justify-center">
                    <div className="h-1 w-12 bg-gray-300 rounded-full" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Add to Cart Animation Component */}
      <AddToCartAnimation 
        bottomOffset={96}
        linkTo="/user/cart"
        hideOnPages={true}
      />
    </AnimatedPage>
  )
}

