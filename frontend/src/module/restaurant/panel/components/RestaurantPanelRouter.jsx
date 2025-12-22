import { Routes, Route, Navigate } from "react-router-dom"
import RestaurantPanelLayout from "./RestaurantPanelLayout"
import Dashboard from "../pages/Dashboard"
import Orders from "../pages/Orders"
import Foods from "../pages/Foods"
import AddFood from "../pages/AddFood"
import BulkImport from "../pages/BulkImport"
import BulkExport from "../pages/BulkExport"
import Categories from "../pages/Categories"
import SubCategory from "../pages/SubCategory"
import Addons from "../pages/Addons"
import Reviews from "../pages/Reviews"
import Campaign from "../pages/Campaign"
import FoodCampaign from "../pages/FoodCampaign"
import Coupons from "../pages/Coupons"
import Chat from "../pages/Chat"
import NewAd from "../pages/NewAd"
import AdsList from "../pages/AdsList"
import MyWallet from "../pages/MyWallet"
import WalletMethod from "../pages/WalletMethod"
import ExpenseReport from "../pages/ExpenseReport"
import Transaction from "../pages/Transaction"
import DisbursementReport from "../pages/DisbursementReport"
import OrderReport from "../pages/OrderReport"
import CampaignOrderReport from "../pages/CampaignOrderReport"
import TaxReport from "../pages/TaxReport"
import FoodReport from "../pages/FoodReport"
import MyRestaurant from "../pages/MyRestaurant"
import RestaurantConfig from "../pages/RestaurantConfig"
import MyBusinessPlan from "../pages/MyBusinessPlan"
import MyQrCode from "../pages/MyQrCode"
import NotificationSetup from "../pages/NotificationSetup"
import EmployeeRole from "../pages/EmployeeRole"
import AllEmployee from "../pages/AllEmployee"
import AddEmployee from "../pages/AddEmployee"
import PointOfSale from "../pages/PointOfSale"
import SubscriptionOrders from "../pages/SubscriptionOrders"
import FoodDetail from "../pages/FoodDetail"

export default function RestaurantPanelRouter() {
  return (
    <Routes>
      <Route element={<RestaurantPanelLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<PointOfSale />} />
        <Route path="orders" element={<Orders />} />
        <Route path="subscription-orders" element={<SubscriptionOrders />} />
        <Route path="foods" element={<Foods />} />
        <Route path="foods/:id" element={<FoodDetail />} />
        <Route path="foods/add" element={<AddFood />} />
        <Route path="foods/bulk-import" element={<BulkImport />} />
        <Route path="foods/bulk-export" element={<BulkExport />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/sub-category" element={<SubCategory />} />
        <Route path="addons" element={<Addons />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="campaign" element={<Campaign />} />
        <Route path="campaign/basic" element={<Campaign />} />
        <Route path="campaign/food" element={<FoodCampaign />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="new-ads" element={<NewAd />} />
        <Route path="ads-list" element={<AdsList />} />
        <Route path="ads-list/pending" element={<AdsList />} />
        <Route path="my-wallet" element={<MyWallet />} />
        <Route path="wallet-method" element={<WalletMethod />} />
        <Route path="expense-report" element={<ExpenseReport />} />
        <Route path="transaction" element={<Transaction />} />
        <Route path="disbursement-report" element={<DisbursementReport />} />
        <Route path="order-report" element={<OrderReport />} />
        <Route path="order-report/regular" element={<OrderReport />} />
        <Route path="order-report/campaign" element={<CampaignOrderReport />} />
        <Route path="food-report" element={<FoodReport />} />
        <Route path="tax-report" element={<TaxReport />} />
        <Route path="my-restaurant" element={<MyRestaurant />} />
        <Route path="restaurant-config" element={<RestaurantConfig />} />
        <Route path="my-business-plan" element={<MyBusinessPlan />} />
        <Route path="my-qr-code" element={<MyQrCode />} />
        <Route path="notification-setup" element={<NotificationSetup />} />
        <Route path="employee-role" element={<EmployeeRole />} />
        <Route path="all-employee" element={<AllEmployee />} />
        <Route path="all-employee/add" element={<AddEmployee />} />
        <Route path="chat" element={<Chat />} />
      </Route>
    </Routes>
  )
}

