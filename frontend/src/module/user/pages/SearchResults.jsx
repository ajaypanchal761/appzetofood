import { useState, useMemo, useRef, useEffect } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, Search, SlidersHorizontal, ChevronDown, Bookmark, BadgePercent, Mic } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StickyCartCard from "../components/StickyCartCard"
import { useProfile } from "../context/ProfileContext"

// Import shared food images - prevents duplication
import { foodImages } from "@/constants/images"

// Categories for browse section - matching Home.jsx order
const categories = [
  { id: 'all', name: "All", image: foodImages[7] },
  { id: 'biryani', name: "Biryani", image: foodImages[0] },
  { id: 'cake', name: "Cake", image: foodImages[1] },
  { id: 'chhole-bhature', name: "Chhole Bhature", image: foodImages[2] },
  { id: 'chicken-tanduri', name: "Chicken Tanduri", image: foodImages[3] },
  { id: 'donuts', name: "Donuts", image: foodImages[4] },
  { id: 'dosa', name: "Dosa", image: foodImages[5] },
  { id: 'french-fries', name: "French Fries", image: foodImages[6] },
  { id: 'idli', name: "Idli", image: foodImages[7] },
  { id: 'momos', name: "Momos", image: foodImages[8] },
  { id: 'samosa', name: "Samosa", image: foodImages[9] },
  { id: 'starters', name: "Starters", image: foodImages[10] },
]

// Filter options
const filterOptions = [
  { id: 'under-30-mins', label: 'Under 30 mins' },
  { id: 'price-match', label: 'Price Match', hasIcon: true },
  { id: 'flat-50-off', label: 'Flat 50% OFF', hasIcon: true },
  { id: 'under-250', label: 'Under ₹250' },
  { id: 'rating-4-plus', label: 'Rating 4.0+' },
]

