import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Upload, Clock, Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadAPI, api } from "@/lib/api"

const cuisinesOptions = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Pizza",
  "Burgers",
  "Bakery",
  "Cafe",
]

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const formatTimeDisplay = (value) => {
  if (!value) return "Not set"
  const [h, m] = value.split(":")
  const hourNum = parseInt(h || "0", 10)
  if (Number.isNaN(hourNum)) return value
  const period = hourNum >= 12 ? "PM" : "AM"
  const hour12 = hourNum % 12 || 12
  const minute = (m || "00").padStart(2, "0")
  return `${hour12.toString().padStart(2, "0")}:${minute} ${period}`
}

const getTimeParts = (value) => {
  if (!value || !value.includes(":")) {
    return { hour: "10", minute: "00", period: "AM" }
  }
  const [h, m] = value.split(":")
  let hourNum = parseInt(h || "0", 10)
  if (Number.isNaN(hourNum)) hourNum = 10
  const period = hourNum >= 12 ? "PM" : "AM"
  const hour12 = hourNum % 12 || 12
  return {
    hour: hour12.toString().padStart(2, "0"),
    minute: (m || "00").padStart(2, "0"),
    period,
  }
}

const toTimeValue = (hour12, minute, period) => {
  let h = parseInt(hour12 || "0", 10)
  if (Number.isNaN(h)) h = 10
  if (period === "PM" && h !== 12) h += 12
  if (period === "AM" && h === 12) h = 0
  return `${h.toString().padStart(2, "0")}:${(minute || "00").padStart(2, "0")}`
}

const hourOptions = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
)
// 15-minute steps are enough for delivery timings
const minuteOptions = ["00", "15", "30", "45"]

