"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, LogOut, User, RefreshCw } from "lucide-react"
import { DeviceList } from "@/components/device-list"
import { useAdmin } from "@/contexts/admin-context"
import { useDevices } from "@/contexts/device-context"
import { useState } from "react"

export default function DashboardPage() {
  const { logout, admin } = useAdmin()
  const { refreshDevices, isLoading } = useDevices()
  const [searchTerm, setSearchTerm] = useState("")

  const handleLogout = () => {
    logout()
  }

  const handleRefresh = async () => {
    await refreshDevices()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">기기 관리</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/devices/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />새 기기
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                {admin?.name || "프로필"}
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="기기 검색..."
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>

        <DeviceList />
      </div>
    </div>
  )
}

