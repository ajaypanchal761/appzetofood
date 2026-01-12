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
        label: "Cuisine",
        path: "/admin/cuisine",
        icon: "Link",
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
          { label: "List", path: "/admin/foods" },
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
        type: "expandable",
        label: "Campaigns",
        icon: "Megaphone",
        subItems: [
          { label: "Basic Campaign", path: "/admin/campaigns/basic" },
          { label: "Food Campaign", path: "/admin/campaigns/food" },
        ],
      },
      {
        type: "link",
        label: "Coupons",
        path: "/admin/coupons",
        icon: "Gift",
      },
      {
        type: "link",
        label: "Cashback",
        path: "/admin/cashback",
        icon: "DollarSign",
      },
      {
        type: "link",
        label: "Banners",
        path: "/admin/banners",
        icon: "Image",
      },
      {
        type: "link",
        label: "Promotional Banner",
        path: "/admin/promotional-banner",
        icon: "Image",
      },
      {
        type: "expandable",
        label: "Advertisement",
        icon: "Image",
        subItems: [
          { label: "New Advertisement", path: "/admin/advertisement/new" },
          { label: "Ad Requests", path: "/admin/advertisement/requests" },
          { label: "Ads List", path: "/admin/advertisement" },
        ],
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
          { label: "Bonus", path: "/admin/wallet/bonus" },
        ],
      },
      {
        type: "expandable",
        label: "Loyalty Point",
        icon: "Award",
        subItems: [
          { label: "Report", path: "/admin/loyalty-point/report" },
        ],
      },
      {
        type: "link",
        label: "Subscribed Mail List",
        path: "/admin/subscribed-mail-list",
        icon: "Mail",
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
        ],
      },
    ],
  },
  {
    type: "section",
    label: "DISBURSEMENT MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Restaurant Disbursement...",
        path: "/admin/restaurant-disbursement",
        icon: "DollarSign",
      },
      {
        type: "link",
        label: "Deliveryman Disbursement...",
        path: "/admin/deliveryman-disbursement",
        icon: "DollarSign",
      },
    ],
  },
  {
    type: "section",
    label: "HELP & SUPPORT",
    items: [
      {
        type: "link",
        label: "Chattings",
        path: "/admin/chattings",
        icon: "MessageSquare",
      },
      {
        type: "link",
        label: "Contact Messages",
        path: "/admin/contact-messages",
        icon: "Mail",
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
        ],
      },
      {
        type: "link",
        label: "Tax Report",
        path: "/admin/tax-report",
        icon: "FileText",
      },
      {
        type: "link",
        label: "Restaurant VAT Report",
        path: "/admin/restaurant-vat-report",
        icon: "FileText",
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
      {
        type: "link",
        label: "Withdraw Method",
        path: "/admin/withdraw-method",
        icon: "Settings",
      },
    ],
  },
  {
    type: "section",
    label: "EMPLOYEE MANAGEMENT",
    items: [
      {
        type: "link",
        label: "Employee Role",
        path: "/admin/employee-role",
        icon: "UserCog",
      },
      {
        type: "expandable",
        label: "Employees",
        icon: "User",
        subItems: [
          { label: "Add New Employee", path: "/admin/employees/add" },
          { label: "Employee List", path: "/admin/employees" },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "SYSTEM SETTINGS",
    items: [
      {
        type: "expandable",
        label: "3rd Party & Configurations",
        icon: "Settings",
        subItems: [
          { label: "3rd Party", path: "/admin/3rd-party-configurations/party" },
          { label: "Firebase Notification", path: "/admin/3rd-party-configurations/firebase" },
          { label: "Offline Payment Setup", path: "/admin/3rd-party-configurations/offline-payment" },
          { label: "Join Us Page Setup", path: "/admin/3rd-party-configurations/join-us" },
          { label: "Analytics Script", path: "/admin/3rd-party-configurations/analytics" },
          { label: "AI Setup", path: "/admin/3rd-party-configurations/ai" },
        ],
      },
      {
        type: "link",
        label: "App & Web Settings",
        path: "/admin/app-web-settings",
        icon: "Globe",
      },
      {
        type: "link",
        label: "Landing Page Management",
        path: "/admin/hero-banner-management",
        icon: "Image",
      },
      {
        type: "link",
        label: "Notification Channels",
        path: "/admin/notification-channels",
        icon: "Bell",
      },
      {
        type: "expandable",
        label: "Landing Page Settings",
        icon: "Globe",
        subItems: [
          { label: "Admin Landing Page", path: "/admin/landing-page-settings/admin" },
          { label: "React Landing Page", path: "/admin/landing-page-settings/react" },
        ],
      },
      {
        type: "link",
        label: "Page Meta Data",
        path: "/admin/page-meta-data",
        icon: "MessageSquare",
      },
      {
        type: "link",
        label: "React Site",
        path: "/admin/react-site",
        icon: "Globe",
      },
      {
        type: "link",
        label: "Clean Database",
        path: "/admin/clean-database",
        icon: "Database",
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
        type: "link",
        label: "Email Template",
        path: "/admin/email-template",
        icon: "Mail",
      },
      {
        type: "link",
        label: "Theme Settings",
        path: "/admin/theme-settings",
        icon: "Palette",
      },
      {
        type: "link",
        label: "Gallery",
        path: "/admin/gallery",
        icon: "Camera",
      },
      {
        type: "link",
        label: "Login Setup",
        path: "/admin/login-setup",
        icon: "LogIn",
      },
      {
        type: "expandable",
        label: "Pages & Social Media",
        icon: "Link",
        subItems: [
          { label: "Social Media", path: "/admin/pages-social-media/social" },
          { label: "Terms And Condition", path: "/admin/pages-social-media/terms" },
          { label: "Privacy Policy", path: "/admin/pages-social-media/privacy" },
          { label: "About Us", path: "/admin/pages-social-media/about" },
          { label: "Refund Policy", path: "/admin/pages-social-media/refund" },
          { label: "Shipping Policy", path: "/admin/pages-social-media/shipping" },
          { label: "Cancellation Policy", path: "/admin/pages-social-media/cancellation" },
          { label: "React Registration", path: "/admin/pages-social-media/react-registration" },
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

