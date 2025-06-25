"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { deviceService, type Device, mapDevicesToApi } from "@/services/api"

type DeviceContextType = {
  devices: Device[]
  isLoading: boolean
  error: string | null
  addDevice: (device: Omit<Device, "id" | "addDate">) => Promise<void>
  updateDevice: (id: string, deviceData: Partial<Device>) => Promise<void>
  deleteDevice: (id: string) => Promise<void>
  getDeviceById: (id: string) => Promise<Device | undefined>
  searchDevices: (query: string) => Promise<void>
  refreshDevices: () => Promise<void>
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 기기 목록 가져오기
  const fetchDevices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await deviceService.getAll()
      // FastAPI 응답 형식에 맞게 데이터 변환
      setDevices(mapDevicesToApi(data))
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 목록을 가져오는 중 오류가 발생했습니다.")
      }
      console.error("기기 목록 가져오기 오류:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const addDevice = async (deviceData: Omit<Device, "id" | "addDate">) => {
    setIsLoading(true)
    setError(null)

    try {
      const newDevice = await deviceService.create(deviceData)
      setDevices((prev) => [...prev, newDevice])
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 추가 중 오류가 발생했습니다.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateDevice = async (id: string, deviceData: Partial<Device>) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedDevice = await deviceService.update(id, deviceData)
      setDevices((prev) =>
        prev.map((device) => (device.id === id ? updatedDevice : device))
      )
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 업데이트 중 오류가 발생했습니다.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDevice = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await deviceService.delete(id)
      setDevices((prev) => prev.filter((device) => device.id !== id))
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 삭제 중 오류가 발생했습니다.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceById = async (id: string) => {
    setError(null)

    try {
      // 이미 로드된 기기 중에서 찾기
      const cachedDevice = devices.find((device) => device.id === id)
      if (cachedDevice) return cachedDevice

      // 캐시에 없으면 API에서 가져오기
      const device = await deviceService.getById(id)
      return device
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 정보를 가져오는 중 오류가 발생했습니다.")
      }
      console.error("기기 정보 가져오기 오류:", err)
      return undefined
    }
  }

  const searchDevices = async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data =
        query.trim() === ""
          ? await deviceService.getAll()
          : await deviceService.search(query)
      setDevices(mapDevicesToApi(data))
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("기기 검색 중 오류가 발생했습니다.")
      }
      console.error("기기 검색 오류:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshDevices = async () => {
    await fetchDevices()
  }

  return (
    <DeviceContext.Provider
      value={{
        devices,
        isLoading,
        error,
        addDevice,
        updateDevice,
        deleteDevice,
        getDeviceById,
        searchDevices,
        refreshDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevices() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error("useDevices must be used within a DeviceProvider")
  }
  return context
}

