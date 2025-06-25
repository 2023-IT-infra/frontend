"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, Car, Server, Cpu, Loader2 } from "lucide-react"
import { useDevices } from "@/contexts/device-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DeviceList() {
  const { devices, deleteDevice, isLoading, error, refreshDevices } = useDevices()
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteDevice = async (deviceId: string) => {
    setIsDeleting(true)
    try {
      await deleteDevice(deviceId)
      setDeviceToDelete(null)
      toast({
        title: "기기 삭제됨",
        description: "기기가 성공적으로 삭제되었습니다.",
      })
    } catch (err) {
      console.error("기기 삭제 오류:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "차량":
        return <Car className="h-4 w-4" />
      case "테스트 장비":
        return <Cpu className="h-4 w-4" />
      case "기타":
      default:
        return <Server className="h-4 w-4" />
    }
  }

  if (isLoading && devices.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>기기 목록을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] pl-15">기기</TableHead>
              <TableHead>MAC 주소</TableHead>
              <TableHead>송신 출력</TableHead>
              <TableHead>유형</TableHead>
              <TableHead className="pl-7">상태</TableHead>
              <TableHead>추가 날짜</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  기기가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="font-medium">{device.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{device.mac}</TableCell>
                  <TableCell className="font-normal">{device.txPower} dBm</TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>
                    <Badge variant={device.status === "active" ? "default" : "secondary"}>
                      {device.status === "active" ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(device.addDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/devices/${device.id}`}>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            편집
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => setDeviceToDelete(device.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기기 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 기기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deviceToDelete && handleDeleteDevice(deviceToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

