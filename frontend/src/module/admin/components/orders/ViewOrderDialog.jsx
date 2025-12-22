import { Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const getStatusColor = (orderStatus) => {
  const colors = {
    "Delivered": "bg-emerald-100 text-emerald-700",
    "Pending": "bg-blue-100 text-blue-700",
    "Scheduled": "bg-blue-100 text-blue-700",
    "Accepted": "bg-green-100 text-green-700",
    "Processing": "bg-orange-100 text-orange-700",
    "Food On The Way": "bg-yellow-100 text-yellow-700",
    "Canceled": "bg-rose-100 text-rose-700",
    "Payment Failed": "bg-red-100 text-red-700",
    "Refunded": "bg-sky-100 text-sky-700",
    "Dine In": "bg-indigo-100 text-indigo-700",
    "Offline Payments": "bg-slate-100 text-slate-700",
  }
  return colors[orderStatus] || "bg-slate-100 text-slate-700"
}

const getPaymentStatusColor = (paymentStatus) => {
  if (paymentStatus === "Paid") return "text-emerald-600"
  if (paymentStatus === "Unpaid" || paymentStatus === "Failed") return "text-red-600"
  return "text-slate-600"
}

export default function ViewOrderDialog({ isOpen, onOpenChange, order }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-orange-600" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this order
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</p>
                <p className="text-sm font-medium text-slate-900">{order.orderId || order.id || order.subscriptionId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Date</p>
                <p className="text-sm font-medium text-slate-900">{order.date}{order.time ? `, ${order.time}` : ""}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name</p>
                <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-slate-900">{order.customerPhone}</p>
              </div>
              {order.restaurant && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restaurant</p>
                  <p className="text-sm font-medium text-slate-900">{order.restaurant}</p>
                </div>
              )}
              {order.deliveryType && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Type</p>
                  <p className="text-sm font-medium text-slate-900">{order.deliveryType}</p>
                </div>
              )}
              {order.orderStatus && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              )}
              {order.paymentStatus && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Status</p>
                  <p className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </p>
                </div>
              )}
            </div>
            {(order.totalAmount || order.total) && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Total Amount</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {order.total || `$ ${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