function TimeSelector({ label, value, onChange }) {
  const parts = getTimeParts(value)

  const handlePartChange = (part, newVal) => {
    const next = { ...parts, [part]: newVal }
    const final = toTimeValue(next.hour, next.minute, next.period)
    onChange(final)
  }

  return (
    <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50/60">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-gray-800" />
        <span className="text-xs font-medium text-gray-900">{label}</span>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white flex items-center justify-between text-xs text-left"
          >
            <span className="text-gray-900">{formatTimeDisplay(value)}</span>
            <span className="text-[11px] text-gray-500">Tap to change</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3">
          <div className="text-xs font-medium text-gray-900 mb-1">Select time</div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="space-y-1">
              <span className="block text-[11px] text-gray-500">Hour</span>
              <Select
                value={parts.hour}
                onValueChange={(v) => handlePartChange("hour", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((h) => (
                    <SelectItem key={h} value={h} className="text-xs">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="block text-[11px] text-gray-500">Minute</span>
              <Select
                value={parts.minute}
                onValueChange={(v) => handlePartChange("minute", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="block text-[11px] text-gray-500">AM / PM</span>
              <Select
                value={parts.period}
                onValueChange={(v) => handlePartChange("period", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM" className="text-xs">
                    AM
                  </SelectItem>
                  <SelectItem value="PM" className="text-xs">
                    PM
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function RestaurantOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [step1, setStep1] = useState({
    restaurantName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    primaryContactNumber: "",
    location: {
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      landmark: "",
    },
  })

  const [step2, setStep2] = useState({
    menuImages: [],
    profileImage: null,
    cuisines: [],
    openingTime: "",
    closingTime: "",
    openDays: [],
  })

  const [step3, setStep3] = useState({
    panNumber: "",
    nameOnPan: "",
    panImage: null,
    gstRegistered: false,
    gstNumber: "",
    gstLegalName: "",
    gstAddress: "",
    gstImage: null,
    fssaiNumber: "",
    fssaiExpiry: "",
    fssaiImage: null,
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    accountType: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await api.get("/restaurant/onboarding")
        const data = res?.data?.data?.onboarding
        if (data) {
          if (data.step1) {
            setStep1((prev) => ({
              ...prev,
              restaurantName: data.step1.restaurantName || "",
              ownerName: data.step1.ownerName || "",
              ownerEmail: data.step1.ownerEmail || "",
              ownerPhone: data.step1.ownerPhone || "",
              primaryContactNumber: data.step1.primaryContactNumber || "",
              location: {
                ...prev.location,
                ...data.step1.location,
              },
            }))
          }
          if (data.step2) {
            setStep2((prev) => ({
              ...prev,
              cuisines: data.step2.cuisines || [],
              openingTime: data.step2.deliveryTimings?.openingTime || "",
              closingTime: data.step2.deliveryTimings?.closingTime || "",
              openDays: data.step2.openDays || [],
            }))
          }
          if (data.step3) {
            setStep3((prev) => ({
              ...prev,
              panNumber: data.step3.pan?.panNumber || "",
              nameOnPan: data.step3.pan?.nameOnPan || "",
              gstRegistered: data.step3.gst?.isRegistered || false,
              gstNumber: data.step3.gst?.gstNumber || "",
              gstLegalName: data.step3.gst?.legalName || "",
              gstAddress: data.step3.gst?.address || "",
              fssaiNumber: data.step3.fssai?.registrationNumber || "",
              fssaiExpiry: data.step3.fssai?.expiryDate
                ? data.step3.fssai.expiryDate.slice(0, 10)
                : "",
              accountNumber: data.step3.bank?.accountNumber || "",
              confirmAccountNumber: data.step3.bank?.accountNumber || "",
              ifscCode: data.step3.bank?.ifscCode || "",
              accountHolderName: data.step3.bank?.accountHolderName || "",
              accountType: data.step3.bank?.accountType || "",
            }))
          }
          if (data.completedSteps) {
            setStep(data.completedSteps + 1 > 3 ? 3 : data.completedSteps + 1)
          }
        }
      } catch (err) {
        // ignore for now
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpload = async (file, folder) => {
    const res = await uploadAPI.uploadMedia(file, { folder })
    const d = res?.data?.data || res?.data
    return { url: d.url, publicId: d.publicId }
  }

  const handleNext = async () => {
    setError("")
    setSaving(true)
    try {
      if (step === 1) {
        const payload = {
          step1,
          completedSteps: 1,
        }
        await api.put("/restaurant/onboarding", payload)
        setStep(2)
      } else if (step === 2) {
        const menuUploads = []
        for (const file of step2.menuImages.filter((f) => f instanceof File)) {
          const uploaded = await handleUpload(file, "appzeto/restaurant/menu")
          menuUploads.push(uploaded)
        }
        const profileUpload =
          step2.profileImage && step2.profileImage instanceof File
            ? await handleUpload(step2.profileImage, "appzeto/restaurant/profile")
            : null

        const payload = {
          step2: {
            menuImageUrls: menuUploads,
            profileImageUrl: profileUpload,
            cuisines: step2.cuisines,
            deliveryTimings: {
              openingTime: step2.openingTime,
              closingTime: step2.closingTime,
            },
            openDays: step2.openDays,
          },
          completedSteps: 2,
        }
        await api.put("/restaurant/onboarding", payload)
        setStep(3)
      } else if (step === 3) {
        if (
          step3.accountNumber &&
          step3.confirmAccountNumber &&
          step3.accountNumber !== step3.confirmAccountNumber
        ) {
          setError("Account number and confirmation do not match")
          setSaving(false)
          return
        }

        let panImageUpload = null
        if (step3.panImage && step3.panImage instanceof File) {
          panImageUpload = await handleUpload(step3.panImage, "appzeto/restaurant/pan")
        }
        let gstImageUpload = null
        if (step3.gstImage && step3.gstImage instanceof File) {
          gstImageUpload = await handleUpload(step3.gstImage, "appzeto/restaurant/gst")
        }
        let fssaiImageUpload = null
        if (step3.fssaiImage && step3.fssaiImage instanceof File) {
          fssaiImageUpload = await handleUpload(step3.fssaiImage, "appzeto/restaurant/fssai")
        }

        const payload = {
          step3: {
            pan: {
              panNumber: step3.panNumber,
              nameOnPan: step3.nameOnPan,
              image: panImageUpload,
            },
            gst: {
              isRegistered: step3.gstRegistered,
              gstNumber: step3.gstNumber,
              legalName: step3.gstLegalName,
              address: step3.gstAddress,
              image: gstImageUpload,
            },
            fssai: {
              registrationNumber: step3.fssaiNumber,
              expiryDate: step3.fssaiExpiry || null,
              image: fssaiImageUpload,
            },
            bank: {
              accountNumber: step3.accountNumber,
              ifscCode: step3.ifscCode,
              accountHolderName: step3.accountHolderName,
              accountType: step3.accountType,
            },
          },
          completedSteps: 3,
        }
        await api.put("/restaurant/onboarding", payload)
        navigate("/restaurant-panel/dashboard", { replace: true })
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save onboarding data"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const toggleCuisine = (cuisine) => {
    setStep2((prev) => {
      const exists = prev.cuisines.includes(cuisine)
      if (exists) {
        return { ...prev, cuisines: prev.cuisines.filter((c) => c !== cuisine) }
      }
      if (prev.cuisines.length >= 3) return prev
      return { ...prev, cuisines: [...prev.cuisines, cuisine] }
    })
  }

  const toggleDay = (day) => {
    setStep2((prev) => {
      const exists = prev.openDays.includes(day)
      if (exists) {
        return { ...prev, openDays: prev.openDays.filter((d) => d !== day) }
      }
      return { ...prev, openDays: [...prev.openDays, day] }
    })
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <section className="bg-white p-4 sm:p-6 rounded-md">
        <h2 className="text-lg font-semibold text-black mb-4">Restaurant information</h2>
        <p className="text-sm text-gray-600 mb-4">Restaurant name</p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-700">Restaurant name*</Label>
            <Input
              value={step1.restaurantName}
              onChange={(e) => setStep1({ ...step1, restaurantName: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
              placeholder="Customers will see this name"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-md">
        <h2 className="text-lg font-semibold text-black mb-4">Owner details</h2>
        <p className="text-sm text-gray-600 mb-4">
          These details will be used for all business communications and updates.
        </p>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-700">Full name*</Label>
            <Input
              value={step1.ownerName}
              onChange={(e) => setStep1({ ...step1, ownerName: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
              placeholder="Owner full name"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Email address*</Label>
            <Input
              type="email"
              value={step1.ownerEmail}
              onChange={(e) => setStep1({ ...step1, ownerEmail: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Phone number*</Label>
            <Input
              value={step1.ownerPhone}
              onChange={(e) => setStep1({ ...step1, ownerPhone: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
              placeholder="+91 98XXXXXX"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-md space-y-4">
        <h2 className="text-lg font-semibold text-black">Restaurant contact & location</h2>
        <div>
          <Label className="text-xs text-gray-700">Primary contact number*</Label>
          <Input
            value={step1.primaryContactNumber}
            onChange={(e) =>
              setStep1({ ...step1, primaryContactNumber: e.target.value })
            }
            className="mt-1 bg-white text-sm text-black placeholder-black"
            placeholder="Restaurant's primary contact number"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Customers, delivery partners and Appzeto may call on this number for order
            support.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Add your restaurant's location for order pick-up.
          </p>
          <Input
            value={step1.location.area}
            onChange={(e) =>
              setStep1({
                ...step1,
                location: { ...step1.location, area: e.target.value },
              })
            }
            className="bg-white text-sm"
            placeholder="Area / Sector / Locality*"
          />
          <Input
            value={step1.location.city}
            onChange={(e) =>
              setStep1({
                ...step1,
                location: { ...step1.location, city: e.target.value },
              })
            }
            className="bg-white text-sm"
            placeholder="City"
          />
          <Input
            value={step1.location.addressLine1}
            onChange={(e) =>
              setStep1({
                ...step1,
                location: { ...step1.location, addressLine1: e.target.value },
              })
            }
            className="bg-white text-sm"
            placeholder="Shop no. / building no. (optional)"
          />
          <Input
            value={step1.location.addressLine2}
            onChange={(e) =>
              setStep1({
                ...step1,
                location: { ...step1.location, addressLine2: e.target.value },
              })
            }
            className="bg-white text-sm"
            placeholder="Floor / tower (optional)"
          />
          <Input
            value={step1.location.landmark}
            onChange={(e) =>
              setStep1({
                ...step1,
                location: { ...step1.location, landmark: e.target.value },
              })
            }
            className="bg-white text-sm"
            placeholder="Nearby landmark (optional)"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Please ensure that this address is the same as mentioned on your FSSAI license.
          </p>
        </div>
      </section>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Images section */}
      <section className="bg-white p-4 sm:p-6 rounded-md space-y-5">
        <h2 className="text-lg font-semibold text-black">Menu & photos</h2>
        <p className="text-xs text-gray-500">
          Add clear photos of your printed menu and a primary profile image. This helps customers
          understand what you serve.
        </p>

        {/* Menu images */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Menu images</Label>
          <div className="mt-1 border border-dashed border-gray-300 rounded-md bg-gray-50/70 px-4 py-3 flex items-center justify-between flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900">Upload menu images</span>
                <span className="text-[11px] text-gray-500">
                  JPG, PNG, WebP • You can select multiple files
                </span>
              </div>
            </div>
            <label
              htmlFor="menuImagesInput"
              className="inline-flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-black  border-black text-xs font-medium cursor-pointer     w-full items-center"
            >
              <Upload className="w-4.5 h-4.5" />
              <span>Choose files</span>
            </label>
            <input
              id="menuImagesInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (!files.length) return
                setStep2((prev) => ({
                  ...prev,
                  menuImages: files,
                }))
              }}
            />
          </div>

          {/* Menu image previews */}
          {!!step2.menuImages.length && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {step2.menuImages.map((file, idx) => {
                const url = file instanceof File ? URL.createObjectURL(file) : null
                return (
                  <div
                    key={idx}
                    className="relative aspect-[4/5] rounded-md overflow-hidden bg-gray-100"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`Menu ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-500 px-2 text-center">
                        Preview unavailable
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                      <p className="text-[10px] text-white truncate">
                        {file?.name || `Image ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile image */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Restaurant profile image</Label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {step2.profileImage ? (
                <img
                  src={
                    step2.profileImage instanceof File
                      ? URL.createObjectURL(step2.profileImage)
                      : ""
                  }
                  alt="Restaurant profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1 flex-col flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900">Upload profile image</span>
                <span className="text-[11px] text-gray-500">
                  This will be shown on your listing card and restaurant page.
                </span>
              </div>
             
            </div>
            
          </div>
           <label
                htmlFor="profileImageInput"
                className="inline-flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-black  border-black text-xs font-medium cursor-pointer     w-full items-center"
                >
                <Upload className="w-4.5 h-4.5" />
                <span>Upload</span>
              </label>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setStep2((prev) => ({
                    ...prev,
                    profileImage: e.target.files?.[0] || null,
                  }))
                }
              />
        </div>
      </section>

      {/* Operational details */}
      <section className="bg-white p-4 sm:p-6 rounded-md space-y-5">
        {/* Cuisines */}
        <div>
          <Label className="text-xs text-gray-700">Select cuisines (up to 3)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {cuisinesOptions.map((cuisine) => {
              const active = step2.cuisines.includes(cuisine)
              return (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-3 py-1.5 text-xs rounded-full ${
                    active ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cuisine}
                </button>
              )
            })}
          </div>
        </div>

        {/* Timings with popover time selectors */}
        <div className="space-y-3">
          <Label className="text-xs text-gray-700">Delivery timings</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TimeSelector
              label="Opening time"
              value={step2.openingTime}
              onChange={(val) => setStep2({ ...step2, openingTime: val })}
            />
            <TimeSelector
              label="Closing time"
              value={step2.closingTime}
              onChange={(val) => setStep2({ ...step2, closingTime: val })}
            />
          </div>
        </div>

        {/* Open days in a calendar-like grid */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-700 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-gray-800" />
            <span>Open days</span>
          </Label>
          <p className="text-[11px] text-gray-500">
            Select the days your restaurant accepts delivery orders.
          </p>
          <div className="mt-1 grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysOfWeek.map((day) => {
              const active = step2.openDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`aspect-square flex items-center justify-center rounded-md text-[11px] font-medium ${
                    active ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {day.charAt(0)}
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <section className="bg-white p-4 sm:p-6 rounded-md space-y-4">
        <h2 className="text-lg font-semibold text-black">PAN details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-700">PAN number</Label>
            <Input
              value={step3.panNumber}
              onChange={(e) => setStep3({ ...step3, panNumber: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Name on PAN</Label>
            <Input
              value={step3.nameOnPan}
              onChange={(e) => setStep3({ ...step3, nameOnPan: e.target.value })}
              className="mt-1 bg-white text-sm text-black placeholder-black"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-700">PAN image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setStep3({ ...step3, panImage: e.target.files?.[0] || null })
            }
            className="mt-1 bg-white text-sm text-black placeholder-black"
          />
        </div>
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-md space-y-4">
        <h2 className="text-lg font-semibold text-black">GST details</h2>
        <div className="flex gap-4 items-center text-sm">
          <span className="text-gray-700">GST registered?</span>
          <button
            type="button"
            onClick={() => setStep3({ ...step3, gstRegistered: true })}
            className={`px-3 py-1.5 text-xs rounded-full ${
              step3.gstRegistered ? "bg-black text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setStep3({ ...step3, gstRegistered: false })}
            className={`px-3 py-1.5 text-xs rounded-full ${
              !step3.gstRegistered ? "bg-black text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            No
          </button>
        </div>
        {step3.gstRegistered && (
          <div className="space-y-3">
            <Input
              value={step3.gstNumber}
              onChange={(e) => setStep3({ ...step3, gstNumber: e.target.value })}
              className="bg-white text-sm"
              placeholder="GST number"
            />
            <Input
              value={step3.gstLegalName}
              onChange={(e) => setStep3({ ...step3, gstLegalName: e.target.value })}
              className="bg-white text-sm"
              placeholder="Legal name"
            />
            <Input
              value={step3.gstAddress}
              onChange={(e) => setStep3({ ...step3, gstAddress: e.target.value })}
              className="bg-white text-sm"
              placeholder="Registered address"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setStep3({ ...step3, gstImage: e.target.files?.[0] || null })
              }
              className="bg-white text-sm"
            />
          </div>
        )}
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-md space-y-4">
        <h2 className="text-lg font-semibold text-black">FSSAI details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            value={step3.fssaiNumber}
            onChange={(e) => setStep3({ ...step3, fssaiNumber: e.target.value })}
            className="bg-white text-sm"
            placeholder="FSSAI number"
          />
          <Input
            type="date"
            value={step3.fssaiExpiry}
            onChange={(e) => setStep3({ ...step3, fssaiExpiry: e.target.value })}
            className="bg-white text-sm"
          />
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setStep3({ ...step3, fssaiImage: e.target.files?.[0] || null })
          }
          className="bg-white text-sm"
        />
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-md space-y-4">
        <h2 className="text-lg font-semibold text-black">Bank account details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            value={step3.accountNumber}
            onChange={(e) =>
              setStep3({ ...step3, accountNumber: e.target.value.trim() })
            }
            className="bg-white text-sm"
            placeholder="Account number"
          />
          <Input
            value={step3.confirmAccountNumber}
            onChange={(e) =>
              setStep3({ ...step3, confirmAccountNumber: e.target.value.trim() })
            }
            className="bg-white text-sm"
            placeholder="Re-enter account number"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            value={step3.ifscCode}
            onChange={(e) => setStep3({ ...step3, ifscCode: e.target.value })}
            className="bg-white text-sm"
            placeholder="IFSC code"
          />
          <Input
            value={step3.accountType}
            onChange={(e) => setStep3({ ...step3, accountType: e.target.value })}
            className="bg-white text-sm"
            placeholder="Account type (savings / current)"
          />
        </div>
        <Input
          value={step3.accountHolderName}
          onChange={(e) =>
            setStep3({ ...step3, accountHolderName: e.target.value })
          }
          className="bg-white text-sm"
          placeholder="Account holder name"
        />
      </section>
    </div>
  )

  const renderStep = () => {
    if (step === 1) return renderStep1()
    if (step === 2) return renderStep2()
    return renderStep3()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="px-4 py-4 sm:px-6 sm:py-5 bg-white flex items-center justify-between">
        <div className="text-sm font-semibold text-black">Restaurant onboarding</div>
        <div className="text-xs text-gray-600">
          Step {step} of 3
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : (
          renderStep()
        )}
      </main>

      {error && (
        <div className="px-4 sm:px-6 pb-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <footer className="px-4 sm:px-6 py-3 bg-white">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            disabled={step === 1 || saving}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-sm text-gray-700 bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={saving}
            className="text-sm bg-black text-white px-6"
          >
            {step === 3 ? (saving ? "Saving..." : "Finish") : saving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  )
}


