import { Routes, Route, Navigate, useLocation } from "react-router-dom"

import Home from "@/pages/Home"
import UserRouter from "@/module/user/components/UserRouter"
import HomePage from "@/module/usermain/pages/HomePage"
import CategoriesPage from "@/module/usermain/pages/CategoriesPage"
import CategoryFoodsPage from "@/module/usermain/pages/CategoryFoodsPage"
import FoodDetailPage from "@/module/usermain/pages/FoodDetailPage"
import CartPage from "@/module/usermain/pages/CartPage"
import CheckoutPage from "@/module/usermain/pages/CheckoutPage"
import PaymentPage from "@/module/usermain/pages/PaymentPage"
import OrdersPage from "@/module/usermain/pages/OrdersPage"
import OrderDetailsPage from "@/module/usermain/pages/OrderDetailsPage"
import WishlistPage from "@/module/usermain/pages/WishlistPage"

import RestaurantOrdersPage from "@/module/restaurant/pages/OrdersPage"
import AllOrdersPage from "@/module/restaurant/pages/AllOrdersPage"
import RestaurantDetailsPage from "@/module/restaurant/pages/RestaurantDetailsPage"
import EditRestaurantPage from "@/module/restaurant/pages/EditRestaurantPage"
import FoodDetailsPage from "@/module/restaurant/pages/FoodDetailsPage"
import EditFoodPage from "@/module/restaurant/pages/EditFoodPage"
import AllFoodPage from "@/module/restaurant/pages/AllFoodPage"
import WalletPage from "@/module/restaurant/pages/WalletPage"
import RestaurantNotifications from "@/module/restaurant/pages/Notifications"
import OrderDetails from "@/module/restaurant/pages/OrderDetails"
import OrdersMain from "@/module/restaurant/pages/OrdersMain"

import RestaurantSignIn from "@/module/restaurant/pages/auth/SignIn"
import RestaurantLogin from "@/module/restaurant/pages/auth/Login"
import RestaurantSignup from "@/module/restaurant/pages/auth/Signup"
import RestaurantOTP from "@/module/restaurant/pages/auth/OTP"
import RestaurantWelcome from "@/module/restaurant/pages/auth/Welcome"

import RestaurantPanelRouter from "@/module/restaurant/panel/components/RestaurantPanelRouter"

import AdvertisementsPage from "@/module/restaurant/pages/AdvertisementsPage"
import AdDetailsPage from "@/module/restaurant/pages/AdDetailsPage"
import NewAdvertisementPage from "@/module/restaurant/pages/NewAdvertisementPage"
import EditAdvertisementPage from "@/module/restaurant/pages/EditAdvertisementPage"
import CouponListPage from "@/module/restaurant/pages/CouponListPage"
import AddCouponPage from "@/module/restaurant/pages/AddCouponPage"
import EditCouponPage from "@/module/restaurant/pages/EditCouponPage"
import ReviewsPage from "@/module/restaurant/pages/ReviewsPage"
import UpdateReplyPage from "@/module/restaurant/pages/UpdateReplyPage"
import SettingsPage from "@/module/restaurant/pages/SettingsPage"
import PrivacyPolicyPage from "@/module/restaurant/pages/PrivacyPolicyPage"
import TermsAndConditionsPage from "@/module/restaurant/pages/TermsAndConditionsPage"
import RestaurantConfigPage from "@/module/restaurant/pages/RestaurantConfigPage"
import RestaurantCategoriesPage from "@/module/restaurant/pages/RestaurantCategoriesPage"
import BusinessPlanPage from "@/module/restaurant/pages/BusinessPlanPage"
import ConversationListPage from "@/module/restaurant/pages/ConversationListPage"
import ChatDetailPage from "@/module/restaurant/pages/ChatDetailPage"
import RestaurantStatus from "@/module/restaurant/pages/RestaurantStatus"
import ExploreMore from "@/module/restaurant/pages/ExploreMore"
import DeliverySettings from "@/module/restaurant/pages/DeliverySettings"
import RushHour from "@/module/restaurant/pages/RushHour"
import SwitchOutlet from "@/module/restaurant/pages/SwitchOutlet"
import OutletTimings from "@/module/restaurant/pages/OutletTimings"
import DaySlots from "@/module/restaurant/pages/DaySlots"
import OutletInfo from "@/module/restaurant/pages/OutletInfo"
import RatingsReviews from "@/module/restaurant/pages/RatingsReviews"
import ContactDetails from "@/module/restaurant/pages/ContactDetails"
import EditOwner from "@/module/restaurant/pages/EditOwner"
import InviteUser from "@/module/restaurant/pages/InviteUser"
import EditCuisines from "@/module/restaurant/pages/EditCuisines"
import EditRestaurantAddress from "@/module/restaurant/pages/EditRestaurantAddress"
import Inventory from "@/module/restaurant/pages/Inventory"
import Feedback from "@/module/restaurant/pages/Feedback"
import ShareFeedback from "@/module/restaurant/pages/ShareFeedback"
import DishRatings from "@/module/restaurant/pages/DishRatings"
import HelpCentre from "@/module/restaurant/pages/HelpCentre"
import FssaiDetails from "@/module/restaurant/pages/FssaiDetails"
import FssaiUpdate from "@/module/restaurant/pages/FssaiUpdate"
import Hyperpure from "@/module/restaurant/pages/Hyperpure"
import HubGrowth from "@/module/restaurant/pages/HubGrowth"
import CreateOffers from "@/module/restaurant/pages/CreateOffers"
import ChooseDiscountType from "@/module/restaurant/pages/ChooseDiscountType"
import ChooseMenuDiscountType from "@/module/restaurant/pages/ChooseMenuDiscountType"
import CreatePercentageDiscount from "@/module/restaurant/pages/CreatePercentageDiscount"
import PreviewOffer from "@/module/restaurant/pages/PreviewOffer"
import CreateFreebies from "@/module/restaurant/pages/CreateFreebies"
import FreebiesTiming from "@/module/restaurant/pages/FreebiesTiming"
import CreatePercentageMenuDiscount from "@/module/restaurant/pages/CreatePercentageMenuDiscount"
import CreateFlatPriceMenuDiscount from "@/module/restaurant/pages/CreateFlatPriceMenuDiscount"
import CreateBOGOMenuDiscount from "@/module/restaurant/pages/CreateBOGOMenuDiscount"
import MenuDiscountTiming from "@/module/restaurant/pages/MenuDiscountTiming"
import HubMenu from "@/module/restaurant/pages/HubMenu"
import ItemDetailsPage from "@/module/restaurant/pages/ItemDetailsPage"
import HubFinance from "@/module/restaurant/pages/HubFinance"
import FinanceDetailsPage from "@/module/restaurant/pages/FinanceDetailsPage"
import PhoneNumbersPage from "@/module/restaurant/pages/PhoneNumbersPage"
import DownloadReport from "@/module/restaurant/pages/DownloadReport"
import ToHub from "@/module/restaurant/pages/ToHub"
import ManageOutlets from "@/module/restaurant/pages/ManageOutlets"
import UpdateBankDetails from "@/module/restaurant/pages/UpdateBankDetails"

