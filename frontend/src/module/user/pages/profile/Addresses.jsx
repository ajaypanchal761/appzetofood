import { Link } from "react-router-dom"
import { MapPin, Trash2, Edit, Check, Plus } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "../../context/ProfileContext"

export default function Addresses() {
  const { addresses, deleteAddress, setDefaultAddress } = useProfile()

  const formatAddress = (address) => {
    const parts = [
      address.street,
      address.additionalDetails,
      `${address.city}, ${address.state} ${address.zipCode}`,
    ].filter(Boolean)
    return parts
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress(id)
    }
  }

  const handleSetDefault = (id) => {
    setDefaultAddress(id)
  }

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Saved Addresses</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your delivery addresses
            </p>
          </div>
          <Link to="/user/profile/addresses/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </Link>
        </div>
        {addresses.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No addresses saved yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first address to get started with deliveries
              </p>
              <Link to="/user/profile/addresses/new">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`shadow-lg ${
                  address.isDefault ? "border-yellow-500 border-2 bg-yellow-50/50" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className={`h-5 w-5 ${address.isDefault ? "text-yellow-600" : "text-muted-foreground"}`} />
                      Delivery Address
                    </CardTitle>
                    {address.isDefault && (
                      <Badge className="bg-yellow-500 text-white">Default</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="space-y-1">
                      {formatAddress(address).map((line, index) => (
                        <p key={index} className="text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap pt-2 border-t">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Set as Default
                      </Button>
                    )}
                    <Link to={`/user/profile/addresses/${address.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}

