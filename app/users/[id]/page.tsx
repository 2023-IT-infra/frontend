"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
}

// Mock user data - in a real app, this would come from an API
const mockUsers: Record<string, User> = {
  "1": {
    id: "1",
    name: "김민준",
    email: "minjun.kim@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2023-05-15T09:45:30",
  },
  "2": {
    id: "2",
    name: "이서연",
    email: "seoyeon.lee@example.com",
    role: "user",
    status: "active",
    lastLogin: "2023-05-14T14:22:10",
  },
  "3": {
    id: "3",
    name: "박지훈",
    email: "jihoon.park@example.com",
    role: "editor",
    status: "inactive",
    lastLogin: "2023-04-28T11:30:45",
  },
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    isActive: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const user = mockUsers[userId]
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.status === "active",
        })
      } else {
        // Handle user not found
        router.push("/")
      }
      setIsLoading(false)
    }, 500)
  }, [userId, router])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
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

    if (!formData.role) {
      newErrors.role = "역할을 선택해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // In a real app, you would submit the data to your backend here
      console.log("Form submitted:", formData)

      // Redirect to the users list page
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          사용자 목록으로 돌아가기
        </Link>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>사용자 편집</CardTitle>
          <CardDescription>사용자 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="editor">편집자</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active-status"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="active-status">활성 상태</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              취소
            </Button>
            <Button type="submit">변경사항 저장</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

