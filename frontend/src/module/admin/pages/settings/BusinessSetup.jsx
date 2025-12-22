import { useState } from "react";
import { Info, Globe2, Phone, MapPin, Clock, DollarSign } from "lucide-react";

const topTabs = [
  "Business settings",
  "Priority setup",
  "Order settings",
  "Refund settings",
  "Restaurant",
  "Delivery man",
  "Customers",
];

export default function BusinessSetup() {
  const [activeTab, setActiveTab] = useState("Business settings");
  const [maintenanceOn, setMaintenanceOn] = useState(false);

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Business setup</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Manage your company information, general configuration and business rules.
          </p>
        </div>

        {/* Note card (top-right) */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 max-w-md">
          <div className="mt-0.5">
            <Info className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs lg:text-sm text-slate-700">
            <p className="font-semibold text-amber-700 mb-0.5">Note</p>
            <p>Don&apos;t forget to click the &quot;Save Information&quot; button below to save changes.</p>
          </div>
        </div>
      </div>

      {/* Top tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 mb-4 flex flex-wrap gap-2">
        {topTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {/* Maintenance mode + Company info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {/* Maintenance header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Maintenance Mode</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Turn on the Maintenance Mode will temporarily deactivate your selected systems as of your chosen date
                and time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceOn((prev) => !prev)}
              className={`inline-flex items-center justify-between w-32 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                maintenanceOn
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              <span>Maintenance Mode</span>
              <span
                className={`inline-flex h-4 w-7 items-center rounded-full transition-all ${
                  maintenanceOn ? "bg-white/30 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-white shadow-sm" />
              </span>
            </button>
          </div>

          {/* Company information */}
          <div className="px-4 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span>Company Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="StackFood"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <select className="w-full pl-8 pr-6 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                      <option>+1</option>
                      <option>+44</option>
                      <option>+880</option>
                    </select>
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                      ▾
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="01700000000"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full pl-3 pr-6 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Bangladesh</option>
                  </select>
                  <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                    ▾
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address
                </label>
                <textarea
                  rows={2}
                  placeholder="House: 00, Road: 00, City-0000, Country"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Latitude
                  <MapPin className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  placeholder="23.746466884053319"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Longitude
                  <MapPin className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  placeholder="90.354159459770426"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Logo & favicon placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo</label>
                <div className="border border-dashed border-slate-300 rounded-lg bg-slate-50/60 h-28 flex items-center justify-center text-xs text-slate-400">
                  Logo area (image placeholder)
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Favicon</label>
                <div className="border border-dashed border-slate-300 rounded-lg bg-slate-50/60 h-28 flex items-center justify-center text-xs text-slate-400">
                  Favicon area (image placeholder)
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Map <span className="text-[10px] font-normal text-slate-500">(placeholder only)</span>
              </label>
              <div className="border border-slate-200 rounded-lg bg-slate-100 h-56 flex items-center justify-center text-xs text-slate-500">
                Map area reserved (Google Map will be integrated later)
              </div>
            </div>
          </div>
        </div>

        {/* General settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>General Settings</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time Zone</label>
              <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>(GMT-06:00) Central Time (US &amp; Canada)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time Format</label>
              <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>12 hour</option>
                <option>24 hour</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Currency ( $ )
                <DollarSign className="w-3 h-3 text-slate-400" />
              </label>
              <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>USD ( $ )</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency Symbol Position</label>
              <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Left ($123)</option>
                <option>Right (123$)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Digit After Decimal Point
              </label>
              <input
                type="number"
                min={0}
                max={4}
                placeholder="2"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Copy Right Text</label>
              <input
                type="text"
                placeholder="Copyright 2025"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cookies Text</label>
              <textarea
                rows={2}
                placeholder="We use cookies and similar technologies on our website to enhance your browsing experience..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Business rule setting */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span>Business Rule Setting</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default commission (%)
              </label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commission on Delivery Charge (%)
              </label>
              <input
                type="number"
                placeholder="30"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Veg / Non Veg Option
              </label>
              <ToggleSwitch initial />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Order Notification For Admin
              </label>
              <ToggleSwitch initial />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commission Base Business Model
              </label>
              <ToggleSwitch initial />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subscription Base Business Model
              </label>
              <ToggleSwitch />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Order Notification Type</label>
              <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="notification-type" defaultChecked className="w-3 h-3 text-blue-600" />
                  <span>Firebase</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="notification-type" className="w-3 h-3 text-blue-600" />
                  <span>Manual</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Guest Checkout</label>
              <ToggleSwitch />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country Picker</label>
              <ToggleSwitch initial />
            </div>
          </div>
        </div>

        {/* Free delivery option */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Free Delivery Option</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose Free Delivery Option
              </label>
              <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="free-delivery-option" defaultChecked className="w-3 h-3 text-blue-600" />
                  <span>Set free delivery for all restaurant</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="free-delivery-option" className="w-3 h-3 text-blue-600" />
                  <span>Set Specific Criteria</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Free Delivery Over ($)
              </label>
              <input
                type="number"
                placeholder="5000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Free Delivery Distance (Km)
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Charge & Payment */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Additional Charge</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Charge</label>
              <ToggleSwitch initial />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Additional Charge Name</label>
              <input
                type="text"
                placeholder="Service Charge"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Charge Amount ($)</label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Partial Payment</label>
              <ToggleSwitch />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Can Pay The Rest Amount Using
              </label>
              <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="rest-payment" defaultChecked className="w-3 h-3 text-blue-600" />
                  <span>COD</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="rest-payment" className="w-3 h-3 text-blue-600" />
                  <span>Digital payment</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input type="radio" name="rest-payment" className="w-3 h-3 text-blue-600" />
                  <span>Offline payment</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">
              Changes will only be applied after clicking the <span className="font-semibold">Save Info</span> button.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Save Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ initial = false }) {
  const [enabled, setEnabled] = useState(initial);

  return (
    <button
      type="button"
      onClick={() => setEnabled((prev) => !prev)}
      className={`inline-flex items-center w-10 h-5 rounded-full border transition-all ${
        enabled ? "bg-blue-600 border-blue-600 justify-end" : "bg-slate-200 border-slate-300 justify-start"
      }`}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
    </button>
  );
}
