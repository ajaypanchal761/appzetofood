import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  Info,
  Trash2,
  Eye,
  Search,
  Download,
  ChevronDown,
  FolderX,
} from "lucide-react"
import Footer from "../components/Footer"

// Mock withdraw request data
const mockWithdrawRequests = [
  {
    id: 1,
    amount: 68.00,
    requestTime: "01 Jun 2023 11:53 am",
    withdrawMethod: "Card",
    transactionType: "Withdraw Request",
    status: "Pending",
    note: "N/A",
  },
  {
    id: 2,
    amount: 5000.00,
    requestTime: "07 Feb 2023 06:29 pm",
    withdrawMethod: "Default method",
    transactionType: "Withdraw Request",
    status: "Pending",
    note: "N/A",
  },
]

// Mock next payouts data
const mockNextPayouts = [
  {
    id: 1,
    payoutId: "1002",
    createdAt: "21 Nov 2023 04:33 pm",
    disburseAmount: 6012.78,
    paymentMethod: "6cash",
    payoutDate: "28-Nov-23 Estimated",
    status: "Pending",
  },
]

export default function MyWallet() {
  const [activeTab, setActiveTab] = useState("withdraw-request")
  const [searchQuery, setSearchQuery] = useState("")
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [adjustAmount, setAdjustAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawNote, setWithdrawNote] = useState("")

  const filteredPayouts = mockNextPayouts.filter((payout) =>
    payout.payoutId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdjustWallet = () => {
    setAdjustDialogOpen(true)
  }

  const handleSubmitAdjust = () => {
    if (!adjustAmount || parseFloat(adjustAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }
    // TODO: Implement adjust wallet API call
    console.log("Adjusting wallet with amount:", adjustAmount)
    alert(`Wallet adjusted by $${adjustAmount}`)
    setAdjustAmount("")
    setAdjustDialogOpen(false)
  }

  const handleRequestWithdraw = () => {
    setWithdrawDialogOpen(true)
  }

  const handleSubmitWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount")
      return
    }
    const amount = parseFloat(withdrawAmount)
    if (amount > 3044.00) {
      alert("Withdrawal amount cannot exceed withdrawable balance ($3,044.00)")
      return
    }
    // TODO: Implement withdraw request API call
    console.log("Requesting withdraw:", { amount: withdrawAmount, note: withdrawNote })
    alert(`Withdrawal request submitted for $${withdrawAmount}`)
    setWithdrawAmount("")
    setWithdrawNote("")
    setWithdrawDialogOpen(false)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Wallet className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Wallet</h1>
      </div>

      {/* Financial Summary Cards */}
      <div className="space-y-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cash in Hand */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cash in Hand</p>
                  <p className="text-2xl font-bold text-gray-900">$733.23</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawable Balance */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">withdraw able balance</p>
                  <p className="text-2xl font-bold text-gray-900">$3,044.00</p>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Unadjusted */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Balance Unadjusted</p>
                  <p className="text-2xl font-bold text-gray-900">$3,777.23</p>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleAdjustWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
          >
            <Info className="h-4 w-4 mr-2" />
            Adjust With Wallet
          </Button>
          <Button
            type="button"
            onClick={handleRequestWithdraw}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
          >
            <Info className="h-4 w-4 mr-2" />
            Request Withdraw
          </Button>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Withdraw */}
          <Card className="border-gray-200 shadow-sm bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending withdraw</p>
                  <p className="text-2xl font-bold text-gray-900">$11,080.78</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Total Withdrawn */}
          <Card className="border-gray-200 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-gray-900">$0.00</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Total Earning */}
          <Card className="border-gray-200 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total earning</p>
                  <p className="text-2xl font-bold text-gray-900">$14,858.01</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-4">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger
                  value="withdraw-request"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-4"
                >
                  Withdraw Request
                </TabsTrigger>
                <TabsTrigger
                  value="payment-history"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-4"
                >
                  Payment History
                </TabsTrigger>
                <TabsTrigger
                  value="next-payouts"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-4"
                >
                  Next Payouts
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Withdraw Request Tab */}
            <TabsContent value="withdraw-request" className="p-6 m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Amount</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Request Time</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Withdraw Method</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Transaction Type</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Note</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWithdrawRequests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <TableCell className="text-sm text-gray-700 font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900">
                          $ {request.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {request.requestTime}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            {request.withdrawMethod}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {request.transactionType}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-blue-600 font-medium">
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {request.note}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payment-history" className="p-6 m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Amount</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Payment Time</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Payment Method</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="py-16">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="flex items-center justify-center w-32 h-24 mb-4">
                            <FolderX className="h-16 w-16 text-gray-400" />
                          </div>
                          <div className="text-sm font-medium">No Data Found</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Next Payouts Tab */}
            <TabsContent value="next-payouts" className="p-6 m-0">
              {/* Header for Next Payouts */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">Total Disbursements</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {filteredPayouts.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-200 h-10"
                    />
                  </div>

                  {/* Export Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 h-10 px-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md text-sm">
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md text-sm">
                        Export Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">ID</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Created At</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Disburse Amount</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Payment Method</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Payout Date</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout, index) => (
                      <TableRow
                        key={payout.id}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <TableCell className="text-sm text-gray-700 font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900">
                          {payout.payoutId}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {payout.createdAt}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900">
                          $ {payout.disburseAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {payout.paymentMethod}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {payout.payoutDate}
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {payout.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Adjust Wallet Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Adjust With Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Adjustment Amount ($)
              </Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="h-10 border-gray-300"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAdjustDialogOpen(false)
                  setAdjustAmount("")
                }}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitAdjust}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Request Withdraw
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Withdrawable Balance:</span> $3,044.00
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Withdrawal Amount ($)
              </Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-10 border-gray-300"
                max="3044"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Note (Optional)
              </Label>
              <Input
                type="text"
                placeholder="Add a note"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                className="h-10 border-gray-300"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setWithdrawDialogOpen(false)
                  setWithdrawAmount("")
                  setWithdrawNote("")
                }}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitWithdraw}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

