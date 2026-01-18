// Sidebar menu structure with all items
export const sidebarMenuData = [
  {
    type: "link",
    label: "Dashboard",
    path: "/admin",
    icon: "LayoutDashboard",
  },
  {
    type: "link",
    label: "Point of Sale",
    path: "/admin/point-of-sale",
    icon: "CreditCard",
  },
  {
    type: "section",
    label: "FOOD MANAGEMENT",
    items: [
      {
        type: "expandable",
        label: "Categories",
        icon: "FolderTree",
        subItems: [
          { label: "Category", path: "/admin/categories" },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "RESTAURANT MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Zone Setup",
        path: "/admin/zone-setup",
        icon: "MapPin",
      },
      {
        type: "link",
        label: "Food Approval",
        path: "/admin/food-approval",
        icon: "CheckCircle2",
      },
      {
        type: "expandable",
        label: "Restaurants",
        icon: "UtensilsCrossed",
        subItems: [
          { label: "Restaurants List", path: "/admin/restaurants" },
          { label: "New Joining Request", path: "/admin/restaurants/joining-request" },
          { label: "Restaurant Commission", path: "/admin/restaurants/commission" },
        ],
      },
      {
        type: "expandable",
        label: "Foods",
        icon: "Utensils",
        subItems: [
          { label: "Restaurant Foods List", path: "/admin/foods" },
          { label: "Restaurant Addons List", path: "/admin/addons" },
        ],
      },
    ],
  },

  {
    type: "section",
    label: "ORDER MANAGEMENT",
    items: [
      {
        type: "expandable",
        label: "Orders",
        icon: "FileText",
        subItems: [
          { label: "All", path: "/admin/orders/all" },
          { label: "Scheduled", path: "/admin/orders/scheduled" },
          { label: "Pending", path: "/admin/orders/pending" },
          { label: "Accepted", path: "/admin/orders/accepted" },
          { label: "Processing", path: "/admin/orders/processing" },
          { label: "Food On The Way", path: "/admin/orders/food-on-the-way" },
          { label: "Delivered", path: "/admin/orders/delivered" },
          { label: "Canceled", path: "/admin/orders/canceled" },
          { label: "Payment Failed", path: "/admin/orders/payment-failed" },
          { label: "Refunded", path: "/admin/orders/refunded" },
          { label: "Dine In", path: "/admin/orders/dine-in" },
          { label: "Offline Payments", path: "/admin/orders/offline-payments" },
        ],
      },
      {
        type: "link",
        label: "Subscription Orders",
        path: "/admin/subscription-orders",
        icon: "Calendar",
      },
      {
        type: "expandable",
        label: "Dispatch Management",
        icon: "Clock",
        subItems: [
          { label: "Searching DeliveryMan", path: "/admin/dispatch/searching" },
          { label: "Ongoing Orders", path: "/admin/dispatch/ongoing" },
        ],
      },
      {
        type: "expandable",
        label: "Order Refunds",
        icon: "Receipt",
        subItems: [
          { label: "New Refund Requests", path: "/admin/order-refunds/new" },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "PROMOTIONS MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Restaurant Coupons & Offers",
        path: "/admin/coupons",
        icon: "Gift",
      },

      {
        type: "link",
        label: "Push Notification",
        path: "/admin/push-notification",
        icon: "Bell",
      },
    ],
  },

  {
    type: "section",
    label: "CUSTOMER MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Customers",
        path: "/admin/customers",
        icon: "Users",
      },
      {
        type: "expandable",
        label: "Wallet",
        icon: "Wallet",
        subItems: [
          { label: "Add Fund", path: "/admin/wallet/add-fund" },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "DELIVERYMAN MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Delivery Boy Commission",
        path: "/admin/delivery-boy-commission",
        icon: "DollarSign",
      },
      {
        type: "expandable",
        label: "Deliveryman",
        icon: "Package",
        subItems: [
          { label: "New Join Request", path: "/admin/delivery-partners/join-request" },
          { label: "Deliveryman List", path: "/admin/delivery-partners" },
          { label: "Deliveryman Reviews", path: "/admin/delivery-partners/reviews" },
          { label: "Bonus", path: "/admin/delivery-partners/bonus" },
          { label: "Earning Addon", path: "/admin/delivery-partners/earning-addon" },
          { label: "Earning Addon History", path: "/admin/delivery-partners/earning-addon-history" },
          { label: "Delivery Earning", path: "/admin/delivery-partners/earnings" },
        ],
      },
    ],
  },

  {
    type: "section",
    label: "HELP & SUPPORT",
    items: [
      {
        type: "link",
        label: "User Feedback",
        path: "/admin/contact-messages",
        icon: "Mail",
      },
      {
        type: "link",
        label: "Safety Emergency Reports",
        path: "/admin/safety-emergency-reports",
        icon: "AlertTriangle",
      },
    ],
  },

  {
    type: "section",
    label: "REPORT MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Transaction Report",
        path: "/admin/transaction-report",
        icon: "FileText",
      },
      {
        type: "link",
        label: "Expense Report",
        path: "/admin/expense-report",
        icon: "FileText",
      },
      {
        type: "expandable",
        label: "Disbursement Report",
        icon: "FileText",
        subItems: [
          { label: "Restaurants", path: "/admin/disbursement-report/restaurants" },
          { label: "Delivery Men", path: "/admin/disbursement-report/deliverymen" },
        ],
      },
      {
        type: "link",
        label: "Food Report",
        path: "/admin/food-report",
        icon: "Utensils",
      },
      {
        type: "expandable",
        label: "Order Report",
        icon: "FileText",
        subItems: [
          { label: "Regular Order Report", path: "/admin/order-report/regular" },
          { label: "Campaign Order Report", path: "/admin/order-report/campaign" },
        ],
      },
      {
        type: "expandable",
        label: "Restaurant Report",
        icon: "FileText",
        subItems: [
          { label: "Restaurant Report", path: "/admin/restaurant-report" },
          { label: "Subscription Report", path: "/admin/restaurant-report/subscription" },
        ],
      },
      {
        type: "expandable",
        label: "Customer Report",
        icon: "FileText",
        subItems: [
          { label: "Customer Wallet Report", path: "/admin/customer-report/wallet" },
          { label: "Feedback Experience", path: "/admin/customer-report/feedback-experience" },
        ],
      },

    ],
  },
  {
    type: "section",
    label: "TRANSACTION MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Collect Cash",
        path: "/admin/collect-cash",
        icon: "DollarSign",
      },
      {
        type: "link",
        label: "Restaurant Withdraws",
        path: "/admin/restaurant-withdraws",
        icon: "CreditCard",
      },
      {
        type: "link",
        label: "Delivery Man Payments",
        path: "/admin/delivery-man-payments",
        icon: "CreditCard",
      },
    ],
  },
  {
    type: "section",
    label: "SYSTEM SETTINGS",
    items: [
      {
        type: "link",
        label: "Landing Page Management",
        path: "/admin/hero-banner-management",
        icon: "Image",
      },
      {
        type: "link",
        label: "Dining Management",
        path: "/admin/dining-management",
        icon: "UtensilsCrossed",
      },

      {
        type: "link",
        label: "Addon Activation",
        path: "/admin/addon-activation",
        icon: "Zap",
      },
    ],
  },
  {
    type: "section",
    label: "BUSINESS SETTINGS",
    items: [
      {
        type: "link",
        label: "Business Setup",
        path: "/admin/business-setup",
        icon: "Settings",
      },
      {
        type: "expandable",
        label: "System Tax",
        icon: "DollarSign",
        subItems: [
          { label: "Create Taxes", path: "/admin/system-tax/create" },
          { label: "Setup Taxes", path: "/admin/system-tax/setup" },
        ],
      },
      {
        type: "expandable",
        label: "Subscription Management",
        icon: "CreditCard",
        subItems: [
          { label: "Subscription Packages", path: "/admin/subscription-management/packages" },
          { label: "Subscriber List", path: "/admin/subscription-management/subscribers" },
          { label: "Settings", path: "/admin/subscription-management/settings" },
        ],
      },

      {
        type: "expandable",
        label: "Pages & Social Media",
        icon: "Link",
        subItems: [
          { label: "Terms And Condition", path: "/admin/pages-social-media/terms" },
          { label: "Privacy Policy", path: "/admin/pages-social-media/privacy" },
          { label: "About Us", path: "/admin/pages-social-media/about" },
          { label: "Refund Policy", path: "/admin/pages-social-media/refund" },
          { label: "Shipping Policy", path: "/admin/pages-social-media/shipping" },
          { label: "Cancellation Policy", path: "/admin/pages-social-media/cancellation" },

        ],
      },
    ],
  },

  {
    type: "section",
    label: "SYSTEM ADDONS",
    items: [
      {
        type: "link",
        label: "ENV Setup",
        path: "/admin/system-addons",
        icon: "Plus",
      },
    ],
  },
]

