import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./AdminLayout";
import AdminHome from "../pages/AdminHome";
import PointOfSale from "../pages/PointOfSale";
import AdminProfile from "../pages/AdminProfile";
import AdminSettings from "../pages/AdminSettings";
import SearchingDeliveryMan from "../pages/dispatch/SearchingDeliveryMan";
import OngoingOrders from "../pages/dispatch/OngoingOrders";
import NewRefundRequests from "../pages/refunds/NewRefundRequests";
import Cuisine from "../pages/restaurant/Cuisine";
import OrdersPage from "../pages/orders/OrdersPage";
import SubscriptionOrders from "../pages/SubscriptionOrders";
import BulkImport from "../pages/categories/BulkImport";
import BulkExport from "../pages/categories/BulkExport";
import SubCategory from "../pages/categories/SubCategory";
import Category from "../pages/categories/Category";
import AddonCategory from "../pages/addons/AddonCategory";
import AddonsList from "../pages/addons/AddonsList";
import AddonsBulkImport from "../pages/addons/AddonsBulkImport";
import AddonsBulkExport from "../pages/addons/AddonsBulkExport";
// Restaurant Management
import ZoneSetup from "../pages/restaurant/ZoneSetup";
import AddRestaurant from "../pages/restaurant/AddRestaurant";
import RestaurantsList from "../pages/restaurant/RestaurantsList";
import JoiningRequest from "../pages/restaurant/JoiningRequest";
import RestaurantsBulkImport from "../pages/restaurant/RestaurantsBulkImport";
import RestaurantsBulkExport from "../pages/restaurant/RestaurantsBulkExport";
// Food ManagementE
import AddFood from "../pages/foods/AddFood";
import FoodsList from "../pages/foods/FoodsList";
import FoodReview from "../pages/foods/FoodReview";
import FoodsBulkImport from "../pages/foods/FoodsBulkImport";
import FoodsBulkExport from "../pages/foods/FoodsBulkExport";
// Promotions Management
import BasicCampaign from "../pages/campaigns/BasicCampaign";
import FoodCampaign from "../pages/campaigns/FoodCampaign";
import Coupons from "../pages/Coupons";
import Cashback from "../pages/Cashback";
import Banners from "../pages/Banners";
import PromotionalBanner from "../pages/PromotionalBanner";
import NewAdvertisement from "../pages/advertisement/NewAdvertisement";
import AdRequests from "../pages/advertisement/AdRequests";
import AdsList from "../pages/advertisement/AdsList";
import PushNotification from "../pages/PushNotification";
// Help & Support
import Chattings from "../pages/Chattings";
import ContactMessages from "../pages/ContactMessages";
// Customer Management
import Customers from "../pages/Customers";
import AddFund from "../pages/wallet/AddFund";
import Bonus from "../pages/wallet/Bonus";
import LoyaltyPointReport from "../pages/loyalty-point/Report";
import SubscribedMailList from "../pages/SubscribedMailList";
// Deliveryman Management
import VehiclesCategorySetup from "../pages/VehiclesCategorySetup";
import ShiftSetup from "../pages/ShiftSetup";
import JoinRequest from "../pages/delivery-partners/JoinRequest";
import AddDeliveryman from "../pages/delivery-partners/AddDeliveryman";
import DeliverymanList from "../pages/delivery-partners/DeliverymanList";
import DeliverymanReviews from "../pages/delivery-partners/DeliverymanReviews";
import DeliverymanBonus from "../pages/delivery-partners/DeliverymanBonus";
import IncentiveRequests from "../pages/delivery-partners/IncentiveRequests";
import IncentivesHistory from "../pages/delivery-partners/IncentivesHistory";
// Disbursement Management
import RestaurantDisbursement from "../pages/RestaurantDisbursement";
import DeliverymanDisbursement from "../pages/DeliverymanDisbursement";
// Report Management
import TransactionReport from "../pages/reports/TransactionReport";
import ExpenseReport from "../pages/reports/ExpenseReport";
import DisbursementReportRestaurants from "../pages/reports/DisbursementReportRestaurants";
import DisbursementReportDeliverymen from "../pages/reports/DisbursementReportDeliverymen";
import FoodReport from "../pages/reports/FoodReport";
import RegularOrderReport from "../pages/reports/RegularOrderReport";
import CampaignOrderReport from "../pages/reports/CampaignOrderReport";
import RestaurantReport from "../pages/reports/RestaurantReport";
import SubscriptionReport from "../pages/reports/SubscriptionReport";
import CustomerWalletReport from "../pages/reports/CustomerWalletReport";
import TaxReport from "../pages/reports/TaxReport";
import RestaurantVATReport from "../pages/reports/RestaurantVATReport";
// Transaction Management
import CollectCash from "../pages/transactions/CollectCash";
import RestaurantWithdraws from "../pages/transactions/RestaurantWithdraws";
import DeliveryManPayments from "../pages/transactions/DeliveryManPayments";
import WithdrawMethod from "../pages/transactions/WithdrawMethod";
// Employee Management
import EmployeeRole from "../pages/employees/EmployeeRole";
import AddEmployee from "../pages/employees/AddEmployee";
import EmployeeList from "../pages/employees/EmployeeList";
// Business Settings
import BusinessSetup from "../pages/settings/BusinessSetup";
import CreateTaxes from "../pages/settings/CreateTaxes";
import SetupTaxes from "../pages/settings/SetupTaxes";
import SubscriptionPackages from "../pages/settings/SubscriptionPackages";
import SubscriberList from "../pages/settings/SubscriberList";
import SubscriptionSettings from "../pages/settings/SubscriptionSettings";
import EmailTemplate from "../pages/settings/EmailTemplate";
import ThemeSettings from "../pages/settings/ThemeSettings";
import Gallery from "../pages/settings/Gallery";
import LoginSetup from "../pages/settings/LoginSetup";
import SocialMedia from "../pages/settings/SocialMedia";
import TermsAndCondition from "../pages/settings/TermsAndCondition";
import PrivacyPolicy from "../pages/settings/PrivacyPolicy";
import AboutUs from "../pages/settings/AboutUs";
import RefundPolicy from "../pages/settings/RefundPolicy";
import ShippingPolicy from "../pages/settings/ShippingPolicy";
import CancellationPolicy from "../pages/settings/CancellationPolicy";
import ReactRegistration from "../pages/settings/ReactRegistration";
// System Settings
import ThirdParty from "../pages/system/ThirdParty";
import FirebaseNotification from "../pages/system/FirebaseNotification";
import OfflinePaymentSetup from "../pages/system/OfflinePaymentSetup";
import JoinUsPageSetup from "../pages/system/JoinUsPageSetup";
import AnalyticsScript from "../pages/system/AnalyticsScript";
import AISetup from "../pages/system/AISetup";
import AppWebSettings from "../pages/system/AppWebSettings";
import NotificationChannels from "../pages/system/NotificationChannels";
import LandingPageSettings from "../pages/system/LandingPageSettings";
import PageMetaData from "../pages/system/PageMetaData";
import ReactSite from "../pages/system/ReactSite";
import CleanDatabase from "../pages/system/CleanDatabase";
import AddonActivation from "../pages/system/AddonActivation";
// System Addons
import SystemAddons from "../pages/system/SystemAddons";
import LandingPageManagement from "../pages/system/LandingPageManagement";

