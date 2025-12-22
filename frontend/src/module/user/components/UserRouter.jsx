import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import UserLayout from "./UserLayout"

// Home & Discovery
import Home from "../pages/Home"
import Dining from "../pages/Dining"
import DiningRestaurants from "../pages/DiningRestaurants"
import DiningCategory from "../pages/DiningCategory"
import DiningExplore50 from "../pages/DiningExplore50"
import DiningExploreNear from "../pages/DiningExploreNear"
import Coffee from "../pages/Coffee"
import Under250 from "../pages/Under250"
import CategoryPage from "../pages/CategoryPage"
import Restaurants from "../pages/restaurants/Restaurants"
import RestaurantDetails from "../pages/restaurants/RestaurantDetails"
import SearchResults from "../pages/SearchResults"
import ProductDetail from "../pages/ProductDetail"

// Cart
import Cart from "../pages/cart/Cart"
import Checkout from "../pages/cart/Checkout"

// Orders
import Orders from "../pages/orders/Orders"
import OrderTracking from "../pages/orders/OrderTracking"
import OrderInvoice from "../pages/orders/OrderInvoice"

// Offers
import Offers from "../pages/Offers"

// Gourmet
import Gourmet from "../pages/Gourmet"

// Top 10
import Top10 from "../pages/Top10"

// Collections
import Collections from "../pages/Collections"

// Gift Cards
import GiftCards from "../pages/GiftCards"
import GiftCardCheckout from "../pages/GiftCardCheckout"

// Profile
import Profile from "../pages/profile/Profile"
import EditProfile from "../pages/profile/EditProfile"
import Addresses from "../pages/profile/Addresses"
import AddAddress from "../pages/profile/AddAddress"
import EditAddress from "../pages/profile/EditAddress"
import Payments from "../pages/profile/Payments"
import AddPayment from "../pages/profile/AddPayment"
import EditPayment from "../pages/profile/EditPayment"
import Favorites from "../pages/profile/Favorites"
import Settings from "../pages/profile/Settings"
import Coupons from "../pages/profile/Coupons"
import RedeemGoldCoupon from "../pages/profile/RedeemGoldCoupon"
import About from "../pages/profile/About"
import SendFeedback from "../pages/profile/SendFeedback"
import ReportSafetyEmergency from "../pages/profile/ReportSafetyEmergency"
import Accessibility from "../pages/profile/Accessibility"
import Logout from "../pages/profile/Logout"

// Auth
import SignIn from "../pages/auth/SignIn"
import OTP from "../pages/auth/OTP"
import AuthCallback from "../pages/auth/AuthCallback"

// Help
import Help from "../pages/help/Help"
import OrderHelp from "../pages/help/OrderHelp"

// Notifications
import Notifications from "../pages/Notifications"

// Wallet
import Wallet from "../pages/Wallet"

export default function UserRouter() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
      {/* Home & Discovery */}
      <Route path="/" element={<Home />} />
      <Route path="/dining" element={<Dining />} />
      <Route path="/dining/restaurants" element={<DiningRestaurants />} />
      <Route path="/dining/:category" element={<DiningCategory />} />
      <Route path="/dining/explore/upto50" element={<DiningExplore50 />} />
      <Route path="/dining/explore/near-rated" element={<DiningExploreNear />} />
      <Route path="/dining/coffee" element={<Coffee />} />
      <Route path="/under-250" element={<Under250 />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:slug" element={<RestaurantDetails />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* Cart - Protected */}
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Cart />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cart/checkout" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Checkout />
          </ProtectedRoute>
        } 
      />

      {/* Orders - Protected */}
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Orders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/:orderId" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <OrderTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/:orderId/invoice" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <OrderInvoice />
          </ProtectedRoute>
        } 
      />

      {/* Offers */}
      <Route path="/offers" element={<Offers />} />

      {/* Gourmet */}
      <Route path="/gourmet" element={<Gourmet />} />

      {/* Top 10 */}
      <Route path="/top-10" element={<Top10 />} />

      {/* Collections */}
      <Route path="/collections" element={<Collections />} />

      {/* Gift Cards */}
      <Route path="/gift-card" element={<GiftCards />} />
      <Route 
        path="/gift-card/checkout" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <GiftCardCheckout />
          </ProtectedRoute>
        } 
      />

      {/* Profile - Protected */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <EditProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/addresses" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Addresses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/addresses/new" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <AddAddress />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/addresses/:id/edit" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <EditAddress />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/payments" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Payments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/payments/new" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <AddPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/payments/:id/edit" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <EditPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/favorites" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Favorites />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/settings" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/coupons" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Coupons />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/redeem-gold-coupon" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <RedeemGoldCoupon />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/about" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <About />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/send-feedback" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <SendFeedback />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/report-safety-emergency" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <ReportSafetyEmergency />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/accessibility" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Accessibility />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/logout" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Logout />
          </ProtectedRoute>
        } 
      />

      {/* Auth */}
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/otp" element={<OTP />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Help */}
      <Route path="/help" element={<Help />} />
      <Route path="/help/orders/:orderId" element={<OrderHelp />} />

      {/* Notifications - Protected */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Notifications />
          </ProtectedRoute>
        } 
      />

      {/* Wallet - Protected */}
      <Route 
        path="/wallet" 
        element={
          <ProtectedRoute requiredRole="user" loginPath="/user/auth/sign-in">
            <Wallet />
          </ProtectedRoute>
        } 
      />
      </Route>
    </Routes>
  )
}

