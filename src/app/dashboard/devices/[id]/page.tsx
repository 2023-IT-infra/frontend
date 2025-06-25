"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDevices } from "@/contexts/device-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: deviceId } = use(params);
  const { getDeviceById, updateDevice, error } = useDevices()
  const { toast } = useToast()


  const [formData, setFormData] = useState({
    name: "",
    mac: "",
    txPower: "",
    type: "",
    isActive: false,
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadDevice = async () => {
      try {
        const device = await getDeviceById(deviceId)
        if (device) {
          setFormData({
            name: device.name,
            mac: device.mac,
            txPower: device.txPower,
            type: device.type,
            isActive: device.status === "active" ,
          })
        } else {
          setLoadError("기기를 찾을 수 없습니다.")
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        }
      } catch (err) {
        setLoadError("기기 정보를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDevice()
  }, [deviceId, router, getDeviceById])

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

    if (!formData.name.trim()) {
      newErrors.name = "기기 이름을 입력해주세요"
    }

    if (!formData.mac.trim()) {
      newErrors.mac = "MAC 주소를 입력해주세요"
    } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac)) {
      newErrors.mac = "유효한 MAC 주소 형식을 입력해주세요 (예: 00:1A:2B:3C:4D:5E)"
    }

    if (!formData.txPower) {
      newErrors.tx_power = "송신 전력을 입력해주세요"
    } else if (isNaN(Number(formData.txPower))) {
      newErrors.tx_power = "유효한 송신 전력을 입력해주세요"
    } else if (Number(formData.txPower) < -100 || Number(formData.txPower) > 20) {
      newErrors.tx_power = " -100을 초과하거나, 20이하의 값을 입력해주세요"
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
        await updateDevice(deviceId, {
          name: formData.name,
          mac: formData.mac,
          txPower: formData.txPower,
          type: formData.type,
          status: formData.isActive ? "active" : "inactive",
        })

        toast({
          title: "기기 업데이트됨",
          description: "기기 정보가 성공적으로 업데이트되었습니다.",
        })

        router.push("/dashboard")
      } catch (err) {
        console.error("기기 업데이트 오류:", err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>기기 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <p>대시보드로 이동합니다...</p>
        </div>
      </div>
    )
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
          <CardTitle>기기 편집</CardTitle>
          <CardDescription>기기 정보를 수정합니다.</CardDescription>
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
                disabled={isSubmitting}
              />
              {validationErrors.mac && <p className="text-sm text-red-500">{validationErrors.mac}</p>}
            </div>

            <div className={"space-y-2"}>
                <Label htmlFor="txPower">송신 출력</Label>
                <Input
                    id="txPower"
                    value={formData.txPower}
                    onChange={(e) => handleChange("txPower", e.target.value)}
                    className={validationErrors.txPower ? "border-red-500" : ""}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="active-status"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="active-status">활성 상태</Label>
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

