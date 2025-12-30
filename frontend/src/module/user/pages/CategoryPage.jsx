import { useState, useMemo, useRef, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Star, Clock, Search, SlidersHorizontal, ChevronDown, Bookmark, BadgePercent, Mic, MapPin, ArrowDownUp, Timer, IndianRupee, UtensilsCrossed, ShieldCheck, X, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Import shared food images - prevents duplication
import { foodImages } from "@/constants/images"
import api from "@/lib/api"

// Filter options
const filterOptions = [
  { id: 'under-30-mins', label: 'Under 30 mins' },
  { id: 'price-match', label: 'Price Match', hasIcon: true },
  { id: 'flat-50-off', label: 'Flat 50% OFF', hasIcon: true },
  { id: 'under-250', label: 'Under ₹250' },
  { id: 'rating-4-plus', label: 'Rating 4.0+' },
]

// Recommended restaurants (small cards) - Comprehensive data for all categories
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

// All restaurants (large cards) - Comprehensive data for all categories
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

export default function CategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(category?.toLowerCase() || 'all')
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [favorites, setFavorites] = useState(new Set())
  const [sortBy, setSortBy] = useState(null)
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState('sort')
  const [activeScrollSection, setActiveScrollSection] = useState('sort')
  const [isLoadingFilterResults, setIsLoadingFilterResults] = useState(false)
  const filterSectionRefs = useRef({})
  const rightContentRef = useRef(null)
  const categoryScrollRef = useRef(null)
  
  // State for categories from admin
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch categories from admin API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await api.get('/categories/public')
        if (response.data.success && response.data.data.categories) {
          // Add "All" category at the beginning
          const allCategory = { 
            id: 'all', 
            name: "All", 
            image: foodImages[7] || foodImages[0],
            slug: 'all'
          }
          const adminCategories = response.data.data.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            image: cat.image || foodImages[0], // Fallback to default image if not provided
            slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
          }))
          setCategories([allCategory, ...adminCategories])
        } else {
          // Fallback to default categories if API fails
          const defaultCategories = [
            { id: 'all', name: "All", image: foodImages[7] },
            { id: 'biryani', name: "Biryani", image: foodImages[0] },
            { id: 'cake', name: "Cake", image: foodImages[1] },
            { id: 'chhole-bhature', name: "Chhole Bhature", image: foodImages[2] },
          ]
          setCategories(defaultCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to default categories on error
        const defaultCategories = [
          { id: 'all', name: "All", image: foodImages[7] },
          { id: 'biryani', name: "Biryani", image: foodImages[0] },
          { id: 'cake', name: "Cake", image: foodImages[1] },
        ]
        setCategories(defaultCategories)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Update selected category when URL changes
  useEffect(() => {
    if (category && categories && categories.length > 0) {
      // Try to match by slug first, then by name
      const categorySlug = category.toLowerCase()
      const matchedCategory = categories.find(cat => 
        cat.slug === categorySlug || 
        cat.id === categorySlug || 
        cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug
      )
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.slug || matchedCategory.id)
      } else {
        setSelectedCategory(categorySlug)
      }
    } else if (category) {
      // If categories not loaded yet, just set the slug
      setSelectedCategory(category.toLowerCase())
    }
  }, [category, categories])

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
    // Show loading when filter is toggled
    setIsLoadingFilterResults(true)
    setTimeout(() => {
      setIsLoadingFilterResults(false)
    }, 500)
  }

  // Scroll tracking effect for filter modal
  useEffect(() => {
    if (!isFilterOpen || !rightContentRef.current) return

    const observerOptions = {
      root: rightContentRef.current,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id')
          if (sectionId) {
            setActiveScrollSection(sectionId)
            setActiveFilterTab(sectionId)
          }
        }
      })
    }, observerOptions)

    Object.values(filterSectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [isFilterOpen])

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

  // Filter restaurants based on active filters and selected category
  const filteredRecommended = useMemo(() => {
    let filtered = [...recommendedRestaurants]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    } else {
      // For 'all', show restaurants from all categories
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

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.cuisine?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, activeFilters, searchQuery])

  const filteredAllRestaurants = useMemo(() => {
    let filtered = [...allRestaurants]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    } else {
      // For 'all', show restaurants from all categories
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

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.cuisine?.toLowerCase().includes(query) ||
        r.featuredDish?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, activeFilters, searchQuery])

  const handleCategorySelect = (category) => {
    const categorySlug = category.slug || category.id
    setSelectedCategory(categorySlug)
    // Update URL to reflect category change
    if (categorySlug === 'all') {
      navigate('/user/category/all')
    } else {
      navigate(`/user/category/${categorySlug}`)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar with Back Button */}
          <div className="flex items-center gap-2 px-3 md:px-6 py-3 border-b border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => navigate('/user')}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Restaurant name or a dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-11 md:h-12 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#2a2a2a] focus:border-gray-500 dark:focus:border-gray-600 text-sm md:text-base dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Mic className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Browse Category Section */}
          <div 
            ref={categoryScrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-6 py-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {loadingCategories ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Loading categories...</span>
              </div>
            ) : (
              categories && categories.length > 0 ? categories.map((cat) => {
                const categorySlug = cat.slug || cat.id
                const isSelected = selectedCategory === categorySlug || selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex flex-col items-center gap-1.5 flex-shrink-0 pb-2 transition-all ${
                      isSelected ? 'border-b-2 border-green-600' : ''
                    }`}
                  >
                    {cat.image ? (
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all ${
                        isSelected ? 'border-green-600 shadow-lg' : 'border-transparent'
                      }`}>
                        <img 
                          src={cat.image} 
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default image if category image fails to load
                            e.target.src = foodImages[0] || 'https://via.placeholder.com/100'
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 transition-all ${
                        isSelected ? 'border-green-600 shadow-lg bg-green-50 dark:bg-green-900/20' : 'border-transparent'
                      }`}>
                        <span className="text-xl md:text-2xl">🍽️</span>
                      </div>
                    )}
                    <span className={`text-xs md:text-sm font-medium whitespace-nowrap ${
                      isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                )
              }) : (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">No categories available</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-2 px-4 md:px-6 py-3">
            {/* Row 1 */}
            <div 
              className="flex items-center gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-1 md:pb-0"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className="h-7 md:h-8 px-2.5 md:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-bold text-black dark:text-white">Filters</span>
              </Button>
              {[
                { id: 'under-30-mins', label: 'Under 30 mins' },
                { id: 'delivery-under-45', label: 'Under 45 mins' },
                { id: 'rating-4-plus', label: 'Rating 4.0+' },
                { id: 'rating-45-plus', label: 'Rating 4.5+' },
              ].map((filter) => {
                const isActive = activeFilters.has(filter.id)
                return (
                  <Button
                    key={filter.id}
                    variant="outline"
                    onClick={() => toggleFilter(filter.id)}
                    className={`h-7 md:h-8 px-2.5 md:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-green-600 text-white border border-green-600 hover:bg-green-600/90'
                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`text-xs md:text-sm text-black dark:text-white font-bold ${isActive ? 'text-white' : 'text-black dark:text-white'}`}>{filter.label}</span>
                  </Button>
                )
              })}
            </div>
            
            {/* Row 2 */}
            <div 
              className="flex items-center gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-1 md:pb-0"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {[
                { id: 'distance-under-1km', label: 'Under 1km', icon: MapPin },
                { id: 'distance-under-2km', label: 'Under 2km', icon: MapPin },
                { id: 'flat-50-off', label: 'Flat 50% OFF' },
                { id: 'under-250', label: 'Under ₹250' },
              ].map((filter) => {
                const Icon = filter.icon
                const isActive = activeFilters.has(filter.id)
                return (
                  <Button
                    key={filter.id}
                    variant="outline"
                    onClick={() => toggleFilter(filter.id)}
                    className={`h-7 md:h-8 px-2.5 md:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-green-600 text-white border border-green-600 hover:bg-green-600/90'
                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {Icon && <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`} />}
                    <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-white' : 'text-black dark:text-white'}`}>{filter.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8 lg:space-y-10">
        <div className="max-w-7xl mx-auto">
          {/* RECOMMENDED FOR YOU Section */}
          {filteredRecommended.length > 0 && (
            <section>
              <h2 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 md:mb-6">
                RECOMMENDED FOR YOU
              </h2>

              {/* Small Restaurant Cards - Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {filteredRecommended.slice(0, 6).map((restaurant) => (
                  <Link 
                    key={restaurant.id}
                    to={`/user/restaurants/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block"
                  >
                    <div className="group">
                      {/* Image Container */}
                      <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-2">
                        <img 
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Offer Badge */}
                        <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] md:text-xs font-semibold px-1.5 py-0.5 rounded">
                          {restaurant.offer}
                        </div>

                        {/* Rating Badge (NOW ON IMAGE, bottom-left with white border) */}
                        <div className="absolute bottom-0 left-0 bg-green-600 border-[4px] rounded-md border-white text-white text-[11px] md:text-xs font-bold px-1.5 py-0.5 flex items-center gap-0.5">
                          {restaurant.rating}
                          <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-white" />
                        </div>
                      </div>

                      {/* Restaurant Info */}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ALL RESTAURANTS Section */}
          <section className="relative">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 md:mb-6">
              ALL RESTAURANTS
            </h2>
            
            {/* Loading Overlay */}
            {isLoadingFilterResults && (
              <div className="absolute inset-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin" strokeWidth={2.5} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading restaurants...</span>
                </div>
              </div>
            )}
            
            {/* Large Restaurant Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 xl:gap-7 items-stretch ${isLoadingFilterResults ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
              {filteredAllRestaurants.map((restaurant) => {
                const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
                const isFavorite = favorites.has(restaurant.id)

                return (
                  <Link key={restaurant.id} to={`/user/restaurants/${restaurantSlug}`} className="h-full flex">
                    <Card className="overflow-hidden cursor-pointer gap-0 border-0 dark:border-gray-800 group bg-white dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-md h-full flex flex-col w-full">
                      {/* Image Section */}
                      <div className="relative h-44 sm:h-52 md:h-60 lg:h-64 xl:h-72 w-full overflow-hidden rounded-t-md flex-shrink-0">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Featured Dish Badge - Top Left */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm md:text-base font-medium">
                            {restaurant.featuredDish} · ₹{restaurant.featuredPrice}
                          </div>
                        </div>
                        
                        {/* Ad Badge */}
                        {restaurant.isAd && (
                          <div className="absolute top-3 right-14 bg-black/50 text-white text-[10px] md:text-xs px-2 py-0.5 rounded">
                            Ad
                          </div>
                        )}
                        
                        {/* Bookmark Icon - Top Right */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 h-9 w-9 md:h-10 md:w-10 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(restaurant.id)
                          }}
                        >
                          <Bookmark className={`h-5 w-5 md:h-6 md:w-6 ${isFavorite ? "fill-gray-800 dark:fill-gray-200 text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`} strokeWidth={2} />
                        </Button>
                      </div>
                      
                      {/* Content Section */}
                        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 gap-0 flex-1 flex flex-col">
                        {/* Restaurant Name & Rating */}
                        <div className="flex items-start justify-between gap-2 mb-2 lg:mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-md md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white line-clamp-1 lg:line-clamp-2">
                              {restaurant.name}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 bg-green-600 text-white px-2 md:px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg flex items-center gap-1">
                            <span className="text-sm md:text-base lg:text-lg font-bold">{restaurant.rating}</span>
                            <Star className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 fill-white text-white" />
                          </div>
                        </div>
                        
                        {/* Delivery Time & Distance */}
                        <div className="flex items-center gap-1 text-sm md:text-base lg:text-lg text-gray-500 dark:text-gray-400 mb-2 lg:mb-3">
                          <Clock className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" strokeWidth={1.5} />
                          <span className="font-medium">{restaurant.deliveryTime}</span>
                          <span className="mx-1">|</span>
                          <span className="font-medium">{restaurant.distance}</span>
                        </div>
                        
                        {/* Offer Badge */}
                        {restaurant.offer && (
                          <div className="flex items-center gap-2 text-sm md:text-base lg:text-lg mt-auto">
                            <BadgePercent className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-blue-600" strokeWidth={2} />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{restaurant.offer}</span>
                          </div>
                        )}
                        </CardContent>
                      </Card>
                    </Link>
                )
              })}
            </div>

            {/* Empty State */}
            {filteredAllRestaurants.length === 0 && (
              <div className="text-center py-12 md:py-16">
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                  {searchQuery
                    ? `No restaurants found for "${searchQuery}"`
                    : "No restaurants found with selected filters"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 md:mt-6"
                  onClick={() => {
                    setActiveFilters(new Set())
                    setSearchQuery("")
                    setSelectedCategory('all')
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Filter Modal - Bottom Sheet */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isFilterOpen && (
              <div className="fixed inset-0 z-[100]">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/50" 
                  onClick={() => setIsFilterOpen(false)}
                />
                
                {/* Modal Content */}
                <div className="absolute bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl max-h-[85vh] md:max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Filters and sorting</h2>
                    <button 
                      onClick={() => {
                        setActiveFilters(new Set())
                        setSortBy(null)
                        setSelectedCuisine(null)
                      }}
                      className="text-green-600 dark:text-green-400 font-medium text-sm md:text-base"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  {/* Body */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Tabs */}
                    <div className="w-24 sm:w-28 md:w-32 bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex flex-col">
                      {[
                        { id: 'sort', label: 'Sort By', icon: ArrowDownUp },
                        { id: 'time', label: 'Time', icon: Timer },
                        { id: 'rating', label: 'Rating', icon: Star },
                        { id: 'distance', label: 'Distance', icon: MapPin },
                        { id: 'price', label: 'Dish Price', icon: IndianRupee },
                        { id: 'cuisine', label: 'Cuisine', icon: UtensilsCrossed },
                        { id: 'offers', label: 'Offers', icon: BadgePercent },
                        { id: 'trust', label: 'Trust', icon: ShieldCheck },
                      ].map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeScrollSection === tab.id || activeFilterTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveFilterTab(tab.id)
                              const section = filterSectionRefs.current[tab.id]
                              if (section) {
                                section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }}
                            className={`flex flex-col items-center gap-1 py-4 px-2 text-center relative transition-colors ${
                              isActive ? 'bg-white dark:bg-[#1a1a1a] text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r" />
                            )}
                            <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
                            <span className="text-xs md:text-sm font-medium leading-tight">{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Right Content Area - Scrollable */}
                    <div ref={rightContentRef} className="flex-1 overflow-y-auto p-4 md:p-6">
                      {/* Sort By Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['sort'] = el}
                        data-section-id="sort"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Sort by</h3>
                        <div className="flex flex-col gap-3">
                          {[
                            { id: null, label: 'Relevance' },
                            { id: 'price-low', label: 'Price: Low to High' },
                            { id: 'price-high', label: 'Price: High to Low' },
                            { id: 'rating-high', label: 'Rating: High to Low' },
                            { id: 'rating-low', label: 'Rating: Low to High' },
                          ].map((option) => (
                            <button
                              key={option.id || 'relevance'}
                              onClick={() => setSortBy(option.id)}
                              className={`px-4 md:px-5 py-3 md:py-4 rounded-xl border text-left transition-colors ${
                                sortBy === option.id
                                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                              }`}
                            >
                              <span className={`text-sm md:text-base font-medium ${sortBy === option.id ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['time'] = el}
                        data-section-id="time"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Delivery Time</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <button 
                            onClick={() => toggleFilter('under-30-mins')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('under-30-mins') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <Timer className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('under-30-mins') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('under-30-mins') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under 30 mins</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('delivery-under-45')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('delivery-under-45') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <Timer className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('delivery-under-45') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('delivery-under-45') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under 45 mins</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Rating Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['rating'] = el}
                        data-section-id="rating"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Restaurant Rating</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <button 
                            onClick={() => toggleFilter('rating-35-plus')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('rating-35-plus') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <Star className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('rating-35-plus') ? 'text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('rating-35-plus') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Rated 3.5+</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('rating-4-plus')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('rating-4-plus') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <Star className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('rating-4-plus') ? 'text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('rating-4-plus') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Rated 4.0+</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('rating-45-plus')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('rating-45-plus') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <Star className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('rating-45-plus') ? 'text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('rating-45-plus') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Rated 4.5+</span>
                          </button>
                        </div>
                      </div>

                      {/* Distance Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['distance'] = el}
                        data-section-id="distance"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Distance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <button 
                            onClick={() => toggleFilter('distance-under-1km')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('distance-under-1km') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <MapPin className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('distance-under-1km') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('distance-under-1km') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under 1 km</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('distance-under-2km')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('distance-under-2km') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <MapPin className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('distance-under-2km') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('distance-under-2km') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under 2 km</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Price Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['price'] = el}
                        data-section-id="price"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Dish Price</h3>
                        <div className="flex flex-col gap-3 md:gap-4">
                          <button 
                            onClick={() => toggleFilter('price-under-200')}
                            className={`px-4 md:px-5 py-3 md:py-4 rounded-xl border text-left transition-colors ${
                              activeFilters.has('price-under-200') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('price-under-200') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under ₹200</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('under-250')}
                            className={`px-4 md:px-5 py-3 md:py-4 rounded-xl border text-left transition-colors ${
                              activeFilters.has('under-250') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('under-250') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under ₹250</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('price-under-500')}
                            className={`px-4 md:px-5 py-3 md:py-4 rounded-xl border text-left transition-colors ${
                              activeFilters.has('price-under-500') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('price-under-500') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Under ₹500</span>
                          </button>
                        </div>
                      </div>

                      {/* Cuisine Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['cuisine'] = el}
                        data-section-id="cuisine"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Cuisine</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                          {['Chinese', 'American', 'Japanese', 'Italian', 'Mexican', 'Indian', 'Asian', 'Seafood', 'Desserts', 'Cafe', 'Healthy'].map((cuisine) => (
                            <button
                              key={cuisine}
                              onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                              className={`px-4 md:px-5 py-3 md:py-4 rounded-xl border text-center transition-colors ${
                                selectedCuisine === cuisine
                                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                              }`}
                            >
                              <span className={`text-sm md:text-base font-medium ${selectedCuisine === cuisine ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {cuisine}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Offers Tab */}
                      <div 
                        ref={el => filterSectionRefs.current['offers'] = el}
                        data-section-id="offers"
                        className="space-y-4 mb-8"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Offers</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <button 
                            onClick={() => toggleFilter('flat-50-off')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('flat-50-off') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <BadgePercent className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('flat-50-off') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('flat-50-off') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Flat 50% OFF</span>
                          </button>
                          <button 
                            onClick={() => toggleFilter('price-match')}
                            className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border transition-colors ${
                              activeFilters.has('price-match') 
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                            }`}
                          >
                            <BadgePercent className={`h-6 w-6 md:h-7 md:w-7 ${activeFilters.has('price-match') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} strokeWidth={1.5} />
                            <span className={`text-sm md:text-base font-medium ${activeFilters.has('price-match') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>Price Match</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Trust Markers Tab */}
                      {activeFilterTab === 'trust' && (
                        <div className="space-y-4">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Trust Markers</h3>
                          <div className="flex flex-col gap-3 md:gap-4">
                            <button className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-600 text-left transition-colors">
                              <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">Top Rated</span>
                            </button>
                            <button className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-600 text-left transition-colors">
                              <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">Trusted by 1000+ users</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center gap-4 px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 py-3 md:py-4 text-center font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => {
                        setIsLoadingFilterResults(true)
                        setIsFilterOpen(false)
                        // Simulate loading for 500ms
                        setTimeout(() => {
                          setIsLoadingFilterResults(false)
                        }, 500)
                      }}
                      className={`flex-1 py-3 md:py-4 font-semibold rounded-xl transition-colors text-sm md:text-base ${
                        activeFilters.size > 0 || sortBy || selectedCuisine
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {activeFilters.size > 0 || sortBy || selectedCuisine
                        ? 'Show results'
                        : 'Show results'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <style>{`
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