import AdminRouter from "@/module/admin/components/AdminRouter"
import DeliveryRouter from "@/module/delivery/components/DeliveryRouter"

function UserPathRedirect() {
  const location = useLocation()
  const newPath = location.pathname.replace(/^\/user/, "") || "/"
  return <Navigate to={newPath} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/user" element={<Navigate to="/" replace />} />
      <Route path="/user/*" element={<UserPathRedirect />} />
      <Route path="/routes" element={<Home />} />

      <Route path="/restaurant/welcome" element={<RestaurantWelcome />} />
      <Route path="/restaurant/auth/sign-in" element={<RestaurantSignIn />} />
      <Route path="/restaurant/login" element={<RestaurantLogin />} />
      <Route path="/restaurant/signup" element={<RestaurantSignup />} />
      <Route path="/restaurant/otp" element={<RestaurantOTP />} />
      <Route path="/restaurant-panel/*" element={<RestaurantPanelRouter />} />

      <Route path="/usermain" element={<HomePage />} />
      <Route path="/usermain/categories" element={<CategoriesPage />} />
      <Route path="/usermain/category/:categoryName" element={<CategoryFoodsPage />} />
      <Route path="/usermain/food/:id" element={<FoodDetailPage />} />
      <Route path="/usermain/cart" element={<CartPage />} />
      <Route path="/usermain/checkout" element={<CheckoutPage />} />
      <Route path="/usermain/payment" element={<PaymentPage />} />
      <Route path="/usermain/orders" element={<OrdersPage />} />
      <Route path="/usermain/orders/:orderId" element={<OrderDetailsPage />} />
      <Route path="/usermain/wishlist" element={<WishlistPage />} />

      <Route path="/restaurant" element={<OrdersMain />} />
      <Route path="/restaurant/notifications" element={<RestaurantNotifications />} />
      <Route path="/restaurant/orders" element={<RestaurantOrdersPage />} />
      <Route path="/restaurant/orders/all" element={<AllOrdersPage />} />
      <Route path="/restaurant/orders/:orderId" element={<OrderDetails />} />
      <Route path="/restaurant/details" element={<RestaurantDetailsPage />} />
      <Route path="/restaurant/edit" element={<EditRestaurantPage />} />
      <Route path="/restaurant/food/all" element={<AllFoodPage />} />
      <Route path="/restaurant/food/:id" element={<FoodDetailsPage />} />
      <Route path="/restaurant/food/:id/edit" element={<EditFoodPage />} />
      <Route path="/restaurant/food/new" element={<EditFoodPage />} />
      <Route path="/restaurant/wallet" element={<WalletPage />} />

      <Route path="/restaurant/advertisements" element={<AdvertisementsPage />} />
      <Route path="/restaurant/advertisements/new" element={<NewAdvertisementPage />} />
      <Route path="/restaurant/advertisements/:id" element={<AdDetailsPage />} />
      <Route path="/restaurant/advertisements/:id/edit" element={<EditAdvertisementPage />} />
      <Route path="/restaurant/coupon" element={<CouponListPage />} />
      <Route path="/restaurant/coupon/new" element={<AddCouponPage />} />
      <Route path="/restaurant/coupon/:id/edit" element={<EditCouponPage />} />
      <Route path="/restaurant/reviews" element={<ReviewsPage />} />
      <Route path="/restaurant/reviews/:id/reply" element={<UpdateReplyPage />} />

      <Route path="/restaurant/settings" element={<SettingsPage />} />
      <Route path="/restaurant/delivery-settings" element={<DeliverySettings />} />
      <Route path="/restaurant/rush-hour" element={<RushHour />} />
      <Route path="/restaurant/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/restaurant/terms" element={<TermsAndConditionsPage />} />

      <Route path="/restaurant/config" element={<RestaurantConfigPage />} />
      <Route path="/restaurant/categories" element={<RestaurantCategoriesPage />} />
      <Route path="/restaurant/business-plan" element={<BusinessPlanPage />} />
      <Route path="/restaurant/conversation" element={<ConversationListPage />} />
      <Route path="/restaurant/conversation/:conversationId" element={<ChatDetailPage />} />
      <Route path="/restaurant/status" element={<RestaurantStatus />} />
      <Route path="/restaurant/explore" element={<ExploreMore />} />

      <Route path="/restaurant/switch-outlet" element={<SwitchOutlet />} />
      <Route path="/restaurant/outlet-timings" element={<OutletTimings />} />
      <Route path="/restaurant/outlet-timings/:day" element={<DaySlots />} />
      <Route path="/restaurant/outlet-info" element={<OutletInfo />} />
      <Route path="/restaurant/ratings-reviews" element={<RatingsReviews />} />
      <Route path="/restaurant/contact-details" element={<ContactDetails />} />
      <Route path="/restaurant/edit-owner" element={<EditOwner />} />
      <Route path="/restaurant/invite-user" element={<InviteUser />} />
      <Route path="/restaurant/edit-cuisines" element={<EditCuisines />} />
      <Route path="/restaurant/edit-address" element={<EditRestaurantAddress />} />

      <Route path="/restaurant/inventory" element={<Inventory />} />
      <Route path="/restaurant/feedback" element={<Feedback />} />
      <Route path="/restaurant/share-feedback" element={<ShareFeedback />} />
      <Route path="/restaurant/dish-ratings" element={<DishRatings />} />
      <Route path="/restaurant/help-centre" element={<HelpCentre />} />
      <Route path="/restaurant/fssai" element={<FssaiDetails />} />
      <Route path="/restaurant/fssai/update" element={<FssaiUpdate />} />
      <Route path="/restaurant/hyperpure" element={<Hyperpure />} />
      <Route path="/restaurant/hub-growth" element={<HubGrowth />} />
      <Route path="/restaurant/hub-growth/create-offers" element={<CreateOffers />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers" element={<ChooseMenuDiscountType />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/freebies" element={<CreateFreebies />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/freebies/timings" element={<FreebiesTiming />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/percentage" element={<CreatePercentageMenuDiscount />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/percentage/timings" element={<MenuDiscountTiming />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/percentage/preview" element={<PreviewOffer />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/flat-price" element={<CreateFlatPriceMenuDiscount />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/flat-price/timings" element={<MenuDiscountTiming />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/flat-price/preview" element={<PreviewOffer />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/bogo" element={<CreateBOGOMenuDiscount />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/bogo/timings" element={<MenuDiscountTiming />} />
      <Route path="/restaurant/hub-growth/create-offers/delight-customers/bogo/preview" element={<PreviewOffer />} />
      <Route path="/restaurant/hub-growth/create-offers/:goalId/:discountType/create" element={<CreatePercentageDiscount />} />
      <Route path="/restaurant/hub-growth/create-offers/:goalId/:discountType/preview" element={<PreviewOffer />} />
      <Route path="/restaurant/hub-growth/create-offers/:goalId" element={<ChooseDiscountType />} />
      <Route path="/restaurant/hub-menu" element={<HubMenu />} />
      <Route path="/restaurant/hub-menu/item/:id" element={<ItemDetailsPage />} />
      <Route path="/restaurant/hub-finance" element={<HubFinance />} />
      <Route path="/restaurant/finance-details" element={<FinanceDetailsPage />} />
      <Route path="/restaurant/phone" element={<PhoneNumbersPage />} />
      <Route path="/restaurant/download-report" element={<DownloadReport />} />
      <Route path="/restaurant/to-hub" element={<ToHub />} />
      <Route path="/restaurant/manage-outlets" element={<ManageOutlets />} />
      <Route path="/restaurant/update-bank-details" element={<UpdateBankDetails />} />

      <Route path="/delivery/*" element={<DeliveryRouter />} />
      <Route path="/admin/*" element={<AdminRouter />} />

      <Route path="/*" element={<UserRouter />} />
    </Routes>
  )
}
