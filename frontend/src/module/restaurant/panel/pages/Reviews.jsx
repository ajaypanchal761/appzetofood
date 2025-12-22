import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Star, Search, Filter, CheckCircle2, X } from "lucide-react"
import Footer from "../components/Footer"

// Import food images
import topRated1 from "@/assets/restaurant icons/Top rated foods/1.png"
import topRated2 from "@/assets/restaurant icons/Top rated foods/2.png"
import topRated3 from "@/assets/restaurant icons/Top rated foods/3.png"

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    food: {
      image: topRated1,
      name: "Meat Pizza",
      orderId: "#100113",
    },
    reviewer: {
      name: "Purno Test",
      verified: true,
      phone: "+8*********",
    },
    review: {
      rating: 5,
      comment: "vvxvxvxv",
    },
    date: "01 Jun 2023",
    time: "11:55 am",
    hasReply: false,
    reply: null,
  },
  {
    id: 2,
    food: {
      image: topRated2,
      name: "Meat Pizza",
      orderId: "#100080",
    },
    reviewer: {
      name: "Jane Doe",
      verified: true,
      phone: "+8*********",
    },
    review: {
      rating: 5,
      comment: "Pizza packaging and test was so good...",
    },
    date: "02 Jan 2023",
    time: "03:35 pm",
    hasReply: true,
    reply: "Thank you for your feedback! We're glad you enjoyed the pizza.",
  },
  {
    id: 3,
    food: {
      image: topRated3,
      name: "Meat Pizza",
      orderId: "#100008",
    },
    reviewer: {
      name: null,
      verified: false,
      phone: null,
    },
    review: {
      rating: 4,
      comment: "Nice",
    },
    date: "21 Aug 2021",
    time: "10:46 pm",
    hasReply: true,
    reply: "We appreciate your review!",
  },
]

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState(mockReviews)
  const [filterOpen, setFilterOpen] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [viewReplyDialogOpen, setViewReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [filterHasReply, setFilterHasReply] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewer.phone?.includes(searchQuery) ||
      review.food.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewer.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRating =
      filterRating === "all" || review.review.rating === parseInt(filterRating)

    const matchesReply =
      filterHasReply === "all" ||
      (filterHasReply === "yes" && review.hasReply) ||
      (filterHasReply === "no" && !review.hasReply)

    return matchesSearch && matchesRating && matchesReply
  })

  const handleGiveReply = (review) => {
    setSelectedReview(review)
    setReplyText("")
    setReplyDialogOpen(true)
  }

  const handleViewReply = (review) => {
    setSelectedReview(review)
    setViewReplyDialogOpen(true)
  }

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      alert("Please enter a reply")
      return
    }

    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id
          ? { ...review, hasReply: true, reply: replyText }
          : review
      )
    )

    setReplyDialogOpen(false)
    setReplyText("")
    setSelectedReview(null)
    alert("Reply submitted successfully!")
  }

  const handleResetFilter = () => {
    setFilterRating("all")
    setFilterHasReply("all")
    setFilterDateFrom("")
    setFilterDateTo("")
    setFilterOpen(false)
  }

  const handleApplyFilter = () => {
    setFilterOpen(false)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Star className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customers Reviews</h1>
        </div>
        <Button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Ex : Search by food name or ph"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 h-10"
        />
      </div>

      {/* Reviews Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Food</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Reviewer</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Review</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review, index) => (
                  <TableRow
                    key={review.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={review.food.image}
                            alt={review.food.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {review.food.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {review.food.orderId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.reviewer.name ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {review.reviewer.name}
                            </span>
                            {review.reviewer.verified && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          {review.reviewer.phone && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {review.reviewer.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Customer not found
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary-orange text-primary-orange" />
                          <span className="text-sm font-semibold text-gray-900">
                            {review.review.rating}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-w-md">
                          {review.review.comment}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-700 font-medium">
                          {review.date}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {review.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.hasReply ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReply(review)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 h-8 px-4"
                        >
                          View Reply
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleGiveReply(review)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4"
                        >
                          Give Reply
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Filter Reviews
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Rating</Label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Reply Status</Label>
              <Select value={filterHasReply} onValueChange={setFilterHasReply}>
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">With Reply</SelectItem>
                  <SelectItem value="no">Without Reply</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">From Date</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="h-10 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">To Date</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="h-10 border-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilter}
                className="border-gray-300"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleApplyFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Give Reply
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Review:</span> {selectedReview.review.comment}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Rating:</span>{" "}
                  {selectedReview.review.rating} / 5
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Customer:</span>{" "}
                  {selectedReview.reviewer.name || "Anonymous"}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Your Reply
                </Label>
                <Textarea
                  placeholder="Enter your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReplyDialogOpen(false)
                    setReplyText("")
                    setSelectedReview(null)
                  }}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitReply}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Reply Dialog */}
      <Dialog open={viewReplyDialogOpen} onOpenChange={setViewReplyDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              View Reply
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Review:</span> {selectedReview.review.comment}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Rating:</span>{" "}
                  {selectedReview.review.rating} / 5
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Customer:</span>{" "}
                  {selectedReview.reviewer.name || "Anonymous"}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Your Reply
                </Label>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-900">{selectedReview.reply}</p>
                </div>
              </div>
              <div className="flex items-center justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setViewReplyDialogOpen(false)
                    setSelectedReview(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

