"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const router = useRouter()
  const { admin, updateAdmin, changePassword, isLoading, error } = useAdmin()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (admin) {
      setFormData((prev) => ({
        ...prev,
        name: admin.name,
        email: admin.email,
      }))
    }
  }, [admin])

  const handleChange = (field: string, value: string) => {
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

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요"
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요"
    }

    // Password validation only if the user is trying to change password
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "현재 비밀번호를 입력해주세요"
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "새 비밀번호를 입력해주세요"
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "비밀번호는 최소 6자 이상이어야 합니다"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
      }
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // 프로필 정보 업데이트
        await updateAdmin({
          name: formData.name,
          email: formData.email,
        })

        // 비밀번호 변경 시도
        if (formData.currentPassword && formData.newPassword) {
          const passwordChanged = await changePassword(formData.currentPassword, formData.newPassword)

          if (passwordChanged) {
            // 비밀번호 필드 초기화
            setFormData((prev) => ({
              ...prev,
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }))
          }
        }

        toast({
          title: "프로필 업데이트됨",
          description: "관리자 정보가 성공적으로 업데이트되었습니다.",
        })
      } catch (err) {
        console.error("프로필 업데이트 오류:", err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading && !admin) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">관리자 프로필</CardTitle>
          <CardDescription className="text-center">관리자 계정 정보를 관리합니다.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={validationErrors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">비밀번호 변경</h3>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  className={validationErrors.currentPassword ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {validationErrors.currentPassword && (
                  <p className="text-sm text-red-500">{validationErrors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className={validationErrors.newPassword ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {validationErrors.newPassword && <p className="text-sm text-red-500">{validationErrors.newPassword}</p>}
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "변경사항 저장"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

