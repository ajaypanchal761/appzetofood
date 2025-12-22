import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Settings, Check } from "lucide-react"
import Footer from "../components/Footer"

const conversations = [
  {
    id: 1,
    name: "AppZetoFood",
    phone: "0***********",
    lastMessage: "Hi",
    lastTime: "1 year ago",
  },
]

export default function Chat() {
  const [activeTab, setActiveTab] = useState("delivery")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConversation = filteredConversations[0] || conversations[0]

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Conversation List</h1>
      </div>

      {/* Chat Layout */}
      <Card className="border-gray-200 shadow-sm flex-1 flex flex-col">
        <CardContent className="p-0 flex flex-1 overflow-hidden">
          {/* Left Sidebar - Conversation List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 h-9 text-sm"
                />
              </div>
            </div>

            {/* Conversation Item */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-start gap-3 px-4 py-3 bg-blue-50 border-l-4 border-blue-500 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-500 uppercase">
                    ack
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900 text-sm">{conv.name}</div>
                      <div className="text-xs text-gray-400">{conv.lastTime}</div>
                    </div>
                    <div className="text-xs text-gray-500">{conv.phone}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{conv.lastMessage}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs and Empty Deliveryman State */}
            <div className="border-t border-gray-100 p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-9 bg-transparent border-b border-gray-200 rounded-none w-full justify-start gap-4">
                  <TabsTrigger
                    value="customer"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none data-[state=active]:text-blue-600 px-0 text-sm font-medium"
                  >
                    Customer
                  </TabsTrigger>
                  <TabsTrigger
                    value="delivery"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none data-[state=active]:text-blue-600 px-0 text-sm font-medium"
                  >
                    Delivery man
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === "delivery" && (
                <div className="pt-6 pb-2 flex flex-col items-center justify-center text-gray-400 text-sm">
                  <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center mb-2">
                    <span className="text-lg">🚚</span>
                  </div>
                  <span className="text-xs text-gray-500">No Deliveryman Found</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Conversation View */}
          <div className="flex-1 flex flex-col">
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-500 uppercase">
                  ack
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{activeConversation.name}</div>
                  <div className="text-xs text-gray-500">{activeConversation.phone}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:bg-gray-200 rounded-full"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              <div className="flex justify-start mb-6">
                <div className="inline-flex px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-800 shadow-sm">
                  Hi
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="inline-flex px-3 py-2 bg-blue-50 border border-blue-400 rounded-md text-sm text-blue-700 shadow-sm mb-1">
                  Hello
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span>08 Sep 2024 12:07 am</span>
                  <Check className="h-3 w-3 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}


