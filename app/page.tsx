"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdmin } from "@/contexts/admin-context"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAdmin()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요"
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요"
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const success = await login(formData.email, formData.password)

      if (success) {
        router.push("/dashboard")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">관리자 로그인</CardTitle>
          <CardDescription className="text-center">관리자 계정으로 로그인하여 기기를 관리하세요</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={validationErrors.password ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleChange("rememberMe", checked)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                로그인 상태 유지
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

