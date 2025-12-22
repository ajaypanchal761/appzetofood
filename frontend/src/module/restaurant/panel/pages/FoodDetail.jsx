import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Edit, FolderX } from "lucide-react"
import Footer from "../components/Footer"

// Import food images
import topSelling1 from "@/assets/restaurant icons/Top selling foods/1.png"
import topSelling2 from "@/assets/restaurant icons/Top selling foods/2.png"
import topSelling3 from "@/assets/restaurant icons/Top selling foods/3.png"

// Mock food data
const mockFoods = {
  1: {
    id: 1,
    name: "Medu Vada",
    image: topSelling1,
    rating: 0.0,
    reviews: 0,
    shortDescription: "Menu Vada is crispy, fluffy, soft, and delicious lentil fritters from South Indian cuisine.",
    price: 95.0,
    discount: 0.0,
    availableTimeStart: "12:01 am",
    availableTimeEnd: "11:57 pm",
    mainStock: 100,
    addons: [],
    tags: "breakfast,",
    nutritionDetails: "Calories, Protein.",
    allergyDetails: "Dairy.",
    variations: [
      { id: 1, name: "Capacity 1 Person", price: 0.0, stock: 10 },
      { id: 2, name: "Capacity 2 Person", price: 70.0, stock: 30 },
      { id: 3, name: "Capacity 4 Person", price: 130.0, stock: 30 },
    ],
    reviewers: [],
  },
  2: {
    id: 2,
    name: "Meat Pizza",
    image: topSelling2,
    rating: 4.5,
    reviews: 3,
    shortDescription: "Delicious meat pizza with various toppings.",
    price: 150.0,
    discount: 10.0,
    availableTimeStart: "10:00 am",
    availableTimeEnd: "11:00 pm",
    mainStock: 50,
    addons: ["Extra Cheese", "Olives"],
    tags: "pizza, meat,",
    nutritionDetails: "Calories, Protein, Carbs.",
    allergyDetails: "Gluten, Dairy.",
    variations: [],
    reviewers: [],
  },
  3: {
    id: 3,
    name: "Grilled Lemon Herb",
    image: topSelling3,
    rating: 0.0,
    reviews: 0,
    shortDescription: "Fresh grilled dish with lemon and herbs.",
    price: 320.0,
    discount: 0.0,
    availableTimeStart: "11:00 am",
    availableTimeEnd: "10:00 pm",
    mainStock: 25,
    addons: [],
    tags: "grilled, healthy,",
    nutritionDetails: "Calories, Protein.",
    allergyDetails: "None.",
    variations: [],
    reviewers: [],
  },
}

export default function FoodDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const food = mockFoods[id] || mockFoods[1]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-none text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{food.name}</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/restaurant-panel/foods/add?edit=${food.id}`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Info
        </Button>
      </div>

      {/* Overview Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Food Image */}
            <div className="flex-shrink-0">
              <img
                src={food.image}
                alt={food.name}
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>

            {/* Rating Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(food.rating)}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {food.rating}/5
                </span>
                <span className="text-sm text-gray-500">
                  Of {food.reviews} Reviews
                </span>
              </div>

              {/* Star Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-12">
                      {star} Star
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-300"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-6 text-right">0</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Short Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Main Stock</TableHead>
                <TableHead>Addons</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Nutrition Details</TableHead>
                <TableHead>Allergy Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm text-gray-700">
                  {food.shortDescription}
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-700">
                      <span className="font-medium">Price :</span> ${food.price.toFixed(2)}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Discount :</span> $ {food.discount.toFixed(2)}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Available time starts :</span> {food.availableTimeStart}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Available time ends :</span> {food.availableTimeEnd}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm font-semibold text-gray-700 inline-block">
                    {food.mainStock}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {food.addons.length > 0 ? food.addons.join(", ") : "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {food.tags}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {food.nutritionDetails}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {food.allergyDetails}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Variation Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Variation Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">SI</TableHead>
                  <TableHead>Variation Name</TableHead>
                  <TableHead>Variation Wise Price</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {food.variations.length > 0 ? (
                  food.variations.map((variation, index) => (
                    <TableRow key={variation.id}>
                      <TableCell className="text-sm">{index + 1}</TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {variation.name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        $ {variation.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {variation.stock}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No variations available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reviewer Table List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Reviewer Table List</CardTitle>
            <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {food.reviewers.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">SI</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {food.reviewers.length > 0 ? (
                food.reviewers.map((reviewer, index) => (
                  <TableRow key={reviewer.id}>
                    <TableCell className="text-sm">{index + 1}</TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {reviewer.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {reviewer.review}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {reviewer.date}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FolderX className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">No Data Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <Footer />
    </div>
  )
}

