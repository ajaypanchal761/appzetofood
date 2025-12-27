import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AnimatedPage from "../../components/AnimatedPage"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProfile } from "../../context/ProfileContext"

export default function EditAddress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAddressById, updateAddress } = useProfile()
  const address = getAddressById(id)

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    additionalDetails: "",
  })

  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        additionalDetails: address.additionalDetails || "",
      })
    }
  }, [address])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      alert("Please fill in all required fields")
      return
    }
    updateAddress(id, formData)
    navigate("/user/profile/addresses")
  }

  if (!address) {
    return (
      <AnimatedPage className="min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Address not found</p>
              <Button onClick={() => navigate("/user/profile/addresses")} className="mt-4">
                Back to Addresses
              </Button>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">Edit Address</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="Enter street address"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="Enter ZIP code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
                <Textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  placeholder="Apartment, building, floor, etc."
                  value={formData.additionalDetails}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate("/user/profile/addresses")}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Address
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