// Recommended restaurants (small cards) - Comprehensive data for all categories (same as CategoryPage)
const recommendedRestaurants = [
  // All/General
  { id: 1, name: "Apna Sweets", deliveryTime: "20-25 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Sweets, Snacks", category: "all" },
  { id: 2, name: "MP-09 Delhi Zayka", deliveryTime: "20-25 mins", rating: 4.1, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "North Indian", category: "all" },
  { id: 3, name: "Hotel Apna Avenue", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", offer: "FLAT 50% OFF", cuisine: "Multi Cuisine", category: "all" },
  { id: 4, name: "Rajhans Dal Bafle", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Rajasthani", category: "all" },
  { id: 5, name: "Veg Legacy", deliveryTime: "20-25 mins", rating: 4.0, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Healthy, Salads", category: "all" },
  { id: 6, name: "MBA Thaliwala", deliveryTime: "30-35 mins", rating: 3.8, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", offer: "FLAT 50% OFF", cuisine: "Thali, North Indian", category: "all" },
  
  // Veg Meal
  { id: 7, name: "Green Leaf Veg", deliveryTime: "15-20 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Vegetarian", category: "veg-meal" },
  { id: 8, name: "Pure Veg Kitchen", deliveryTime: "20-25 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Vegetarian", category: "veg-meal" },
  { id: 9, name: "Veg Express", deliveryTime: "25-30 mins", rating: 4.1, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "Vegetarian", category: "veg-meal" },
  
  // Pizza
  { id: 10, name: "Pizza Corner", deliveryTime: "20-25 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", offer: "FLAT 50% OFF", cuisine: "Pizza", category: "pizza" },
  { id: 11, name: "Domino's Pizza", deliveryTime: "15-20 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", offer: "Buy 1 Get 1", cuisine: "Pizza", category: "pizza" },
  { id: 12, name: "Italian Pizza House", deliveryTime: "25-30 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Pizza", category: "pizza" },
  
  // Thali
  { id: 13, name: "Thali Express", deliveryTime: "20-25 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Thali", category: "thali" },
  { id: 14, name: "Rajasthani Thali", deliveryTime: "25-30 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Thali", category: "thali" },
  { id: 15, name: "Gujarati Thali", deliveryTime: "20-25 mins", rating: 4.1, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", offer: "FLAT ₹35 OFF", cuisine: "Thali", category: "thali" },
  
  // Cake
  { id: 16, name: "Sweet Dreams Bakery", deliveryTime: "30-35 mins", rating: 4.6, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", offer: "FLAT ₹100 OFF", cuisine: "Bakery, Cake", category: "cake" },
  { id: 17, name: "Cake Studio", deliveryTime: "25-30 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop", offer: "FLAT ₹80 OFF", cuisine: "Bakery, Cake", category: "cake" },
  { id: 18, name: "Chocolate Heaven", deliveryTime: "35-40 mins", rating: 4.7, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", offer: "FLAT ₹120 OFF", cuisine: "Bakery, Cake", category: "cake" },
  
  // Biryani
  { id: 19, name: "Biryani House", deliveryTime: "25-30 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Biryani", category: "biryani" },
  { id: 20, name: "Hyderabadi Biryani", deliveryTime: "30-35 mins", rating: 4.6, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Biryani", category: "biryani" },
  { id: 21, name: "Mughlai Biryani", deliveryTime: "25-30 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Biryani", category: "biryani" },
  
  // Burger
  { id: 22, name: "Burger King", deliveryTime: "20-25 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Burger", category: "burger" },
  { id: 23, name: "Burger Junction", deliveryTime: "15-20 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Burger", category: "burger" },
  { id: 24, name: "Gourmet Burgers", deliveryTime: "25-30 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Burger", category: "burger" },
  
  // Chinese
  { id: 25, name: "Chinese Wok", deliveryTime: "20-25 mins", rating: 4.0, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Chinese", category: "chinese" },
  { id: 26, name: "Dragon Chinese", deliveryTime: "25-30 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Chinese", category: "chinese" },
  { id: 27, name: "Golden Dragon", deliveryTime: "30-35 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Chinese", category: "chinese" },
  
  // South Indian
  { id: 28, name: "South Indian Delight", deliveryTime: "15-20 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "South Indian", category: "south-indian" },
  { id: 29, name: "Dosa Corner", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "South Indian", category: "south-indian" },
  { id: 30, name: "Idli Express", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "South Indian", category: "south-indian" },
  
  // Momos
  { id: 31, name: "Momos Express", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "Momos", category: "momos" },
  { id: 32, name: "Tibetan Momos", deliveryTime: "25-30 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Momos", category: "momos" },
  { id: 33, name: "Steam Momos", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "Momos", category: "momos" },
  
  // Chhole Bhature
  { id: 34, name: "Chhole Bhature House", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Chhole Bhature", category: "chhole-bhature" },
  { id: 35, name: "Delhi Chhole Bhature", deliveryTime: "15-20 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", offer: "FLAT ₹35 OFF", cuisine: "Chhole Bhature", category: "chhole-bhature" },
  { id: 36, name: "Punjabi Chhole", deliveryTime: "25-30 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "Chhole Bhature", category: "chhole-bhature" },
  
  // Chicken Tanduri
  { id: 37, name: "Tandoori Express", deliveryTime: "25-30 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Chicken Tanduri", category: "chicken-tanduri" },
  { id: 38, name: "Mughlai Tandoori", deliveryTime: "30-35 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", offer: "FLAT ₹60 OFF", cuisine: "Chicken Tanduri", category: "chicken-tanduri" },
  { id: 39, name: "Tandoori House", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Chicken Tanduri", category: "chicken-tanduri" },
  
  // Donuts
  { id: 40, name: "Donut Delight", deliveryTime: "30-35 mins", rating: 4.6, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Donuts", category: "donuts" },
  { id: 41, name: "Sweet Donuts", deliveryTime: "25-30 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Donuts", category: "donuts" },
  { id: 42, name: "Donut Express", deliveryTime: "35-40 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1519869325934-5d2c92d5e7ec?w=400&h=300&fit=crop", offer: "FLAT ₹35 OFF", cuisine: "Donuts", category: "donuts" },
  
  // Dosa
  { id: 43, name: "Dosa Corner", deliveryTime: "15-20 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "Dosa", category: "dosa" },
  { id: 44, name: "Masala Dosa House", deliveryTime: "20-25 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", offer: "FLAT ₹35 OFF", cuisine: "Dosa", category: "dosa" },
  { id: 45, name: "South Dosa", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "Dosa", category: "dosa" },
  
  // French Fries
  { id: 46, name: "Fries Express", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop", offer: "FLAT ₹20 OFF", cuisine: "French Fries", category: "french-fries" },
  { id: 47, name: "Crispy Fries", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "French Fries", category: "french-fries" },
  { id: 48, name: "Golden Fries", deliveryTime: "15-20 mins", rating: 4.1, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", offer: "FLAT ₹15 OFF", cuisine: "French Fries", category: "french-fries" },
  
  // Idli
  { id: 49, name: "Idli Express", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "Idli", category: "idli" },
  { id: 50, name: "Soft Idli House", deliveryTime: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹30 OFF", cuisine: "Idli", category: "idli" },
  { id: 51, name: "Idli Corner", deliveryTime: "15-20 mins", rating: 4.1, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", offer: "FLAT ₹20 OFF", cuisine: "Idli", category: "idli" },
  
  // Samosa
  { id: 52, name: "Samosa House", deliveryTime: "15-20 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", offer: "FLAT ₹20 OFF", cuisine: "Samosa", category: "samosa" },
  { id: 53, name: "Crispy Samosa", deliveryTime: "20-25 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", offer: "FLAT ₹25 OFF", cuisine: "Samosa", category: "samosa" },
  { id: 54, name: "Samosa Express", deliveryTime: "15-20 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop", offer: "FLAT ₹15 OFF", cuisine: "Samosa", category: "samosa" },
  
  // Starters
  { id: 55, name: "Starters Corner", deliveryTime: "20-25 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", offer: "FLAT ₹40 OFF", cuisine: "Starters", category: "starters" },
  { id: 56, name: "Appetizer House", deliveryTime: "25-30 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", offer: "FLAT ₹50 OFF", cuisine: "Starters", category: "starters" },
  { id: 57, name: "Tasty Starters", deliveryTime: "20-25 mins", rating: 4.2, image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop", offer: "FLAT ₹35 OFF", cuisine: "Starters", category: "starters" },
]

// All restaurants (large cards) - Comprehensive data for all categories (same as CategoryPage)
const allRestaurants = [
  // All/General
  { id: 1, name: "Bhojan Fix Thali", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.1, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Fix Thali", featuredPrice: 274, isAd: true, cuisine: "North Indian, Thali", category: "all" },
  { id: 2, name: "Hotel Apna Avenue", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.3, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop", offer: "Flat 50% OFF", featuredDish: "Thali", featuredPrice: 249, cuisine: "Multi Cuisine", category: "all" },
  
  // Veg Meal
  { id: 3, name: "Green Leaf Veg Restaurant", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.4, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Veg Thali", featuredPrice: 199, cuisine: "Vegetarian", category: "veg-meal" },
  { id: 4, name: "Pure Veg Kitchen", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.2, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Veg Combo", featuredPrice: 179, cuisine: "Vegetarian", category: "veg-meal" },
  { id: 5, name: "Veg Express", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.1, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop", offer: "Flat ₹30 OFF above ₹129", featuredDish: "Veg Meal", featuredPrice: 149, cuisine: "Vegetarian", category: "veg-meal" },
  
  // Pizza
  { id: 6, name: "Pizza Paradise", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.5, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop", offer: "Buy 1 Get 1 Free", featuredDish: "Margherita Pizza", featuredPrice: 249, cuisine: "Pizza, Italian", category: "pizza" },
  { id: 7, name: "Domino's Pizza", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.3, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop", offer: "Flat 50% OFF", featuredDish: "Pepperoni Pizza", featuredPrice: 299, cuisine: "Pizza", category: "pizza" },
  { id: 8, name: "Italian Pizza House", deliveryTime: "25-30 mins", distance: "1.8 km", rating: 4.4, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop", offer: "Flat ₹60 OFF above ₹299", featuredDish: "Farmhouse Pizza", featuredPrice: 349, cuisine: "Pizza, Italian", category: "pizza" },
  
  // Thali
  { id: 9, name: "Thali Express", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.2, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "North Indian Thali", featuredPrice: 199, cuisine: "Thali", category: "thali" },
  { id: 10, name: "Rajasthani Thali House", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.3, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Rajasthani Thali", featuredPrice: 249, cuisine: "Thali", category: "thali" },
  { id: 11, name: "Gujarati Thali", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.1, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop", offer: "Flat ₹35 OFF above ₹129", featuredDish: "Gujarati Thali", featuredPrice: 179, cuisine: "Thali", category: "thali" },
  
  // Cake
  { id: 12, name: "Sweet Dreams Bakery", deliveryTime: "30-35 mins", distance: "2 km", rating: 4.6, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop", offer: "Flat ₹100 OFF above ₹499", featuredDish: "Chocolate Cake", featuredPrice: 599, cuisine: "Bakery, Cake", category: "cake" },
  { id: 13, name: "Cake Studio", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop", offer: "Flat ₹80 OFF above ₹399", featuredDish: "Red Velvet Cake", featuredPrice: 499, cuisine: "Bakery, Cake", category: "cake" },
  { id: 14, name: "Chocolate Heaven", deliveryTime: "35-40 mins", distance: "2.5 km", rating: 4.7, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop", offer: "Flat ₹120 OFF above ₹599", featuredDish: "Black Forest Cake", featuredPrice: 699, cuisine: "Bakery, Cake", category: "cake" },
  
  // Biryani
  { id: 15, name: "Paradise Biryani", deliveryTime: "30-35 mins", distance: "2.5 km", rating: 4.5, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop", offer: "50% OFF up to ₹100", featuredDish: "Hyderabadi Biryani", featuredPrice: 299, cuisine: "Biryani, Mughlai", category: "biryani" },
  { id: 16, name: "Biryani House", deliveryTime: "25-30 mins", distance: "1.8 km", rating: 4.5, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Chicken Biryani", featuredPrice: 249, cuisine: "Biryani", category: "biryani" },
  { id: 17, name: "Mughlai Biryani", deliveryTime: "25-30 mins", distance: "2 km", rating: 4.4, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Mutton Biryani", featuredPrice: 329, cuisine: "Biryani", category: "biryani" },
  
  // Burger
  { id: 18, name: "Burger King", deliveryTime: "20-25 mins", distance: "1.2 km", rating: 4.2, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹299", featuredDish: "Whopper", featuredPrice: 199, cuisine: "Burger, Fast Food", category: "burger" },
  { id: 19, name: "Burger Junction", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.3, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹249", featuredDish: "Classic Burger", featuredPrice: 179, cuisine: "Burger", category: "burger" },
  { id: 20, name: "Gourmet Burgers", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop", offer: "Flat ₹60 OFF above ₹349", featuredDish: "Premium Burger", featuredPrice: 249, cuisine: "Burger", category: "burger" },
  
  // Chinese
  { id: 21, name: "Chinese Wok", deliveryTime: "30-35 mins", distance: "2 km", rating: 4.0, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop", offer: "20% OFF on all orders", featuredDish: "Hakka Noodles", featuredPrice: 189, cuisine: "Chinese, Asian", category: "chinese" },
  { id: 22, name: "Dragon Chinese", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.2, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Schezwan Noodles", featuredPrice: 219, cuisine: "Chinese", category: "chinese" },
  { id: 23, name: "Golden Dragon", deliveryTime: "30-35 mins", distance: "2.2 km", rating: 4.3, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop", offer: "Flat ₹60 OFF above ₹249", featuredDish: "Manchurian", featuredPrice: 249, cuisine: "Chinese", category: "chinese" },
  
  // South Indian
  { id: 24, name: "South Indian Delight", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.4, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Free Delivery above ₹199", featuredDish: "Masala Dosa", featuredPrice: 99, cuisine: "South Indian", category: "south-indian" },
  { id: 25, name: "Dosa Corner", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Rava Dosa", featuredPrice: 129, cuisine: "South Indian", category: "south-indian" },
  { id: 26, name: "Idli Express", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Flat ₹25 OFF above ₹99", featuredDish: "Masala Idli", featuredPrice: 89, cuisine: "South Indian", category: "south-indian" },
  
  // Momos
  { id: 27, name: "Momos Express", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.3, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop", offer: "Flat ₹30 OFF above ₹149", featuredDish: "Steam Momos", featuredPrice: 129, cuisine: "Momos", category: "momos" },
  { id: 28, name: "Tibetan Momos", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.4, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹199", featuredDish: "Fried Momos", featuredPrice: 149, cuisine: "Momos", category: "momos" },
  { id: 29, name: "Steam Momos House", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.2, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop", offer: "Flat ₹25 OFF above ₹99", featuredDish: "Veg Momos", featuredPrice: 109, cuisine: "Momos", category: "momos" },
  
  // Chhole Bhature
  { id: 30, name: "Chhole Bhature House", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.3, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Chhole Bhature", featuredPrice: 149, cuisine: "Chhole Bhature", category: "chhole-bhature" },
  { id: 31, name: "Delhi Chhole Bhature", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.4, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop", offer: "Flat ₹35 OFF above ₹129", featuredDish: "Special Chhole", featuredPrice: 129, cuisine: "Chhole Bhature", category: "chhole-bhature" },
  
  // Chicken Tanduri
  { id: 32, name: "Tandoori Express", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Chicken Tanduri", featuredPrice: 249, cuisine: "Chicken Tanduri", category: "chicken-tanduri" },
  { id: 33, name: "Mughlai Tandoori", deliveryTime: "30-35 mins", distance: "2 km", rating: 4.4, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop", offer: "Flat ₹60 OFF above ₹249", featuredDish: "Tanduri Half", featuredPrice: 299, cuisine: "Chicken Tanduri", category: "chicken-tanduri" },
  
  // Donuts
  { id: 34, name: "Donut Delight", deliveryTime: "30-35 mins", distance: "2 km", rating: 4.6, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Chocolate Donut", featuredPrice: 149, cuisine: "Donuts", category: "donuts" },
  { id: 35, name: "Sweet Donuts", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.5, image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Glazed Donut", featuredPrice: 129, cuisine: "Donuts", category: "donuts" },
  
  // Dosa
  { id: 36, name: "Dosa Corner", deliveryTime: "15-20 mins", distance: "0.8 km", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Flat ₹30 OFF above ₹99", featuredDish: "Masala Dosa", featuredPrice: 99, cuisine: "Dosa", category: "dosa" },
  { id: 37, name: "Masala Dosa House", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.4, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop", offer: "Flat ₹35 OFF above ₹109", featuredDish: "Rava Dosa", featuredPrice: 109, cuisine: "Dosa", category: "dosa" },
  
  // French Fries
  { id: 38, name: "Fries Express", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.2, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop", offer: "Flat ₹20 OFF above ₹99", featuredDish: "French Fries", featuredPrice: 99, cuisine: "French Fries", category: "french-fries" },
  { id: 39, name: "Crispy Fries", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.3, image: "https://images.unsplash.com/photo-1626074353765-517ae6b44e08?w=800&h=600&fit=crop", offer: "Flat ₹25 OFF above ₹109", featuredDish: "Loaded Fries", featuredPrice: 129, cuisine: "French Fries", category: "french-fries" },
  
  // Idli
  { id: 40, name: "Idli Express", deliveryTime: "15-20 mins", distance: "0.6 km", rating: 4.2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Flat ₹25 OFF above ₹89", featuredDish: "Plain Idli", featuredPrice: 89, cuisine: "Idli", category: "idli" },
  { id: 41, name: "Soft Idli House", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop", offer: "Flat ₹30 OFF above ₹99", featuredDish: "Masala Idli", featuredPrice: 109, cuisine: "Idli", category: "idli" },
  
  // Samosa
  { id: 42, name: "Samosa House", deliveryTime: "15-20 mins", distance: "0.5 km", rating: 4.3, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop", offer: "Flat ₹20 OFF above ₹79", featuredDish: "Aloo Samosa", featuredPrice: 79, cuisine: "Samosa", category: "samosa" },
  { id: 43, name: "Crispy Samosa", deliveryTime: "20-25 mins", distance: "0.8 km", rating: 4.4, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop", offer: "Flat ₹25 OFF above ₹89", featuredDish: "Paneer Samosa", featuredPrice: 99, cuisine: "Samosa", category: "samosa" },
  
  // Starters
  { id: 44, name: "Starters Corner", deliveryTime: "20-25 mins", distance: "1 km", rating: 4.4, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop", offer: "Flat ₹40 OFF above ₹149", featuredDish: "Paneer Tikka", featuredPrice: 199, cuisine: "Starters", category: "starters" },
  { id: 45, name: "Appetizer House", deliveryTime: "25-30 mins", distance: "1.5 km", rating: 4.3, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop", offer: "Flat ₹50 OFF above ₹199", featuredDish: "Chicken Wings", featuredPrice: 249, cuisine: "Starters", category: "starters" },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [favorites, setFavorites] = useState(new Set())
  const categoryScrollRef = useRef(null)

  // Update search query when URL changes
  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      // Try to match query to a category
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase() === query.toLowerCase() ||
        cat.id === query.toLowerCase().replace(/\s+/g, '-')
      )
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id)
      }
    }
  }, [query])

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(filterId)) {
        newSet.delete(filterId)
      } else {
        newSet.add(filterId)
      }
      return newSet
    })
  }

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
    }
  }

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId)
    // Update search query to match category name
    const category = categories.find(c => c.id === catId)
    if (category && category.id !== 'all') {
      setSearchQuery(category.name)
      setSearchParams({ q: category.name })
    } else {
      setSearchQuery("")
      setSearchParams({})
    }
  }

  // Filter restaurants based on search query, selected category, and filters
  const filteredRecommended = useMemo(() => {
    let filtered = [...recommendedRestaurants]

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine?.toLowerCase().includes(lowerQuery) ||
        r.category === selectedCategory
      )
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    } else if (!query.trim()) {
      filtered = filtered.filter(r => r.category === 'all' || !r.category)
    }

    // Apply filters
    if (activeFilters.has('under-30-mins')) {
      filtered = filtered.filter(r => {
        const timeMatch = r.deliveryTime.match(/(\d+)/)
        return timeMatch && parseInt(timeMatch[1]) <= 30
      })
    }
    if (activeFilters.has('rating-4-plus')) {
      filtered = filtered.filter(r => r.rating >= 4.0)
    }
    if (activeFilters.has('flat-50-off')) {
      filtered = filtered.filter(r => r.offer?.includes('50%'))
    }

    return filtered
  }, [query, selectedCategory, activeFilters])

  const filteredAllRestaurants = useMemo(() => {
    let filtered = [...allRestaurants]

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine?.toLowerCase().includes(lowerQuery) ||
        r.featuredDish?.toLowerCase().includes(lowerQuery) ||
        r.category === selectedCategory
      )
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    } else if (!query.trim()) {
      filtered = filtered.filter(r => r.category === 'all' || !r.category)
    }

    // Apply filters
    if (activeFilters.has('under-30-mins')) {
      filtered = filtered.filter(r => {
        const timeMatch = r.deliveryTime.match(/(\d+)/)
        return timeMatch && parseInt(timeMatch[1]) <= 30
      })
    }
    if (activeFilters.has('rating-4-plus')) {
      filtered = filtered.filter(r => r.rating >= 4.0)
    }
    if (activeFilters.has('under-250')) {
      filtered = filtered.filter(r => r.featuredPrice <= 250)
    }
    if (activeFilters.has('flat-50-off')) {
      filtered = filtered.filter(r => r.offer?.includes('50%'))
    }

    return filtered
  }, [query, selectedCategory, activeFilters])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="max-w-7xl mx-auto">
        {/* Search Bar with Back Button */}
        <div className="flex items-center gap-2 px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => navigate('/user')}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
              placeholder="Restaurant name or a dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#2a2a2a] focus:border-gray-500 dark:focus:border-gray-600 text-sm dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400"
              />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Mic className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </form>
            </div>

        {/* Browse Category Section */}
        <div 
          ref={categoryScrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-8 lg:px-10 py-3 md:py-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 pb-2 transition-all ${
                  isSelected ? 'border-b-2 border-green-600' : ''
                }`}
              >
                {cat.image ? (
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    isSelected ? 'border-green-600 dark:border-green-500 shadow-lg' : 'border-transparent'
                  }`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 transition-all ${
                    isSelected ? 'border-green-600 dark:border-green-500 shadow-lg bg-green-50 dark:bg-green-900/20' : 'border-transparent'
                  }`}>
                    <span className="text-xl">🍽️</span>
                  </div>
                )}
                <span className={`text-xs font-medium whitespace-nowrap ${
                  isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>

      {/* Filters */}
      <div 
        className="flex items-center gap-2 sm:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-8 lg:px-10 py-3 md:py-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Filter Button */}
        <Button
          variant="outline"
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 font-medium bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-bold text-black dark:text-white">Filters</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {/* Filter Options */}
        {filterOptions.map((filter) => {
          const isActive = activeFilters.has(filter.id)
          return (
                                    <Button
              key={filter.id}
              variant="outline"
              onClick={() => toggleFilter(filter.id)}
              className={`h-9 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all font-medium ${
                isActive
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {filter.hasIcon && filter.id === 'price-match' && (
                <span className={`text-xs ${isActive ? 'text-white' : 'text-green-600 dark:text-green-400'}`}>✓</span>
              )}
              {filter.hasIcon && filter.id === 'flat-50-off' && (
                <span className={`text-xs ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`}>★</span>
              )}
              <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-black dark:text-white'}`}>{filter.label}</span>
                                    </Button>
          )
        })}
      </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8 lg:space-y-10">
        {/* RECOMMENDED FOR YOU Section */}
        {filteredRecommended.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">
              RECOMMENDED FOR YOU
            </h2>
            
            {/* Small Restaurant Cards - Horizontal Scroll */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
              {filteredRecommended.slice(0, 6).map((restaurant) => (
                <Link 
                  key={restaurant.id} 
                  to={`/user/restaurants/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block"
                >
                  <div className="group">
                    {/* Image Container */}
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                              <img
                                src={restaurant.image}
                                alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                      {/* Offer Badge */}
                      <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        {restaurant.offer}
                      </div>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {restaurant.rating}
                        <Star className="h-2.5 w-2.5 fill-white" />
                      </div>
                    </div>
                    
                    {/* Restaurant Info */}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[10px]">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ALL RESTAURANTS Section */}
        <section>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">
            ALL RESTAURANTS
          </h2>
          
          {/* Large Restaurant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {filteredAllRestaurants.map((restaurant) => {
              const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
              const isFavorite = favorites.has(restaurant.id)

              return (
                <Link key={restaurant.id} to={`/user/restaurants/${restaurantSlug}`} className="h-full flex">
                  <Card className="overflow-hidden cursor-pointer border-0 dark:border-gray-800 group bg-white dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-md flex flex-col h-full w-full">
                    {/* Image Section */}
                    <div className="relative h-44 sm:h-52 md:h-60 lg:h-64 xl:h-72 w-full overflow-hidden rounded-t-md flex-shrink-0">
                        <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      
                      {/* Featured Dish Badge - Top Left */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                          {restaurant.featuredDish} · ₹{restaurant.featuredPrice}
                        </div>
                      </div>
                      
                      {/* Ad Badge */}
                      {restaurant.isAd && (
                        <div className="absolute top-3 right-14 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                          Ad
                        </div>
                      )}
                      
                      {/* Bookmark Icon - Top Right */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-9 w-9 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(restaurant.id)
                        }}
                      >
                        <Bookmark className={`h-5 w-5 ${isFavorite ? "fill-gray-800 dark:fill-gray-200 text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`} strokeWidth={2} />
                      </Button>
                    </div>
                    
                    {/* Content Section */}
                    <CardContent className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow">
                      {/* Restaurant Name & Rating */}
                      <div className="flex items-start justify-between gap-2 mb-2 lg:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white line-clamp-1 lg:line-clamp-2">
                            {restaurant.name}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 bg-green-600 text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg flex items-center gap-1">
                          <span className="text-sm lg:text-base font-bold">{restaurant.rating}</span>
                          <Star className="h-3 w-3 lg:h-4 lg:w-4 fill-white text-white" />
                        </div>
                      </div>
                      
                      {/* Delivery Time & Distance */}
                      <div className="flex items-center gap-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-2 lg:mb-3">
                        <Clock className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
                        <span className="font-medium">{restaurant.deliveryTime}</span>
                        <span className="mx-1">|</span>
                        <span className="font-medium">{restaurant.distance}</span>
                      </div>
                      
                      {/* Offer Badge */}
                      {restaurant.offer && (
                        <div className="flex items-center gap-2 text-sm lg:text-base mt-auto">
                          <BadgePercent className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{restaurant.offer}</span>
                        </div>
                      )}
                      </CardContent>
                    </Card>
                </Link>
              )
            })}
            
            {/* Empty State */}
            {filteredAllRestaurants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {query
                    ? `No restaurants found for "${query}"`
                    : "No restaurants found with selected filters"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => {
                    setActiveFilters(new Set())
                    setSearchQuery("")
                    setSelectedCategory('all')
                    setSearchParams({})
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
      <StickyCartCard />
    </div>
  )
}
