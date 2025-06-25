"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DeviceProvider } from "@/contexts/device-context"
import { Toaster } from "@/components/ui/toaster"
import { useAdmin } from "@/contexts/admin-context"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAdmin()

  // 인증 상태 확인 및 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>인증 확인 중...</p>
      </div>
    )
  }

  return (
    <DeviceProvider>
      <div className="min-h-screen bg-background">
        {children}
        <Toaster />
      </div>
    </DeviceProvider>
  )
}

