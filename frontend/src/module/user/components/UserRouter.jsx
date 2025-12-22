import { Routes, Route } from "react-router-dom"
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

      {/* Cart */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/cart/checkout" element={<Checkout />} />

      {/* Orders */}
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderTracking />} />
      <Route path="/orders/:orderId/invoice" element={<OrderInvoice />} />

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
      <Route path="/gift-card/checkout" element={<GiftCardCheckout />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/profile/addresses" element={<Addresses />} />
      <Route path="/profile/addresses/new" element={<AddAddress />} />
      <Route path="/profile/addresses/:id/edit" element={<EditAddress />} />
      <Route path="/profile/payments" element={<Payments />} />
      <Route path="/profile/payments/new" element={<AddPayment />} />
      <Route path="/profile/payments/:id/edit" element={<EditPayment />} />
      <Route path="/profile/favorites" element={<Favorites />} />
      <Route path="/profile/settings" element={<Settings />} />
      <Route path="/profile/coupons" element={<Coupons />} />
      <Route path="/profile/redeem-gold-coupon" element={<RedeemGoldCoupon />} />
      <Route path="/profile/about" element={<About />} />
      <Route path="/profile/send-feedback" element={<SendFeedback />} />
      <Route path="/profile/report-safety-emergency" element={<ReportSafetyEmergency />} />
      <Route path="/profile/accessibility" element={<Accessibility />} />
      <Route path="/profile/logout" element={<Logout />} />

      {/* Auth */}
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/otp" element={<OTP />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Help */}
      <Route path="/help" element={<Help />} />
      <Route path="/help/orders/:orderId" element={<OrderHelp />} />

      {/* Notifications */}
      <Route path="/notifications" element={<Notifications />} />

      {/* Wallet */}
      <Route path="/wallet" element={<Wallet />} />
      </Route>
    </Routes>
  )
}