export default function AdminRouter() {
  return (
    <Routes>
      {/* Protected Routes - With Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<AdminHome />} />
        <Route path="/point-of-sale" element={<PointOfSale />} />
        
        {/* Profile */}
        <Route path="/profile" element={<AdminProfile />} />
        
        {/* Settings */}
        <Route path="/settings" element={<AdminSettings />} />

        {/* ORDER MANAGEMENT */}
        {/* Orders */}
        <Route path="orders/all" element={<OrdersPage statusKey="all" />} />
        <Route path="orders/scheduled" element={<OrdersPage statusKey="scheduled" />} />
        <Route path="orders/pending" element={<OrdersPage statusKey="pending" />} />
        <Route path="orders/accepted" element={<OrdersPage statusKey="accepted" />} />
        <Route path="orders/processing" element={<OrdersPage statusKey="processing" />} />
        <Route path="orders/food-on-the-way" element={<OrdersPage statusKey="food-on-the-way" />} />
        <Route path="orders/delivered" element={<OrdersPage statusKey="delivered" />} />
        <Route path="orders/canceled" element={<OrdersPage statusKey="canceled" />} />
        <Route path="orders/payment-failed" element={<OrdersPage statusKey="payment-failed" />} />
        <Route path="orders/refunded" element={<OrdersPage statusKey="refunded" />} />
        <Route path="orders/dine-in" element={<OrdersPage statusKey="dine-in" />} />
        <Route path="orders/offline-payments" element={<OrdersPage statusKey="offline-payments" />} />
        <Route path="subscription-orders" element={<SubscriptionOrders />} />
        {/* Dispatch Management */}
        <Route path="dispatch/searching" element={<SearchingDeliveryMan />} />
        <Route path="dispatch/ongoing" element={<OngoingOrders />} />
        {/* Order Refunds */}
        <Route path="order-refunds/new" element={<NewRefundRequests />} />

        {/* RESTAURANT MANAGEMENT */}
        <Route path="zone-setup" element={<ZoneSetup />} />
        <Route path="cuisine" element={<Cuisine />} />
        {/* Restaurants */}
        <Route path="restaurants/add" element={<AddRestaurant />} />
        <Route path="restaurants" element={<RestaurantsList />} />
        <Route path="restaurants/joining-request" element={<JoiningRequest />} />
        <Route path="restaurants/bulk-import" element={<RestaurantsBulkImport />} />
        <Route path="restaurants/bulk-export" element={<RestaurantsBulkExport />} />

        {/* FOOD MANAGEMENT */}
        {/* Categories */}
        <Route path="categories" element={<Category />} />
        <Route path="categories/sub-category" element={<SubCategory />} />
        <Route path="categories/bulk-import" element={<BulkImport />} />
        <Route path="categories/bulk-export" element={<BulkExport />} />
        {/* Addons */}
        <Route path="addons/category" element={<AddonCategory />} />
        <Route path="addons" element={<AddonsList />} />
        <Route path="addons/bulk-import" element={<AddonsBulkImport />} />
        <Route path="addons/bulk-export" element={<AddonsBulkExport />} />
        {/* Foods */}
        <Route path="foods/add" element={<AddFood />} />
        <Route path="foods" element={<FoodsList />} />
        <Route path="food/list" element={<FoodsList />} />
        <Route path="foods/review" element={<FoodReview />} />
        <Route path="foods/bulk-import" element={<FoodsBulkImport />} />
        <Route path="foods/bulk-export" element={<FoodsBulkExport />} />

        {/* PROMOTIONS MANAGEMENT */}
        {/* Campaigns */}
        <Route path="campaigns/basic" element={<BasicCampaign />} />
        <Route path="campaigns/food" element={<FoodCampaign />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="cashback" element={<Cashback />} />
        <Route path="banners" element={<Banners />} />
        <Route path="promotional-banner" element={<PromotionalBanner />} />
        {/* Advertisement */}
        <Route path="advertisement/new" element={<NewAdvertisement />} />
        <Route path="advertisement/requests" element={<AdRequests />} />
        <Route path="advertisement" element={<AdsList />} />
        <Route path="push-notification" element={<PushNotification />} />

        {/* HELP & SUPPORT */}
        <Route path="chattings" element={<Chattings />} />
        <Route path="contact-messages" element={<ContactMessages />} />

        {/* CUSTOMER MANAGEMENT */}
        <Route path="customers" element={<Customers />} />
        {/* Wallet */}
        <Route path="wallet/add-fund" element={<AddFund />} />
        <Route path="wallet/bonus" element={<Bonus />} />
        {/* Loyalty Point */}
        <Route path="loyalty-point/report" element={<LoyaltyPointReport />} />
        <Route path="subscribed-mail-list" element={<SubscribedMailList />} />

        {/* DELIVERYMAN MANAGEMENT */}
        <Route path="vehicles-category-setup" element={<VehiclesCategorySetup />} />
        <Route path="shift-setup" element={<ShiftSetup />} />
        {/* Delivery Partners */}
        <Route path="delivery-partners/join-request" element={<JoinRequest />} />
        <Route path="delivery-partners/add" element={<AddDeliveryman />} />
        <Route path="delivery-partners" element={<DeliverymanList />} />
        <Route path="delivery-partners/reviews" element={<DeliverymanReviews />} />
        <Route path="delivery-partners/bonus" element={<DeliverymanBonus />} />
        <Route path="delivery-partners/incentive-requests" element={<IncentiveRequests />} />
        <Route path="delivery-partners/incentives-history" element={<IncentivesHistory />} />

        {/* DISBURSEMENT MANAGEMENT */}
        <Route path="restaurant-disbursement" element={<RestaurantDisbursement />} />
        <Route path="deliveryman-disbursement" element={<DeliverymanDisbursement />} />

        {/* REPORT MANAGEMENT */}
        <Route path="transaction-report" element={<TransactionReport />} />
        <Route path="expense-report" element={<ExpenseReport />} />
        {/* Disbursement Report */}
        <Route path="disbursement-report/restaurants" element={<DisbursementReportRestaurants />} />
        <Route path="disbursement-report/deliverymen" element={<DisbursementReportDeliverymen />} />
        <Route path="food-report" element={<FoodReport />} />
        {/* Order Report */}
        <Route path="order-report/regular" element={<RegularOrderReport />} />
        <Route path="order-report/campaign" element={<CampaignOrderReport />} />
        {/* Restaurant Report */}
        <Route path="restaurant-report" element={<RestaurantReport />} />
        <Route path="restaurant-report/subscription" element={<SubscriptionReport />} />
        {/* Customer Report */}
        <Route path="customer-report/wallet" element={<CustomerWalletReport />} />
        <Route path="tax-report" element={<TaxReport />} />
        <Route path="restaurant-vat-report" element={<RestaurantVATReport />} />

        {/* TRANSACTION MANAGEMENT */}
        <Route path="collect-cash" element={<CollectCash />} />
        <Route path="restaurant-withdraws" element={<RestaurantWithdraws />} />
        <Route path="delivery-man-payments" element={<DeliveryManPayments />} />
        <Route path="withdraw-method" element={<WithdrawMethod />} />

        {/* EMPLOYEE MANAGEMENT */}
        <Route path="employee-role" element={<EmployeeRole />} />
        {/* Employees */}
        <Route path="employees/add" element={<AddEmployee />} />
        <Route path="employees" element={<EmployeeList />} />

        {/* BUSINESS SETTINGS */}
        <Route path="business-setup" element={<BusinessSetup />} />
        {/* System Tax */}
        <Route path="system-tax/create" element={<CreateTaxes />} />
        <Route path="system-tax/setup" element={<SetupTaxes />} />
        {/* Subscription Management */}
        <Route path="subscription-management/packages" element={<SubscriptionPackages />} />
        <Route path="subscription-management/subscribers" element={<SubscriberList />} />
        <Route path="subscription-management/settings" element={<SubscriptionSettings />} />
        <Route path="email-template" element={<EmailTemplate />} />
        <Route path="theme-settings" element={<ThemeSettings />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="login-setup" element={<LoginSetup />} />
        {/* Business Settings - FCM */}
        <Route path="business-settings/fcm-index" element={<FirebaseNotification />} />
        {/* Pages & Social Media */}
        <Route path="pages-social-media/social" element={<SocialMedia />} />
        <Route path="pages-social-media/terms" element={<TermsAndCondition />} />
        <Route path="pages-social-media/privacy" element={<PrivacyPolicy />} />
        <Route path="pages-social-media/about" element={<AboutUs />} />
        <Route path="pages-social-media/refund" element={<RefundPolicy />} />
        <Route path="pages-social-media/shipping" element={<ShippingPolicy />} />
        <Route path="pages-social-media/cancellation" element={<CancellationPolicy />} />
        <Route path="pages-social-media/react-registration" element={<ReactRegistration />} />

        {/* SYSTEM SETTINGS */}
        {/* 3rd Party & Configurations */}
        <Route path="3rd-party-configurations/party" element={<ThirdParty />} />
        <Route path="3rd-party-configurations/firebase" element={<FirebaseNotification />} />
        <Route path="3rd-party-configurations/offline-payment" element={<OfflinePaymentSetup />} />
        <Route path="3rd-party-configurations/join-us" element={<JoinUsPageSetup />} />
        <Route path="3rd-party-configurations/analytics" element={<AnalyticsScript />} />
        <Route path="3rd-party-configurations/ai" element={<AISetup />} />
        <Route path="app-web-settings" element={<AppWebSettings />} />
        <Route path="notification-channels" element={<NotificationChannels />} />
        {/* Landing Page Settings */}
        <Route path="landing-page-settings/admin" element={<LandingPageSettings type="admin" />} />
        <Route path="landing-page-settings/react" element={<LandingPageSettings type="react" />} />
        <Route path="page-meta-data" element={<PageMetaData />} />
        <Route path="react-site" element={<ReactSite />} />
        <Route path="clean-database" element={<CleanDatabase />} />
        <Route path="addon-activation" element={<AddonActivation />} />

        {/* SYSTEM ADDONS */}
        <Route path="system-addons" element={<SystemAddons />} />
        {/* HERO BANNER MANAGEMENT */}
        <Route path="hero-banner-management" element={<LandingPageManagement />} />
      </Route>

      {/* Redirect /admin to /admin/ */}
      <Route path="" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
