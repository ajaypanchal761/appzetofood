import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Bell } from "lucide-react"
import Footer from "../components/Footer"

const notificationTopics = [
  {
    id: 1,
    title: "Restaurant Account Block",
    description: "Get notification on restaurant account block",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 2,
    title: "Restaurant Account Unblock",
    description: "Get notification on restaurant account unblock",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 3,
    title: "Restaurant Withdraw Approve",
    description: "Get notification on restaurant withdraw approve",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 4,
    title: "Restaurant Withdraw Rejection",
    description: "Get notification on restaurant withdraw rejection",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 5,
    title: "Restaurant Campaign Join Request",
    description: "Get notification on restaurant campaign join request",
    pushNotification: false, // N/A
    mail: true,
    sms: false, // N/A
  },
  {
    id: 6,
    title: "Restaurant Campaign Join Rejection",
    description: "Get notification on restaurant campaign join rejection",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 7,
    title: "Restaurant Campaign Join Approval",
    description: "Get notification on restaurant campaign join approval",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 8,
    title: "Restaurant Order Notification",
    description: "Get notification on restaurant order notification",
    pushNotification: true,
    mail: false, // N/A
    sms: false, // N/A
  },
  {
    id: 9,
    title: "Restaurant Advertisement Create By Admin",
    description: "Get notification on restaurant advertisement create by admin",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 10,
    title: "Restaurant Advertisement Approval",
    description: "Get notification on restaurant advertisement approval",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 11,
    title: "Restaurant Advertisement Deny",
    description: "Get notification on restaurant advertisement deny",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 12,
    title: "Restaurant Advertisement Resume",
    description: "Get notification on restaurant advertisement resume",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
  {
    id: 13,
    title: "Restaurant Advertisement Pause",
    description: "Get notification on restaurant advertisement pause",
    pushNotification: true,
    mail: true,
    sms: false, // N/A
  },
]

export default function NotificationSetup() {
  const [notifications, setNotifications] = useState(notificationTopics)

  const handleToggle = (id, field) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, [field]: !notif[field] } : notif
      )
    )
  }

  const isNA = (notif, field) => {
    // Check if this field should show N/A based on the original data
    if (field === "sms") return true // All SMS are N/A
    if (notif.id === 5 && field === "pushNotification") return true
    if (notif.id === 8 && field === "mail") return true
    return false
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Bell className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Setup</h1>
        </div>
        <p className="text-sm text-gray-600 ml-13">
          From here you setup who can see what types of notification from AppZetoFood.
        </p>
      </div>

      {/* Notification Settings Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700 text-center">
                    SI
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Topics</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-center w-40">
                    Push Notification
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-center w-32">
                    Mail
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-center w-32">
                    SMS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow
                    key={notif.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium text-center">
                      {notif.id}
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{notif.title}</div>
                        <div className="text-sm text-gray-600">{notif.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isNA(notif, "pushNotification") ? (
                        <Button
                          variant="outline"
                          disabled
                          className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-not-allowed"
                        >
                          N/A
                        </Button>
                      ) : (
                        <Switch
                          checked={notif.pushNotification}
                          onCheckedChange={() => handleToggle(notif.id, "pushNotification")}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isNA(notif, "mail") ? (
                        <Button
                          variant="outline"
                          disabled
                          className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-not-allowed"
                        >
                          N/A
                        </Button>
                      ) : (
                        <Switch
                          checked={notif.mail}
                          onCheckedChange={() => handleToggle(notif.id, "mail")}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isNA(notif, "sms") ? (
                        <Button
                          variant="outline"
                          disabled
                          className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-not-allowed"
                        >
                          N/A
                        </Button>
                      ) : (
                        <Switch
                          checked={notif.sms}
                          onCheckedChange={() => handleToggle(notif.id, "sms")}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

