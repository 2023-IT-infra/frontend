"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDevices } from "@/contexts/device-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewDevicePage() {
  const router = useRouter()
  const { addDevice, error } = useDevices()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    mac: "",
    tx_power: "",
    type: "",
    status: "active" as "active" | "inactive",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      newErrors.name = "기기 이름을 입력해주세요"
    }

    if (!formData.mac.trim()) {
      newErrors.mac = "MAC 주소를 입력해주세요"
    } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac)) {
      newErrors.mac = "유효한 MAC 주소 형식을 입력해주세요 (예: 00:1A:2B:3C:4D:5E)"
    }

    if (!formData.tx_power.trim()) {
      newErrors.txPower = "블루투스 송신 감도를 입력해주세요"
    } else if (isNaN(Number(formData.tx_power))) {
      newErrors.txPower = "숫자를 입력헤주세요"
    } else if (Number(formData.tx_power) < -100 || Number(formData.tx_power) > 20) {
      newErrors.txPower = "유효한 블루투스 송신 감도를 입력해주세요 (-100 ~ 20)"
    }

    if (!formData.type) {
      newErrors.type = "기기 유형을 선택해주세요"
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        await addDevice({
          name: formData.name,
          mac: formData.mac,
          txPower: formData.tx_power,
          type: formData.type,
          status: formData.status,
        })

        toast({
          title: "기기 추가됨",
          description: "새 기기가 성공적으로 추가되었습니다.",
        })

        router.push("/dashboard")
      } catch (err) {
        console.error("기기 추가 오류:", err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          기기 목록으로 돌아가기
        </Link>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>새 기기 추가</CardTitle>
          <CardDescription>새로운 기기를 등록합니다. 모든 필드를 작성해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">기기 이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={validationErrors.name ? "border-red-500" : ""}
                placeholder="예: 소나타"
                disabled={isSubmitting}
              />
              {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mac">MAC 주소</Label>
              <Input
                id="mac"
                value={formData.mac}
                onChange={(e) => handleChange("mac", e.target.value)}
                className={validationErrors.mac ? "border-red-500" : ""}
                placeholder="00:1A:2B:3C:4D:5E"
                disabled={isSubmitting}
              />
              {validationErrors.mac && <p className="text-sm text-red-500">{validationErrors.mac}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="tx_power">송신 출력</Label>
                <Input
                    id="tx_power"
                    value={formData.tx_power}
                    onChange={(e) => handleChange("tx_power", e.target.value)}
                    className={validationErrors.txPower ? "border-red-500" : ""}
                    placeholder="-50"
                    disabled={isSubmitting}
                />
                {validationErrors.txPower && <p className="text-sm text-red-500">{validationErrors.txPower}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">기기 유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type" className={validationErrors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="차량">차량</SelectItem>
                  <SelectItem value="테스트 장비">테스트 장비</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.type && <p className="text-sm text-red-500">{validationErrors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => handleChange("status", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard")} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  추가 중...
                </>
              ) : (
                "기기 추가"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

